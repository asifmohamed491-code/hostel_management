// hooks/useSuperAdminDashboard.tsx
//
// Centralized React Context Provider and hook for the Super Admin Dashboard.
// Provides live MongoDB-backed data for:
// - Top Stat Cards (Students, Wardens, Blocks, Rooms, Occupancy, Active Users)
// - Second row cards (Student Overview, Hostel Occupancy, Hostel Block Overview, Warden Overview)
// - Third row cards (Attendance Analytics, Recent System Activity, System Status)
//
// Follows the same pattern as hooks/useWardenAttendanceStats.tsx:
// 1. Unified loading state
// 2. Synchronized 15-second background polling
// 3. Window focus synchronization
// 4. Zero fake data flash
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
import type {
  SuperAdminStatCard,
  HostelBlockRow,
  WardenOverviewRow,
  AttendanceAnalyticsPoint,
  SystemActivityItem,
  SystemStatusItem,
} from "@/lib/super-admin-dashboard-mock";

export interface StudentOverviewData {
  total: number;
  allocated: number;
  unallocated: number;
}

export interface HostelOccupancyData {
  occupancyPct: number;
  totalRooms: number;
  occupied: number;
  available: number;
}

export interface WardenOverviewData {
  total: number;
  active: number;
  inactive: number;
  recent: WardenOverviewRow[];
}

export interface SuperAdminDashboardStats {
  statCards: SuperAdminStatCard[];
  studentOverview: StudentOverviewData;
  hostelOccupancy: HostelOccupancyData;
  hostelBlocks: HostelBlockRow[];
  wardenOverview: WardenOverviewData;
  attendanceAnalytics: AttendanceAnalyticsPoint[];
  recentActivity: SystemActivityItem[];
  systemStatus: SystemStatusItem[];
  systemStatusSummary: string;
}

interface SuperAdminDashboardContextValue {
  stats: SuperAdminDashboardStats | null;
  loading: boolean;
  isDashboardReady: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SuperAdminDashboardContext =
  createContext<SuperAdminDashboardContextValue | null>(null);

export function SuperAdminDashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [stats, setStats] = useState<SuperAdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(
    async (isBackground = false) => {
      if (!isBackground && !isDashboardReady) {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetch("/api/super-admin/stats", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(
            errBody?.message || "Failed to load Super Admin dashboard statistics"
          );
        }

        const data: SuperAdminDashboardStats = await res.json();

        if (!isMountedRef.current) return;

        setStats(data);
        setIsDashboardReady(true);
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        if (!stats) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Super Admin dashboard"
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [isDashboardReady, stats]
  );

  useEffect(() => {
    fetchDashboardData(false);

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    const handleFocus = () => {
      fetchDashboardData(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchDashboardData]);

  const refetch = useCallback(async () => {
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  const value = useMemo(
    () => ({
      stats,
      loading,
      isDashboardReady,
      error,
      refetch,
    }),
    [stats, loading, isDashboardReady, error, refetch]
  );

  return (
    <SuperAdminDashboardContext.Provider value={value}>
      {children}
    </SuperAdminDashboardContext.Provider>
  );
}

export function useSuperAdminDashboard() {
  const context = useContext(SuperAdminDashboardContext);
  if (!context) {
    throw new Error(
      "useSuperAdminDashboard must be used within a SuperAdminDashboardProvider"
    );
  }
  return context;
}

