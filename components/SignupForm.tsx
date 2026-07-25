"use client";

import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { GoogleButton } from "@/components/GoogleButton";
import { signupSchema, type SignupSchema } from "@/lib/validation";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  function onSubmit(values: SignupSchema) {
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        console.info("Signup submitted", values);
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
      heading="Create an Account"
      subtitle="Join the OASYS hostel platform"
      footer={
        <p className="text-xs font-medium text-heading/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2.5 sm:gap-3">
        <div data-entrance="input">
          <InputField
            label="Full Name"
            iconSrc="/assets/icons/user.svg"
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </div>

        <div data-entrance="input">
          <InputField
            label="College Email"
            iconSrc="/assets/icons/mail.svg"
            placeholder="name@oasys.edu.in"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div data-entrance="input">
          <InputField
            label="Password"
            iconSrc="/assets/icons/lock.svg"
            placeholder="Create a password"
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
            placeholder="Confirm your password"
            autoComplete="new-password"
            isPassword
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        {/*
          Entrance animation targets THIS wrapper (opacity/y), while hover
          animation targets the inner button (scale/boxShadow) via ref.
          Keeping them on separate DOM nodes — same pattern as LoginForm
          and GoogleButton below — prevents GSAP's overwrite manager from
          killing the entrance tween mid-flight when the button mounts
          under the cursor.
        */}
        <div data-entrance="button">
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
            data-float
            className="mt-1 w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-2.5 xl:py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-0.5 text-xs font-medium text-heading/40">
          <span className="h-px flex-1 bg-heading/15" />
          or
          <span className="h-px flex-1 bg-heading/15" />
        </div>

        <div data-entrance="button">
          <GoogleButton />
        </div>
      </form>
    </AuthCard>
  );
}