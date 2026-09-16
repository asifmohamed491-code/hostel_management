// components/dashboard/content/student/StudentAttendance.tsx
//
// Full student attendance flow with real browser GPS & server-authoritative geofencing.
// NO camera, NO QR scanning.
//
// ─── FLOW ────────────────────────────────────────────────────────────
//   1. Check location via navigator.geolocation (high accuracy, timeout: 15s)
//   2. Location verified → displays actual measured distance & allowed 320m radius
//   3. Student clicks "Continue" → POST /api/attendance/mark with { latitude, longitude, accuracy }
//   4. Backend validates session, calculates Haversine distance, checks geofence & duplicate
//   5. Success / Already Marked / Out of Bounds / Poor Accuracy / No Session / Expired
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  RotateCcw,
  Navigation,
  QrCode,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { STUDENT_PROFILE } from "@/lib/student-dashboard-mock";
import { HOSTEL_GEOFENCE, calculateDistanceMeters } from "@/lib/constants/geofence";
import { Html5Qrcode } from "html5-qrcode";

/* ── Flow stages ──────────────────────────────────────────────────── */
type Stage =
  | "checking-session"
  | "checking-location"
  | "location-verified"
  | "scanning-qr"
  | "verifying"
  | "success"
  | "already-marked"
  | "no-session"
  | "session-expired"
  | "out-of-bounds"
  | "poor-accuracy"
  | "invalid-qr"
  | "permission-denied"
  | "position-unavailable"
  | "location-timeout"
  | "error";

/* ── Attendance record from backend ───────────────────────────────── */
interface AttendanceResult {
  studentName?: string;
  registerNumber?: string;
  roomNumber?: string;
  date?: string;
  markedAt?: string;
  status?: string;
  distanceMeters?: number;
}

interface Coords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeoExtra {
  distanceMeters?: number;
  allowedRadius?: number;
  accuracy?: number;
  maxAccuracy?: number;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 1: CHECKING ACTIVE WARDEN SESSION                              */
function CheckingSessionStage() {
  return (
    <StageCard>
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:flex-row lg:gap-10 lg:px-14 lg:py-16 lg:text-left">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-primary">Mark Attendance</span>
          <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">Checking attendance status…</h2>
          <p className="max-w-lg text-[14px] font-medium leading-relaxed text-heading/55 sm:text-[15px]">
            Checking whether today&apos;s attendance session is open.
          </p>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 2: CHECKING LOCATION (Real navigator.geolocation)             */
/* ═══════════════════════════════════════════════════════════════════ */
function CheckingLocationStage({
  onVerified,
  onError,
}: {
  onVerified: (coords: Coords, distanceMeters: number) => void;
  onError: (stage: Stage, extra?: GeoExtra) => void;
}) {
  useEffect(() => {
    let cancelled = false;

    if (typeof window === "undefined" || !navigator.geolocation) {
      onError("position-unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;

        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        const distance = calculateDistanceMeters(
          coords.latitude,
          coords.longitude,
          HOSTEL_GEOFENCE.latitude,
          HOSTEL_GEOFENCE.longitude
        );
        const roundedDistance = Math.round(distance);

        // Pre-check GPS accuracy threshold
        if (coords.accuracy > HOSTEL_GEOFENCE.maxAccuracyMeters) {
          onError("poor-accuracy", {
            accuracy: Math.round(coords.accuracy),
            maxAccuracy: HOSTEL_GEOFENCE.maxAccuracyMeters,
          });
          return;
        }

        // Pre-check geofence boundary client-side
        if (distance > HOSTEL_GEOFENCE.radiusMeters) {
          onError("out-of-bounds", {
            distanceMeters: roundedDistance,
            allowedRadius: HOSTEL_GEOFENCE.radiusMeters,
          });
          return;
        }

        onVerified(coords, roundedDistance);
      },
      (error) => {
        if (cancelled) return;
        if (error.code === error.PERMISSION_DENIED) {
          onError("permission-denied");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          onError("position-unavailable");
        } else if (error.code === error.TIMEOUT) {
          onError("location-timeout");
        } else {
          onError("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [onVerified, onError]);

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
            Reading GPS satellite coordinates…
          </div>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 3: LOCATION VERIFIED                                         */
/* ═══════════════════════════════════════════════════════════════════ */
function LocationVerifiedStage({
  distanceMeters,
  allowedRadius,
  onContinue,
}: {
  distanceMeters: number;
  allowedRadius: number;
  onContinue: () => void;
}) {
  return (
    <StageCard>
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:flex-row lg:gap-10 lg:px-14 lg:py-16 lg:text-left">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-emerald-500/10 lg:h-28 lg:w-28 animate-fade-up">
          <ShieldCheck className="h-12 w-12 text-emerald-500 lg:h-14 lg:w-14" />
          <span className="absolute inset-0 rounded-3xl border-2 border-emerald-500/20 animate-pulse" />
        </div>
        <div className="flex flex-1 flex-col gap-4 animate-fade-up">
          <div>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">Location Verified</h2>
            <p className="mt-1.5 text-[14px] font-medium text-heading/55 sm:text-[15px]">You are inside the hostel attendance zone.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-2.5 text-[13px] font-semibold text-heading/70">
              <Wifi className="h-4 w-4 text-emerald-500" />
              Distance from Hostel: {distanceMeters} m
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-2.5 text-[13px] font-semibold text-heading/70">
              <CircleDot className="h-4 w-4 text-primary" />
              Allowed Radius: {allowedRadius} m
            </span>
          </div>
          <button type="button" onClick={onContinue} className="mt-2 inline-flex w-fit items-center gap-2 self-center rounded-2xl bg-primary px-8 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer lg:self-start sm:text-[15px]">
            Continue
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 4: SCAN ACTIVE WARDEN QR                                     */
function ScanQrStage({
  onScanned,
  onError,
}: {
  onScanned: (token: string) => void;
  onError: () => void;
}) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scannerRef.current;
    if (!element) return;
    const elementId = `attendance-qr-reader-${Math.random().toString(36).slice(2)}`;
    element.id = elementId;
    const scanner = new Html5Qrcode(elementId);
    let stopped = false;
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, (decodedText) => {
      if (!stopped) onScanned(decodedText);
    }, () => undefined).catch(() => {
      if (!stopped) onError();
    });
    return () => {
      stopped = true;
      void scanner.stop().catch(() => undefined);
    };
  }, [onError, onScanned]);

  return (
    <StageCard>
      <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10 sm:py-12 lg:flex-row lg:gap-10 lg:px-14 lg:py-16 lg:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-primary/10 lg:h-28 lg:w-28">
          <QrCode className="h-12 w-12 text-primary lg:h-14 lg:w-14" />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-heading sm:text-[24px]">Scan Warden QR</h2>
            <p className="mt-1.5 text-[14px] font-medium text-heading/55 sm:text-[15px]">Scan the active attendance QR displayed by your warden.</p>
          </div>
          <div ref={scannerRef} className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white/40" />
        </div>
      </div>
    </StageCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STEP 5: VERIFYING ATTENDANCE (backend call with GPS and QR payload) */
/* ═══════════════════════════════════════════════════════════════════ */
function VerifyingStage({
  coords,
  qrToken,
  onResult,
}: {
  coords: Coords | null;
  qrToken: string;
  onResult: (stage: Stage, data?: AttendanceResult, extra?: GeoExtra) => void;
}) {
  const [steps, setSteps] = useState([
    { label: "GPS location verified", done: true },
    { label: "Active attendance session found", done: false },
    { label: "Validating geofence & attendance", done: false },
    { label: "Recording attendance", done: false },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      // Step 2: session check simulation step in UI
      await delay(600);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 1 ? { ...st, done: true } : st)));

      // Step 3: validation step
      await delay(500);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 2 ? { ...st, done: true } : st)));

      // Step 4: Call backend with real GPS coordinates
      try {
        const payload = coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
              qrToken,
            }
          : {};

        const res = await fetch("/api/attendance/mark", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (cancelled) return;

        setSteps((s) => s.map((st, i) => (i === 3 ? { ...st, done: true } : st)));
        await delay(400);
        if (cancelled) return;

        if (res.status === 201) {
          onResult("success", data.record);
        } else if (data.code === "ALREADY_MARKED") {
          onResult("already-marked", data.record);
        } else if (data.code === "OUT_OF_BOUNDS") {
          onResult("out-of-bounds", undefined, {
            distanceMeters: data.distanceMeters,
            allowedRadius: data.allowedRadius,
          });
        } else if (data.code === "POOR_GPS_ACCURACY") {
          onResult("poor-accuracy", undefined, {
            accuracy: data.accuracy,
            maxAccuracy: data.maxAllowedAccuracy,
          });
        } else if (data.code === "LOCATION_REQUIRED") {
          onResult("permission-denied");
        } else if (data.code === "INVALID_QR") {
          onResult("invalid-qr");
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
  }, [coords, onResult, qrToken]);

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
              Checking today&apos;s active attendance session & hostel geofence…
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
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-[15px] cursor-pointer"
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
            className="mt-2 inline-flex w-fit items-center gap-2 self-center rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:self-start sm:text-[15px] cursor-pointer"
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
/* UNAVAILABLE / ERROR / GEOFENCE STATES                             */
/* ═══════════════════════════════════════════════════════════════════ */
function UnavailableStage({
  type,
  extra,
  onRetry,
}: {
  type:
    | "no-session"
    | "session-expired"
    | "out-of-bounds"
    | "poor-accuracy"
    | "invalid-qr"
    | "permission-denied"
    | "position-unavailable"
    | "location-timeout"
    | "error";
  extra?: GeoExtra;
  onRetry: () => void;
}) {
  const router = useRouter();

  const config: Record<
    typeof type,
    {
      icon: typeof XCircle;
      iconColor: string;
      iconBg: string;
      title: string;
      desc: string;
    }
  > = {
    "no-session": {
      icon: XCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      title: "Attendance Unavailable",
      desc: "No active attendance session is currently available. Please check back when the warden starts attendance.",
    },
    "session-expired": {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "Attendance Session Expired",
      desc: "Today's attendance session has ended.",
    },
    "out-of-bounds": {
      icon: Navigation,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      title: "Outside Hostel Geofence",
      desc: "You must be inside the hostel premises to mark attendance.",
    },
    "poor-accuracy": {
      icon: Wifi,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "Low GPS Accuracy",
      desc: "Your GPS accuracy is insufficient. Please move to an open area or enable high accuracy GPS and try again.",
    },
    "invalid-qr": {
      icon: QrCode,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      title: "Invalid Attendance QR",
      desc: "This QR code is invalid, inactive, or no longer valid. Please scan the active QR displayed by your warden.",
    },
    "permission-denied": {
      icon: MapPin,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      title: "Location Permission Denied",
      desc: "Location access is required to verify that you are in the hostel. Please enable location permissions in your browser settings.",
    },
    "position-unavailable": {
      icon: MapPin,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "Location Unavailable",
      desc: "Unable to retrieve your GPS location. Please ensure your device location/GPS is switched on.",
    },
    "location-timeout": {
      icon: Clock,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "Location Check Timed Out",
      desc: "Obtaining GPS coordinates took too long. Please check your signal and try again.",
    },
    error: {
      icon: XCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      title: "Something Went Wrong",
      desc: "We couldn't process your attendance. Please check your connection and try again.",
    },
  };

  const c = config[type] || config.error;
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
            {type === "poor-accuracy" && (extra?.accuracy ?? 0) >= 1000 && (
              <p className="mt-2 max-w-lg text-[14px] font-medium leading-relaxed text-heading/55 sm:text-[15px]">
                Your device could not determine a precise location. For accurate attendance verification, please use a mobile device with location services enabled.
              </p>
            )}
          </div>

          {/* Out of bounds details */}
          {type === "out-of-bounds" && extra?.distanceMeters !== undefined && (
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-[13px] font-semibold text-red-600">
                <Navigation className="h-4 w-4 text-red-500" />
                Your Distance: {extra.distanceMeters} m
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-heading/10 bg-heading/[0.02] px-4 py-2 text-[13px] font-semibold text-heading/70">
                <CircleDot className="h-4 w-4 text-primary" />
                Allowed Radius: {extra.allowedRadius ?? HOSTEL_GEOFENCE.radiusMeters} m
              </span>
            </div>
          )}

          {/* Poor accuracy details */}
          {type === "poor-accuracy" && extra?.accuracy !== undefined && (
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[13px] font-semibold text-amber-700">
                <Wifi className="h-4 w-4 text-amber-500" />
                Current Accuracy: ±{extra.accuracy} m
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-heading/10 bg-heading/[0.02] px-4 py-2 text-[13px] font-semibold text-heading/70">
                <CircleDot className="h-4 w-4 text-primary" />
                Required Accuracy: ≤ {extra.maxAccuracy ?? HOSTEL_GEOFENCE.maxAccuracyMeters} m
              </span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-[15px] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/student")}
              className="inline-flex items-center gap-2 rounded-2xl border border-heading/10 bg-white/50 px-7 py-3.5 text-[14px] font-semibold text-heading/70 transition-all duration-200 hover:bg-white/80 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-[15px] cursor-pointer"
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

  const [stage, setStage] = useState<Stage>("checking-session");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [geoExtra, setGeoExtra] = useState<GeoExtra | undefined>(undefined);
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
        } else if (!data.hasActiveSession) {
          setStage("no-session");
        } else if (!data.session?.active || data.session.expired) {
          setStage("session-expired");
        } else {
          setStage("checking-location");
        }
      } catch {
        if (!cancelled) setStage("error");
      }
    }
    checkExistingAttendance();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLocationVerified = useCallback((userCoords: Coords, calculatedDistance: number) => {
    setCoords(userCoords);
    setDistanceMeters(calculatedDistance);
    setStage("location-verified");
  }, []);

  const handleLocationError = useCallback((errorStage: Stage, extra?: GeoExtra) => {
    if (extra) setGeoExtra(extra);
    setStage(errorStage);
  }, []);

  const handleContinueToVerify = useCallback(() => {
    setStage("scanning-qr");
  }, []);

  const handleQrScanned = useCallback((token: string) => {
    setQrToken(token);
    setStage("verifying");
  }, []);

  const handleQrError = useCallback(() => {
    setStage("invalid-qr");
  }, []);

  const handleVerifyResult = useCallback(
    (resultStage: Stage, data?: AttendanceResult, extra?: GeoExtra) => {
      if (data) setRecord(data);
      if (extra) setGeoExtra(extra);
      setStage(resultStage);
    },
    []
  );

  const handleRetry = useCallback(() => {
    setGeoExtra(undefined);
    setCoords(null);
    setQrToken("");
    setStage("checking-session");
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/student")}
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
          Verify your GPS location and mark today&apos;s attendance.
        </p>
      </div>

      {/* Stage content — fills available width */}
      <div className="pb-4">
        {stage === "checking-session" && <CheckingSessionStage />}

        {stage === "checking-location" && (
          <CheckingLocationStage
            onVerified={handleLocationVerified}
            onError={handleLocationError}
          />
        )}

        {stage === "location-verified" && (
          <LocationVerifiedStage
            distanceMeters={distanceMeters}
            allowedRadius={HOSTEL_GEOFENCE.radiusMeters}
            onContinue={handleContinueToVerify}
          />
        )}

        {stage === "scanning-qr" && (
          <ScanQrStage onScanned={handleQrScanned} onError={handleQrError} />
        )}

        {stage === "verifying" && (
          <VerifyingStage coords={coords} qrToken={qrToken} onResult={handleVerifyResult} />
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
          stage === "out-of-bounds" ||
          stage === "poor-accuracy" ||
          stage === "invalid-qr" ||
          stage === "permission-denied" ||
          stage === "position-unavailable" ||
          stage === "location-timeout" ||
          stage === "error") && (
          <UnavailableStage
            type={stage}
            extra={geoExtra}
            onRetry={handleRetry}
          />
        )}
      </div>

      {/* Student Attendance History */}
      <StudentAttendanceHistory key={stage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* STUDENT ATTENDANCE HISTORY SECTION                                */
/* ═══════════════════════════════════════════════════════════════════ */
interface HistoryRecord {
  id: string;
  date: string;
  formattedDate: string;
  time: string;
  status: string;
  distanceMeters?: number;
  markingMethod: string;
  roomNumber?: string;
}

function StudentAttendanceHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch("/api/attendance/history", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setHistory(data.history || []);
      } catch {
        // Continue silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || history.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-3">
      <h3 className="px-1 text-[16px] font-bold text-heading sm:text-[18px]">
        Your Attendance History
      </h3>

      <StageCard className="p-4 sm:p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-left">
            <thead>
              <tr className="border-b border-heading/10 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-heading/40">
                <th className="py-2.5 px-2">Date</th>
                <th className="py-2.5 px-2">Check-in Time</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2">Method</th>
                <th className="py-2.5 px-2 text-right">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-heading/[0.05]">
              {history.map((rec) => (
                <tr key={rec.id} className="transition-colors hover:bg-heading/[0.02]">
                  <td className="py-3 px-2 text-[13px] font-semibold text-heading">
                    {rec.formattedDate || rec.date}
                  </td>
                  <td className="py-3 px-2 text-[13px] font-medium text-heading/70">
                    {rec.time}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        rec.status.toLowerCase() === "present"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : rec.status.toLowerCase() === "late"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[12px] font-mono text-heading/60">
                    {rec.markingMethod || "QR_GPS"}
                  </td>
                  <td className="py-3 px-2 text-right text-[12px] font-mono text-heading/60">
                    {rec.distanceMeters !== undefined ? `${rec.distanceMeters} m` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StageCard>
    </div>
  );
}

