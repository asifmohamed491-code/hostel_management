import type { Metadata } from "next";
import { SuperAdminStudents } from "@/components/dashboard/content/super-admin/SuperAdminStudents";

export const metadata: Metadata = {
  title: "View Students | OASYS Hostel Management",
};

// Route: /dashboard/super-admin/reports/students
// This is the URL ALREADY assigned to the Super Admin dashboard's student
// Quick Action (lib/super-admin-dashboard-mock.tsx) and to the sidebar's
// "Student Report" item (lib/dashboard-nav.ts) — no page existed there, which
// is the 404. Both links are left untouched. Being a real page under
// app/dashboard/, DashboardLayout (Sidebar, Topbar, background) and
// middleware.ts (Super Admin only) apply automatically; no rewrite needed.
//
// UI PHASE: renders sample data only (lib/super-admin-students-mock.ts).
export default function ViewStudentsPage() {
  return <SuperAdminStudents />;
}
