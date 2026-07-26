// dashboard-nav.ts
// Central nav config for the dashboard Sidebar. Kept separate from the
// component so the same source of truth can drive active-state
// matching, icon lookup, and (later) route generation.
import type { ComponentType, SVGProps } from "react";
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
      { label: "Users", href: "/dashboard/users", icon: PeopleIcon },
      { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
    ],
  },
];

export const LOGOUT_ITEM: NavItem = {
  label: "Logout",
  href: "/login",
  icon: LogoutIcon,
};
