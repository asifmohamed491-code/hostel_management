// WardenAccountDetails.tsx
"use client";

import {
  Mail,
  Phone,
  UserRound,
  Briefcase,
  IdCard,
  Building2,
  ShieldCheck,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_LABELS, getInitials } from "@/lib/user-display";
import {
  AccountDetailsPageHeader,
  AccountSecurityCard,
  CARD_BODY_CLASS,
  InfoRow,
  NOT_AVAILABLE,
  ProfileSummaryCard,
} from "@/components/dashboard/content/account/AccountDetailsShared";

// The User model (models/User.ts) has no staff-ID or hostel-block
// field for wardens today, so those stay "Not available" rather than
// fabricating data — the same fallback the Student page already uses
// for fields (e.g. Semester, Room Type) the schema doesn't carry.
const STAFF_ID = NOT_AVAILABLE;
const ASSIGNED_HOSTEL_BLOCK = NOT_AVAILABLE;

export function WardenAccountDetails() {
  const { user, loading } = useCurrentUser();

  const fullName = user?.fullName?.trim() || (loading ? "Loading..." : "Warden");
  const roleLabel = user ? ROLE_LABELS[user.role] : ROLE_LABELS.warden;
  const initials = user ? getInitials(user.fullName) : "";

  const email = user?.email || NOT_AVAILABLE;
  const phone = user?.phone?.trim() || NOT_AVAILABLE;
  const department = user?.department?.trim() || NOT_AVAILABLE;

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      <AccountDetailsPageHeader dashboardHref="/dashboard/warden" />

      <ProfileSummaryCard
        initials={initials}
        fullName={fullName}
        roleLabel={roleLabel}
        fields={[
          { icon: IdCard, label: "Staff ID", value: STAFF_ID },
          { icon: Mail, label: "College Email", value: email },
          { icon: Phone, label: "Phone Number", value: phone },
        ]}
      />

      {/* Info cards (2-column Grid) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
        {/* Personal Information */}
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

        {/* Professional / Academic Information */}
        <DashboardCard
          title="Professional Information"
          subtitle="Your role and department details"
          icon={<Briefcase className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--mist"
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow icon={IdCard} label="Staff ID" value={STAFF_ID} />
          <InfoRow icon={Building2} label="Department" value={department} />
          <InfoRow icon={Briefcase} label="Designation" value={roleLabel} />
        </DashboardCard>

        {/* Hostel Information */}
        <DashboardCard
          title="Hostel Information"
          subtitle="Your assigned hostel block"
          icon={<Building2 className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--lilac flex flex-col"
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow
            icon={Building2}
            label="Assigned Hostel Block"
            value={ASSIGNED_HOSTEL_BLOCK}
          />
        </DashboardCard>

        {/* Account Security (Matched Full Height with Hostel Info) */}
        <AccountSecurityCard icon={<ShieldCheck className="h-[18px] w-[18px]" />} />
      </div>
    </div>
  );
}
