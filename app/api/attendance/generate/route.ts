// app/api/attendance/generate/route.ts
//
// POST /api/attendance/generate
// Warden-only: creates a new attendance session for today.
// Deactivates any previous session for the same date, then creates
// a fresh one with a cryptographically random token.
// Sends "Attendance Open" notification to all students.
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AttendanceSession } from "@/models/AttendanceSession";
import { Notification } from "@/models/Notification";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  // ── Auth ──
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: "Session expired." }, { status: 401 });
  }

  // ── Role check ──
  if (payload.role !== "warden") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const warden = await User.findById(payload.userId);
    if (!warden) {
      return NextResponse.json({ message: "Warden not found." }, { status: 404 });
    }

    const today = getTodayString();

    // Deactivate any existing sessions for today
    await AttendanceSession.updateMany(
      { date: today, active: true },
      { $set: { active: false } }
    );

    // Generate a secure random token
    const sessionToken = `OASYS-${crypto.randomBytes(16).toString("hex").toUpperCase()}-${Date.now()}`;

    // Session expires at 11:59 PM today
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const session = await AttendanceSession.create({
      token: sessionToken,
      generatedBy: warden._id,
      date: today,
      expiresAt,
      active: true,
    });

    // Broadcast "Attendance Open" notification to all students
    const students = await User.find({ role: "student" }).select("_id").lean();
    if (students.length) {
      await Notification.insertMany(
        students.map((student) => ({
          recipient: student._id,
          title: "Attendance Open",
          message: "Today's hostel attendance is now open. Please mark your attendance.",
          href: "/dashboard/student/attendance",
        }))
      );
    }

    return NextResponse.json(
      {
        message: "Attendance session created.",
        session: {
          id: session._id.toString(),
          token: session.token,
          date: session.date,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          active: session.active,
          generatedBy: warden.fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Generate attendance session error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
