// app/api/attendance/report/route.ts
//
// GET /api/attendance/report
// Warden/Super-admin API to retrieve full attendance records for reports & exports.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { User } from "@/models/User";
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

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    const dateParam = searchParams.get("date")?.trim() || getTodayString();
    const statusParam = searchParams.get("status")?.trim().toLowerCase();
    const searchParam = searchParams.get("search")?.trim().toLowerCase();

    // 1. Fetch all registered students
    const allStudents = await User.find({ role: "student" })
      .sort({ fullName: 1 })
      .lean();

    // 2. Fetch all attendance records for the target date
    const attendanceRecords = await AttendanceRecord.find({ date: dateParam })
      .sort({ markedAt: -1 })
      .lean();

    // Map attendance records by student ID (and by student registerNumber or name if needed)
    const recordByStudentId = new Map<string, (typeof attendanceRecords)[0]>();
    const recordByStudentName = new Map<string, (typeof attendanceRecords)[0]>();

    for (const rec of attendanceRecords) {
      if (rec.student) {
        recordByStudentId.set(rec.student.toString(), rec);
      }
      if (rec.studentName) {
        recordByStudentName.set(rec.studentName.toLowerCase().trim(), rec);
      }
    }

    // 3. Build comprehensive list of student attendance (Present + Absent)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allItems: any[] = [];
    const processedStudentIds = new Set<string>();

    for (const student of allStudents) {
      const studentId = student._id.toString();
      processedStudentIds.add(studentId);

      const rec =
        recordByStudentId.get(studentId) ||
        recordByStudentName.get(student.fullName.toLowerCase().trim());

      const isPresent = Boolean(rec && (rec.status === "present" || rec.status === "late"));
      const markedDate = rec?.markedAt ? new Date(rec.markedAt) : null;

      allItems.push({
        id: rec ? rec._id.toString() : `absent-${studentId}`,
        studentId,
        studentName: student.fullName || rec?.studentName || "Student",
        registerNumber: student.registerNumber || rec?.registerNumber || "",
        department: student.department || rec?.department || "",
        year: student.year || rec?.year || "",
        hostelBlock: student.hostelBlock || rec?.hostelBlock || "",
        roomNumber: student.roomNumber || rec?.roomNumber || "",
        date: dateParam,
        formattedDate: markedDate ? formatDate(markedDate) : formatDate(new Date(dateParam)),
        time: markedDate ? formatTime(markedDate) : "—",
        status: isPresent ? "Present" : "Absent",
        distanceMeters: isPresent
          ? (rec?.location?.distanceMeters ?? rec?.distanceFromHostel ?? 0)
          : undefined,
        markingMethod: isPresent ? (rec?.markingMethod || "QR_GPS") : "—",
      });
    }

    // Also include any attendance record whose student user might not be in allStudents
    for (const rec of attendanceRecords) {
      const sId = rec.student?.toString();
      if (sId && !processedStudentIds.has(sId)) {
        processedStudentIds.add(sId);
        const markedDate = rec.markedAt ? new Date(rec.markedAt) : new Date(dateParam);
        const isPresent = rec.status === "present" || rec.status === "late";
        allItems.push({
          id: rec._id.toString(),
          studentId: sId,
          studentName: rec.studentName || "Student",
          registerNumber: rec.registerNumber || "",
          department: rec.department || "",
          year: rec.year || "",
          hostelBlock: rec.hostelBlock || "",
          roomNumber: rec.roomNumber || "",
          date: dateParam,
          formattedDate: formatDate(markedDate),
          time: isPresent ? formatTime(markedDate) : "—",
          status: isPresent ? "Present" : "Absent",
          distanceMeters: isPresent
            ? (rec.location?.distanceMeters ?? rec.distanceFromHostel ?? 0)
            : undefined,
          markingMethod: isPresent ? (rec.markingMethod || "QR_GPS") : "—",
        });
      }
    }

    // If there are no registered students at all in DB, but there are attendance records
    if (allItems.length === 0 && attendanceRecords.length > 0) {
      for (const rec of attendanceRecords) {
        const markedDate = rec.markedAt ? new Date(rec.markedAt) : new Date(dateParam);
        const isPresent = rec.status === "present" || rec.status === "late";
        allItems.push({
          id: rec._id.toString(),
          studentId: rec.student?.toString() || rec._id.toString(),
          studentName: rec.studentName || "Student",
          registerNumber: rec.registerNumber || "",
          department: rec.department || "",
          year: rec.year || "",
          hostelBlock: rec.hostelBlock || "",
          roomNumber: rec.roomNumber || "",
          date: dateParam,
          formattedDate: formatDate(markedDate),
          time: isPresent ? formatTime(markedDate) : "—",
          status: isPresent ? "Present" : "Absent",
          distanceMeters: isPresent
            ? (rec.location?.distanceMeters ?? rec.distanceFromHostel ?? 0)
            : undefined,
          markingMethod: isPresent ? (rec.markingMethod || "QR_GPS") : "—",
        });
      }
    }

    // 4. Calculate Overall Summary (Total Students, Present, Absent, Attendance %)
    const totalStudents = allItems.length;
    const presentCount = allItems.filter((i) => i.status === "Present").length;
    const absentCount = totalStudents - presentCount;
    const overallAttendancePct =
      totalStudents > 0 ? `${((presentCount / totalStudents) * 100).toFixed(1)}%` : "0%";

    const summary = {
      totalStudents,
      present: presentCount,
      absent: absentCount,
      overallAttendancePct,
    };

    // 5. Calculate Block-wise Summary
    const blockMap = new Map<string, { total: number; present: number; absent: number }>();

    for (const item of allItems) {
      const blockKey = item.hostelBlock?.trim() || "Unassigned";
      const existing = blockMap.get(blockKey) || { total: 0, present: 0, absent: 0 };
      existing.total += 1;
      if (item.status === "Present") {
        existing.present += 1;
      } else {
        existing.absent += 1;
      }
      blockMap.set(blockKey, existing);
    }

    const blockSummary = Array.from(blockMap.entries())
      .map(([blockName, counts]) => ({
        hostelBlock: blockName,
        totalStudents: counts.total,
        present: counts.present,
        absent: counts.absent,
        attendancePct:
          counts.total > 0 ? `${((counts.present / counts.total) * 100).toFixed(1)}%` : "0%",
      }))
      .sort((a, b) => a.hostelBlock.localeCompare(b.hostelBlock));

    // 6. Apply filters for table view
    let filteredRecords = allItems;

    if (statusParam && statusParam !== "all") {
      filteredRecords = filteredRecords.filter(
        (rec) => rec.status.toLowerCase() === statusParam
      );
    }

    if (searchParam) {
      filteredRecords = filteredRecords.filter((rec) => {
        return (
          rec.studentName?.toLowerCase().includes(searchParam) ||
          rec.registerNumber?.toLowerCase().includes(searchParam) ||
          rec.roomNumber?.toLowerCase().includes(searchParam) ||
          rec.department?.toLowerCase().includes(searchParam) ||
          rec.hostelBlock?.toLowerCase().includes(searchParam)
        );
      });
    }

    const parsedDate = new Date(dateParam + "T00:00:00");
    const displayDate = !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : dateParam;

    return NextResponse.json(
      {
        date: dateParam,
        formattedDate: displayDate,
        summary,
        blockSummary,
        total: filteredRecords.length,
        records: filteredRecords,
        allRecordsForExport: allItems,
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

