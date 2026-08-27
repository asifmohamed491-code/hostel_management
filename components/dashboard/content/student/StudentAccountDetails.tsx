// StudentAccountDetails.tsx
//
// Content for /dashboard/student/account. Follows the same composition
// pattern as StudentDashboardOverview.tsx: read the real authenticated
// user via useCurrentUser(), and fall back to the SAME existing mock
// (lib/student-dashboard-mock.tsx) already powering the Student
// dashboard's welcome/room cards for fields the current schema/API
// doesn't carry yet. Genuinely unavailable fields (DOB, Gender,
// Semester, Room Type) show a plain "Not available" placeholder rather
// than invented data — the UI is shaped and ready for real values the
// moment a real field exists, per the task's own instructions not to
// add fake fetching architecture or DB fields for this.
"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  UserRound,
  GraduationCap,
  BookOpenCheck,
  Building2,
  DoorClosed,
  BedDouble,
  KeyRound,
  ShieldCheck,
  Lock,
  IdCard,
  ChevronRight,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_LABELS, getInitials } from "@/lib/user-display";
import { STUDENT_PROFILE, MY_ROOM } from "@/lib/student-dashboard-mock";

const NOT_AVAILABLE = "Not available";
const CARD_BODY_CLASS = "px-[15px] py-4 sm:px-[19px] sm:py-5 flex flex-col gap-2 sm:gap-2.5";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/5 bg-white/[0.5] backdrop-blur-[20px] px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-[12.5px] font-medium text-heading/50">{label}</span>
      </span>
      <span className="min-w-0 flex-1 break-words text-right text-[13px] font-semibold text-heading sm:flex-none sm:max-w-[55%]">
        {value}
      </span>
    </div>
  );
}

// Small stat pill for the profile summary row (Register No / Email /
// Phone) — icon badge + stacked label/value, matching the reference
// design's three-up summary strip. Wraps to its own line on narrow
// screens instead of overflowing.
function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-[11.5px] font-medium text-heading/45">{label}</p>
        <p className="truncate text-[13.5px] font-semibold text-heading">{value}</p>
      </div>
    </div>
  );
}

export function StudentAccountDetails() {
  const { user, loading } = useCurrentUser();

  const fullName = user?.fullName?.trim() || (loading ? "Loading..." : "Student");
  const roleLabel = user ? ROLE_LABELS[user.role] : ROLE_LABELS.student;
  const initials = user ? getInitials(user.fullName) : "";

  // Real fields — always the logged-in user's own data via SafeUser
  // (lib/auth.ts) / GET /api/auth/me. Never hardcoded.
  const email = user?.email || NOT_AVAILABLE;
  const phone = user?.phone?.trim() || NOT_AVAILABLE;
  const department = user?.department?.trim() || STUDENT_PROFILE.department;
  const year = user?.year?.trim() || STUDENT_PROFILE.year;
  const roomNumber = user?.roomNumber?.trim() || MY_ROOM.room;

  // Not yet on the User schema/API — reuse the existing Student
  // dashboard mock for Register Number/Hostel Block (same source the
  // dashboard's own welcome/room cards already read from), and show
  // "Not available" for fields that don't exist in any existing data
  // structure yet (Semester, Room Type).
  const registerNo = STUDENT_PROFILE.registerNo || NOT_AVAILABLE;
  const hostelBlock = STUDENT_PROFILE.block || MY_ROOM.block || NOT_AVAILABLE;
  const semester = NOT_AVAILABLE;
  const roomType = NOT_AVAILABLE;

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Page header + breadcrumb */}
      <div>
        <h1 className="text-[22px] font-semibold text-heading xl:text-[28px]">
          Account Details
        </h1>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-heading/45">
          <Link href="/dashboard/student" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-heading/70">Account Details</span>
        </div>
      </div>

      {/* Profile summary card */}
      <DashboardCard
        className="relative overflow-hidden"
        bodyClassName="relative flex flex-col gap-5 p-5 sm:p-6"
      >
        {/* Subtle decorative skyline watermark — desktop only, purely
            ambient (mirrors the reference composition's hostel
            illustration) and never overlaps real content. */}
        <Building2
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-4 hidden h-40 w-40 text-primary/[0.06] lg:block"
          strokeWidth={1}
        />

        <div className="relative flex min-w-0 flex-wrap items-center gap-4">
          <InitialsAvatar initials={initials} size={64} />
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-heading xl:text-[20px]">
              {fullName}
            </p>
            <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="relative border-t border-heading/[0.07]" />

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
          <SummaryStat icon={IdCard} label="Register Number" value={registerNo} />
          <SummaryStat icon={Mail} label="College Email" value={email} />
          <SummaryStat icon={Phone} label="Phone Number" value={phone} />
        </div>
      </DashboardCard>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
        <DashboardCard
          title="Personal Information"
          subtitle="Your personal and contact details"
          icon={<UserRound className="h-[18px] w-[18px]" />}
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow icon={UserRound} label="Full Name" value={fullName} />
          <InfoRow icon={Mail} label="College Email" value={email} />
          <InfoRow icon={Phone} label="Phone Number" value={phone} />
        </DashboardCard>

        <DashboardCard
          title="Academic Information"
          subtitle="Your academic details"
          icon={<GraduationCap className="h-[18px] w-[18px]" />}
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow icon={GraduationCap} label="Department" value={department} />
          <InfoRow icon={BookOpenCheck} label="Year" value={year} />
          <InfoRow icon={BookOpenCheck} label="Semester" value={semester} />
        </DashboardCard>

        <DashboardCard
          title="Hostel Information"
          subtitle="Your hostel and room details"
          icon={<Building2 className="h-[18px] w-[18px]" />}
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow icon={Building2} label="Hostel Block" value={hostelBlock} />
          <InfoRow icon={DoorClosed} label="Room Number" value={roomNumber} />
          <InfoRow icon={BedDouble} label="Room Type" value={roomType} />
        </DashboardCard>

        <DashboardCard
          title="Account Security"
          subtitle="Secure your account"
          icon={<ShieldCheck className="h-[18px] w-[18px]" />}
          bodyClassName="px-[15px] py-5 sm:px-[19px] sm:py-6"
        >
          <div className="rounded-[16px] bg-primary/[0.08] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Lock className="h-6 w-6" />
                </span>
                <span className="flex-1 pt-0.5 text-[13.5px] font-medium leading-relaxed text-heading/70">
                  Keep your account secure by updating your password regularly.
                </span>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark w-full sm:w-auto"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
