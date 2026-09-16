// app/api/attendance/history/route.ts
//
// GET /api/attendance/history
// Returns the authenticated student's attendance history from MongoDB.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

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

    const totalMarked = records.length;
    const presentCount = records.filter((r) => r.status === "present").length;
    const lateCount = records.filter((r) => r.status === "late").length;

    return NextResponse.json(
      {
        history,
        stats: {
          totalMarked,
          presentCount,
          lateCount,
          attendancePct: totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100,
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

