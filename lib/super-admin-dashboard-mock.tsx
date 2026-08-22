// super-admin-dashboard-mock.ts
//
// Placeholder UI data for the Super Admin dashboard content area,
// mirroring the numbers/labels in the uploaded reference screenshot.
// Kept separate from lib/dashboard-mock.tsx (the Warden dashboard's
// data) since the two dashboards show entirely different metrics —
// same pattern as student-dashboard-mock.tsx.
//
// Per the Super Admin dashboard task: the project doesn't currently
// expose API/DB-backed statistics for these cards (only /api/students
// and /api/wardens exist, and this dashboard's scope is UI only), so
// the reference screenshot's values are used as static display data,
// the same way the Warden dashboard's cards use dashboard-mock.tsx.

export type StatCardIcon =
  | "students"
  | "wardens"
  | "blocks"
  | "rooms"
  | "occupancy"
  | "activeUsers";

export interface SuperAdminStatCard {
  id: string;
  label: string;
  value: string;
  caption: string;
  icon: StatCardIcon;
  /** Only "room-occupancy" renders a progress bar instead of a caption line. */
  progressPct?: number;
}

export const SUPER_ADMIN_STAT_CARDS: SuperAdminStatCard[] = [
  {
    id: "total-students",
    label: "Total Students",
    value: "628",
    caption: "+12 this month",
    icon: "students",
  },
  {
    id: "total-wardens",
    label: "Total Wardens",
    value: "12",
    caption: "Active wardens",
    icon: "wardens",
  },
  {
    id: "total-hostel-blocks",
    label: "Total Hostel Blocks",
    value: "4",
    caption: "All blocks active",
    icon: "blocks",
  },
  {
    id: "total-rooms",
    label: "Total Rooms",
    value: "83",
    caption: "78 occupied",
    icon: "rooms",
  },
  {
    id: "room-occupancy",
    label: "Room Occupancy",
    value: "80%",
    caption: "",
    icon: "occupancy",
    progressPct: 80,
  },
  {
    id: "active-users",
    label: "Active Users",
    value: "642",
    caption: "current online count",
    icon: "activeUsers",
  },
];

export const STUDENT_OVERVIEW = {
  total: 628,
  active: 612,
  inactive: 16,
};

export const HOSTEL_OCCUPANCY = {
  occupancyPct: 80,
  totalRooms: 83,
  occupied: 67,
  available: 16,
};

export interface HostelBlockRow {
  id: string;
  name: string;
  pct: number;
  rooms: number;
  /** Some blocks show "Available", others (fully booked) show "Occupied" — matches the reference. */
  secondaryLabel: "Available" | "Occupied";
  secondaryValue: number;
}

export const HOSTEL_BLOCKS: HostelBlockRow[] = [
  { id: "block-a", name: "Block A", pct: 87, rooms: 83, secondaryLabel: "Available", secondaryValue: 16 },
  { id: "block-b", name: "Block B", pct: 80, rooms: 67, secondaryLabel: "Occupied", secondaryValue: 67 },
  { id: "block-c", name: "Block C", pct: 81, rooms: 16, secondaryLabel: "Available", secondaryValue: 16 },
  { id: "block-d", name: "Block D", pct: 72, rooms: 13, secondaryLabel: "Available", secondaryValue: 16 },
];

export interface WardenOverviewRow {
  id: string;
  name: string;
  block: string;
  status: "Active" | "Inactive";
}

export const WARDEN_OVERVIEW = {
  total: 12,
  active: 10,
  inactive: 2,
  recent: [
    { id: "w-1", name: "Test Warden", block: "Block A", status: "Active" },
    { id: "w-2", name: "Another Warden", block: "Block B", status: "Active" },
  ] as WardenOverviewRow[],
};

export interface AttendanceAnalyticsPoint {
  label: string;
  present: number;
  late: number;
  absent: number;
}

export const ATTENDANCE_ANALYTICS: AttendanceAnalyticsPoint[] = [
  { label: "Mon", present: 78, late: 14, absent: 8 },
  { label: "Tue", present: 85, late: 9, absent: 6 },
  { label: "Wed", present: 70, late: 20, absent: 10 },
  { label: "Thu", present: 82, late: 12, absent: 6 },
  { label: "Fri", present: 92, late: 6, absent: 4 },
  { label: "Sat", present: 96, late: 3, absent: 3 },
  { label: "Sun", present: 58, late: 16, absent: 24 },
];

export const ATTENDANCE_LEGEND: { key: "present" | "late" | "absent"; label: string; color: string }[] = [
  { key: "present", label: "Present", color: "#6E42F5" },
  { key: "late", label: "Late", color: "#C4B5FD" },
  { key: "absent", label: "Absent", color: "#F97373" },
];

export type SystemActivityIcon = "warden" | "student" | "room" | "block" | "report";

export interface SystemActivityItem {
  id: string;
  text: string;
  time: string;
  icon: SystemActivityIcon;
}

export const RECENT_SYSTEM_ACTIVITY: SystemActivityItem[] = [
  { id: "act-1", text: "Warden account created", time: "5 min ago", icon: "warden" },
  { id: "act-2", text: "New student registered", time: "18 min ago", icon: "student" },
  { id: "act-3", text: "Room allocation updated", time: "32 min ago", icon: "room" },
  { id: "act-4", text: "Hostel Block A updated", time: "1 hr ago", icon: "block" },
  { id: "act-5", text: "Attendance report generated", time: "2 hr ago", icon: "report" },
];

export type QuickActionIcon =
  | "createWarden"
  | "manageWardens"
  | "manageBlocks"
  | "studentReport"
  | "attendance"
  | "generateReport";

export interface SuperAdminQuickAction {
  id: string;
  label: string;
  href: string;
  icon: QuickActionIcon;
}

// Routed to the existing Super Admin nav destinations (lib/dashboard-nav.ts)
// so every action is a real, working link — no dead buttons.
export const SUPER_ADMIN_QUICK_ACTIONS: SuperAdminQuickAction[] = [
  { id: "create-warden", label: "Create Warden", href: "/dashboard/super-admin/wardens/create", icon: "createWarden" },
  { id: "manage-wardens", label: "Manage Wardens", href: "/dashboard/super-admin/wardens", icon: "manageWardens" },
  { id: "manage-blocks", label: "Manage Hostel Blocks", href: "/dashboard/super-admin/hostel-blocks", icon: "manageBlocks" },
  { id: "student-report", label: "View Student Report", href: "/dashboard/super-admin/reports/students", icon: "studentReport" },
  { id: "view-attendance", label: "View Attendance", href: "/dashboard/super-admin/reports/attendance", icon: "attendance" },
  { id: "generate-report", label: "Generate Report", href: "/dashboard/super-admin/reports/wardens", icon: "generateReport" },
];

export interface SystemStatusItem {
  id: string;
  label: string;
  status: string;
  dot: "blue" | "green" | "amber";
}

export const SYSTEM_STATUS: SystemStatusItem[] = [
  { id: "database", label: "Database", status: "Connected", dot: "blue" },
  { id: "authentication", label: "Authentication", status: "Operational", dot: "green" },
  { id: "email-smtp", label: "Email/SMTP", status: "Operational", dot: "amber" },
  { id: "api", label: "API", status: "Operational", dot: "amber" },
];

export const SYSTEM_STATUS_SUMMARY = "All Systems Operational";
