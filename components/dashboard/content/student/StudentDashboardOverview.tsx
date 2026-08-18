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

import { WelcomeCard } from "@/components/dashboard/content/WelcomeAttendanceRow";
import { StudentSummaryRow } from "@/components/dashboard/content/student/StudentSummaryRow";
import { StudentBottomRow } from "@/components/dashboard/content/student/StudentBottomRow";
import { STUDENT_PROFILE } from "@/lib/student-dashboard-mock";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function StudentDashboardOverview() {
  const { user, loading } = useCurrentUser();
  const safeStudentName = user?.fullName?.trim() || "Student";
  const details = `Register No: ${STUDENT_PROFILE.registerNo} | Department: ${STUDENT_PROFILE.department} | Year: ${STUDENT_PROFILE.year} | ${STUDENT_PROFILE.block} | Room ${STUDENT_PROFILE.room}`;

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      <WelcomeCard
        greeting="Welcome back,"
        name={loading ? "Student" : safeStudentName}
        description="Here's your hostel overview for today."
        details={details}
      />

      <StudentSummaryRow />
      <StudentBottomRow />
    </div>
  );
}