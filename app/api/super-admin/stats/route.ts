// app/api/super-admin/stats/route.ts
//
// GET /api/super-admin/stats
// Aggregates live MongoDB database metrics for the Super Admin Dashboard:
// - Total Students, Wardens, Hostel Blocks, Rooms, Occupancy, Active Users
// - Student Overview (Allocated vs Unassigned)
// - Hostel Occupancy & Hostel Block breakdown
// - Warden Overview & status
// - Attendance Analytics (Mon-Sun weekly data)
// - Recent System Activity (real timestamped events)
// - System Status (Database, Auth, SMTP, API)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthPayload } from "@/lib/auth";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { AttendanceSession } from "@/models/AttendanceSession";
import { Notification } from "@/models/Notification";

function formatRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (payload.role !== "super_admin") {
      return NextResponse.json(
        { message: "Access denied. Super Admin role required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Students
    const totalStudents = await User.countDocuments({ role: "student" });
    const studentsThisMonth = await User.countDocuments({
      role: "student",
      createdAt: { $gte: startOfMonth },
    });
    const studentsCaption =
      studentsThisMonth > 0
        ? `+${studentsThisMonth} this month`
        : "Enrolled students";

    // 2. Total Wardens
    const wardens = await User.find({ role: "warden" })
      .sort({ createdAt: -1 })
      .lean();
    const totalWardens = wardens.length;
    const wardensCaption =
      totalWardens > 0 ? `${totalWardens} active` : "Active wardens";

    // 3. Hostel Blocks
    const roomBlocks = await Room.distinct("hostelBlock");
    const studentBlocks = await User.distinct("hostelBlock", {
      role: "student",
      hostelBlock: { $exists: true, $ne: "" },
    });
    const blockNames = Array.from(
      new Set(
        [...roomBlocks, ...studentBlocks]
          .map((b) => (typeof b === "string" ? b.trim() : ""))
          .filter(Boolean)
      )
    ).sort();
    const totalHostelBlocks = blockNames.length;
    const blocksCaption =
      totalHostelBlocks > 0 ? "All blocks active" : "No blocks created";

    // 4. Rooms and Occupancy
    const allRooms = await Room.find({}).lean();
    const totalRooms = allRooms.length;

    // Determine occupied rooms: rooms that have at least 1 student assigned
    const occupiedRoomAgg = await User.aggregate([
      {
        $match: {
          role: "student",
          roomNumber: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$roomNumber",
          count: { $sum: 1 },
        },
      },
    ]);

    const occupiedRoomNumberSet = new Set(
      occupiedRoomAgg.map((r) => String(r._id).trim())
    );

    const occupiedRooms = allRooms.filter((r) =>
      occupiedRoomNumberSet.has(r.roomNumber.trim())
    ).length;

    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const roomOccupancyPct =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 5. Active Users (all registered accounts in system)
    const totalUsers = await User.countDocuments({});

    // 6. Student Overview (Allocated vs Unassigned)
    const allocatedStudents = await User.countDocuments({
      role: "student",
      roomNumber: { $exists: true, $ne: "" },
    });
    const unallocatedStudents = Math.max(0, totalStudents - allocatedStudents);

    // 7. Hostel Block Overview
    const hostelBlockOverview = blockNames.map((blockName) => {
      const blockRooms = allRooms.filter(
        (r) => r.hostelBlock.trim() === blockName
      );
      const blockTotalRooms = blockRooms.length;
      const blockOccupied = blockRooms.filter((r) =>
        occupiedRoomNumberSet.has(r.roomNumber.trim())
      ).length;
      const blockAvailable = Math.max(0, blockTotalRooms - blockOccupied);
      const blockPct =
        blockTotalRooms > 0
          ? Math.round((blockOccupied / blockTotalRooms) * 100)
          : 0;

      const secondaryLabel: "Available" | "Occupied" =
        blockAvailable > 0 ? "Available" : "Occupied";
      const secondaryValue =
        blockAvailable > 0 ? blockAvailable : blockOccupied;

      return {
        id: blockName.toLowerCase().replace(/\s+/g, "-"),
        name: blockName,
        pct: blockPct,
        rooms: blockTotalRooms,
        secondaryLabel,
        secondaryValue,
      };
    });

    // 8. Warden Overview
    const wardenOverviewRecent = wardens.slice(0, 4).map((w) => ({
      id: w._id.toString(),
      name: w.fullName,
      block: w.hostelBlock?.trim() || "Unassigned",
      status: "Active" as const,
    }));

    // 9. Attendance Analytics (Mon - Sun of current week)
    const currentDayOfWeek = now.getDay(); // 0: Sun, 1: Mon...
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const attendanceAnalytics = await Promise.all(
      dayLabels.map(async (label, index) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + index);
        const dateStr = d.toISOString().slice(0, 10);

        const [presentCount, lateCount, absentCount] = await Promise.all([
          AttendanceRecord.countDocuments({
            date: dateStr,
            status: "present",
          }),
          AttendanceRecord.countDocuments({
            date: dateStr,
            status: "late",
          }),
          AttendanceRecord.countDocuments({
            date: dateStr,
            status: "absent",
          }),
        ]);

        const presentPct =
          totalStudents > 0
            ? Math.round((presentCount / totalStudents) * 100)
            : 0;
        const latePct =
          totalStudents > 0 ? Math.round((lateCount / totalStudents) * 100) : 0;
        const absentPct =
          totalStudents > 0
            ? Math.round((absentCount / totalStudents) * 100)
            : 0;

        return {
          label,
          present: presentPct,
          late: latePct,
          absent: absentPct,
          date: dateStr,
        };
      })
    );

    // 10. Recent System Activity (real timestamped events)
    type ActivityItem = {
      id: string;
      text: string;
      time: string;
      icon: "warden" | "student" | "room" | "block" | "report";
      timestamp: Date;
    };

    const recentActivities: ActivityItem[] = [];

    // Recent Users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    for (const u of recentUsers) {
      if (u.role === "warden") {
        recentActivities.push({
          id: `u-${u._id}`,
          text: `Warden account created (${u.fullName})`,
          time: formatRelativeTime(new Date(u.createdAt), now),
          icon: "warden",
          timestamp: new Date(u.createdAt),
        });
      } else if (u.role === "student") {
        recentActivities.push({
          id: `u-${u._id}`,
          text: `New student registered (${u.fullName})`,
          time: formatRelativeTime(new Date(u.createdAt), now),
          icon: "student",
          timestamp: new Date(u.createdAt),
        });
      }
    }

    // Recent Attendance Records
    const recentAttendance = await AttendanceRecord.find({})
      .sort({ markedAt: -1 })
      .limit(5)
      .lean();

    for (const rec of recentAttendance) {
      recentActivities.push({
        id: `att-${rec._id}`,
        text: `Attendance marked by ${rec.studentName} (${rec.roomNumber || rec.hostelBlock || "Room"})`,
        time: formatRelativeTime(new Date(rec.markedAt), now),
        icon: "report",
        timestamp: new Date(rec.markedAt),
      });
    }

    // Recent Attendance Sessions
    const recentSessions = await AttendanceSession.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    for (const sess of recentSessions) {
      recentActivities.push({
        id: `sess-${sess._id}`,
        text: `Attendance session opened (${sess.date})`,
        time: formatRelativeTime(new Date(sess.createdAt), now),
        icon: "report",
        timestamp: new Date(sess.createdAt),
      });
    }

    // Recent Notifications
    const recentNotifs = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    for (const notif of recentNotifs) {
      recentActivities.push({
        id: `notif-${notif._id}`,
        text: notif.title,
        time: formatRelativeTime(new Date(notif.createdAt), now),
        icon: "report",
        timestamp: new Date(notif.createdAt),
      });
    }

    // Sort combined activities by most recent and take top 5
    recentActivities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const topActivities = recentActivities.slice(0, 5).map((act) => ({
      id: act.id,
      text: act.text,
      time: act.time,
      icon: act.icon,
    }));

    // 11. System Status
    const isDbConnected = mongoose.connection.readyState === 1;
    const isAuthOk = Boolean(process.env.JWT_SECRET);
    const isSmtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER
    );

    const systemStatus = [
      {
        id: "database",
        label: "Database",
        status: isDbConnected ? "Connected" : "Disconnected",
        dot: isDbConnected ? ("green" as const) : ("amber" as const),
      },
      {
        id: "authentication",
        label: "Authentication",
        status: isAuthOk ? "Operational" : "Degraded",
        dot: isAuthOk ? ("green" as const) : ("amber" as const),
      },
      {
        id: "email-smtp",
        label: "Email/SMTP",
        status: isSmtpConfigured ? "Operational" : "Not Configured",
        dot: isSmtpConfigured ? ("green" as const) : ("amber" as const),
      },
      {
        id: "api",
        label: "API",
        status: "Operational",
        dot: "green" as const,
      },
    ];

    const isAllOperational =
      isDbConnected && isAuthOk && isSmtpConfigured;
    const systemStatusSummary = isAllOperational
      ? "All Systems Operational"
      : "System Attention Needed";

    // 12. Top Stat Cards array
    const statCards = [
      {
        id: "total-students",
        label: "Total Students",
        value: String(totalStudents),
        caption: studentsCaption,
        icon: "students" as const,
      },
      {
        id: "total-wardens",
        label: "Total Wardens",
        value: String(totalWardens),
        caption: wardensCaption,
        icon: "wardens" as const,
      },
      {
        id: "total-hostel-blocks",
        label: "Total Hostel Blocks",
        value: String(totalHostelBlocks),
        caption: blocksCaption,
        icon: "blocks" as const,
      },
      {
        id: "total-rooms",
        label: "Total Rooms",
        value: String(totalRooms),
        caption: `${occupiedRooms} occupied`,
        icon: "rooms" as const,
      },
      {
        id: "room-occupancy",
        label: "Room Occupancy",
        value: `${roomOccupancyPct}%`,
        caption: "",
        icon: "occupancy" as const,
        progressPct: roomOccupancyPct,
      },
      {
        id: "active-users",
        label: "Active Users",
        value: String(totalUsers),
        caption: "registered accounts",
        icon: "activeUsers" as const,
      },
    ];

    const responseData = {
      statCards,
      studentOverview: {
        total: totalStudents,
        allocated: allocatedStudents,
        unallocated: unallocatedStudents,
      },
      hostelOccupancy: {
        occupancyPct: roomOccupancyPct,
        totalRooms,
        occupied: occupiedRooms,
        available: availableRooms,
      },
      hostelBlocks: hostelBlockOverview,
      wardenOverview: {
        total: totalWardens,
        active: totalWardens,
        inactive: 0,
        recent: wardenOverviewRecent,
      },
      attendanceAnalytics,
      recentActivity: topActivities,
      systemStatus,
      systemStatusSummary,
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Super Admin stats aggregation error:", error);
    return NextResponse.json(
      { message: "Could not aggregate Super Admin dashboard statistics." },
      { status: 500 }
    );
  }
}

