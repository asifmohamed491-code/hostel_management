// ResetPasswordForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/validation";

// Must match the key ForgotPasswordForm writes to after OTP verification.
const RESET_SESSION_KEY = "oasys_reset_session";

interface ResetSession {
  email: string;
  resetToken: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResetSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  // Read the reset session on mount only — sessionStorage, not the URL,
  // so the token never appears in the address bar or browser history.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RESET_SESSION_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<ResetSession>) : null;
      if (parsed?.email && parsed?.resetToken) {
        setSession({ email: parsed.email, resetToken: parsed.resetToken });
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  async function onSubmit(values: ResetPasswordSchema) {
    if (!session) {
      setFormError("This reset session has expired. Please start again.");
      return;
    }

    setFormError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.email,
          resetToken: session.resetToken,
          password: values.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "Could not reset your password. Please try again.");
        return;
      }

      // Single-use — the backend has already invalidated it; clear it
      // here too so it can't be replayed from this tab.
      window.sessionStorage.removeItem(RESET_SESSION_KEY);

      router.push("/login");
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  }

  function handleButtonEnter() {
    gsap.to(submitButtonRef.current, {
      scale: 1.02,
      boxShadow: "0 12px 28px rgba(110, 66, 245, 0.35)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleButtonLeave() {
    gsap.to(submitButtonRef.current, {
      scale: 1,
      boxShadow: "0 8px 20px rgba(110, 66, 245, 0.22)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  if (sessionChecked && !session) {
    return (
      <AuthCard
        heading="Reset Password"
        subtitle="This reset session has expired or is invalid."
        footer={
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Request a new OTP
          </Link>
        }
      >
        <p className="text-center text-xs font-medium text-heading/60">
          Please restart the password reset process from the beginning.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading="Reset Password"
      subtitle="Choose a new password for your account."
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div data-entrance="input">
          <InputField
            label="New Password"
            iconSrc="/assets/icons/lock.svg"
            placeholder="Enter your new password"
            autoComplete="new-password"
            isPassword
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div data-entrance="input">
          <InputField
            label="Confirm Password"
            iconSrc="/assets/icons/lock.svg"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            isPassword
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-red-500">
            {formError}
          </p>
        )}

        <div data-entrance="button">
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting || !session}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
            data-float
            className="mt-1 w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-primary-light py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}