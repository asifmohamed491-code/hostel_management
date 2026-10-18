import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { WardenForm } from "@/components/dashboard/forms/WardenForm";

export const metadata: Metadata = {
  title: "Create Warden | OASYS Hostel Management",
};

// This page is never linked to directly — the Super Admin sidebar links
// to /dashboard/super-admin/wardens/create, and next.config.ts rewrites
// that URL here (browser URL stays /dashboard/super-admin/wardens/create).
// It lives at the top level, outside app/dashboard/, specifically so it
// does NOT inherit app/dashboard/layout.tsx (no Sidebar/Topbar) and
// instead renders the same full-screen split AuthLayout as /signup.
// <WardenForm /> with no wardenId is CREATE mode (unchanged behaviour);
// the Edit Warden route renders the same component in EDIT mode.
export default function CreateWardenPage() {
  return (
    <AuthLayout cardSide="left">
      <WardenForm />
    </AuthLayout>
  );
}
