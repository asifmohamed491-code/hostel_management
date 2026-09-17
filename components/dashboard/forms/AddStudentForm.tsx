"use client";

// AddStudentForm.tsx
// Warden's "Add Student" form — 2-step multi-step form.
// Step 1: Student Details (Full Name, Register Number, College Email, Phone, Department, Year)
// Step 2: Hostel & Account Details (Hostel Block, Room Number, Password, Confirm Password)
//
// Fixes applied:
//  1. GSAP step transition: OUT → state change → IN sequence using a ref-based
//     content wrapper. React conditionally renders the correct step content
//     after the exit animation completes (via gsap onComplete callback).
//  2. Custom glassmorphism dropdowns replace native <select> for Department,
//     Year, and Hostel Block. Only one dropdown can be open at a time.
//     Outside-click closes the open dropdown.
//  3. Muted gray placeholder color for all custom select fields (text-heading/40).

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import { addStudentSchema, type AddStudentSchema } from "@/lib/validation";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { cn } from "@/lib/cn";

// ─── Constants ───────────────────────────────────────────────────────
const HOSTEL_BLOCKS = ["Block A", "Block B", "Block C"] as const;
const YEARS = ["I", "II", "III", "IV"] as const;

// Step 1 fields (validated before moving to Step 2)
const STEP1_FIELDS: (Path<AddStudentSchema>)[] = [
  "fullName", "registerNumber", "email", "phoneNumber", "department", "year",
];

// ─── Custom Glassmorphism Dropdown ───────────────────────────────────
// Replaces the native <select> for Department, Year, and Hostel Block.
// Only one dropdown is open at a time (controlled by `openDropdown` state
// in the parent). Outside-click is handled via a document pointerdown
// listener keyed to the dropdown's own ref.
interface CustomSelectProps {
  label: string;
  iconSrc: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  placeholder: string;
  error?: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function CustomSelect({
  label,
  iconSrc,
  value,
  onChange,
  options,
  placeholder,
  error,
  isOpen,
  onOpen,
  onClose,
}: CustomSelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [isOpen, onClose]);

  const displayValue = value || null;

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1 text-left">
      <label className="text-[12px] font-semibold text-heading/90">{label}</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "group relative flex w-full items-center rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 transition-all duration-300",
          "focus:outline-none focus:border-primary/60 focus:bg-white/70 focus:shadow-glass",
          isOpen && "border-primary/60 bg-white/70 shadow-glass",
          error && "border-red-300 focus:border-red-400",
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
        <span
          className={cn(
            "flex-1 text-left text-[12.5px] font-medium",
            displayValue ? "text-heading" : "text-heading/40",
          )}
        >
          {displayValue ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-1 h-3.5 w-3.5 shrink-0 text-heading/40 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            // Glassmorphism panel — same visual language as liquid-glass cards
            "absolute left-0 right-0 top-[calc(100%+4px)] z-50",
            "rounded-xl border border-white/60 p-1 shadow-[0_10px_30px_rgba(76,29,149,0.18)]",
            "bg-white/70 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)]",
            "max-h-48 overflow-y-auto",
            // Animate in with a subtle scale + fade
            "animate-[dropdownIn_0.18s_cubic-bezier(0.22,1,0.36,1)_both]",
          )}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              onClick={() => {
                onChange(opt);
                onClose();
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-left text-[12.5px] font-medium transition-colors duration-150",
                value === opt
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-heading/80 hover:bg-primary/5 hover:text-primary",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────
export function AddStudentForm() {
  // "pending" means we're mid-animation — the DOM still shows the OLD step
  // content while GSAP is animating it out.
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingStep, setPendingStep] = useState<1 | 2 | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Which custom dropdown is currently open (null = none)
  const [openDropdown, setOpenDropdown] = useState<"department" | "year" | "hostelBlock" | null>(null);

  const submitBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  // Content wrapper ref — we animate this div's children OUT before switching step
  const contentRef = useRef<HTMLDivElement>(null);

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

  // ── GSAP: animate content OUT, switch step state, animate IN ────────
  // animateTransition(toStep) drives the full OUT→IN sequence.
  const animateTransition = useCallback(
    (toStep: 1 | 2) => {
      const el = contentRef.current;
      if (!el) {
        setStep(toStep);
        return;
      }

      // Kill any running animations on this element
      gsap.killTweensOf(el);

      // Phase 1: Animate current content OUT
      gsap.to(el, {
        opacity: 0,
        y: toStep === 2 ? -12 : 12,  // slide up for Next, down for Back
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          // Phase 2: Switch the step — React re-renders the new content
          setPendingStep(null);
          setStep(toStep);

          // Phase 3: Immediately reset position, then animate IN
          // Use requestAnimationFrame to give React one paint cycle to
          // mount the new content before we read/animate it.
          requestAnimationFrame(() => {
            if (!contentRef.current) return;
            gsap.fromTo(
              contentRef.current,
              { opacity: 0, y: toStep === 2 ? 12 : -12 },
              { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
            );
          });
        },
      });
    },
    [],
  );

  // ── Step navigation ──────────────────────────────────────────────
  async function goToStep2() {
    if (pendingStep !== null) return; // block during animation
    setFormError(null);
    setOpenDropdown(null);
    const valid = await trigger(STEP1_FIELDS);
    if (!valid) return;
    setPendingStep(2);
    animateTransition(2);
  }

  function goToStep1() {
    if (pendingStep !== null) return; // block during animation
    setFormError(null);
    setOpenDropdown(null);
    setPendingStep(1);
    animateTransition(1);
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

  // Helper: dropdown open/close handlers — ensures only one open at a time
  function openDropdownHandler(name: "department" | "year" | "hostelBlock") {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }
  function closeDropdown() {
    setOpenDropdown(null);
  }

  return (
    <AuthCard heading="Create Student Account" subtitle="Create a hostel student account" footer={null}>
      {/* ── Step indicator ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300",
              step === 1
                ? "bg-primary text-white"
                : "bg-primary/15 text-primary",
            )}
          >
            1
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold transition-colors duration-300",
              step === 1 ? "text-heading" : "text-heading/40",
            )}
          >
            Student Details
          </span>
        </div>
        <div className="h-px w-6 bg-heading/15" />
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300",
              step === 2
                ? "bg-primary text-white"
                : "bg-primary/15 text-primary",
            )}
          >
            2
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold transition-colors duration-300",
              step === 2 ? "text-heading" : "text-heading/40",
            )}
          >
            Hostel &amp; Account
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
        {/* ── Animated content wrapper ──────────────────────────────── */}
        <div ref={contentRef}>
          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
              <InputField
                label="Full Name"
                iconSrc="/assets/icons/user.svg"
                placeholder="Full name"
                autoComplete="name"
                error={fieldErrors.fullName?.message}
                {...register("fullName")}
              />
              <InputField
                label="Register Number"
                iconSrc="/assets/icons/user.svg"
                placeholder="e.g. 8129241040XX"
                autoComplete="off"
                error={fieldErrors.registerNumber?.message}
                {...register("registerNumber")}
              />
              <InputField
                label="College Email"
                iconSrc="/assets/icons/mail.svg"
                placeholder="email@oasys.edu.in"
                autoComplete="email"
                error={fieldErrors.email?.message}
                {...register("email")}
              />
              <InputField
                label="Phone Number"
                iconSrc="/assets/icons/phone.svg"
                placeholder="Phone number"
                autoComplete="tel"
                error={fieldErrors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
              <CustomSelect
                label="Department"
                iconSrc="/assets/icons/department.svg"
                value={selectedDept}
                onChange={(val) => setValue("department", val, { shouldValidate: true })}
                options={DEPARTMENTS}
                placeholder="Select dept"
                error={fieldErrors.department?.message}
                isOpen={openDropdown === "department"}
                onOpen={() => openDropdownHandler("department")}
                onClose={closeDropdown}
              />
              <CustomSelect
                label="Year"
                iconSrc="/assets/icons/calendar.svg"
                value={selectedYear}
                onChange={(val) => setValue("year", val, { shouldValidate: true })}
                options={YEARS}
                placeholder="Select year"
                error={fieldErrors.year?.message}
                isOpen={openDropdown === "year"}
                onOpen={() => openDropdownHandler("year")}
                onClose={closeDropdown}
              />
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
              <CustomSelect
                label="Hostel Block"
                iconSrc="/assets/dashboard/icons/room-icon.svg"
                value={selectedBlock}
                onChange={(val) => setValue("hostelBlock", val, { shouldValidate: true })}
                options={HOSTEL_BLOCKS}
                placeholder="Hostel block"
                error={fieldErrors.hostelBlock?.message}
                isOpen={openDropdown === "hostelBlock"}
                onOpen={() => openDropdownHandler("hostelBlock")}
                onClose={closeDropdown}
              />
              <InputField
                label="Room Number"
                iconSrc="/assets/dashboard/icons/room-icon.svg"
                placeholder="Room number"
                autoComplete="off"
                error={fieldErrors.roomNumber?.message}
                {...register("roomNumber")}
              />
              <InputField
                label="Password"
                iconSrc="/assets/icons/lock.svg"
                placeholder="Create password"
                autoComplete="new-password"
                isPassword
                error={fieldErrors.password?.message}
                {...register("password")}
              />
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
          )}
        </div>
        {/* ── /Animated content wrapper ─────────────────────────────── */}

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
              disabled={pendingStep !== null}
              onMouseEnter={() => handleBtnEnter(nextBtnRef)}
              onMouseLeave={() => handleBtnLeave(nextBtnRef)}
              data-float
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(110,66,245,0.22)] transition-opacity cursor-pointer disabled:opacity-70"
            >
              Next
            </button>
          )}
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={goToStep1}
                disabled={pendingStep !== null}
                className="flex-1 rounded-xl border border-primary/25 bg-white/60 py-3 text-xs font-semibold text-primary backdrop-blur-sm transition-all hover:bg-white/80 cursor-pointer disabled:opacity-70"
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
