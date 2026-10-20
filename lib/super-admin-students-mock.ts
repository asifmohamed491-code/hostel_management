// lib/super-admin-students-mock.ts
//
// ╔══════════════════════════════════════════════════════════════════════╗
// ║  TEMPORARY MOCK DATA — UI PHASE ONLY. NOTHING HERE COMES FROM MONGODB ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// Sample students for the Super Admin "View Students" page. Everything is
// generated deterministically (no randomness) so server and client render
// identically. The page (SuperAdminStudents.tsx) only touches this file
// through `MOCK_STUDENTS`, `filterStudents`, `summarizeStudents`,
// `getFilterOptions` and the small helpers below — replace `MOCK_STUDENTS`
// with an API response of the same `StudentRow` shape and the UI keeps
// working unchanged. Delete this file when the backend is connected.
//
// MAPPING TO THE REAL DATA (backend phase)
// ┌──────────────────────┬──────────────────────────────────────────────┐
// │ StudentRow field     │ Real source                                  │
// ├──────────────────────┼──────────────────────────────────────────────┤
// │ id                   │ User._id                                     │
// │ fullName / email /   │ User.fullName / email / phone                │
// │ phone                │                                              │
// │ registerNumber       │ User.registerNumber                          │
// │ department / year    │ User.department / year                       │
// │ hostelBlock          │ User.hostelBlock                             │
// │ roomNumber           │ User.roomNumber (null/"" = Unallocated)      │
// │ createdAt            │ User.createdAt                               │
// │ attendance           │ NOT on User. Count AttendanceRecord.status   │
// │                      │ (present | late | absent) per student; send  │
// │                      │ null when the student has no records.        │
// │ status               │ NOT in the User schema. An account status    │
// │                      │ field (e.g. isActive) must be added in the   │
// │                      │ backend phase; mock only until then.         │
// │ Floor                │ Not in the Room/User models -> not shown.    │
// └──────────────────────┴──────────────────────────────────────────────┘

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
  registerNumber: string;
  department: string;
  year: string;
  hostelBlock: string | null;
  roomNumber: string | null;
  /** null = no attendance data at all (different from 0% attendance). */
  attendance: StudentAttendance | null;
  status: StudentStatus;
  createdAt: string | null;
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

// ------------------------------------------------------------ helpers

export function isAllocated(student: Pick<StudentRow, "roomNumber">): boolean {
  return Boolean(student.roomNumber && student.roomNumber.trim());
}

/**
 * Attendance % or null when there is no valid data. Assumption for this UI
 * phase: (present + late) / (present + late + absent) — "late" still means
 * the student attended. Align with the existing attendance stats in the
 * backend phase. 0% (data exists, nobody present) is NOT the same as null.
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

export function filterStudents(students: StudentRow[], filters: StudentFilters): StudentRow[] {
  const needle = filters.query.trim().toLowerCase();
  return students.filter((s) => {
    if (needle) {
      const haystack = `${s.fullName} ${s.registerNumber} ${s.email}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filters.department !== "all" && s.department !== filters.department) return false;
    if (filters.year !== "all" && s.year !== filters.year) return false;
    if (filters.block !== "all" && s.hostelBlock !== filters.block) return false;
    if (filters.allocation === "allocated" && !isAllocated(s)) return false;
    if (filters.allocation === "unallocated" && isAllocated(s)) return false;
    if (filters.status !== "all" && s.status !== filters.status) return false;
    return true;
  });
}

export function summarizeStudents(students: StudentRow[]) {
  const allocated = students.filter(isAllocated).length;
  return {
    total: students.length,
    allocated,
    unallocated: students.length - allocated,
    active: students.filter((s) => s.status === "active").length,
  };
}

export function getFilterOptions(students: StudentRow[]) {
  const unique = (values: (string | null)[]) =>
    Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
  return {
    departments: unique(students.map((s) => s.department)),
    years: unique(students.map((s) => s.year)),
    blocks: unique(students.map((s) => s.hostelBlock)),
  };
}

// ---------------------------------------------------------- mock data

const DEPT_CODE: Record<string, string> = {
  "Computer Science": "CS",
  "Information Technology": "IT",
  Electronics: "EC",
  Mechanical: "ME",
  Civil: "CE",
  Electrical: "EE",
};
const YEAR_PREFIX: Record<string, string> = { "1st Year": "25", "2nd Year": "24", "3rd Year": "23", "4th Year": "22" };

// [name, department, year, block, room, [present, absent, late] | null, status, created]
type Seed = [string, string, string, string | null, string | null, [number, number, number] | null, StudentStatus, string];

const SEEDS: Seed[] = [
  ["Aarav Sharma", "Computer Science", "2nd Year", "Block A", "A-101", [42, 3, 2], "active", "2024-07-15"],
  ["Karthik Raman", "Electronics", "3rd Year", "Block A", "A-101", [38, 6, 1], "active", "2023-07-18"],
  ["Vikram Nair", "Mechanical", "1st Year", "Block A", "A-102", [30, 10, 0], "active", "2025-07-10"],
  ["Sanjay Kumar", "Civil", "4th Year", "Block A", "A-102", [45, 1, 1], "active", "2022-07-20"],
  ["Rohan Mehta", "Computer Science", "2nd Year", "Block A", "A-102", [20, 25, 3], "inactive", "2024-07-15"],
  ["Arjun Pillai", "Information Technology", "2nd Year", "Block A", "A-103", [40, 4, 0], "active", "2024-07-16"],
  ["Dinesh Babu", "Electrical", "3rd Year", "Block B", "B-101", [35, 8, 2], "active", "2023-07-19"],
  ["Harish Venkat", "Civil", "1st Year", "Block B", "B-102", null, "active", "2025-07-12"],
  ["Imran Sheikh", "Civil", "1st Year", null, null, null, "active", "2025-07-12"],
  ["Naveen Reddy", "Computer Science", "4th Year", "Block B", "B-102", [44, 2, 0], "active", "2022-07-21"],
  ["Pranav Iyer", "Information Technology", "3rd Year", "Block B", "B-103", [0, 12, 0], "active", "2023-07-19"],
  ["Suresh Menon", "Mechanical", "2nd Year", "Block C", "C-101", [33, 9, 4], "active", "2024-07-17"],
  ["Tarun Gupta", "Electronics", "1st Year", "Block C", "C-101", [28, 12, 1], "active", "2025-07-11"],
  ["Yusuf Ali", "Electrical", "4th Year", "Block C", "C-102", [46, 0, 2], "active", "2022-07-22"],
  ["Ganesh Murthy", "Computer Science", "3rd Year", null, null, [36, 5, 3], "inactive", "2023-07-20"],
  ["Lokesh Rao", "Mechanical", "1st Year", "Block C", "C-102", [25, 15, 0], "active", "2025-07-10"],
  ["Manoj Prasad", "Information Technology", "4th Year", "Block A", "A-104", [41, 3, 2], "active", "2022-07-20"],
  ["Nikhil Joseph", "Electronics", "2nd Year", "Block A", "A-104", null, "inactive", "2024-07-18"],
  ["Praveen Das", "Civil", "2nd Year", null, null, [31, 7, 0], "active", "2024-07-17"],
  ["Rahul Verma", "Electrical", "1st Year", "Block B", "B-103", [29, 11, 2], "active", "2025-07-12"],
  ["Siddharth Jain", "Computer Science", "3rd Year", "Block C", "C-103", [37, 4, 1], "active", "2023-07-21"],
  ["Varun Krishnan", "Information Technology", "1st Year", "Block B", null, null, "active", "2025-07-13"],
  ["Ashwin Kannan", "Mechanical", "4th Year", "Block C", "C-103", [43, 2, 2], "active", "2022-07-22"],
  ["Balaji Subramani", "Electrical", "2nd Year", null, null, [18, 22, 5], "inactive", "2024-07-19"],
  ["Deepak Chandran", "Computer Science", "1st Year", "Block A", "A-103", [33, 8, 1], "active", "2025-07-14"],
  ["Ezhil Arasu", "Civil", "3rd Year", "Block B", "B-101", [39, 3, 0], "active", "2023-07-22"],
];

/** MOCK: replace with the students API response (same shape). */
export const MOCK_STUDENTS: StudentRow[] = SEEDS.map(
  ([fullName, department, year, hostelBlock, roomNumber, att, status, created], index) => ({
    id: `mock-student-${index + 1}`,
    fullName,
    email: `${fullName.toLowerCase().replace(/[^a-z]+/g, ".")}@oasys.edu.in`,
    phone: `9${String(876500000 + (index + 1) * 12345).padStart(9, "0")}`,
    registerNumber: `OIT${YEAR_PREFIX[year] ?? "25"}${DEPT_CODE[department] ?? "XX"}${100 + index + 1}`,
    department,
    year,
    hostelBlock,
    roomNumber,
    attendance: att ? { present: att[0], absent: att[1], late: att[2] } : null,
    status,
    createdAt: `${created}T09:30:00.000Z`,
  })
);
