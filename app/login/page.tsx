import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login | OASYS Hostel Management",
};

export default function LoginPage() {
  return (
    <AuthLayout cardSide="right">
      <LoginForm />
    </AuthLayout>
  );
}
