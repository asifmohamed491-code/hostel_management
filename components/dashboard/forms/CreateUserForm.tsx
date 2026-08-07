"use client";

// CreateUserForm.tsx
// Reusable "create a user" form — the exact same visual piece as
// components/SignupForm.tsx (same AuthCard glassmorphism, same
// InputField style, same gradient submit button with the same GSAP
// hover), generalized so only the field list, validation schema,
// default values, and API endpoint change per caller (Add Student,
// Create Warden). Like SignupForm, this component renders no layout of
// its own and has no entrance-timeline of its own — it's always used
// as the `children` of AuthLayout (components/AuthLayout.tsx), the same
// full-screen split Auth layout /signup uses, which owns the
// `data-entrance` timeline for everything rendered inside it.
import { useRef, useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import gsap from "gsap";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";

export interface CreateUserFieldConfig<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  iconSrc: string;
  placeholder?: string;
  autoComplete?: string;
  isPassword?: boolean;
}

export interface CreateUserFormProps<TFieldValues extends FieldValues> {
  heading: string;
  subtitle: string;
  fields: CreateUserFieldConfig<TFieldValues>[];
  schema: ZodType<TFieldValues>;
  defaultValues: DefaultValues<TFieldValues>;
  endpoint: string;
  submitLabel: string;
  loadingLabel: string;
  successMessage: string;
  /**
   * Optional transform applied to the validated form values before they're
   * sent to `endpoint`. Use this to drop client-only fields (like a
   * confirmPassword the API doesn't accept) without touching the API's
   * own validation schema.
   */
  toRequestBody?: (values: TFieldValues) => Record<string, unknown>;
}

export function CreateUserForm<TFieldValues extends FieldValues>({
  heading,
  subtitle,
  fields,
  schema,
  defaultValues,
  endpoint,
  submitLabel,
  loadingLabel,
  successMessage,
  toRequestBody,
}: CreateUserFormProps<TFieldValues>) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  async function onSubmit(values: TFieldValues) {
    setFormError(null);
    setFormSuccess(null);

    try {
      const body = toRequestBody ? toRequestBody(values) : values;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }

      setFormSuccess(successMessage);
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

  const fieldErrors = errors as Record<string, { message?: string } | undefined>;

  return (
    <AuthCard heading={heading} subtitle={subtitle} footer={null}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
        {/* Same 2-Column Grid Layout used by the Signup form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
          {fields.map((field) => (
            <div data-entrance="input" key={String(field.name)}>
              <InputField
                label={field.label}
                iconSrc={field.iconSrc}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                isPassword={field.isPassword}
                error={fieldErrors[field.name as string]?.message}
                {...register(field.name)}
              />
            </div>
          ))}
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
            {isSubmitting ? loadingLabel : submitLabel}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
