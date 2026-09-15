import type { Metadata } from "next";
import { WardenAttendance } from "@/components/dashboard/content/warden/WardenAttendance";

export const metadata: Metadata = {
  title: "Attendance Management | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
// Auth + role protection is handled by the existing middleware.ts.
export default function WardenAttendancePage() {
  return <WardenAttendance />;
}

