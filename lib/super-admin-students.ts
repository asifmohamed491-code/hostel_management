// lib/super-admin-students.ts
//
// Shared (client + server) types and PURE helpers for the Super Admin
// "View Student Report" page. All student data comes from MongoDB through
// GET /api/super-admin/students (see app/api/super-admin/students/route.ts);
// this file contains no data, only the response shape and small helpers.
//
// Account status: the User schema has no deactivation field and the rest of
// the app treats every student account as active (e.g. the dashboard's
// "registered active students" is simply the student count). The API
// therefore reports "active" for every student, and "inactive" only if a
// future `isActive: false` flag exists. The Inactive filter is kept in the UI
// so nothing has to be redesigned when such a field is added.

export type StudentStatus = "active" | "inactive";
export type AllocationFilter = "all" | "allocated" | "unallocated";
export type StatusFilter = "all" | StudentStatus;

export interface StudentAttendance {
  present: number;
  absent: number;
  late: number;
}

export interface StudentRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  registerNumber: string | null;
  department: string | null;
  year: string | null;
  hostelBlock: string | null;
  roomNumber: string | null;
  /** null = no attendance data at all (different from 0% attendance). */
  attendance: StudentAttendance | null;
  status: StudentStatus;
  createdAt: string | null;
}

export interface StudentsSummary {
  total: number;
  allocated: number;
  unallocated: number;
  active: number;
}

export interface StudentFilterOptions {
  departments: string[];
  years: string[];
  blocks: string[];
}

export interface StudentsResponse {
  students: StudentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: StudentsSummary;
  filterOptions: StudentFilterOptions;
}

export interface StudentFilters {
  query: string;
  department: string; // "all" or a department name
  year: string; // "all" or a year label
  block: string; // "all" or a block name
  allocation: AllocationFilter;
  status: StatusFilter;
}

export const DEFAULT_FILTERS: StudentFilters = {
  query: "",
  department: "all",
  year: "all",
  block: "all",
  allocation: "all",
  status: "all",
};

export const ALLOCATION_OPTIONS: { value: AllocationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "allocated", label: "Allocated" },
  { value: "unallocated", label: "Unallocated" },
];

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const EMPTY_SUMMARY: StudentsSummary = { total: 0, allocated: 0, unallocated: 0, active: 0 };

export function isAllocated(student: Pick<StudentRow, "roomNumber">): boolean {
  return Boolean(student.roomNumber && student.roomNumber.trim());
}

/**
 * Attendance % or null when there is no valid data. Same rule as the
 * student's own attendance history (/api/attendance/history): present and
 * late both count as attended; percentage = attended / (attended + absent).
 * 0% (data exists, nothing attended) is NOT the same as null.
 */
export function getAttendancePercent(attendance: StudentAttendance | null): number | null {
  if (!attendance) return null;
  const total = attendance.present + attendance.late + attendance.absent;
  if (!Number.isFinite(total) || total <= 0) return null;
  return Math.round(((attendance.present + attendance.late) / total) * 100);
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function filtersAreActive(filters: StudentFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.department !== "all" ||
    filters.year !== "all" ||
    filters.block !== "all" ||
    filters.allocation !== "all" ||
    filters.status !== "all"
  );
}
