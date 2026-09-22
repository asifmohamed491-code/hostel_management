// hooks/useStudentDashboard.tsx
//
// Centralized React Context Provider and hook for the Student Dashboard.
// Provides live MongoDB-backed data for:
// - My Room (block, roomNumber, floor, roommates)
// - Attendance (present, absent, percentage)
// - Recent Notifications (dynamic from Notification collection, latest first)
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
import type { SafeUser } from "@/lib/auth";

export interface StudentRoommate {
  id: string;
  name: string;
  bed: string;
  initials: string;
}

export interface StudentRoomData {
  block: string;
  roomNumber: string;
  floor: string;
  roommates: StudentRoommate[];
}

export interface StudentAttendanceData {
  present: number;
  absent: number;
  percentage: number;
}

export interface StudentNotificationItem {
  id: string;
  date: string;
  title: string;
  message: string;
  type: "alert" | "event" | "reminder";
  read: boolean;
  createdAt: string;
}

export interface StudentDashboardContextValue {
  user: SafeUser | null;
  room: StudentRoomData;
  attendance: StudentAttendanceData;
  notifications: StudentNotificationItem[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const StudentDashboardContext =
  createContext<StudentDashboardContextValue | null>(null);

function getFloorFromRoom(roomNumber?: string): string {
  if (!roomNumber) return "Not Assigned";
  const match = roomNumber.match(/\d+/);
  if (!match) return "Ground Floor";
  const num = parseInt(match[0], 10);
  if (num >= 100 && num < 200) return "1st Floor";
  if (num >= 200 && num < 300) return "2nd Floor";
  if (num >= 300 && num < 400) return "3rd Floor";
  if (num >= 400 && num < 500) return "4th Floor";
  if (num >= 500 && num < 600) return "5th Floor";
  if (num < 100) return "Ground Floor";
  const floorNum = Math.floor(num / 100);
  return `${floorNum}th Floor`;
}

function formatNotificationDate(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function inferNotificationType(
  title: string,
  message: string
): "alert" | "event" | "reminder" {
  const text = `${title} ${message}`.toLowerCase();
  if (text.includes("event") || text.includes("dinner") || text.includes("celebration") || text.includes("fest")) {
    return "event";
  }
  if (text.includes("reminder") || text.includes("inspect") || text.includes("due") || text.includes("session")) {
    return "reminder";
  }
  return "alert";
}

export function StudentDashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [roommates, setRoommates] = useState<StudentRoommate[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceData>({
    present: 0,
    absent: 0,
    percentage: 0,
  });
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStudentData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Current user
      const userRes = await fetch("/api/auth/me", { credentials: "include" });
      let currentUser: SafeUser | null = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        currentUser = userData.user || null;
      }

      // 2. Attendance history & stats
      const attRes = await fetch("/api/attendance/history", { credentials: "include" });
      let attStats: StudentAttendanceData = { present: 0, absent: 0, percentage: 0 };
      if (attRes.ok) {
        const attData = await attRes.json();
        const s = attData.stats || {};
        const p = typeof s.present === "number" ? s.present : (s.presentCount || 0);
        const a = typeof s.absent === "number" ? s.absent : (s.absentCount || 0);
        const pct = typeof s.percentage === "number" ? s.percentage : (s.attendancePct || 0);
        attStats = {
          present: p,
          absent: a,
          percentage: pct,
        };
      }

      // 3. Notifications
      const notifRes = await fetch("/api/notifications", { credentials: "include" });
      let notifItems: StudentNotificationItem[] = [];
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const rawList = Array.isArray(notifData.notifications) ? notifData.notifications : [];
        notifItems = rawList.map((item: any) => ({
          id: item.id || String(Math.random()),
          date: formatNotificationDate(item.createdAt),
          title: item.title || "Notification",
          message: item.message || item.title || "",
          type: inferNotificationType(item.title || "", item.message || ""),
          read: Boolean(item.read),
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }

      // 4. Roommates (if user is assigned to a room)
      let mates: StudentRoommate[] = [];
      if (currentUser?.roomNumber && currentUser?.hostelBlock) {
        const matesRes = await fetch("/api/students?roommates=true", { credentials: "include" });
        if (matesRes.ok) {
          const matesData = await matesRes.json();
          if (Array.isArray(matesData.roommates)) {
            mates = matesData.roommates;
          }
        }
      }

      if (!isMountedRef.current) return;

      setUser(currentUser);
      setAttendance(attStats);
      setNotifications(notifItems);
      setRoommates(mates);
    } catch (err) {
      console.error("Student dashboard data fetch error:", err);
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const room: StudentRoomData = useMemo(() => {
    const block = user?.hostelBlock?.trim() || "Not Assigned";
    const roomNumber = user?.roomNumber?.trim() || "Not Assigned";
    const floor = getFloorFromRoom(user?.roomNumber);
    return {
      block,
      roomNumber,
      floor,
      roommates,
    };
  }, [user, roommates]);

  const value = useMemo(
    () => ({
      user,
      room,
      attendance,
      notifications,
      loading,
      refetch: fetchStudentData,
    }),
    [user, room, attendance, notifications, loading, fetchStudentData]
  );

  return (
    <StudentDashboardContext.Provider value={value}>
      {children}
    </StudentDashboardContext.Provider>
  );
}

export function useStudentDashboard() {
  const context = useContext(StudentDashboardContext);
  if (!context) {
    throw new Error(
      "useStudentDashboard must be used within a StudentDashboardProvider"
    );
  }
  return context;
}

