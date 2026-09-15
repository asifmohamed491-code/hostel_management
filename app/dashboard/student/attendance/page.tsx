import type { Metadata } from "next";
import { StudentAttendance } from "@/components/dashboard/content/student/StudentAttendance";

export const metadata: Metadata = {
  title: "Mark Attendance | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
// Auth + role protection is handled by the existing middleware.ts,
// exactly like every other /dashboard/student/* route.
export default function StudentAttendancePage() {
  return <StudentAttendance />;
}

