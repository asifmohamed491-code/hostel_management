// StudentAttendance.tsx
//
// Full student attendance flow — NO camera, NO QR scanning.
// The student clicks "Mark Attendance", the app verifies location
// (simulated for now), then calls the backend to validate the
// active attendance session and record the student's attendance.
//
// ─── FLOW ────────────────────────────────────────────────────────────
//   1. Check location (dummy GPS simulation → ready for real later)
//   2. Location verified → "Continue"
//   3. Verify attendance against backend (active session check)
//   4. Success / Already Marked / No Session / Expired
// ─── FUTURE REPLACEMENT POINTS ──────────────────────────────────────
//   • Location check  → real navigator.geolocation + geofencing
//   • Backend already handles real session tokens from warden
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  XCircle,
  Loader2,
  CalendarDays,
  Clock,
  Hash,
  DoorOpen,
  Wifi,
  CircleDot,
  AlertTriangle,
  Fingerprint,
  User,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { STUDENT_PROFILE } from "@/lib/student-dashboard-mock";

/* ── Flow stages ──────────────────────────────────────────────────── */
type Stage =
  | "checking-location"
  | "location-verified"
  | "verifying"
  | "success"
  | "already-marked"
  | "no-session"
  | "session-expired"
  | "error";

/* ── Attendance record from backend ───────────────────────────────── */
interface AttendanceResult {
  studentName?: string;
  registerNumber?: string;
  roomNumber?: string;
  date?: string;
  markedAt?: string;
  status?: string;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 1: LOCATION CHECK (dummy GPS)                               */
/* STEP 1: CHECKING LOCATION                                         */
/* ═══════════════════════════════════════════════════════════════════ */
function LocationCheckStage({ onVerified }: { onVerified: () => void }) {
  const [verified, setVerified] = useState(false);

function CheckingLocationStage({ onVerified }: { onVerified: () => void }) {
  useEffect(() => {
    // Simulate GPS check — 2s delay
    const t = setTimeout(() => setVerified(true), 2000);
    // Simulate location check — 1.8s delay
    const t = setTimeout(onVerified, 1800);
    return () => clearTimeout(t);
  }, []);
  }, [onVerified]);

  if (!verified) {
    return (
      <StageCard>
        <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 lg:flex-row lg:gap-10 lg:text-left">
          {/* Large Location Icon with pulse */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-primary/10 lg:h-28 lg:w-28">
            <MapPin className="h-12 w-12 text-primary animate-bounce lg:h-14 lg:w-14" />
            <span className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-ping opacity-30" />
          </div>
  return (
    <StageCard>
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 lg:flex-row lg:gap-10 lg:text-left">
        {/* Large Location Icon with pulse */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-primary/10 lg:h-28 lg:w-28">
          <MapPin className="h-12 w-12 text-primary animate-bounce lg:h-14 lg:w-14" />
          <span className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-ping opacity-30" />
        </div>

          {/* Content */}
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-bold uppercase tracking-wider text-primary">
              Mark Attendance
            </span>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">
              Checking your location…
            </h2>
            <p className="max-w-lg text-[14px] font-medium leading-relaxed text-heading/55 sm:text-[15px]">
              Please allow location access to verify that you are inside the hostel premises.
            </p>
            <div className="flex items-center gap-2 text-[12px] font-semibold text-heading/40">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Verifying GPS coordinates…
            </div>
        {/* Content */}
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-primary">
            Mark Attendance
          </span>
          <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">
            Checking your location…
          </h2>
          <p className="max-w-lg text-[14px] font-medium leading-relaxed text-heading/55 sm:text-[15px]">
            Please allow location access to verify that you are inside the hostel premises.
          </p>
          <div className="flex items-center gap-2 text-[12px] font-semibold text-heading/40">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Verifying GPS coordinates…
          </div>
        </div>
      </StageCard>
    );
  }
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 2: LOCATION VERIFIED                                         */
/* ═══════════════════════════════════════════════════════════════════ */
function LocationVerifiedStage({ onContinue }: { onContinue: () => void }) {
  return (
    <StageCard>
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 lg:flex-row lg:gap-10 lg:text-left">
        {/* Large check icon */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-emerald-500/10 lg:h-28 lg:w-28 animate-fade-up">
          <ShieldCheck className="h-12 w-12 text-emerald-500 lg:h-14 lg:w-14" />
          <span className="absolute inset-0 rounded-3xl border-2 border-emerald-500/20 animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 animate-fade-up">
          <div>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">
              Location Verified
            </h2>
            <p className="mt-1.5 text-[14px] font-medium text-heading/55 sm:text-[15px]">
              You are inside the hostel attendance zone.
            </p>
          </div>

          {/* Location details */}
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-2.5 text-[13px] font-semibold text-heading/70">
              <Wifi className="h-4 w-4 text-emerald-500" />
              Distance from Hostel: 32 m
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-2.5 text-[13px] font-semibold text-heading/70">
              <CircleDot className="h-4 w-4 text-primary" />
              Allowed Radius: 100 m
            </span>
          </div>

          <button
            type="button"
            onClick={onVerified}
            onClick={onContinue}
            className="mt-2 inline-flex w-fit items-center gap-2 self-center rounded-2xl bg-primary px-8 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer lg:self-start sm:text-[15px]"
          >
            Continue
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 3: VERIFYING ATTENDANCE (backend call)                      */
/* ═══════════════════════════════════════════════════════════════════ */
function VerifyingStage({
  onResult,
}: {
  onResult: (stage: Stage, data?: AttendanceResult) => void;
}) {
  const [steps, setSteps] = useState([
    { label: "Location verified", done: true },
    { label: "Active attendance session found", done: false },
    { label: "Validating attendance", done: false },
    { label: "Recording attendance", done: false },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      // Step 2: check session
      await delay(800);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 1 ? { ...st, done: true } : st)));

      // Step 3: validate
      await delay(600);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 2 ? { ...st, done: true } : st)));

      // Step 4: call backend
      try {
        const res = await fetch("/api/attendance/mark", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (cancelled) return;

        setSteps((s) => s.map((st, i) => (i === 3 ? { ...st, done: true } : st)));
        await delay(500);
        if (cancelled) return;

        if (res.status === 201) {
          onResult("success", data.record);
        } else if (data.code === "ALREADY_MARKED") {
          onResult("already-marked", data.record);
        } else if (data.code === "SESSION_EXPIRED") {
          onResult("session-expired");
        } else if (data.code === "NO_SESSION") {
          onResult("no-session");
        } else {
          onResult("error");
        }
      } catch {
        if (!cancelled) onResult("error");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StageCard>
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 lg:flex-row lg:gap-10 lg:text-left">
        {/* Icon */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-primary/10 lg:h-28 lg:w-28">
          <Fingerprint className="h-12 w-12 animate-pulse text-primary lg:h-14 lg:w-14" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">
              Verify Attendance
            </h2>
            <p className="mt-1.5 text-[14px] font-medium text-heading/55 sm:text-[15px]">
              Checking today&apos;s active attendance session…
            </p>
          </div>

          {/* Verification steps */}
          <div className="flex flex-col gap-3">
            {steps.map((step) => (
              <div
                key={step.label}
                className="flex items-center gap-3 text-[13px] font-semibold sm:text-[14px]"
              >
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary/40" />
                )}
                <span
                  className={
                    step.done ? "text-heading/70" : "text-heading/40"
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 4: SUCCESS STATE                                            */
/* ═══════════════════════════════════════════════════════════════════ */
function SuccessStage({
  studentName,
  record,
}: {
  studentName: string;
  record: AttendanceResult;
}) {
  const router = useRouter();
  const now = new Date(record.markedAt || Date.now());

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const details = [
    { icon: Hash, label: "Register Number", value: record.registerNumber || STUDENT_PROFILE.registerNo },
    { icon: User, label: "Student Name", value: studentName },
    { icon: DoorOpen, label: "Room Number", value: record.roomNumber || STUDENT_PROFILE.room },
    { icon: CalendarDays, label: "Date", value: dateStr },
    { icon: Clock, label: "Time", value: timeStr },
    { icon: CheckCircle2, label: "Status", value: "Present", accent: true },
  ];

  return (
    <StageCard className="animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Success message */}
        <div className="flex flex-col items-center gap-5 px-6 py-8 text-center sm:px-10 lg:items-start lg:justify-center lg:py-12 lg:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 lg:h-24 lg:w-24">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 lg:h-12 lg:w-12" />
          </div>

          <div>
            <h2 className="text-[22px] font-bold text-heading sm:text-[26px]">
              Attendance Marked!
            </h2>
            <p className="mt-2 text-[15px] font-medium text-heading/60 sm:text-[16px]">
              {greeting}, {studentName}
            </p>
            <p className="mt-1 text-[13px] font-medium text-heading/45 sm:text-[14px]">
              Your attendance has been recorded successfully.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/student")}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-[15px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center border-t border-heading/5 px-6 py-6 sm:px-10 lg:border-l lg:border-t-0 lg:py-10">
          <div className="space-y-0">
            {details.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-3 border-b border-heading/5 py-3.5 last:border-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary/70">
                  <d.icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide text-heading/40">
                  {d.label}
                </span>
                <span
                  className={`text-right text-[14px] font-semibold ${
                    d.accent ? "text-emerald-600" : "text-heading"
                  }`}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ALREADY MARKED STATE                                             */
/* ═══════════════════════════════════════════════════════════════════ */
function AlreadyMarkedStage({ record }: { record?: AttendanceResult }) {
  const router = useRouter();
  const markedAt = record?.markedAt ? new Date(record.markedAt) : new Date();

  const dateStr = markedAt.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = markedAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <StageCard className="animate-fade-up">
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 lg:flex-row lg:gap-10 lg:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-amber-500/10 lg:h-24 lg:w-24">
          <ShieldCheck className="h-10 w-10 text-amber-500 lg:h-12 lg:w-12" />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">
              Attendance Already Marked
            </h2>
            <p className="mt-2 text-[14px] font-medium text-heading/55 sm:text-[15px]">
              Your attendance has already been recorded for today.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-2.5 text-[13px] font-semibold text-heading/70">
              <CalendarDays className="h-4 w-4 text-primary/60" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-2.5 text-[13px] font-semibold text-heading/70">
              <Clock className="h-4 w-4 text-primary/60" />
              {timeStr}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-2.5 text-[13px] font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Present
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/student")}
            className="mt-2 inline-flex w-fit items-center gap-2 self-center rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:self-start sm:text-[15px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* NO SESSION / EXPIRED / ERROR STATES                              */
/* ═══════════════════════════════════════════════════════════════════ */
function UnavailableStage({
  type,
  onRetry,
}: {
  type: "no-session" | "session-expired" | "error";
  onRetry: () => void;
}) {
  const router = useRouter();

  const config = {
    "no-session": {
      icon: XCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      title: "Attendance Unavailable",
      desc: "No active attendance session is currently available.",
    },
    "session-expired": {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "Attendance Session Expired",
      desc: "The current attendance session is no longer active.",
    },
    error: {
      icon: XCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      title: "Something Went Wrong",
      desc: "We couldn't process your attendance. Please check your connection and try again.",
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <StageCard className="animate-fade-up">
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16 lg:flex-row lg:gap-10 lg:text-left">
        <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${c.iconBg} lg:h-24 lg:w-24`}>
          <Icon className={`h-10 w-10 ${c.iconColor} lg:h-12 lg:w-12`} />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">
              {c.title}
            </h2>
            <p className="mt-2 max-w-lg text-[14px] font-medium leading-relaxed text-heading/55 sm:text-[15px]">
              {c.desc}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-[15px]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/student")}
              className="inline-flex items-center gap-2 rounded-2xl border border-heading/10 bg-white/50 px-7 py-3.5 text-[14px] font-semibold text-heading/70 transition-all duration-200 hover:bg-white/80 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-[15px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* SHARED CARD WRAPPER — desktop-filling glassmorphism               */
/* ═══════════════════════════════════════════════════════════════════ */
function StageCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "sa-dashboard-card w-full rounded-[20px] border border-white/10 bg-white/[0.79] backdrop-blur-[30px] " +
        className
      }
    >
      {children}
    </section>
  );
}

/* ── Delay helper ─────────────────────────────────────────────────── */
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════════════════════════ */
/* MAIN ORCHESTRATOR                                                */
/* ═══════════════════════════════════════════════════════════════════ */
export function StudentAttendance() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [stage, setStage] = useState<Stage>("checking-location");
  const [record, setRecord] = useState<AttendanceResult>({});

  const studentName = user?.fullName?.trim() || "Student";

  // Check if attendance was already marked for today
  useEffect(() => {
    let cancelled = false;
    async function checkExistingAttendance() {
      try {
        const res = await fetch("/api/attendance/status", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.studentRecord) {
          setRecord(data.studentRecord);
          setStage("already-marked");
        }
      } catch {
        // Continue with normal location checking flow
      }
    }
    checkExistingAttendance();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLocationVerified = useCallback(() => {
    setStage("location-verified");
  }, []);

  const handleContinueToVerify = useCallback(() => {
    setStage("verifying");
  }, []);

  const handleVerifyResult = useCallback(
    (resultStage: Stage, data?: AttendanceResult) => {
      if (data) setRecord(data);
      setStage(resultStage);
    },
    []
  );

  const handleRetry = useCallback(() => {
    setStage("checking-location");
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/student")}
        className="group flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-heading/70 transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        className="group flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-heading/70 transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Dashboard
      </button>

      {/* Page title */}
      <div className="px-1">
        <h1 className="text-[22px] font-bold text-heading sm:text-[26px]">
          Mark Attendance
        </h1>
        <p className="mt-1 text-[13px] font-medium text-heading/50 sm:text-[14px]">
          Verify your location and mark today&apos;s attendance.
        </p>
      </div>

      {/* Stage content — fills available width */}
      <div className="pb-4">
        {stage === "checking-location" && (
          <LocationCheckStage onVerified={handleLocationVerified} />
          <CheckingLocationStage onVerified={handleLocationVerified} />
        )}

        {stage === "location-verified" && (
          <LocationCheckStage onVerified={handleLocationVerified} />
          <LocationVerifiedStage onContinue={handleContinueToVerify} />
        )}

        {stage === "verifying" && (
          <VerifyingStage onResult={handleVerifyResult} />
        )}

        {stage === "success" && (
          <SuccessStage
            studentName={loading ? "Student" : studentName}
            record={record}
          />
        )}

        {stage === "already-marked" && <AlreadyMarkedStage record={record} />}

        {(stage === "no-session" ||
          stage === "session-expired" ||
          stage === "error") && (
          <UnavailableStage type={stage} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
}
