"use client";

import { cn } from "@/lib/cn";
import {
  SESSION_STATE_LABEL,
  STATUS_LABEL,
  type AttendanceStatus,
  type SessionState,
} from "@/lib/attendance-report";

const STATUS_STYLES: Record<AttendanceStatus, { badge: string; dot: string }> = {
  present: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/70", dot: "bg-emerald-500" },
  late: { badge: "bg-amber-50 text-amber-700 ring-amber-200/70", dot: "bg-amber-500" },
  absent: { badge: "bg-rose-50 text-rose-600 ring-rose-200/70", dot: "bg-rose-400" },
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset", style.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const STATE_STYLES: Record<SessionState, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  closed: "bg-slate-100 text-slate-600 ring-slate-200/80",
  expired: "bg-amber-50 text-amber-700 ring-amber-200/70",
};

export function SessionStateBadge({ state }: { state: SessionState }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset", STATE_STYLES[state])}>
      {SESSION_STATE_LABEL[state]}
    </span>
  );
}
