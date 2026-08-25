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

        <style jsx>{`
          @property --login-gradient-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }

          @property --login-gradient-angle-offset {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }

          @property --login-gradient-percent {
            syntax: "<percentage>";
            initial-value: 5%;
            inherits: false;
          }

          @property --login-gradient-shine {
            syntax: "<color>";
            initial-value: #ffffff;
            inherits: false;
          }

          .shiny-login {
            --shiny-login-bg: #6e42f5;
            --shiny-login-bg-subtle: #5b2fe0;
            --shiny-login-fg: #ffffff;
            --shiny-login-highlight: #8b5cf6;
            --shiny-login-highlight-subtle: #f4f1fd;
            --login-animation: login-gradient-angle linear infinite;
            --login-duration: 3s;
            --login-shadow-size: 2px;
            --login-transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);

            isolation: isolate;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            outline-offset: 4px;
            border: 1px solid transparent;
            border-radius: 0.85rem;
            color: var(--shiny-login-fg);
            background:
              linear-gradient(var(--shiny-login-bg), var(--shiny-login-bg)) padding-box,
              conic-gradient(
                from calc(var(--login-gradient-angle) - var(--login-gradient-angle-offset)),
                transparent,
                var(--shiny-login-highlight) var(--login-gradient-percent),
                var(--login-gradient-shine) calc(var(--login-gradient-percent) * 2),
                var(--shiny-login-highlight) calc(var(--login-gradient-percent) * 3),
                transparent calc(var(--login-gradient-percent) * 4)
              ) border-box;
            box-shadow: inset 0 0 0 1px var(--shiny-login-bg-subtle);
            transition: var(--login-transition);
            transition-property: --login-gradient-angle-offset, --login-gradient-percent,
              --login-gradient-shine;
          }

          .shiny-login::before,
          .shiny-login::after {
            content: "";
            pointer-events: none;
            position: absolute;
            inset-inline-start: 50%;
            inset-block-start: 50%;
            translate: -50% -50%;
            z-index: -1;
          }

          .shiny-login:active {
            translate: 0 1px;
          }

          .shiny-login::before {
            --login-dot-size: calc(100% - var(--login-shadow-size) * 3);
            --login-dot-position: 2px;
            --login-dot-space: calc(var(--login-dot-position) * 2);
            width: var(--login-dot-size);
            height: var(--login-dot-size);
            background: radial-gradient(
              circle at var(--login-dot-position) var(--login-dot-position),
              white calc(var(--login-dot-position) / 4),
              transparent 0
            ) padding-box;
            background-size: var(--login-dot-space) var(--login-dot-space);
            background-repeat: space;
            mask-image: conic-gradient(
              from calc(var(--login-gradient-angle) + 45deg),
              black,
              transparent 10% 90%,
              black
            );
            border-radius: inherit;
            opacity: 0.4;
          }

          .shiny-login::after {
            --login-animation: login-shimmer linear infinite;
            width: 100%;
            aspect-ratio: 1;
            background: linear-gradient(
              -50deg,
              transparent,
              var(--shiny-login-highlight),
              transparent
            );
            mask-image: radial-gradient(circle at bottom, transparent 40%, black);
            opacity: 0.6;
          }

          .shiny-login span {
            position: relative;
            z-index: 1;
          }

          .shiny-login,
          .shiny-login::before,
          .shiny-login::after {
            animation: var(--login-animation) var(--login-duration),
              var(--login-animation) calc(var(--login-duration) / 0.4) reverse paused;
            animation-composition: add;
          }

          .shiny-login:is(:hover, :focus-visible) {
            --login-gradient-percent: 20%;
            --login-gradient-angle-offset: 95deg;
            --login-gradient-shine: var(--shiny-login-highlight-subtle);
          }

          .shiny-login:is(:hover, :focus-visible),
          .shiny-login:is(:hover, :focus-visible)::before,
          .shiny-login:is(:hover, :focus-visible)::after {
            animation-play-state: running;
          }

          @keyframes login-gradient-angle {
            to {
              --login-gradient-angle: 360deg;
            }
          }

          @keyframes login-shimmer {
            to {
              rotate: 360deg;
            }
          }

        `}</style>

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
            aria-busy={isSubmitting}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
            data-float
            className="shiny-login mt-1 inline-flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex min-w-0 items-center justify-center gap-2">
              {isSubmitting && (
                <i
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/75 border-t-transparent"
                />
              )}
              {isSubmitting ? "Logging in..." : "Login"}
            </span>
          </button>
        </div>
      </form>
    </AuthCard>
  );
}