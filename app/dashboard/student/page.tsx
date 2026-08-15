import type { Metadata } from "next";
import { StudentDashboardOverview } from "@/components/dashboard/content/student/StudentDashboardOverview";

export const metadata: Metadata = {
  title: "Student Dashboard | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
export default function StudentDashboardPage() {
  return <StudentDashboardOverview />;
}