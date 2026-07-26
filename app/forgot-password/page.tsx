import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | OASYS Hostel Management",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout cardSide="right">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
