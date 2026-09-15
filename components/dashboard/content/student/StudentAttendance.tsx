// StudentAttendance.tsx
//
// Full client-side attendance flow for the Student dashboard MVP:
//
//   1. Location Check (dummy — simulated success)
//   2. QR Scanner   (in-app camera via html5-qrcode)
//   3. Success / Invalid / Already-Marked states
//
// ─── FUTURE REPLACEMENT POINTS ───────────────────────────────────────
//   • DUMMY_QR_PAYLOAD  → warden-generated daily QR from backend
//   • validateQr()      → POST /api/attendance/verify (backend check)
//   • simulateGps()     → real navigator.geolocation + geofencing
//   • localStorage key  → MongoDB attendance record check
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
  XCircle,
  Loader2,
  CalendarDays,
  Clock,
  Hash,
  DoorOpen,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { STUDENT_PROFILE } from "@/lib/student-dashboard-mock";

/* ── Dummy QR payload ─────────────────────────────────────────────── */
// TODO: Replace with warden-generated daily token from backend
const DUMMY_QR_PAYLOAD = "OASYS_ATTENDANCE_DUMMY_2026";

/* ── LocalStorage key for duplicate prevention ────────────────────── */
// TODO: Replace with backend/DB attendance lookup
const LS_KEY = "oasys_attendance_marked";

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function isAlreadyMarkedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_KEY) === getToday();
}

function markAttendanceToday(): void {
  localStorage.setItem(LS_KEY, getToday());
}

/* ── Dummy QR validation ──────────────────────────────────────────── */
// TODO: Replace with POST /api/attendance/verify
function validateQr(payload: string): boolean {
  return payload.trim() === DUMMY_QR_PAYLOAD;
}

/* ── Flow stages ──────────────────────────────────────────────────── */
type Stage =
  | "checking-location"
  | "location-verified"
  | "scanner"
  | "success"
  | "invalid"
  | "already-marked";

/* ── Shared glass card wrapper ────────────────────────────────────── */
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "sa-dashboard-card rounded-[20px] border border-white/10 bg-white/[0.79] backdrop-blur-[30px] " +
        className
      }
    >
      {children}
    </section>
  );
}

/* ── Back to Dashboard button ─────────────────────────────────────── */
function BackButton({ label = "Back to Dashboard" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/student")}
      className={
        "group flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold " +
        "text-heading/70 transition-all duration-200 hover:text-primary " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      }
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}

/* ── Primary action button (reused across stages) ─────────────────── */
function PrimaryButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[14px] " +
        "font-semibold text-white shadow-glass transition-all duration-200 " +
        "hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 " +
        className
      }
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* 1. LOCATION CHECK (dummy)                                        */
/* ═══════════════════════════════════════════════════════════════════ */
function LocationCheckStage({ onVerified }: { onVerified: () => void }) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Simulate GPS check — 1.8s delay then auto-verified
    const t = setTimeout(() => setVerified(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (verified) {
      // Brief pause on the "verified" screen, then auto-advance
      const t = setTimeout(onVerified, 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [verified, onVerified]);

  return (
    <GlassCard className="mx-auto max-w-md px-6 py-10 text-center sm:px-8">
      {!verified ? (
        /* ── Checking ── */
        <div className="flex flex-col items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-heading">
              Checking your location…
            </h2>
            <p className="mt-1.5 text-[13px] font-medium text-heading/55">
              Please wait while we verify you are inside the hostel zone.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-heading/40">
            <MapPin className="h-3.5 w-3.5" />
            Verifying GPS coordinates
          </span>
        </div>
      ) : (
        /* ── Verified ── */
        <div className="flex flex-col items-center gap-5 animate-fade-up">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-heading">
              Location Verified
            </h2>
            <p className="mt-1.5 text-[13px] font-medium text-heading/55">
              You are inside the hostel attendance zone.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600/60">
            <MapPin className="h-3.5 w-3.5" />
            Opening scanner…
          </span>
        </div>
      )}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* 2. QR SCANNER                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
function ScannerStage({
  onResult,
}: {
  onResult: (payload: string) => void;
}) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Prevent double-initialisation in React strict mode
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let html5Qr: import("html5-qrcode").Html5Qrcode | null = null;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!scannerRef.current) return;

        html5Qr = new Html5Qrcode("oasys-qr-reader");
        scannerInstanceRef.current = html5Qr;

        await html5Qr.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            onResult(decodedText);
            // Stop scanner after first successful read
            html5Qr
              ?.stop()
              .catch(() => {
                /* scanner may already be stopped */
              });
          },
          () => {
            /* ignore scan failures (frames without QR) */
          }
        );
      } catch (err) {
        console.error("QR scanner error:", err);
        setError(
          "Could not access camera. Please allow camera access and try again."
        );
      }
    }

    startScanner();

    return () => {
      html5Qr
        ?.stop()
        .catch(() => {
          /* already stopped */
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlassCard className="mx-auto max-w-md overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <QrCode className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold leading-6 text-heading">
              Mark Attendance
            </h2>
            <p className="mt-0.5 text-[12.5px] font-medium text-heading/50">
              Scan the QR code displayed by your hostel warden.
            </p>
          </div>
        </div>
      </div>

      {/* Camera preview area */}
      <div className="relative mx-4 mb-3 overflow-hidden rounded-2xl border border-white/30 bg-black/5 sm:mx-5">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <XCircle className="h-10 w-10 text-red-400" />
            <p className="text-[13px] font-medium text-heading/70">{error}</p>
          </div>
        ) : (
          <div
            id="oasys-qr-reader"
            ref={scannerRef}
            className="aspect-square w-full [&_video]:!rounded-2xl [&_#qr-shaded-region]:!border-primary/40"
          />
        )}
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-center gap-2 px-5 pb-5">
        <ScanLine className="h-4 w-4 text-primary/50" />
        <p className="text-[12px] font-medium text-heading/45">
          Align the QR code inside the frame
        </p>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* 3. SUCCESS STATE                                                 */
/* ═══════════════════════════════════════════════════════════════════ */
function SuccessStage({
  studentName,
  registerNo,
  roomNumber,
}: {
  studentName: string;
  registerNo: string;
  roomNumber: string;
}) {
  const router = useRouter();
  const now = new Date();

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
    { icon: Hash, label: "Register Number", value: registerNo },
    { icon: DoorOpen, label: "Room Number", value: roomNumber },
    { icon: CalendarDays, label: "Date", value: dateStr },
    { icon: Clock, label: "Time", value: timeStr },
    {
      icon: CheckCircle2,
      label: "Status",
      value: "Present",
      valueClassName: "text-emerald-600 font-bold",
    },
  ];

  return (
    <GlassCard className="mx-auto max-w-md px-6 py-8 text-center sm:px-8 animate-fade-up">
      {/* Success icon */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>

      <h2 className="text-[22px] font-bold text-heading">
        Attendance Marked!
      </h2>
      <p className="mt-2 text-[14px] font-medium text-heading/60">
        {greeting}, {studentName}
      </p>
      <p className="mt-1 text-[13px] font-medium text-heading/45">
        Your attendance has been recorded successfully.
      </p>

      {/* Detail rows */}
      <div className="mt-6 space-y-0">
        {details.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 border-b border-heading/5 px-2 py-3 last:border-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary/70">
              <d.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-left text-[12px] font-semibold uppercase tracking-wide text-heading/40">
              {d.label}
            </span>
            <span
              className={
                "text-right text-[13px] font-semibold text-heading " +
                ((d as { valueClassName?: string }).valueClassName ?? "")
              }
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>

      {/* Back button */}
      <div className="mt-6">
        <PrimaryButton onClick={() => router.push("/dashboard/student")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* 4. INVALID QR STATE                                              */
/* ═══════════════════════════════════════════════════════════════════ */
function InvalidStage({ onRetry }: { onRetry: () => void }) {
  return (
    <GlassCard className="mx-auto max-w-md px-6 py-10 text-center sm:px-8 animate-fade-up">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
        <XCircle className="h-10 w-10 text-red-400" />
      </div>

      <h2 className="text-[20px] font-bold text-heading">Invalid QR Code</h2>
      <p className="mt-2 text-[13px] font-medium text-heading/55">
        Please scan the attendance QR displayed by your hostel warden.
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={onRetry}>
          <ScanLine className="h-4 w-4" />
          Scan Again
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* 5. ALREADY MARKED STATE                                          */
/* ═══════════════════════════════════════════════════════════════════ */
function AlreadyMarkedStage() {
  const router = useRouter();
  return (
    <GlassCard className="mx-auto max-w-md px-6 py-10 text-center sm:px-8 animate-fade-up">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
        <ShieldCheck className="h-10 w-10 text-amber-500" />
      </div>

      <h2 className="text-[20px] font-bold text-heading">
        Attendance Already Marked
      </h2>
      <p className="mt-2 text-[13px] font-medium text-heading/55">
        Today&apos;s attendance has already been recorded.
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={() => router.push("/dashboard/student")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* MAIN ORCHESTRATOR                                                */
/* ═══════════════════════════════════════════════════════════════════ */

export function StudentAttendance() {
  const { user, loading } = useCurrentUser();

  // Determine initial stage (check localStorage for already-marked)
  const [stage, setStage] = useState<Stage>(() =>
    isAlreadyMarkedToday() ? "already-marked" : "checking-location"
  );

  const studentName = user?.fullName?.trim() || "Student";
  const registerNo = STUDENT_PROFILE.registerNo;
  const roomNumber = user?.roomNumber || STUDENT_PROFILE.room;

  const handleLocationVerified = useCallback(() => {
    setStage("scanner");
  }, []);

  const handleQrResult = useCallback((payload: string) => {
    if (validateQr(payload)) {
      markAttendanceToday();
      setStage("success");
    } else {
      setStage("invalid");
    }
  }, []);

  const handleRetry = useCallback(() => {
    setStage("scanner");
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Back nav */}
      <BackButton />

      {/* Stage content */}
      <div className="flex flex-col items-center justify-center px-2 pb-4">
        {stage === "checking-location" && (
          <LocationCheckStage onVerified={handleLocationVerified} />
        )}

        {stage === "location-verified" && (
          /* This stage auto-transitions via LocationCheckStage */
          <LocationCheckStage onVerified={handleLocationVerified} />
        )}

        {stage === "scanner" && <ScannerStage onResult={handleQrResult} />}

        {stage === "success" && (
          <SuccessStage
            studentName={loading ? "Student" : studentName}
            registerNo={registerNo}
            roomNumber={roomNumber}
          />
        )}

        {stage === "invalid" && <InvalidStage onRetry={handleRetry} />}

        {stage === "already-marked" && <AlreadyMarkedStage />}
      </div>
    </div>
  );
}
