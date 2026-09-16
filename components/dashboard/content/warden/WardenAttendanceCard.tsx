// components/dashboard/content/warden/WardenAttendanceCard.tsx
//
// Desktop-optimized attendance session card for the Warden.
// Shows "Today's Attendance" with the ability to generate a secure
// attendance session, displays the generated QR visually, and provides
// live status information. Used directly on the Warden Dashboard and
// the dedicated Attendance management page.
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  QrCode,
  RefreshCw,
  Shield,
  ShieldCheck,
  CalendarDays,
  Zap,
  Users,
  Timer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SessionData {
  id: string;
  token: string;
  date: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  expired?: boolean;
  generatedBy: string;
}

export function WardenAttendanceCard() {
  const { user } = useCurrentUser();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Fetch current session on mount ─────────────────────────────── */
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance/status", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      if (data.hasActiveSession && data.session) {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch {
      setError("Could not load attendance status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /* ── Generate new session ───────────────────────────────────────── */
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await fetch("/api/attendance/generate", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to generate session");
      }
      const data = await res.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate session.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── Date/time formatting ───────────────────────────────────────── */
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const wardenName = user?.fullName?.trim() || "Warden";

  if (loading) {
    return (
      <div className="sa-dashboard-card flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.79] px-8 py-16 backdrop-blur-[30px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[13px] font-medium text-heading/50">Loading attendance status…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <section className="sa-dashboard-card w-full rounded-[20px] border border-white/10 bg-white/[0.79] shadow-sm backdrop-blur-[30px]">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          {/* Left: Info & Action */}
          <div className="flex flex-col justify-center gap-5 px-6 py-8 sm:px-10 sm:py-10 lg:py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 sm:h-14 sm:w-14">
              <QrCode className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-heading sm:text-[22px]">
                Today&apos;s Attendance
              </h2>
              <p className="mt-1.5 max-w-md text-[14px] font-medium leading-relaxed text-heading/55">
                Generate a secure attendance session for students.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-semibold text-white shadow-glass transition-all duration-200 hover:bg-primary-dark hover:shadow-glass-lg active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer sm:text-[15px]"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
                {generating ? "Generating…" : "Generate Attendance QR"}
              </button>
            </div>

            {error && (
              <p className="text-[13px] font-medium text-red-500">{error}</p>
            )}
          </div>

          {/* Right: Visual placeholder */}
          <div className="hidden items-center justify-center border-l border-white/20 px-8 py-10 lg:flex">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-dashed border-heading/10 bg-heading/[0.03]">
                <QrCode className="h-14 w-14 text-heading/15" />
              </div>
              <p className="text-[13px] font-medium text-heading/35">
                No active attendance session
              </p>
              <div className="flex flex-col gap-1.5 text-[12px] font-medium text-heading/30">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-heading/20" />
                  Students cannot mark attendance
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-heading/20" />
                  Generate session to activate
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sa-dashboard-card w-full rounded-[20px] border border-white/10 bg-white/[0.79] shadow-sm backdrop-blur-[30px]">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
        {/* Left: Session status (3/5 width) */}
        <div className="flex flex-col gap-5 px-6 py-8 sm:px-10 sm:py-9 lg:col-span-3">
          {/* Header with status badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-bold text-heading sm:text-[22px]">
                Today&apos;s Attendance QR
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {session.expired ? "Expired" : "Active"}
              </span>
            </div>
          </div>

          {/* Session details */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow
              icon={CalendarDays}
              label="Date"
              value={formatDate(session.date + "T00:00:00")}
            />
            <DetailRow
              icon={Clock}
              label="Generated At"
              value={formatTime(session.createdAt)}
            />
            <DetailRow
              icon={Timer}
              label="Valid Until"
              value={formatTime(session.expiresAt)}
            />
            <DetailRow
              icon={Users}
              label="Generated By"
              value={session.generatedBy || wardenName}
            />
          </div>

          {/* Status checks */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <StatusBadge text="Token Active" active={!session.expired} />
            <StatusBadge text="Valid for Today" active={!session.expired} />
            <StatusBadge text="Ready for Student Verification" active={!session.expired} />
          </div>

          {/* Regenerate action */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-[13px] font-semibold text-primary transition-all duration-200 hover:bg-primary/10 active:scale-[0.97] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate QR
            </button>
            {error && (
              <p className="text-[13px] font-medium text-red-500">{error}</p>
            )}
          </div>
        </div>

        {/* Right: Large QR Visual (2/5 width) */}
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/20 px-6 py-8 sm:px-10 lg:col-span-2 lg:border-l lg:border-t-0">
          {/* Real QR Code Container */}
          <div className="relative flex items-center justify-center rounded-3xl border-2 border-primary/20 bg-white p-3.5 shadow-glass sm:p-4.5">
            <QRCodeSVG
              value={session.token}
              size={184}
              level="M"
              fgColor="#150B2D"
              bgColor="#FFFFFF"
              className="h-44 w-44 rounded-lg sm:h-48 sm:w-48"
              title="Today's Attendance QR Code"
            />
            {/* Corner framing markers */}
            <span className="pointer-events-none absolute -left-1.5 -top-1.5 h-6 w-6 rounded-tl-xl border-l-[3px] border-t-[3px] border-primary/40" />
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 h-6 w-6 rounded-tr-xl border-r-[3px] border-t-[3px] border-primary/40" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-6 w-6 rounded-bl-xl border-b-[3px] border-l-[3px] border-primary/40" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-br-xl border-b-[3px] border-r-[3px] border-primary/40" />
          </div>

          {/* Session Token display */}
          <div className="w-full max-w-[260px] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-heading/40">
              Active Session Token
            </p>
            <p className="mt-1 truncate rounded-lg bg-heading/[0.04] px-3 py-1.5 font-mono text-[11px] font-medium text-heading/60">
              {session.token}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600/70">
            <Shield className="h-3.5 w-3.5" />
            Active for today&apos;s student attendance
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-heading/5 bg-heading/[0.02] px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary/60">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/35">
          {label}
        </p>
        <p className="truncate text-[13px] font-semibold text-heading">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ text, active }: { text: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${
        active
          ? "bg-emerald-500/10 text-emerald-700"
          : "bg-heading/5 text-heading/35"
      }`}
    >
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      {text}
    </span>
  );
}

