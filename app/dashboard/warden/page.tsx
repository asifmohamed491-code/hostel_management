import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/content/DashboardOverview";

export const metadata: Metadata = {
  title: "Warden Dashboard | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
// Renders the same content as /dashboard via the shared
// DashboardOverview component — no duplicated JSX, no separate
// dashboard components.
export default function WardenDashboardPage() {
  return <DashboardOverview />;
}