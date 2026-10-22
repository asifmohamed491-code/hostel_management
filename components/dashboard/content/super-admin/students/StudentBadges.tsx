"use client";

// StudentBadges.tsx — small presentational pieces shared by the student
// table, the mobile cards and the details modal.
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/user-display";
import type { StudentStatus } from "@/lib/super-admin-students";

export function StudentAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[12px] font-semibold text-primary",
        className
      )}
    >
      {getInitials(name) || "S"}
    </span>
  );
}

// Account status only — deliberately separate from attendance.
export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
          : "bg-slate-100 text-slate-600 ring-slate-200/80"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-slate-400")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function UnallocatedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/70">
      Unallocated
    </span>
  );
}

/** Attendance % or "—" when there is no valid data (never an invented number). */
export function AttendanceValue({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <span className="text-heading/35" title="No attendance data available" aria-label="No attendance data">
        —
      </span>
    );
  }
  return <span className="font-semibold text-heading">{percent}%</span>;
}
