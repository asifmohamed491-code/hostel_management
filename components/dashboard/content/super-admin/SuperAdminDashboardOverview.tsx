// SuperAdminDashboardOverview.tsx
//
// The Super Admin dashboard content area, matching the reference
// screenshot: Welcome card, 6-card stat row, second row (Student
// Overview / Hostel Occupancy / Hostel Block Overview / Warden
// Overview), third row (Attendance Analytics / Recent System Activity
// / Quick Actions / System Status). Sidebar, Topbar, and the fixed
// background are provided by DashboardLayout (app/dashboard/layout.tsx)
// and are untouched here — same convention as DashboardOverview.tsx
// (Warden) and StudentDashboardOverview.tsx.
//
// `WelcomeCard` here is the SAME shared component the Warden and
// Student dashboards already use
// (components/dashboard/content/WelcomeAttendanceRow.tsx) — reused
// as-is (not duplicated) via its existing optional props, exactly the
// way StudentDashboardOverview.tsx reuses it, so the Super Admin
// welcome section gets the identical glass card, typography, spacing,
// and entrance animation for free.
"use client";

import { WelcomeCard } from "@/components/dashboard/content/WelcomeAttendanceRow";
import { SuperAdminStatCardsRow } from "@/components/dashboard/content/super-admin/SuperAdminStatCardsRow";
import { SuperAdminSecondRow } from "@/components/dashboard/content/super-admin/SuperAdminSecondRow";
import { SuperAdminThirdRow } from "@/components/dashboard/content/super-admin/SuperAdminThirdRow";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function SuperAdminDashboardOverview() {
  const { user, loading } = useCurrentUser();
  const firstName = user?.fullName?.trim().split(/\s+/)[0];
  const displayName = loading || !firstName ? "Admin" : firstName;

  return (
    <div className="flex w-full flex-col gap-5 pb-2 pt-4 xl:gap-6 xl:pt-5">
      <WelcomeCard
        greeting="Welcome back,"
        name={`${displayName}`}
        description="Here's your hostel system overview for today."
      />

      <SuperAdminStatCardsRow />
      <div className="xl:min-h-[300px]">
        <SuperAdminSecondRow />
      </div>
      <div className="xl:min-h-[280px]">
        <SuperAdminThirdRow />
      </div>
    </div>
  );
}
