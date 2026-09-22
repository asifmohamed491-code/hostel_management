// hooks/useSuperAdminDashboard.tsx
//
// Centralized React Context Provider and hook for the Super Admin Dashboard.
// Provides live MongoDB-backed data for:
// - Top Stat Cards (Students, Wardens, Blocks, Rooms, Occupancy, Active Users)
// - Second row cards (Student Overview, Hostel Occupancy, Hostel Block Overview, Warden Overview)
// - Third row cards (Attendance Analytics, Recent System Activity, System Status)
//
// Guarantees:
// 1. Initial dashboard load occurs exactly ONCE on mount
// 2. No recursive re-fetching or re-render loops
// 3. Stable 15-second background polling without resetting loading states
// 4. Stable window focus synchronization
// 5. In-flight request deduplication
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

  // References to keep callbacks completely stable without re-creation
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const isDashboardReadyRef = useRef(false);
  const statsRef = useRef<SuperAdminDashboardStats | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isDashboardReadyRef.current = isDashboardReady;
  }, [isDashboardReady]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Completely stable fetch callback — empty dependencies, uses refs
  const fetchDashboardData = useCallback(async (isBackground = false) => {
    // Prevent overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Only set visible loading state on initial fetch before data is ready
    if (!isBackground && !isDashboardReadyRef.current) {
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

      isDashboardReadyRef.current = true;
      statsRef.current = data;
      setStats(data);
      setIsDashboardReady(true);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Only set error if no previous data has been loaded
      if (!statsRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Super Admin dashboard"
        );
      }
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch once on mount
    fetchDashboardData(false);

    // 15-second background polling
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    // Refetch on window focus
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
