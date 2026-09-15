import type { Metadata } from "next";
import { WardenAccountDetails } from "@/components/dashboard/content/warden/WardenAccountDetails";

export const metadata: Metadata = {
  title: "Account Details | OASYS Hostel Management",
};

// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
// Auth + role protection is handled by the existing middleware.ts,
// exactly like every other /dashboard/warden/* route — an
// unauthenticated request is redirected to /login, and a non-warden
// is redirected to their own role's dashboard, before this ever runs.
export default function WardenAccountDetailsPage() {
  return <WardenAccountDetails />;
}
