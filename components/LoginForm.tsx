// LoginForm.tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { GoogleButton } from "@/components/GoogleButton";
import { loginSchema, type LoginSchema } from "@/lib/validation";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  function onSubmit(values: LoginSchema) {
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        console.info("Login submitted", values);
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
      heading="Welcome Back"
      subtitle="Login to your account"
      footer={
        <p className="text-sm font-medium text-heading/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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

        <div data-entrance="input" className="flex flex-col gap-2">
          <InputField className="bg-transparent hover:bg-transparent"
            label="Password"
            iconSrc="/assets/icons/lock.svg"
            placeholder="Enter your password"
            autoComplete="current-password"
            isPassword
            error={errors.password?.message}
            {...register("password")}
          />
          <Link
            href="/login"
            className="self-end text-xs font-semibold text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/*
          Entrance animation targets THIS wrapper (opacity/y), while hover
          animation targets the inner button (scale/boxShadow) via ref.
          Keeping them on separate DOM nodes — same pattern as GoogleButton
          below — prevents GSAP's overwrite manager from killing the
          entrance tween mid-flight when the button mounts under the cursor.
        */}
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-heading/40">
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