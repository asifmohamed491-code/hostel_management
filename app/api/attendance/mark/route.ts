// app/api/attendance/mark/route.ts
//
// POST /api/attendance/mark
// Student-only: marks attendance for today by validating against the
// currently active attendance session. No camera/QR scanning needed —
// the backend finds the active session automatically.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AttendanceSession } from "@/models/AttendanceSession";
import { AttendanceRecord } from "@/models/AttendanceRecord";
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
  if (payload.role !== "student") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const student = await User.findById(payload.userId);
    if (!student) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    const today = getTodayString();

    // ── Check duplicate ──
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
            date: existingRecord.date,
            markedAt: existingRecord.markedAt,
            status: existingRecord.status,
          },
        },
        { status: 409 }
      );
    }

    // ── Find active session ──
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

    // ── Create attendance record ──
    const record = await AttendanceRecord.create({
      student: student._id,
      studentName: student.fullName,
      registerNumber: student.department
        ? `${new Date().getFullYear() - (parseInt(student.year || "1", 10) - 1)}${student.department?.substring(0, 3).toUpperCase()}0124`
        : "2023CSE0124",
      roomNumber: student.roomNumber?.trim() || "214",
      date: today,
      markedAt: new Date(),
      status: "present",
      attendanceSession: activeSession._id,
    });

    return NextResponse.json(
      {
        message: "Attendance marked successfully.",
        code: "SUCCESS",
        record: {
          id: record._id.toString(),
          studentName: record.studentName,
          registerNumber: record.registerNumber,
          roomNumber: record.roomNumber,
          date: record.date,
          markedAt: record.markedAt,
          status: record.status,
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

