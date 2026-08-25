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
  Hash,
  Calendar,
  UserRound,
  GraduationCap,
  BookOpenCheck,
  Building2,
  DoorClosed,
  BedDouble,
  KeyRound,
  ChevronRight,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_LABELS, getInitials } from "@/lib/user-display";
import { STUDENT_PROFILE, MY_ROOM } from "@/lib/student-dashboard-mock";

const NOT_AVAILABLE = "Not available";
const CARD_BODY_CLASS = "divide-y divide-heading/[0.06] px-[19px] pb-[19px] pt-3";

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
    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 py-2.5">
      <span className="flex shrink-0 items-center gap-2 text-[12.5px] font-medium text-heading/50">
        <Icon className="h-4 w-4 shrink-0 text-heading/35" />
        {label}
      </span>
      <span className="min-w-0 flex-1 break-words text-right text-[13px] font-semibold text-heading sm:flex-none sm:max-w-[60%]">
        {value}
      </span>
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
  // structure yet (DOB, Gender, Semester, Room Type).
  const registerNo = STUDENT_PROFILE.registerNo || NOT_AVAILABLE;
  const hostelBlock = STUDENT_PROFILE.block || MY_ROOM.block || NOT_AVAILABLE;
  const dob = NOT_AVAILABLE;
  const gender = NOT_AVAILABLE;
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

      {/* Profile header card */}
      <DashboardCard bodyClassName="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between xl:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <InitialsAvatar initials={initials} size={64} />
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-heading xl:text-[20px]">
              {fullName}
            </p>
            <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <span className="flex items-center gap-2 text-[13px] font-medium text-heading/70">
            <Hash className="h-3.5 w-3.5 shrink-0 text-heading/35" />
            {registerNo}
          </span>
          <span className="flex items-center gap-2 break-all text-[13px] font-medium text-heading/70">
            <Mail className="h-3.5 w-3.5 shrink-0 text-heading/35" />
            {email}
          </span>
          <span className="flex items-center gap-2 text-[13px] font-medium text-heading/70">
            <Phone className="h-3.5 w-3.5 shrink-0 text-heading/35" />
            {phone}
          </span>
        </div>
      </DashboardCard>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
        <DashboardCard title="Personal Information" bodyClassName={CARD_BODY_CLASS}>
          <InfoRow icon={UserRound} label="Full Name" value={fullName} />
          <InfoRow icon={Hash} label="Register Number" value={registerNo} />
          <InfoRow icon={Calendar} label="Date of Birth" value={dob} />
          <InfoRow icon={UserRound} label="Gender" value={gender} />
          <InfoRow icon={Mail} label="College Email" value={email} />
          <InfoRow icon={Phone} label="Phone Number" value={phone} />
        </DashboardCard>

        <DashboardCard title="Academic Information" bodyClassName={CARD_BODY_CLASS}>
          <InfoRow icon={GraduationCap} label="Department" value={department} />
          <InfoRow icon={BookOpenCheck} label="Year" value={year} />
          <InfoRow icon={BookOpenCheck} label="Semester" value={semester} />
        </DashboardCard>

        <DashboardCard title="Hostel Information" bodyClassName={CARD_BODY_CLASS}>
          <InfoRow icon={Building2} label="Hostel Block" value={hostelBlock} />
          <InfoRow icon={DoorClosed} label="Room Number" value={roomNumber} />
          <InfoRow icon={BedDouble} label="Room Type" value={roomType} />
        </DashboardCard>

        <DashboardCard
          title="Account Security"
          bodyClassName="flex flex-col gap-3 px-[19px] pb-[19px] pt-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-heading/55">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-heading/35" />
            Keep your account secure by updating your password regularly. Your
            password is never shown here.
          </span>
          <Link
            href="/forgot-password"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Change Password
          </Link>
        </DashboardCard>
      </div>
    </div>
  );
}
