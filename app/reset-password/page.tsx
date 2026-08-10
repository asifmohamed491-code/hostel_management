import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | OASYS Hostel Management",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout cardSide="right">
      <ResetPasswordForm />
    </AuthLayout>
  );
}