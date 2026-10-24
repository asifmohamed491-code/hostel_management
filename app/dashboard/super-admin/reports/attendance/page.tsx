import type { Metadata } from "next";
import { SuperAdminAttendance } from "@/components/dashboard/content/super-admin/SuperAdminAttendance";

export const metadata: Metadata = {
  title: "View Attendance | OASYS Hostel Management",
};

// Route: /dashboard/super-admin/reports/attendance
// The URL ALREADY assigned to the Super Admin dashboard's "View Attendance"
// Quick Action (lib/super-admin-dashboard-mock.tsx) and the sidebar's
// "Attendance" item (lib/dashboard-nav.ts) — no page existed there (404). Both
// links are untouched. A real App Router page under app/dashboard/, so the
// dashboard layout and middleware.ts (Super Admin only) apply; the data comes
// from GET /api/super-admin/attendance (also Super Admin only).
export default function ViewAttendancePage() {
  return <SuperAdminAttendance />;
}
