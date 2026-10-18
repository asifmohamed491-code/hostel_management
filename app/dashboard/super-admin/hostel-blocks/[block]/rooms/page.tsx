import type { Metadata } from "next";
import { SuperAdminRooms } from "@/components/dashboard/content/super-admin/SuperAdminRooms";

export const metadata: Metadata = {
  title: "View Rooms | OASYS Hostel Management",
};

// Route: /dashboard/super-admin/hostel-blocks/<block name>/rooms
//   e.g. /dashboard/super-admin/hostel-blocks/Block%20A/rooms
// A hostel block has no separate model/id in this project — it is just the
// block name string stored on Room.hostelBlock / User.hostelBlock — so the
// route segment is the (URL-encoded) block name.
//
// This page lives under app/dashboard/, so DashboardLayout (Sidebar, Topbar,
// background) and middleware.ts (Super Admin only) apply automatically.
//
// UI PHASE: renders sample data only (see lib/super-admin-rooms-mock.ts).
// `?preview=empty` shows the "no rooms yet" state for design review.
function readBlockName(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // keep the raw segment if it is not valid percent-encoding
  }
  return decoded.trim().slice(0, 60) || "Hostel Block";
}

export default async function ViewRoomsPage({
  params,
  searchParams,
}: {
  params: Promise<{ block: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const { block } = await params;
  const { preview } = await searchParams;

  return (
    <SuperAdminRooms blockName={readBlockName(block)} previewEmpty={preview === "empty"} />
  );
}
