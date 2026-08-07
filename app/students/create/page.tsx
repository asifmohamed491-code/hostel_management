import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { AddStudentForm } from "@/components/dashboard/forms/AddStudentForm";

export const metadata: Metadata = {
  title: "Add Student | OASYS Hostel Management",
};

// This page is never linked to directly — the Warden sidebar links to
// /dashboard/warden/students/create, and next.config.ts rewrites that
// URL here (browser URL stays /dashboard/warden/students/create). It
// lives at the top level, outside app/dashboard/, specifically so it
// does NOT inherit app/dashboard/layout.tsx (no Sidebar/Topbar) and
// instead renders the same full-screen split AuthLayout as /signup.
export default function AddStudentPage() {
  return (
    <AuthLayout cardSide="left">
      <AddStudentForm />
    </AuthLayout>
  );
}
