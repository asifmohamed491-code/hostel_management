// app/api/attendance/mark/route.ts
//
// POST /api/attendance/mark
// Student-only: marks attendance for today by validating:
// 1. Authenticated student session (JWT)
// 2. No duplicate attendance marked today
// 3. Active, unexpired Warden attendance session
// 4. Valid GPS payload & acceptable accuracy (<= 150m)
// 5. Server-side Haversine geofence calculation (<= 320m)
// 6. Creates notifications for the student & wardens
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AttendanceSession } from "@/models/AttendanceSession";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { Notification } from "@/models/Notification";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { HOSTEL_GEOFENCE, calculateDistanceMeters } from "@/lib/constants/geofence";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export async function POST(request: NextRequest) {
  // ── 1. Auth ──
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Not authenticated." }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ code: "SESSION_EXPIRED", message: "Session expired." }, { status: 401 });
  }

  // ── 2. Role check ──
  if (payload.role !== "student") {
    return NextResponse.json({ code: "FORBIDDEN", message: "Forbidden." }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const student = await User.findById(payload.userId);
    if (!student) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Student not found." }, { status: 404 });
    }

    const today = getTodayString();

    // ── 3. Check duplicate ──
    const existingRecord = await AttendanceRecord.findOne({
      student: student._id,
      date: today,
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          message: "Attendance already marked.",
          code: "ALREADY_MARKED",
          record: {
            studentName: existingRecord.studentName,
            registerNumber: existingRecord.registerNumber,
            roomNumber: existingRecord.roomNumber,
            department: existingRecord.department,
            year: existingRecord.year,
            hostelBlock: existingRecord.hostelBlock,
            date: existingRecord.date,
            markedAt: existingRecord.markedAt,
            status: existingRecord.status,
            distanceMeters: existingRecord.location?.distanceMeters ?? existingRecord.distanceFromHostel,
            markingMethod: existingRecord.markingMethod,
          },
        },
        { status: 409 }
      );
    }

    // ── 4. Find active session ──
    const activeSession = await AttendanceSession.findOne({
      date: today,
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (!activeSession) {
      // Check if there's an expired one
      const expiredSession = await AttendanceSession.findOne({
        date: today,
        active: true,
      });

      if (expiredSession) {
        return NextResponse.json(
          {
            message: "Attendance session expired.",
            code: "SESSION_EXPIRED",
          },
          { status: 410 }
        );
      }

      return NextResponse.json(
        {
          message: "No active attendance session available.",
          code: "NO_SESSION",
        },
        { status: 404 }
      );
    }

    // ── 5. Parse & validate GPS payload ──
    const body = await request.json().catch(() => null);
    const latitude = typeof body?.latitude === "number" ? body.latitude : NaN;
    const longitude = typeof body?.longitude === "number" ? body.longitude : NaN;
    const accuracy = typeof body?.accuracy === "number" ? body.accuracy : NaN;

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      isNaN(accuracy) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180 ||
      accuracy < 0
    ) {
      return NextResponse.json(
        {
          code: "LOCATION_REQUIRED",
          message: "Location permission and valid GPS coordinates are required to mark attendance.",
        },
        { status: 400 }
      );
    }

    // ── 6. Check GPS accuracy threshold ──
    if (accuracy > HOSTEL_GEOFENCE.maxAccuracyMeters) {
      return NextResponse.json(
        {
          code: "POOR_GPS_ACCURACY",
          message: "GPS accuracy is too low. Please move to an open area and try again.",
          accuracy: Math.round(accuracy),
          maxAllowedAccuracy: HOSTEL_GEOFENCE.maxAccuracyMeters,
        },
        { status: 400 }
      );
    }

    // ── 7. Server-side Haversine distance calculation ──
    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      HOSTEL_GEOFENCE.latitude,
      HOSTEL_GEOFENCE.longitude
    );
    const roundedDistance = Math.round(distanceMeters);

    // ── 8. Geofence radius check ──
    if (distanceMeters > HOSTEL_GEOFENCE.radiusMeters) {
      return NextResponse.json(
        {
          code: "OUT_OF_BOUNDS",
          message: "You are outside the hostel attendance zone.",
          distanceMeters: roundedDistance,
          allowedRadius: HOSTEL_GEOFENCE.radiusMeters,
        },
        { status: 403 }
      );
    }

    // ── 9. Create attendance record with full profile & GPS details ──
    const markedAt = new Date();
    const timeStr = formatTime(markedAt);

    const regNumber = student.registerNumber?.trim() || "—";

    const record = await AttendanceRecord.create({
      student: student._id,
      studentName: student.fullName,
      registerNumber: regNumber,
      department: student.department?.trim() || "—",
      year: student.year?.trim() || "—",
      hostelBlock: student.hostelBlock?.trim() || "—",
      roomNumber: student.roomNumber?.trim() || "—",
      date: today,
      markedAt,
      status: "present",
      attendanceSession: activeSession._id,
      markingMethod: "QR_GPS",
      distanceFromHostel: roundedDistance,
      location: {
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        distanceMeters: roundedDistance,
      },
    });

    // ── 10. Notifications: Student confirmation + Warden notification ──
    try {
      // Notification for the student
      await Notification.create({
        recipient: student._id,
        title: "Attendance Marked",
        message: `Your attendance has been successfully marked for today at ${timeStr}.`,
        href: "/dashboard/student/attendance",
      });

      // Notification for active wardens
      const wardens = await User.find({ role: "warden" }).select("_id").lean();
      if (wardens.length) {
        await Notification.insertMany(
          wardens.map((warden) => ({
            recipient: warden._id,
            title: "Student Attendance Marked",
            message: `${student.fullName} marked attendance at ${timeStr}.`,
            href: "/dashboard/warden",
          }))
        );
      }
    } catch (notifErr) {
      console.warn("Failed to create attendance notifications:", notifErr);
    }

    return NextResponse.json(
      {
        message: "Attendance marked successfully.",
        code: "SUCCESS",
        distanceMeters: roundedDistance,
        allowedRadius: HOSTEL_GEOFENCE.radiusMeters,
        record: {
          id: record._id.toString(),
          studentName: record.studentName,
          registerNumber: record.registerNumber,
          roomNumber: record.roomNumber,
          department: record.department,
          year: record.year,
          hostelBlock: record.hostelBlock,
          date: record.date,
          markedAt: record.markedAt,
          status: record.status,
          distanceMeters: roundedDistance,
          markingMethod: record.markingMethod,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle MongoDB duplicate key error (race condition safety)
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        {
          message: "Attendance already marked.",
          code: "ALREADY_MARKED",
        },
        { status: 409 }
      );
    }

    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
