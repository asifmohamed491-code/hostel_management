// dashboard-nav.ts
// Central nav config for the dashboard Sidebar. Kept separate from the
// component so the same source of truth can drive active-state
// matching, icon lookup, and (later) route generation.
//
// Role-based navigation: the Sidebar renders one of ROLE_NAV_SECTIONS
// based on the authenticated user's role (super_admin / warden /
// student), keyed off the same `UserRole` type returned by
// /api/auth/me. This keeps a single Sidebar component and a single
// source of truth for nav items — no per-role Sidebar duplication.
import type { ComponentType, SVGProps } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Building2,
  DoorClosed,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  Bed,
  UtensilsCrossed,
  BookOpenCheck,
  Wrench,
  MessageSquareText,
  Settings as SettingsLucide,
} from "lucide-react";
import type { UserRole } from "@/models/User";
import {
  DashboardIcon,
  AttendanceIcon,
  RoomIcon,
  PeopleIcon,
  RulesIcon,
  FoodMenuIcon,
  FeedbackIcon,
  MaintenanceIcon,
  ReportIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/components/icons/DashboardIcons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: IconComponent;
  children?: NavChild[];
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

// Two sections match the reference design: "Attendance Management" and
// "Hostel Information". Dashboard sits above both, ungrouped; Logout
// sits below both, pinned to the bottom of the rail.
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: DashboardIcon }],
  },
  {
    label: "Attendance Management",
    items: [
      {
        label: "Student Attendance",
        href: "/dashboard/attendance",
        icon: AttendanceIcon,
      },
      {
        label: "Rooms",
        href: "/dashboard/rooms",
        icon: RoomIcon,
        children: [
          { label: "All Rooms", href: "/dashboard/rooms" },
          { label: "Allotment", href: "/dashboard/rooms/allotment" },
          { label: "Vacant Rooms", href: "/dashboard/rooms/vacant" },
        ],
      },
      {
        label: "Students",
        href: "/dashboard/students",
        icon: PeopleIcon,
        children: [
          { label: "All Students", href: "/dashboard/students" },
          { label: "Add Student", href: "/dashboard/students/new" },
          { label: "Gate Pass", href: "/dashboard/students/gate-pass" },
        ],
      },
    ],
  },
  {
    label: "Hostel Information",
    items: [
      {
        label: "Rules & Regulations",
        href: "/dashboard/rules",
        icon: RulesIcon,
      },
      { label: "Food Menu", href: "/dashboard/food-menu", icon: FoodMenuIcon },
      {
        label: "Food Feedback",
        href: "/dashboard/food-feedback",
        icon: FeedbackIcon,
      },
      {
        label: "Maintenance",
        href: "/dashboard/maintenance",
        icon: MaintenanceIcon,
        children: [
          { label: "Open Requests", href: "/dashboard/maintenance" },
          { label: "New Request", href: "/dashboard/maintenance/new" },
          { label: "History", href: "/dashboard/maintenance/history" },
        ],
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: ReportIcon,
        children: [
          { label: "Attendance Report", href: "/dashboard/reports/attendance" },
          { label: "Occupancy Report", href: "/dashboard/reports/occupancy" },
          { label: "Maintenance Report", href: "/dashboard/reports/maintenance" },
        ],
      },
      // "Users" has no dedicated icon in the uploaded asset pack — it
      // reuses the two-person PeopleIcon, same as "Students" above.
      { label: "User Management", href: "/dashboard/users", icon: PeopleIcon },
      { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
    ],
  },
];

export const LOGOUT_ITEM: NavItem = {
  label: "Logout",
  href: "/login",
  icon: LogoutIcon,
};

// ---------------------------------------------------------------------
// Super Admin — user & hostel management + reports. Routes live under
// /dashboard/super-admin/* to match the role-home prefix enforced by
// middleware.ts.
// ---------------------------------------------------------------------
const SUPER_ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard/super-admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        label: "Create Warden",
        href: "/dashboard/super-admin/wardens/create",
        icon: UserPlus,
      },
      {
        label: "Warden List",
        href: "/dashboard/super-admin/wardens",
        icon: Users,
      },
    ],
  },
  {
    label: "Hostel Management",
    items: [
      {
        label: "Hostel Blocks",
        href: "/dashboard/super-admin/hostel-blocks",
        icon: Building2,
      },
      {
        label: "Rooms",
        href: "/dashboard/super-admin/rooms",
        icon: DoorClosed,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        label: "Attendance Report",
        href: "/dashboard/super-admin/reports/attendance",
        icon: ClipboardList,
      },
      {
        label: "Student Report",
        href: "/dashboard/super-admin/reports/students",
        icon: GraduationCap,
      },
      {
        label: "Warden Report",
        href: "/dashboard/super-admin/reports/wardens",
        icon: ShieldCheck,
      },
    ],
  },
  {
    items: [
      {
        label: "Settings",
        href: "/dashboard/super-admin/settings",
        icon: SettingsLucide,
      },
    ],
  },
];

// ---------------------------------------------------------------------
// Student — hostel info + support requests. Routes live under
// /dashboard/student/* to match the role-home prefix enforced by
// middleware.ts.
// ---------------------------------------------------------------------
const STUDENT_NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard }],
  },
  {
    label: "Hostel",
    items: [
      { label: "My Room", href: "/dashboard/student/room", icon: Bed },
      {
        label: "Attendance",
        href: "/dashboard/student/attendance",
        icon: ClipboardList,
      },
      {
        label: "Food Menu",
        href: "/dashboard/student/food-menu",
        icon: UtensilsCrossed,
      },
      {
        label: "Rules & Regulations",
        href: "/dashboard/student/rules",
        icon: BookOpenCheck,
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        label: "Maintenance Request",
        href: "/dashboard/student/maintenance",
        icon: Wrench,
      },
      {
        label: "Food Feedback",
        href: "/dashboard/student/food-feedback",
        icon: MessageSquareText,
      },
    ],
  },
  {
    items: [
      {
        label: "Settings",
        href: "/dashboard/student/settings",
        icon: SettingsLucide,
      },
    ],
  },
];

/**
 * Single source of truth mapping each authenticated role to its nav
 * config. The Sidebar looks up the current user's role here instead of
 * branching per role inline — add a new role by adding a section array
 * and a map entry, no component changes required.
 */
export const ROLE_NAV_SECTIONS: Record<UserRole, NavSection[]> = {
  super_admin: SUPER_ADMIN_NAV_SECTIONS,
  warden: NAV_SECTIONS,
  student: STUDENT_NAV_SECTIONS,
};
