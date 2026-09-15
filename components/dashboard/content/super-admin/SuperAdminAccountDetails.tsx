// SuperAdminAccountDetails.tsx
"use client";

import {
  Mail,
  Phone,
  UserRound,
  ShieldCheck,
  IdCard,
  Settings2,
  Lock,
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

// The User model (models/User.ts) has no admin-ID, department, or
// access-level field for Super Admin accounts today, so these stay
// "Not available" rather than fabricating data — the same fallback the
// Student page already uses for fields the schema doesn't carry.
const ADMIN_ID = NOT_AVAILABLE;
const ACCESS_LEVEL = NOT_AVAILABLE;

export function SuperAdminAccountDetails() {
  const { user, loading } = useCurrentUser();

  const fullName =
    user?.fullName?.trim() || (loading ? "Loading..." : "Super Admin");
  const roleLabel = user ? ROLE_LABELS[user.role] : ROLE_LABELS.super_admin;
  const initials = user ? getInitials(user.fullName) : "";

  const email = user?.email || NOT_AVAILABLE;
  const phone = user?.phone?.trim() || NOT_AVAILABLE;
  const department = user?.department?.trim() || NOT_AVAILABLE;

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      <AccountDetailsPageHeader dashboardHref="/dashboard/super-admin" />

      <ProfileSummaryCard
        initials={initials}
        fullName={fullName}
        roleLabel={roleLabel}
        fields={[
          { icon: IdCard, label: "Admin ID", value: ADMIN_ID },
          { icon: Mail, label: "Email", value: email },
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
          <InfoRow icon={Mail} label="Email" value={email} />
          <InfoRow icon={Phone} label="Phone Number" value={phone} />
        </DashboardCard>

        {/* Administrative Information */}
        <DashboardCard
          title="Administrative Information"
          subtitle="Your admin role details"
          icon={<ShieldCheck className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--mist"
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow icon={IdCard} label="Admin ID" value={ADMIN_ID} />
          <InfoRow icon={ShieldCheck} label="Role" value={roleLabel} />
          <InfoRow icon={UserRound} label="Department" value={department} />
        </DashboardCard>

        {/* System / Admin Information */}
        <DashboardCard
          title="System Information"
          subtitle="Your system access level"
          icon={<Settings2 className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--lilac flex flex-col"
          bodyClassName={CARD_BODY_CLASS}
        >
          <InfoRow icon={Lock} label="Access Level" value={ACCESS_LEVEL} />
        </DashboardCard>

        {/* Account Security (Matched Full Height with System Info) */}
        <AccountSecurityCard icon={<ShieldCheck className="h-[18px] w-[18px]" />} />
      </div>
    </div>
  );
}
