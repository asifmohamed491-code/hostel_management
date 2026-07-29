import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warden Dashboard | OASYS Hostel Management",
};

// Intentionally empty — Sidebar, Top Navigation, and the fixed
// background are provided by DashboardLayout (app/dashboard/layout.tsx).
// Dashboard content sections (welcome card, stats, charts, tables,
// quick actions, etc.) will be added here one at a time later.
export default function WardenDashboardPage() {
  return <div className="min-h-[1px] w-full" />;
}
