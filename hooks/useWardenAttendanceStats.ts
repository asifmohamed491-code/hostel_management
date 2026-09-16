// hooks/useWardenAttendanceStats.ts
//
// React hook to fetch and synchronize live MongoDB attendance statistics
// for Warden & Super Admin dashboards.
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STAT_CARDS,
  TODAY_ATTENDANCE,
  WEEKLY_ATTENDANCE,
  RECENT_CHECKINS,
  ATTENDANCE_TABLE,
  type StatCardData,
  type WeeklyPoint,
  type CheckinItem,
  type AttendanceRow,
} from "@/lib/dashboard-mock";

export interface AttendanceStatsData {
  totalStudents: number;
  totalRooms: number;
  presentToday: number;
  absentToday: number;
  activeComplaints: number;
  roomOccupancy: string;
  todayAttendance: {
    present: number;
    late: number;
    absent: number;
    attendancePct: number;
    lastUpdated: string;
  };
  weeklyAttendance: WeeklyPoint[];
  recentCheckins: CheckinItem[];
  recentAttendanceTable: AttendanceRow[];
}

export function useWardenAttendanceStats() {
  const [stats, setStats] = useState<AttendanceStatsData>({
    totalStudents: 628,
    totalRooms: 83,
    presentToday: TODAY_ATTENDANCE.present,
    absentToday: TODAY_ATTENDANCE.absent,
    activeComplaints: 0,
    roomOccupancy: "80%",
    todayAttendance: TODAY_ATTENDANCE,
    weeklyAttendance: WEEKLY_ATTENDANCE,
    recentCheckins: RECENT_CHECKINS,
    recentAttendanceTable: ATTENDANCE_TABLE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/stats", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load attendance statistics");
      const data: AttendanceStatsData = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Re-fetch when window gains focus or at subtle intervals (e.g. 15s)
    const handleFocus = () => fetchStats();
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(fetchStats, 15000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [fetchStats]);

  // Transform stat cards array dynamically based on live data
  const statCards: StatCardData[] = [
    {
      id: "total-students",
      label: "Total Students",
      value: String(stats.totalStudents),
      gradient: "linear-gradient(109deg, #ffffff 6.68%, #ded7fe 76.17%)",
      shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
    },
    {
      id: "total-rooms",
      label: "Total Rooms",
      value: String(stats.totalRooms),
      gradient: "linear-gradient(127deg, #ffffff 11.34%, #ddddfd 96.61%)",
      shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
    },
    {
      id: "present-today",
      label: "Present Today",
      value: String(stats.presentToday),
      gradient: "linear-gradient(-60deg, #d6eaec 9.06%, #ffffff 119.44%)",
    },
    {
      id: "absent-today",
      label: "Absent Today",
      value: String(stats.absentToday),
      gradient: "linear-gradient(-60deg, #fdcad3 1.01%, #ffffff 96.89%)",
    },
    {
      id: "active-complaints",
      label: "Active Complaints",
      value: String(stats.activeComplaints),
      gradient: "linear-gradient(-54deg, #f7d3de 4.39%, #ffffff 78.54%)",
      shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
    },
    {
      id: "room-occupancy",
      label: "Room Occupancy",
      value: stats.roomOccupancy,
      gradient: "linear-gradient(135deg, #ffffff 19.69%, #999999 122.58%)",
      shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
    },
  ];

  return {
    stats,
    statCards,
    loading,
    error,
    refetch: fetchStats,
  };
}

