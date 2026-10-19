import type { Metadata } from "next";
import { SuperAdminHostelBlocks } from "@/components/dashboard/content/super-admin/SuperAdminHostelBlocks";

export const metadata: Metadata = {
  title: "Manage Hostel Blocks | OASYS Hostel Management",
};

// Route: /dashboard/super-admin/hostel-blocks
// This is the URL used by BOTH the Super Admin dashboard's "Manage Hostel
// Blocks" Quick Action (lib/super-admin-dashboard-mock.tsx) and the sidebar's
// "Hostel Blocks" item (lib/dashboard-nav.ts). Before this file existed those
// links had no page to land on, which is the 404.
//
// A real App Router page under app/dashboard/, so DashboardLayout (Sidebar,
// Topbar, background) and middleware.ts (Super Admin only) apply as-is —
// no next.config.ts rewrite is involved.
export default function ManageHostelBlocksPage() {
  return <SuperAdminHostelBlocks />;
}
