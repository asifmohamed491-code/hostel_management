import type { Metadata } from "next";
import { SuperAdminAccountDetails } from "@/components/dashboard/content/super-admin/SuperAdminAccountDetails";

export const metadata: Metadata = {
  title: "Account Details | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
// Auth + role protection is handled by the existing middleware.ts,
// exactly like every other /dashboard/super-admin/* route — an
// unauthenticated request is redirected to /login, and a non-super-admin
// is redirected to their own role's dashboard, before this ever runs.
export default function SuperAdminAccountDetailsPage() {
  return <SuperAdminAccountDetails />;
}
