import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warden Dashboard | OASYS Hostel Management",
};

// Intentionally empty — Sidebar, Top Navigation, and the fixed
// background are provided by DashboardLayout (app/dashboard/layout.tsx).
// Dashboard content sections (welcome card, stats, charts, tables,
// quick actions, etc.) will be added here one at a time later.
export default function WardenDashboardPage() {
  return  <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-white">Warden Admin Dashboard</h1>
      <p className="text-sm text-white/70">Authentication Successful</p>
    </div>;
}
