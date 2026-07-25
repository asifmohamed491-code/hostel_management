import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | OASYS Hostel Management",
};

export default function SignupPage() {
  return (
    <AuthLayout cardSide="left">
      <SignupForm />
    </AuthLayout>
  );
}
