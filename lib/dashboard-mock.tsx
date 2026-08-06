// dashboard-mock.ts
//
// Placeholder UI data for the dashboard content area, mirroring the
// numbers/labels in the Figma file (node 136:31) as closely as
// possible. None of this touches auth, routing, or the backend/API
// layer — swap each export for a real data fetch whenever that's
// wired up; shapes are kept simple so the swap is a drop-in.
//
// Two small content fixes vs. the raw Figma export (layout/spacing/
// colors untouched, only copy):
// - The second "Present" mini-stat in the attendance card is relabeled
//   "Late" — the source file has two chips both labeled "Present"
//   with different numbers, which reads as a duplicate-label typo.
// - The recent check-ins / attendance table sub-labels that exactly
//   repeated the row's own name (e.g. "Aaliyah Khan" / "Sarah Jonn")
//   were swapped for a room number, since a name duplicated under
//   itself is almost certainly placeholder-fill, not intended content.

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  gradient: string;
  shadow?: string;
}

// Gradients copied 1:1 (angle + color stops) from the Figma node fills.
export const STAT_CARDS: StatCardData[] = [
  {
    id: "total-students",
    label: "Total Students",
    value: "628",
    gradient: "linear-gradient(109deg, #ffffff 6.68%, #ded7fe 76.17%)",
    shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
  },
  {
    id: "total-rooms",
    label: "Total Rooms",
    value: "83",
    gradient: "linear-gradient(127deg, #ffffff 11.34%, #ddddfd 96.61%)",
    shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
  },
  {
    id: "present-today",
    label: "Present Today",
    value: "140",
    gradient: "linear-gradient(-60deg, #d6eaec 9.06%, #ffffff 119.44%)",
  },
  {
    id: "absent-today",
    label: "Absent Today",
    value: "40",
    gradient: "linear-gradient(-60deg, #fdcad3 1.01%, #ffffff 96.89%)",
  },
  {
    id: "active-complaints",
    label: "Active Complaints",
    value: "0",
    gradient: "linear-gradient(-54deg, #f7d3de 4.39%, #ffffff 78.54%)",
    shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
  },
  {
    id: "room-occupancy",
    label: "Room Occupancy",
    value: "80%",
    gradient: "linear-gradient(135deg, #ffffff 19.69%, #999999 122.58%)",
    shadow: "0 4px 10px 0 rgba(120,90,200,0.06)",
  },
];

export interface TodayAttendanceMiniStat {
  label: string;
  value: string;
}

export const TODAY_ATTENDANCE = {
  present: 161,
  late: 9,
  absent: 0,
  attendancePct: 90,
  lastUpdated: "12:53 AM",
};

export const TODAY_ATTENDANCE_STATS: TodayAttendanceMiniStat[] = [
  { label: "Present", value: String(TODAY_ATTENDANCE.present) },
  { label: "Late", value: String(TODAY_ATTENDANCE.late) },
  { label: "Absent", value: String(TODAY_ATTENDANCE.absent) },
];

export interface WeeklyPoint {
  label: string;
  value: number;
}

// Shared across the ring / trend-line / bar charts so all three read
// consistently, same as the three chart cards in the Figma row.
export const WEEKLY_ATTENDANCE: WeeklyPoint[] = [
  { label: "Mon", value: 88 },
  { label: "Tue", value: 92 },
  { label: "Wed", value: 76 },
  { label: "Thu", value: 90 },
  { label: "Fri", value: 84 },
  { label: "Sat", value: 60 },
];

export const ATTENDANCE_RING_PCT = 90;

export interface CheckinItem {
  id: string;
  name: string;
  room: string;
  time: string;
  initials: string;
}

export const RECENT_CHECKINS: CheckinItem[] = [
  { id: "chk-1", name: "Aaliyah Khan", room: "Room 214", time: "1:33 PM", initials: "AK" },
  { id: "chk-2", name: "Benjamin Lee", room: "Room 118", time: "1:33 PM", initials: "BL" },
  { id: "chk-3", name: "Zoe Chen", room: "Room 305", time: "1:33 AM", initials: "ZC" },
];

export interface AttendanceRow {
  id: string;
  name: string;
  room: string;
  status: "Present" | "Late" | "Absent";
  date: string;
  lastUpdated: string;
  initials: string;
}

export const ATTENDANCE_TABLE: AttendanceRow[] = [
  {
    id: "row-1",
    name: "Priya Sharma",
    room: "Room 214",
    status: "Present",
    date: "Jan 12, 1:33 PM",
    lastUpdated: "Jan 12, 7:00 AM",
    initials: "PS",
  },
  {
    id: "row-2",
    name: "Rohan Mehta",
    room: "Room 118",
    status: "Late",
    date: "Jan 12, 1:33 PM",
    lastUpdated: "Jan 12, 7:00 AM",
    initials: "RM",
  },
];

export interface QuickActionItem {
  id: string;
  label: string[];
  icon: "qr" | "report" | "pdf" | "excel";
  size: "lg" | "sm";
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  { id: "qr", label: ["Generate", "Today's QR"], icon: "qr", size: "lg" },
  { id: "report", label: ["View", "Attendance", "Report"], icon: "report", size: "lg" },
  { id: "pdf", label: ["Export PDF"], icon: "pdf", size: "sm" },
  { id: "excel", label: ["Export Excel"], icon: "excel", size: "sm" },
];

export interface ProgressItem {
  id: string;
  label: string;
  caption: string;
  value: number;
  color: string;
}

export const PROGRESS: ProgressItem[] = [
  { id: "fees", label: "Fee Collection", caption: "₹18.6L of ₹22L collected", value: 84, color: "#6E42F5" },
  { id: "occupancy", label: "Room Occupancy", caption: "162 of 180 rooms filled", value: 90, color: "#8B5CF6" },
  { id: "attendance-goal", label: "Monthly Attendance Goal", caption: "94% of 95% target", value: 94, color: "#F0A420" },
];
