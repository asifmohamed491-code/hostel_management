import type { Metadata } from "next";
import { SuperAdminRooms } from "@/components/dashboard/content/super-admin/SuperAdminRooms";

export const metadata: Metadata = {
  title: "View Rooms | OASYS Hostel Management",
};

// Route: /dashboard/super-admin/hostel-blocks/<block name>/rooms
//   e.g. /dashboard/super-admin/hostel-blocks/Block%20A/rooms
// Opened by "View Rooms" on a block card. A block is identified by its NAME
// everywhere in this project (Room.hostelBlock / User.hostelBlock), so the
// route segment is the URL-encoded block name; the API validates that the
// block really exists and answers 404 otherwise.
//
// Under app/dashboard/, so DashboardLayout and middleware.ts (Super Admin
// only) apply automatically. Works on refresh and when opened directly.
function readBlockName(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // keep the raw segment if it is not valid percent-encoding
  }
  return decoded.trim().slice(0, 60);
}

export default async function ViewRoomsPage({
  params,
}: {
  params: Promise<{ block: string }>;
}) {
  const { block } = await params;
  return <SuperAdminRooms blockName={readBlockName(block)} />;
}
