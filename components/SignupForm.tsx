"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { signupSchema, type SignupSchema } from "@/lib/validation";

export function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      department: "",
      year: "",
      roomNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  async function onSubmit(values: SignupSchema) {
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }

      setFormSuccess("Student account created successfully.");
      reset();
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
      heading="Create Student Account"
      subtitle="Create a hostel student account"
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
        {/* 2-Column Grid Layout for Desktop/Laptops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
          <div data-entrance="input">
            <InputField
              label="Full Name"
              iconSrc="/assets/icons/user.svg"
              placeholder="Full name"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
          </div>

          <div data-entrance="input">
            <InputField
              label="College Email"
              iconSrc="/assets/icons/mail.svg"
              placeholder="email@oasys.edu.in"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div data-entrance="input">
            <InputField
              label="Phone Number"
              iconSrc="/assets/icons/phone.svg"
              placeholder="Phone number"
              autoComplete="tel"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />
          </div>

          <div data-entrance="input">
            <InputField
              label="Department"
              iconSrc="/assets/icons/department.svg"
              placeholder="Department"
              autoComplete="off"
              error={errors.department?.message}
              {...register("department")}
            />
          </div>

          <div data-entrance="input">
            <InputField
              label="Year"
              iconSrc="/assets/icons/calendar.svg"
              placeholder="Year"
              autoComplete="off"
              error={errors.year?.message}
              {...register("year")}
            />
          </div>

          <div data-entrance="input">
            <InputField 
              label="Room Number"
              iconSrc="/assets/dashboard/icons/room-icon.svg"
              placeholder="Room number"
              autoComplete="off"
              error={errors.roomNumber?.message}
              {...register("roomNumber")}
            />
          </div>

          <div data-entrance="input">
            <InputField
              label="Password"
              iconSrc="/assets/icons/lock.svg"
              placeholder="Create password"
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
              placeholder="Confirm password"
              autoComplete="new-password"
              isPassword
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-red-500">
            {formError}
          </p>
        )}

        {formSuccess && (
          <p role="status" className="text-xs font-medium text-emerald-600">
            {formSuccess}
          </p>
        )}

        <div data-entrance="button" className="mt-2">
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
            data-float
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
          >
            {isSubmitting ? "Creating student..." : "Create Student"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}