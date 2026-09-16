// app/api/attendance/report/route.ts
//
// GET /api/attendance/report
// Warden/Super-admin API to retrieve full attendance records for reports & exports.
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

  if (payload.role !== "warden" && payload.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search")?.trim().toLowerCase();

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (dateParam) {
      filter.date = dateParam;
    }
    if (statusParam && statusParam !== "all") {
      filter.status = statusParam;
    }
    if (searchParam) {
      filter.$or = [
        { studentName: { $regex: searchParam, $options: "i" } },
        { registerNumber: { $regex: searchParam, $options: "i" } },
        { roomNumber: { $regex: searchParam, $options: "i" } },
      ];
    }

    const records = await AttendanceRecord.find(filter)
      .sort({ markedAt: -1 })
      .limit(200)
      .lean();

    const formattedRecords = records.map((rec) => {
      const markedDate = new Date(rec.markedAt);
      return {
        id: rec._id.toString(),
        studentName: rec.studentName,
        registerNumber: rec.registerNumber || "—",
        department: rec.department || "Computer Science",
        year: rec.year || "3rd Year",
        hostelBlock: rec.hostelBlock || "Block A",
        roomNumber: rec.roomNumber || "—",
        date: rec.date,
        formattedDate: formatDate(markedDate),
        time: formatTime(markedDate),
        status: rec.status,
        distanceMeters: rec.location?.distanceMeters ?? rec.distanceFromHostel ?? 0,
        markingMethod: rec.markingMethod || "QR_GPS",
      };
    });

    return NextResponse.json(
      {
        total: formattedRecords.length,
        records: formattedRecords,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Attendance report fetch error:", error);
    return NextResponse.json(
      { message: "Could not generate attendance report." },
      { status: 500 }
    );
  }
}

