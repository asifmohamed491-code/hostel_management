// SuperAdminDashboardOverview.tsx
//
// The Super Admin dashboard content area, matching the reference
// screenshot: Welcome section, 6-card stat row, second row (Student
// Overview / Hostel Occupancy / Hostel Block Overview / Warden
// Overview), third row (Attendance Analytics / Recent System Activity
// / Quick Actions / System Status). Sidebar, Topbar, and the fixed
// background are provided by DashboardLayout (app/dashboard/layout.tsx)
// and are untouched here — same convention as DashboardOverview.tsx
// (Warden) and StudentDashboardOverview.tsx.
import { SuperAdminWelcomeSection } from "@/components/dashboard/content/super-admin/SuperAdminWelcomeSection";
import { SuperAdminStatCardsRow } from "@/components/dashboard/content/super-admin/SuperAdminStatCardsRow";
import { SuperAdminSecondRow } from "@/components/dashboard/content/super-admin/SuperAdminSecondRow";
import { SuperAdminThirdRow } from "@/components/dashboard/content/super-admin/SuperAdminThirdRow";

export function SuperAdminDashboardOverview() {
  return (
    <div className="flex w-full flex-col gap-5 pb-2 pt-4 xl:gap-6 xl:pt-5">
      <SuperAdminWelcomeSection />
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
