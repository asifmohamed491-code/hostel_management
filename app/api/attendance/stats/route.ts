// app/api/attendance/stats/route.ts
//
// GET /api/attendance/stats
// Returns aggregated real-time attendance statistics from MongoDB for the
// Warden and Super Admin dashboards.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { AttendanceSession } from "@/models/AttendanceSession";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const second = parts[1];
  if (first && second) {
    return `${first[0]}${second[0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "ST";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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

    const today = getTodayString();
    const now = new Date();

    // 1. Total registered active students
    const totalStudents = await User.countDocuments({ role: "student" });

    // 2. Total rooms and capacity from Room collection
    const rooms = await Room.find({}).lean();
    const totalRooms = rooms.length;
    const totalRoomCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 4), 0);

    // Occupied students in rooms
    const occupiedStudents = await User.countDocuments({
      role: "student",
      roomNumber: { $exists: true, $ne: "" },
    });

    const roomOccupancyPct =
      totalRoomCapacity > 0
        ? Math.round((occupiedStudents / totalRoomCapacity) * 100)
        : 0;
    const roomOccupancy = `${roomOccupancyPct}%`;

    // 2. Today's attendance counts from MongoDB
    const presentCount = await AttendanceRecord.countDocuments({
      date: today,
      status: "present",
    });

    const lateCount = await AttendanceRecord.countDocuments({
      date: today,
      status: "late",
    });

    // Combined present + late for total attendance today
    const totalPresentToday = presentCount + lateCount;
    const absentToday = Math.max(0, totalStudents - totalPresentToday);

    const attendancePct = totalStudents > 0 ? Math.round((totalPresentToday / totalStudents) * 100) : 0;

    // 3. Last updated time
    const latestRecord = await AttendanceRecord.findOne({ date: today }).sort({ markedAt: -1 }).lean();
    const activeSession = await AttendanceSession.findOne({ date: today, active: true }).lean();
    const lastUpdatedTime = latestRecord?.markedAt
      ? formatTime(new Date(latestRecord.markedAt))
      : activeSession?.createdAt
        ? formatTime(new Date(activeSession.createdAt))
        : formatTime(now);

    // 4. Weekly attendance data (Mon - Sat)
    // Find dates for the current week (Monday to Saturday)
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyAttendance = await Promise.all(
      dayLabels.map(async (label, index) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + index);
        const dateStr = dayDate.toISOString().slice(0, 10);

        // Check if this date has records in DB
        const count = await AttendanceRecord.countDocuments({
          date: dateStr,
          status: { $in: ["present", "late"] },
        });

        if (dateStr === today) {
          const pct = totalStudents > 0 ? Math.round((totalPresentToday / totalStudents) * 100) : 0;
          return { label, value: pct, count: totalPresentToday, date: dateStr };
        }

        if (count > 0) {
          const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
          return { label, value: pct, count, date: dateStr };
        }

        return { label, value: 0, count: 0, date: dateStr };
      })
    );

    // 5. Recent Check-ins (latest real records from MongoDB)
    const recentRecords = await AttendanceRecord.find()
      .sort({ markedAt: -1 })
      .limit(20)
      .lean();

    // Deduplicate by student._id or studentName so each student appears at most once in recent check-ins
    const seenStudents = new Set<string>();
    const uniqueStudentRecords = [];
    for (const rec of recentRecords) {
      const studentKey = rec.student ? rec.student.toString() : rec.studentName;
      if (!seenStudents.has(studentKey)) {
        seenStudents.add(studentKey);
        uniqueStudentRecords.push(rec);
      }
    }

    const recentCheckins = uniqueStudentRecords.slice(0, 3).map((rec) => ({
      id: rec._id.toString(),
      name: rec.studentName,
      room: rec.roomNumber?.startsWith("Room") ? rec.roomNumber : `Room ${rec.roomNumber || "—"}`,
      time: formatTime(new Date(rec.markedAt)),
      initials: getInitials(rec.studentName),
      status: rec.status,
    }));

    // 6. Recent Attendance Table records (deduplicated by record ID)
    const seenRecordIds = new Set<string>();
    const recentAttendanceTable = [];
    for (const rec of recentRecords) {
      const recId = rec._id.toString();
      if (!seenRecordIds.has(recId)) {
        seenRecordIds.add(recId);
        const markedDate = new Date(rec.markedAt);
        const capStatus = rec.status === "late" ? "Late" : rec.status === "absent" ? "Absent" : "Present";
        recentAttendanceTable.push({
          id: recId,
          name: rec.studentName,
          room: rec.roomNumber?.startsWith("Room") ? rec.roomNumber : `Room ${rec.roomNumber || "—"}`,
          status: capStatus as "Present" | "Late" | "Absent",
          date: formatDate(markedDate),
          lastUpdated: formatDate(markedDate),
          initials: getInitials(rec.studentName),
          registerNumber: rec.registerNumber || "—",
          department: rec.department || "—",
          year: rec.year || "—",
          hostelBlock: rec.hostelBlock || "—",
        });
      }
    }

    // Calculated stats
    const stats = {
      totalStudents,
      totalRooms,
      presentToday: totalPresentToday,
      absentToday,
      activeComplaints: 0,
      roomOccupancy,
      todayAttendance: {
        present: presentCount,
        late: lateCount,
        absent: absentToday,
        attendancePct,
        lastUpdated: lastUpdatedTime,
      },
      weeklyAttendance,
      recentCheckins,
      recentAttendanceTable,
    };

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Attendance stats aggregation error:", error);
    return NextResponse.json(
      { message: "Could not aggregate attendance statistics." },
      { status: 500 }
    );
  }
}
