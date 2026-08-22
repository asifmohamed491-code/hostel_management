import type { Metadata } from "next";
import { SuperAdminDashboardOverview } from "@/components/dashboard/content/super-admin/SuperAdminDashboardOverview";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here —
// same convention as app/dashboard/warden/page.tsx.
export default function SuperAdminDashboardPage() {
  return <SuperAdminDashboardOverview />;
}
