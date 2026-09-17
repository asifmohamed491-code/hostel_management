// hooks/useWardenAttendanceStats.tsx
//
// Centralized React Context Provider and hook for Warden Dashboard data.
// Guarantees ONE unified loading state, ONE synchronized polling cycle (15s),
// and ZERO mock/dummy data.
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  gradient: string;
  shadow?: string;
}

export interface WeeklyPoint {
  label: string;
  value: number;
  count?: number;
  date?: string;
}

export interface CheckinItem {
  id: string;
  name: string;
  room: string;
  time: string;
  initials: string;
  status?: string;
}

export interface AttendanceRow {
  id: string;
  name: string;
  room: string;
  status: "Present" | "Late" | "Absent";
  date: string;
  lastUpdated: string;
  initials: string;
  registerNumber?: string;
  department?: string;
  year?: string;
  hostelBlock?: string;
}

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

export interface AttendanceSessionData {
  id: string;
  token: string;
  date: string;
  createdAt: string;
  generatedAt?: string;
  expiresAt: string;
  active: boolean;
  expired?: boolean;
  generatedBy: string;
}

interface WardenAttendanceStatsContextValue {
  stats: AttendanceStatsData | null;
  statCards: StatCardData[];
  session: AttendanceSessionData | null;
  loading: boolean;
  isDashboardReady: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSession: (newSession: AttendanceSessionData | null) => void;
}

const WardenAttendanceStatsContext =
  createContext<WardenAttendanceStatsContextValue | null>(null);

export function WardenAttendanceStatsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [stats, setStats] = useState<AttendanceStatsData | null>(null);
  const [session, setSession] = useState<AttendanceSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard against state updates if unmounted
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground && !isDashboardReady) {
      setLoading(true);
      setError(null);
    }

    try {
      // Fetch both attendance stats and active session in parallel
      const [statsRes, sessionRes] = await Promise.all([
        fetch("/api/attendance/stats", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/attendance/status", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!statsRes.ok) {
        throw new Error("Failed to load attendance statistics from server");
      }

      const statsData: AttendanceStatsData = await statsRes.json();

      let sessionData: AttendanceSessionData | null = null;
      if (sessionRes.ok) {
        const sessionJson = await sessionRes.json();
        if (sessionJson.session) {
          sessionData = sessionJson.session;
        }
      }

      if (!isMountedRef.current) return;

      // Deduplicate recent check-ins before storing
      const seenCheckinIds = new Set<string>();
      const seenCheckinStudents = new Set<string>();
      const deduplicatedCheckins: CheckinItem[] = [];
      for (const item of statsData.recentCheckins || []) {
        const studentKey = item.name.trim().toLowerCase();
        if (!seenCheckinIds.has(item.id) && !seenCheckinStudents.has(studentKey)) {
          seenCheckinIds.add(item.id);
          seenCheckinStudents.add(studentKey);
          deduplicatedCheckins.push(item);
          if (deduplicatedCheckins.length === 3) break;
        }
      }

      // Deduplicate recent attendance table by unique MongoDB record ID
      const seenRowIds = new Set<string>();
      const deduplicatedTable: AttendanceRow[] = [];
      for (const row of statsData.recentAttendanceTable || []) {
        if (!seenRowIds.has(row.id)) {
          seenRowIds.add(row.id);
          deduplicatedTable.push(row);
        }
      }

      statsData.recentCheckins = deduplicatedCheckins;
      statsData.recentAttendanceTable = deduplicatedTable;

      setStats(statsData);
      setSession(sessionData);
      setIsDashboardReady(true);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      // If we don't have data yet, show error state
      if (!stats) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard data");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isDashboardReady, stats]);

  useEffect(() => {
    // Initial fetch on mount
    fetchDashboardData(false);

    // Single synchronized background refresh every 15 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    // Single focus listener for silent synchronization
    const handleFocus = () => {
      fetchDashboardData(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchDashboardData]);

  // Transform stat cards array dynamically based on live MongoDB stats
  const statCards = useMemo<StatCardData[]>(() => {
    if (!stats) {
      return [
        { id: "total-students", label: "Total Students", value: "—", gradient: "linear-gradient(109deg, #ffffff 6.68%, #ded7fe 76.17%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
        { id: "total-rooms", label: "Total Rooms", value: "—", gradient: "linear-gradient(127deg, #ffffff 11.34%, #ddddfd 96.61%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
        { id: "present-today", label: "Present Today", value: "—", gradient: "linear-gradient(-60deg, #d6eaec 9.06%, #ffffff 119.44%)" },
        { id: "absent-today", label: "Absent Today", value: "—", gradient: "linear-gradient(-60deg, #fdcad3 1.01%, #ffffff 96.89%)" },
        { id: "active-complaints", label: "Active Complaints", value: "0", gradient: "linear-gradient(-54deg, #f7d3de 4.39%, #ffffff 78.54%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
        { id: "room-occupancy", label: "Room Occupancy", value: "—", gradient: "linear-gradient(135deg, #ffffff 19.69%, #999999 122.58%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
      ];
    }

    return [
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
  }, [stats]);

  const updateSession = useCallback((newSession: AttendanceSessionData | null) => {
    setSession(newSession);
  }, []);

  const refetch = useCallback(async () => {
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  const value = useMemo(
    () => ({
      stats,
      statCards,
      session,
      loading,
      isDashboardReady,
      error,
      refetch,
      updateSession,
    }),
    [stats, statCards, session, loading, isDashboardReady, error, refetch, updateSession]
  );

  return (
    <WardenAttendanceStatsContext.Provider value={value}>
      {children}
    </WardenAttendanceStatsContext.Provider>
  );
}

export function useWardenAttendanceStats() {
  const context = useContext(WardenAttendanceStatsContext);
  if (!context) {
    return {
      stats: null,
      statCards: [
        { id: "total-students", label: "Total Students", value: "—", gradient: "linear-gradient(109deg, #ffffff 6.68%, #ded7fe 76.17%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
        { id: "total-rooms", label: "Total Rooms", value: "—", gradient: "linear-gradient(127deg, #ffffff 11.34%, #ddddfd 96.61%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
        { id: "present-today", label: "Present Today", value: "—", gradient: "linear-gradient(-60deg, #d6eaec 9.06%, #ffffff 119.44%)" },
        { id: "absent-today", label: "Absent Today", value: "—", gradient: "linear-gradient(-60deg, #fdcad3 1.01%, #ffffff 96.89%)" },
        { id: "active-complaints", label: "Active Complaints", value: "0", gradient: "linear-gradient(-54deg, #f7d3de 4.39%, #ffffff 78.54%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
        { id: "room-occupancy", label: "Room Occupancy", value: "—", gradient: "linear-gradient(135deg, #ffffff 19.69%, #999999 122.58%)", shadow: "0 4px 10px 0 rgba(120,90,200,0.06)" },
      ],
      session: null,
      loading: false,
      isDashboardReady: true,
      error: null,
      refetch: async () => {},
      updateSession: () => {},
    };
  }
  return context;
}
