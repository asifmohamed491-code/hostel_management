// ForgotPasswordForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { OtpInput } from "@/components/OtpInput";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/validation";

const RESEND_COOLDOWN_SECONDS = 60;
// sessionStorage key the reset token is handed off through — kept out
// of the URL so it never lands in the address bar or browser history.
const RESET_SESSION_KEY = "oasys_reset_session";

export function ForgotPasswordForm() {
  const router = useRouter();

  const [otpSent, setOtpSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const verifyButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  async function requestOtp(targetEmail: string): Promise<string> {
    const response = await fetch("/api/auth/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message ?? "Could not send OTP. Please try again.");
    }

    return (data?.message as string | undefined) ?? "OTP sent to your email.";
  }

  async function onSubmit(values: ForgotPasswordSchema) {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const message = await requestOtp(values.email);
      setSentEmail(values.email);
      setOtp("");
      setOtpSent(true);
      setSuccessMessage(message);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not send OTP. Please try again."
      );
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending || !sentEmail) return;

    setFormError(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const message = await requestOtp(sentEmail);
      setOtp("");
      setSuccessMessage(message);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  async function handleVerify() {
    if (otp.length !== 6) {
      setFormError("Enter the full 6-digit OTP.");
      return;
    }

    setFormError(null);
    setSuccessMessage(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentEmail, otp }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "Incorrect OTP. Please try again.");
        return;
      }

      window.sessionStorage.setItem(
        RESET_SESSION_KEY,
        JSON.stringify({ email: sentEmail, resetToken: data.resetToken })
      );

      router.push("/reset-password");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleSendButtonEnter() {
    gsap.to(sendButtonRef.current, {
      scale: 1.02,
      boxShadow: "0 12px 28px rgba(110, 66, 245, 0.35)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleSendButtonLeave() {
    gsap.to(sendButtonRef.current, {
      scale: 1,
      boxShadow: "0 8px 20px rgba(110, 66, 245, 0.22)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleVerifyButtonEnter() {
    gsap.to(verifyButtonRef.current, {
      scale: 1.02,
      boxShadow: "0 12px 28px rgba(110, 66, 245, 0.35)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleVerifyButtonLeave() {
    gsap.to(verifyButtonRef.current, {
      scale: 1,
      boxShadow: "0 8px 20px rgba(110, 66, 245, 0.22)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  return (
    <AuthCard
      heading="Forgot Password"
      subtitle="Enter your college email to receive a password reset OTP."
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div data-entrance="input">
          <InputField
            label="College Email"
            iconSrc="/assets/icons/mail.svg"
            placeholder="812924104055@oasys.edu.in"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div data-entrance="button">
          <button
            ref={sendButtonRef}
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={handleSendButtonEnter}
            onMouseLeave={handleSendButtonLeave}
            data-float
            className="mt-1 w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-primary-light py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
          >
            {isSubmitting ? "Sending OTP..." : otpSent ? "Send OTP again" : "Send OTP"}
          </button>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-red-500">
            {formError}
          </p>
        )}
        {successMessage && (
          <p role="status" className="text-xs font-medium text-emerald-600">
            {successMessage}
          </p>
        )}
      </form>

      {otpSent && (
        <div data-entrance="input" className="mt-4 flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

          <button
            ref={verifyButtonRef}
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== 6}
            onMouseEnter={handleVerifyButtonEnter}
            onMouseLeave={handleVerifyButtonLeave}
            data-float
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-primary-light py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="self-center text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-heading/40 disabled:no-underline"
          >
            {isResending
              ? "Resending..."
              : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
          </button>
        </div>
      )}
    </AuthCard>
  );
}