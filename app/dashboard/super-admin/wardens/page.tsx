import type { Metadata } from "next";
import { SuperAdminWardens } from "@/components/dashboard/content/super-admin/SuperAdminWardens";

export const metadata: Metadata = {
  title: "Manage Wardens | OASYS Hostel Management",
};

// Reached from Super Admin Dashboard -> Quick Actions -> Manage Wardens
// (and the sidebar's "Warden List" item, which shares this route).
// Sidebar, Top Navigation, and the fixed background come from
// DashboardLayout (app/dashboard/layout.tsx). Auth + role protection is
// enforced by the existing middleware.ts for every /dashboard/super-admin/*
// route, and the data it loads is additionally guarded server-side by
// GET /api/wardens (401 unauthenticated, 403 non-super-admin).
export default function SuperAdminWardensPage() {
  return <SuperAdminWardens />;
}
