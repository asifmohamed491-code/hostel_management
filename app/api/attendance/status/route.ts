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

    // Find active session for today
    const activeSession = await AttendanceSession.findOne({
      date: today,
      active: true,
    }).populate("generatedBy", "fullName");

    if (!activeSession) {
      return NextResponse.json(
        {
          hasActiveSession: false,
          session: null,
          studentRecord: null,
        },
        { status: 200 }
      );
    }

    const isExpired = new Date() > activeSession.expiresAt;

    // If the requester is a student, also check if they've already marked
    let studentRecord = null;
    if (payload.role === "student") {
      const record = await AttendanceRecord.findOne({
        student: payload.userId,
        date: today,
      });
      if (record) {
        studentRecord = {
          date: record.date,
          markedAt: record.markedAt,
          status: record.status,
        };
      }
    }

    // Get warden name from populated field
    const wardenUser = activeSession.generatedBy as unknown as { fullName?: string };
    const wardenName = wardenUser?.fullName || "Warden";

    return NextResponse.json(
      {
        hasActiveSession: true,
        session: {
          id: activeSession._id.toString(),
          token: activeSession.token,
          date: activeSession.date,
          createdAt: activeSession.createdAt,
          expiresAt: activeSession.expiresAt,
          active: activeSession.active && !isExpired,
          expired: isExpired,
          generatedBy: wardenName,
        },
        studentRecord,
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

