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

export const dynamic = "force-dynamic";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AttendanceSession } from "@/models/AttendanceSession";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { Notification } from "@/models/Notification";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { HOSTEL_GEOFENCE, calculateDistanceMeters } from "@/lib/constants/geofence";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export async function POST(request: NextRequest) {
  // â”€â”€ 1. Auth â”€â”€
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Not authenticated." }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ code: "SESSION_EXPIRED", message: "Session expired." }, { status: 401 });
  }

  // â”€â”€ 2. Role check â”€â”€
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
    const now = new Date();

    // â”€â”€ 3. Parse JSON body early â”€â”€
    const body = await request.json().catch(() => null);

    // â”€â”€ 4. Extract and validate QR token â”€â”€
    let scannedToken = (typeof body?.qrToken === "string" ? body.qrToken : "").trim();
    if (scannedToken.startsWith("{") && scannedToken.endsWith("}")) {
      try {
        const parsed = JSON.parse(scannedToken);
        if (parsed && typeof parsed.token === "string") {
          scannedToken = parsed.token.trim();
        }
      } catch {
        // preserve scannedToken
      }
    }

    if (!scannedToken) {
      return NextResponse.json(
        {
          code: "INVALID_QR",
          message: "QR code is required to mark attendance.",
        },
        { status: 400 }
      );
    }

    // â”€â”€ 5. Look up session in MongoDB by token â”€â”€
    const session = await AttendanceSession.findOne({ token: scannedToken });

    if (!session) {
      return NextResponse.json(
        {
          code: "INVALID_QR",
          message: "QR is no longer valid. Please scan the current attendance QR.",
        },
        { status: 400 }
      );
    }

    // â”€â”€ 6. Check if session was deactivated/regenerated â”€â”€
    if (!session.active) {
      return NextResponse.json(
        {
          code: "INVALID_QR",
          message: "QR is no longer valid. Please scan the current attendance QR.",
        },
        { status: 400 }
      );
    }

    // â”€â”€ 7. Server timestamp source of truth: verify session has not expired â”€â”€
    if (now.getTime() >= new Date(session.expiresAt).getTime()) {
      await AttendanceSession.updateOne(
        { _id: session._id },
        { $set: { active: false } }
      );

      return NextResponse.json(
        {
          code: "SESSION_EXPIRED",
          message: "Attendance QR has expired.",
        },
        { status: 410 }
      );
    }

    // â”€â”€ 8. Ensure this session is the current active session in the database â”€â”€
    const currentActiveSession = await AttendanceSession.findOne({ active: true }).sort({ createdAt: -1 });
    if (!currentActiveSession || currentActiveSession._id.toString() !== session._id.toString()) {
      return NextResponse.json(
        {
          code: "INVALID_QR",
          message: "QR is no longer valid. Please scan the current attendance QR.",
        },
        { status: 400 }
      );
    }

    const attendanceDate = session.date || today;

    // â”€â”€ 9. Check duplicate attendance for the session date â”€â”€
    const existingRecord = await AttendanceRecord.findOne({
      student: student._id,
      date: attendanceDate,
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
            time: formatTime(new Date(existingRecord.markedAt)),
            status: existingRecord.status,
            distanceMeters: existingRecord.location?.distanceMeters ?? existingRecord.distanceFromHostel,
            markingMethod: existingRecord.markingMethod,
          },
        },
        { status: 409 }
      );
    }

    // â”€â”€ 10. Parse & validate GPS payload â”€â”€
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

    // â”€â”€ 11. Check GPS accuracy threshold â”€â”€
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

    // â”€â”€ 12. Server-side Haversine distance calculation â”€â”€
    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      HOSTEL_GEOFENCE.latitude,
      HOSTEL_GEOFENCE.longitude
    );
    const roundedDistance = Math.round(distanceMeters);

    // â”€â”€ 13. Geofence radius check â”€â”€
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

    // â”€â”€ 14. Create attendance record with full profile & GPS details â”€â”€
    const markedAt = new Date();
    const timeStr = formatTime(markedAt);

    const regNumber = student.registerNumber?.trim() || "â€”";

    const record = await AttendanceRecord.create({
      student: student._id,
      studentName: student.fullName,
      registerNumber: regNumber,
      department: student.department?.trim() || "â€”",
      year: student.year?.trim() || "â€”",
      hostelBlock: student.hostelBlock?.trim() || "â€”",
      roomNumber: student.roomNumber?.trim() || "â€”",
      date: attendanceDate,
      markedAt,
      status: "present",
      attendanceSession: session._id,
      markingMethod: "QR_GPS",
      distanceFromHostel: roundedDistance,
      location: {
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        distanceMeters: roundedDistance,
      },
    });

    // â”€â”€ 10. Notifications: Student confirmation + Warden notification â”€â”€
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
          time: timeStr,
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
