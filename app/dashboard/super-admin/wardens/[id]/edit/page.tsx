import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { FullScreenPortal } from "@/components/dashboard/forms/FullScreenPortal";
import { WardenForm } from "@/components/dashboard/forms/WardenForm";

export const metadata: Metadata = {
  title: "Edit Warden | OASYS Hostel Management",
};

// Real route: /dashboard/super-admin/wardens/<warden id>/edit
// Opened by the Edit button on Manage Wardens. Being a real page under
// app/dashboard/, it is covered by middleware.ts (Super Admin only) and
// needs NO next.config.ts rewrite. It is shown full-screen (same split
// AuthLayout as Create Warden) through FullScreenPortal, which layers it
// above the dashboard Sidebar/Topbar. The data is additionally guarded by
// GET/PATCH /api/wardens/[id] (401 unauthenticated, 403 non-super-admin).
export default async function EditWardenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FullScreenPortal>
      <AuthLayout cardSide="left">
        <WardenForm wardenId={id} />
      </AuthLayout>
    </FullScreenPortal>
  );
}
