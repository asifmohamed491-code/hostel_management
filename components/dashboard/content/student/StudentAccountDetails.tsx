// StudentAccountDetails.tsx
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
  IdCard,
  ChevronRight,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_LABELS, getInitials } from "@/lib/user-display";
import { STUDENT_PROFILE, MY_ROOM } from "@/lib/student-dashboard-mock";

const NOT_AVAILABLE = "Not available";
const CARD_BODY_CLASS =
  "px-[15px] py-4 sm:px-[19px] sm:py-5 flex flex-col gap-2 sm:gap-2.5";

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
  // Non-interactive info field, styled to match the existing Quick
  // Actions card treatment (sa-student-action-btn + the same
  // border/background combo used by QuickActionsPanel's ActionCell)
  // instead of a bespoke background.
  return (
    <div className="sa-student-action-btn flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-3 backdrop-blur-md sm:px-4 sm:py-3.5">
      <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-9 sm:w-9">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
        <span className="truncate text-[12.5px] font-medium text-heading/50">
          {label}
        </span>
      </span>
      <span className="min-w-0 flex-1 break-words text-right text-[13px] font-semibold text-heading sm:flex-none sm:max-w-[55%]">
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

  // Real fields
  const email = user?.email || NOT_AVAILABLE;
  const phone = user?.phone?.trim() || NOT_AVAILABLE;
  const department = user?.department?.trim() || STUDENT_PROFILE.department;
  const year = user?.year?.trim() || STUDENT_PROFILE.year;
  const roomNumber = user?.roomNumber?.trim() || MY_ROOM.room;

  // Mock placeholders
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
          <Link
            href="/dashboard/student"
            className="transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-heading/70">Account Details</span>
        </div>
      </div>

      {/* Profile summary card */}
      <DashboardCard
        className="sa-dashboard-card sa-dashboard-card--pearl relative overflow-hidden"
        bodyClassName="relative flex flex-col gap-5 p-5 sm:p-6"
      >


        {/* Top Header: Avatar (64px) + Name */}
        <div className="relative flex min-w-0 items-center gap-4">
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

        {/* Both 1px line & bottom row aligned together directly starting from the same left position */}
        <div className="flex flex-col gap-5 sm:pl-[80px]">
          {/* 1px Line starting exactly aligned with Name and fields */}
          <div className="border-t border-heading/[0.07] w-full" />

          {/* 3 Fields Starting at the same line */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-10 w-fit">
            {/* Register Number */}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <IdCard className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-heading/50">
                  Register Number
                </p>
                <p className="truncate text-[13px] font-semibold text-heading">
                  {registerNo}
                </p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-9 w-[1px] bg-heading/[0.08] sm:block" />

            {/* College Email */}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-heading/50">
                  College Email
                </p>
                <p className="truncate text-[13px] font-semibold text-heading">
                  {email}
                </p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-9 w-[1px] bg-heading/[0.08] sm:block" />

            {/* Phone Number */}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-heading/50">
                  Phone Number
                </p>
                <p className="truncate text-[13px] font-semibold text-heading">
                  {phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
        <DashboardCard
          title="Personal Information"
          subtitle="Your personal and contact details"
          icon={<UserRound className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--violet"
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
          className="sa-dashboard-card sa-dashboard-card--mist"
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow
            icon={GraduationCap}
            label="Department"
            value={department}
          />
          <InfoRow icon={BookOpenCheck} label="Year" value={year} />
          <InfoRow icon={BookOpenCheck} label="Semester" value={semester} />
        </DashboardCard>

        <DashboardCard
          title="Hostel Information"
          subtitle="Your hostel and room details"
          icon={<Building2 className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--lilac"
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow
            icon={Building2}
            label="Hostel Block"
            value={hostelBlock}
          />
          <InfoRow
            icon={DoorClosed}
            label="Room Number"
            value={roomNumber}
          />
          <InfoRow icon={BedDouble} label="Room Type" value={roomType} />
        </DashboardCard>

        <DashboardCard
          title="Account Security"
          subtitle="Secure your account"
          icon={<ShieldCheck className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--lilac"
          bodyClassName={CARD_BODY_CLASS}
        >
          {/* Change Password — same /forgot-password link and behavior as
              before, restyled to match the existing Quick Actions
              button/card treatment (ActionCell in QuickActionsPanel.tsx). */}
          <Link
            href="/forgot-password"
            className={
              "group relative flex w-full items-center gap-3 sm:gap-3.5 rounded-2xl " +
              "sa-student-action-btn border border-slate-200/80 bg-white/80 p-3.5 sm:p-4 backdrop-blur-md " +
              "shadow-xs transition-all duration-300 ease-out " +
              "hover:-translate-y-1 hover:border-primary/40 hover:bg-white " +
              "hover:shadow-lg hover:shadow-primary/10 " +
              "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            }
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/30 sm:h-10 sm:w-10">
              <KeyRound className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
            </span>

            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold text-heading transition-colors duration-200 group-hover:text-slate-900">
                Change Password
              </span>
              <span className="block truncate text-[12px] font-medium text-heading/50">
                Update your password regularly
              </span>
            </span>

            <ChevronRight className="relative h-4 w-4 shrink-0 text-heading/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </DashboardCard>
      </div>
    </div>
  );
}