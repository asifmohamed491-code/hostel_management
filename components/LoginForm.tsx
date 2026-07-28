// LoginForm.tsx
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { loginSchema, type LoginSchema } from "@/lib/validation";

const ROLE_REDIRECTS: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  warden: "/dashboard/warden",
  student: "/dashboard/student",
};

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  async function onSubmit(values: LoginSchema) {
    setFormError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "Invalid email or password.");
        return;
      }

      const role = data?.user?.role as string | undefined;
      const destination = (role && ROLE_REDIRECTS[role]) || "/dashboard";

      router.push(destination);
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

  return (
    <AuthCard
      heading="Welcome Back"
      subtitle="Login to your account"
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
            href="/forgot-password"
            className="self-end text-xs font-semibold text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-red-500">
            {formError}
          </p>
        )}

        {/*
          Entrance animation targets THIS wrapper (opacity/y), while hover
          animation targets the inner button (scale/boxShadow) via ref.
          Keeping them on separate DOM nodes prevents GSAP's overwrite
          manager from killing the entrance tween mid-flight when the
          button mounts under the cursor.
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
      </form>
    </AuthCard>
  );
}