"use client";

// AddStudentForm.tsx
// Warden's "Add Student" form — 2-step multi-step form.
// Step 1: Student Details (Full Name, Register Number, College Email, Phone, Department, Year)
// Step 2: Hostel & Account Details (Hostel Block, Room Number, Password, Confirm Password)
// Reuses the existing AuthCard, InputField, and validation schema.
import { useRef, useState } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import Image from "next/image";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { addStudentSchema, type AddStudentSchema } from "@/lib/validation";
import { cn } from "@/lib/cn";

// ─── Constants ───────────────────────────────────────────────────────
const DEPARTMENTS = [
  "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL",
  "AIML", "AIDS", "CSE(CS)", "BME", "AUTO", "CHEM",
] as const;

const HOSTEL_BLOCKS = ["Block A", "Block B", "Block C"] as const;

const YEARS = ["I", "II", "III", "IV"] as const;

// Step 1 fields (validated before moving to Step 2)
const STEP1_FIELDS: (Path<AddStudentSchema>)[] = [
  "fullName", "registerNumber", "email", "phoneNumber", "department", "year",
];

// ─── Component ───────────────────────────────────────────────────────
export function AddStudentForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const submitBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddStudentSchema>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      fullName: "",
      registerNumber: "",
      email: "",
      phoneNumber: "",
      department: "",
      year: "",
      hostelBlock: "",
      roomNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedDept = watch("department");
  const selectedBlock = watch("hostelBlock");
  const selectedYear = watch("year");

  // ── Step navigation ──────────────────────────────────────────────
  async function goToStep2() {
    setFormError(null);
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep(2);
  }

  function goToStep1() {
    setFormError(null);
    setStep(1);
  }

  // ── Submit ───────────────────────────────────────────────────────
  async function onSubmit(values: AddStudentSchema) {
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
      setStep(1);
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  }

  // ── GSAP button hover (matches existing design) ──────────────────
  function handleBtnEnter(ref: React.RefObject<HTMLButtonElement | null>) {
    gsap.to(ref.current, {
      scale: 1.02,
      boxShadow: "0 12px 28px rgba(110, 66, 245, 0.35)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }
  function handleBtnLeave(ref: React.RefObject<HTMLButtonElement | null>) {
    gsap.to(ref.current, {
      scale: 1,
      boxShadow: "0 8px 20px rgba(110, 66, 245, 0.22)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  const fieldErrors = errors as Record<string, { message?: string } | undefined>;

  // ── Shared Select Component ──────────────────────────────────────
  function SelectField({
    label,
    iconSrc,
    value,
    onChange,
    options,
    placeholder,
    error,
  }: {
    label: string;
    iconSrc: string;
    value: string;
    onChange: (val: string) => void;
    options: readonly string[];
    placeholder: string;
    error?: string;
  }) {
    return (
      <div className="flex flex-col gap-1 text-left">
        <label className="text-[12px] font-semibold text-heading/90">{label}</label>
        <div
          data-float
          className={cn(
            "group relative flex items-center rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 transition-all duration-300",
            "focus-within:border-primary/60 focus-within:bg-white/70 focus-within:shadow-glass",
            error && "border-red-300 focus-within:border-red-400"
          )}
        >
          <Image
            src={iconSrc}
            alt=""
            width={16}
            height={16}
            className="mr-2 shrink-0 opacity-80 [filter:invert(32%)_sepia(85%)_saturate(2421%)_hue-rotate(245deg)_brightness(98%)_contrast(98%)]"
            aria-hidden
          />
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-[12.5px] font-medium text-heading placeholder:text-heading/40 focus:outline-none cursor-pointer appearance-none"
          >
            <option value="" disabled className="bg-white text-heading/50">
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-white text-heading font-medium">
                {opt}
              </option>
            ))}
          </select>
          {/* Dropdown chevron */}
          <svg className="pointer-events-none ml-1 h-3.5 w-3.5 shrink-0 text-heading/40" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <AuthCard heading="Create Student Account" subtitle="Create a hostel student account" footer={null}>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-200",
              step === 1
                ? "bg-primary text-white"
                : "bg-primary/15 text-primary"
            )}
          >
            1
          </span>
          <span className={cn("text-[11px] font-semibold transition-colors duration-200", step === 1 ? "text-heading" : "text-heading/40")}>
            Student Details
          </span>
        </div>
        <div className="h-px w-6 bg-heading/15" />
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-200",
              step === 2
                ? "bg-primary text-white"
                : "bg-primary/15 text-primary"
            )}
          >
            2
          </span>
          <span className={cn("text-[11px] font-semibold transition-colors duration-200", step === 2 ? "text-heading" : "text-heading/40")}>
            Hostel & Account
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
            <div data-entrance="input">
              <InputField
                label="Full Name"
                iconSrc="/assets/icons/user.svg"
                placeholder="Full name"
                autoComplete="name"
                error={fieldErrors.fullName?.message}
                {...register("fullName")}
              />
            </div>
            <div data-entrance="input">
              <InputField
                label="Register Number"
                iconSrc="/assets/icons/user.svg"
                placeholder="e.g. 8129241040XX"
                autoComplete="off"
                error={fieldErrors.registerNumber?.message}
                {...register("registerNumber")}
              />
            </div>
            <div data-entrance="input">
              <InputField
                label="College Email"
                iconSrc="/assets/icons/mail.svg"
                placeholder="email@oasys.edu.in"
                autoComplete="email"
                error={fieldErrors.email?.message}
                {...register("email")}
              />
            </div>
            <div data-entrance="input">
              <InputField
                label="Phone Number"
                iconSrc="/assets/icons/phone.svg"
                placeholder="Phone number"
                autoComplete="tel"
                error={fieldErrors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
            </div>
            <div data-entrance="input">
              <SelectField
                label="Department"
                iconSrc="/assets/icons/department.svg"
                value={selectedDept}
                onChange={(val) => setValue("department", val, { shouldValidate: true })}
                options={DEPARTMENTS}
                placeholder="Select dept"
                error={fieldErrors.department?.message}
              />
            </div>
            <div data-entrance="input">
              <SelectField
                label="Year"
                iconSrc="/assets/icons/calendar.svg"
                value={selectedYear}
                onChange={(val) => setValue("year", val, { shouldValidate: true })}
                options={YEARS}
                placeholder="Select year"
                error={fieldErrors.year?.message}
              />
            </div>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
            <div data-entrance="input">
              <SelectField
                label="Hostel Block"
                iconSrc="/assets/dashboard/icons/room-icon.svg"
                value={selectedBlock}
                onChange={(val) => setValue("hostelBlock", val, { shouldValidate: true })}
                options={HOSTEL_BLOCKS}
                placeholder="Select hostel block"
                error={fieldErrors.hostelBlock?.message}
              />
            </div>
            <div data-entrance="input">
              <InputField
                label="Room Number"
                iconSrc="/assets/dashboard/icons/room-icon.svg"
                placeholder="Room number"
                autoComplete="off"
                error={fieldErrors.roomNumber?.message}
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
                error={fieldErrors.password?.message}
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
                error={fieldErrors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
          </div>
        )}

        {/* ─── Error / Success ─── */}
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

        {/* ─── Buttons ─── */}
        <div data-entrance="button" className="mt-2 flex gap-3">
          {step === 1 && (
            <button
              ref={nextBtnRef}
              type="button"
              onClick={goToStep2}
              onMouseEnter={() => handleBtnEnter(nextBtnRef)}
              onMouseLeave={() => handleBtnLeave(nextBtnRef)}
              data-float
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(110,66,245,0.22)] transition-opacity cursor-pointer"
            >
              Next
            </button>
          )}
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={goToStep1}
                className="flex-1 rounded-xl border border-primary/25 bg-white/60 py-3 text-xs font-semibold text-primary backdrop-blur-sm transition-all hover:bg-white/80 cursor-pointer"
              >
                Back
              </button>
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={() => handleBtnEnter(submitBtnRef)}
                onMouseLeave={() => handleBtnLeave(submitBtnRef)}
                data-float
                className="flex-[2] rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? "Creating student..." : "Create Student"}
              </button>
            </>
          )}
        </div>
      </form>
    </AuthCard>
  );
}
