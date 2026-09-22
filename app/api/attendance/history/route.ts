// app/api/attendance/history/route.ts
//
// GET /api/attendance/history
// Returns the authenticated student's attendance history from MongoDB.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { AttendanceSession } from "@/models/AttendanceSession";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

export const dynamic = "force-dynamic";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function GET(request: NextRequest) {
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

    // Students can only view their own history. Wardens can query by ?studentId=...
    let targetStudentId = payload.userId;
    if (payload.role !== "student") {
      const { searchParams } = new URL(request.url);
      const queryStudentId = searchParams.get("studentId");
      if (queryStudentId) {
        targetStudentId = queryStudentId;
      }
    }

    const records = await AttendanceRecord.find({ student: targetStudentId })
      .sort({ markedAt: -1 })
      .limit(30)
      .lean();

    const history = records.map((rec) => {
      const markedDate = new Date(rec.markedAt);
      return {
        id: rec._id.toString(),
        date: rec.date,
        formattedDate: formatDate(markedDate),
        time: formatTime(markedDate),
        status: rec.status,
        distanceMeters: rec.location?.distanceMeters ?? rec.distanceFromHostel,
        markingMethod: rec.markingMethod || "QR_GPS",
        roomNumber: rec.roomNumber,
      };
    });

    // All-time records for accurate dynamic statistics
    const allStudentRecords = await AttendanceRecord.find({ student: targetStudentId }).lean();
    const presentCount = allStudentRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const explicitAbsent = allStudentRecords.filter((r) => r.status === "absent").length;

    // Check sessions to count unattended sessions as absent
    const sessionDates = await AttendanceSession.distinct("date");
    const attendedDates = new Set(
      allStudentRecords
        .filter((r) => r.status === "present" || r.status === "late")
        .map((r) => r.date)
    );
    const missedSessions = sessionDates.filter((d) => !attendedDates.has(d)).length;
    const absentCount = Math.max(explicitAbsent, missedSessions);

    const totalMarked = allStudentRecords.length;
    const totalAttendance = presentCount + absentCount;
    const attendancePercentage = totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

    return NextResponse.json(
      {
        history,
        stats: {
          totalMarked,
          presentCount,
          present: presentCount,
          absentCount,
          absent: absentCount,
          lateCount: 0,
          attendancePct: attendancePercentage,
          percentage: attendancePercentage,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Attendance history error:", error);
    return NextResponse.json(
      { message: "Could not load attendance history." },
      { status: 500 }
    );
  }
}

