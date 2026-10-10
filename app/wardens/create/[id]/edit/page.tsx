import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { EditWardenForm } from "@/components/dashboard/forms/EditWardenForm";

export const metadata: Metadata = {
  title: "Edit Warden | OASYS Hostel Management",
};

// Never linked to directly — Manage Wardens links to
// /dashboard/super-admin/wardens/<id>/edit, and next.config.ts rewrites
// that URL here (the browser URL stays unchanged). Same pattern as
// app/wardens/create: it lives outside app/dashboard/ so it renders the
// full-screen split AuthLayout like Create Warden, not the dashboard
// layout. Role protection for the public URL is enforced by middleware.ts
// (it matches the /dashboard/... URL before the rewrite), and the data
// itself is guarded again by GET/PATCH /api/wardens/[id].
export default async function EditWardenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AuthLayout cardSide="left">
      <EditWardenForm wardenId={id} />
    </AuthLayout>
  );
}
