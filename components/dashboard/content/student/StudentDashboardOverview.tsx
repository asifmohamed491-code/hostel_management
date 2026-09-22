// StudentDashboardOverview.tsx
//
// The Student dashboard content area (Welcome Card, summary cards,
// attendance/room/notifications/quick-actions), mirroring how
// DashboardOverview.tsx composes the Warden dashboard from shared
// building blocks. `WelcomeCard` here is the SAME component the
// Warden dashboard uses (components/dashboard/content/WelcomeAttendanceRow.tsx)
// — it was made reusable via optional props rather than duplicated —
// so the Student dashboard's welcome section has identical visual
// design, just Student-specific content passed in as props. Sidebar,
// Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { WelcomeCard } from "@/components/dashboard/content/WelcomeAttendanceRow";
import { StudentSummaryRow } from "@/components/dashboard/content/student/StudentSummaryRow";
import { StudentBottomRow } from "@/components/dashboard/content/student/StudentBottomRow";
import { StudentDashboardSkeleton } from "@/components/dashboard/content/student/StudentDashboardSkeleton";
import {
  StudentDashboardProvider,
  useStudentDashboard,
} from "@/hooks/useStudentDashboard";

function StudentDashboardContent() {
  const { user, isDashboardReady, error, refetch } = useStudentDashboard();
  const safeStudentName = user?.fullName?.trim() || "Student";
  const regNo = user?.registerNumber || "—";
  const dept = user?.department || "—";
  const year = user?.year ? `${user.year} Year` : "—";
  const block = user?.hostelBlock || "Block Not Assigned";
  const room = user?.roomNumber
    ? user.roomNumber.startsWith("Room")
      ? user.roomNumber
      : `Room ${user.roomNumber}`
    : "Room Not Assigned";
  const details = `Register No: ${regNo} | Department: ${dept} | Year: ${year} | ${block} | ${room}`;

  if (error && !isDashboardReady) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-[380px] px-4 py-12">
        <div className="sa-dashboard-card flex flex-col items-center gap-4 rounded-[22px] border border-white/60 bg-white/70 p-8 text-center backdrop-blur-[20px] shadow-lg max-w-md w-full">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-heading sm:text-[20px]">
              Unable to load dashboard data
            </h2>
            <p className="mt-1.5 text-[13px] font-medium text-heading/55">
              {error || "An error occurred while communicating with the server."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-glass transition-all hover:bg-primary-dark cursor-pointer active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isDashboardReady) {
    return <StudentDashboardSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5 transition-opacity duration-300">
      <WelcomeCard
        greeting="Welcome back,"
        name={safeStudentName}
        description="Here's your hostel overview for today."
        details={details}
      />

      <StudentSummaryRow />
      <StudentBottomRow />
    </div>
  );
}

export function StudentDashboardOverview() {
  return (
    <StudentDashboardProvider>
      <StudentDashboardContent />
    </StudentDashboardProvider>
  );
}