// app/api/attendance/status/route.ts
//
// GET /api/attendance/status
// Returns the current active attendance session status for today.
// Used by both Warden (to see current session) and Student (to check
// if an active session exists before attempting to mark).
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import "@/models/User";
import { AttendanceSession } from "@/models/AttendanceSession";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { HOSTEL_GEOFENCE } from "@/lib/constants/geofence";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  // ── Auth ──
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: "Session expired." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const today = getTodayString();
    const now = new Date();

    // 1. Look for currently active session first (newest first)
    let session = await AttendanceSession.findOne({
      active: true,
    })
      .sort({ createdAt: -1 })
      .populate("generatedBy", "fullName");

    // 2. If no active session, look for the most recent session for today (which may have expired)
    if (!session) {
      session = await AttendanceSession.findOne({
        date: today,
      })
        .sort({ createdAt: -1 })
        .populate("generatedBy", "fullName");
    }

    // If no session exists at all
    if (!session) {
      let studentRecord = null;
      if (payload.role === "student") {
        const record = await AttendanceRecord.findOne({
          student: payload.userId,
          date: today,
        });
        if (record) {
          studentRecord = {
            studentName: record.studentName,
            registerNumber: record.registerNumber,
            roomNumber: record.roomNumber,
            date: record.date,
            markedAt: record.markedAt,
            status: record.status,
            distanceMeters: record.location?.distanceMeters,
          };
        }
      }

      return NextResponse.json(
        {
          hasActiveSession: false,
          session: null,
          studentRecord,
          geofence: {
            radiusMeters: HOSTEL_GEOFENCE.radiusMeters,
          },
        },
        { status: 200 }
      );
    }

    // 3. Server timestamp source of truth for expiry
    const isExpired = !session.active || now.getTime() >= new Date(session.expiresAt).getTime();

    // If expired but still marked active in DB, deactivate proactively
    if (session.active && isExpired) {
      await AttendanceSession.updateOne(
        { _id: session._id },
        { $set: { active: false } }
      );
      session.active = false;
    }

    // 4. If requester is a student, check if they've already marked attendance
    let studentRecord = null;
    if (payload.role === "student") {
      const attendanceDate = session.date || today;
      const record = await AttendanceRecord.findOne({
        student: payload.userId,
        date: attendanceDate,
      });
      if (record) {
        studentRecord = {
          studentName: record.studentName,
          registerNumber: record.registerNumber,
          roomNumber: record.roomNumber,
          date: record.date,
          markedAt: record.markedAt,
          status: record.status,
          distanceMeters: record.location?.distanceMeters,
        };
      }
    }

    // Get warden name from populated field
    const wardenUser = session.generatedBy as unknown as { fullName?: string };
    const wardenName = wardenUser?.fullName || "Warden";

    const isSessionActive = session.active && !isExpired;

    return NextResponse.json(
      {
        hasActiveSession: isSessionActive,
        session: {
          id: session._id.toString(),
          token: session.token,
          date: session.date,
          createdAt: session.createdAt,
          generatedAt: session.generatedAt || session.createdAt,
          expiresAt: session.expiresAt,
          active: isSessionActive,
          expired: isExpired,
          generatedBy: wardenName,
        },
        studentRecord,
        geofence: {
          radiusMeters: HOSTEL_GEOFENCE.radiusMeters,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Attendance status error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

