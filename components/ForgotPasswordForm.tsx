// ForgotPasswordForm.tsx
"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/validation";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  function onSubmit(values: ForgotPasswordSchema) {
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        console.info("Forgot password OTP requested", values);
        resolve();
      }, 900);
    });
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
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
            data-float
            className="mt-1 w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-primary-light py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
