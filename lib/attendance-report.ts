// lib/attendance-report.ts
//
// Shared (client + server) types and PURE helpers for the Super Admin
// "View Attendance" page. No data lives here.
//
// ATTENDANCE RULES (derived from the existing system, not invented):
//  • A session is an AttendanceSession (one per QR generation; sessions are
//    global, valid for 3 hours; generating a new one closes the previous).
//    Several sessions can exist on the same date.
//  • An AttendanceRecord is unique per (student, date) and is linked to the
//    session that captured it. Statuses in the schema: present | late | absent.
//    The current marking flow only ever writes "present"; "late" is supported
//    by the schema and counted by the existing stats/report routes.
//  • EXPECTED to attend a session = every student account that existed when
//    the session was generated (the generate route notifies exactly those
//    students). Students registered later are NOT expected, so never absent.
//  • A student who already attended (present/late) the same DATE through a
//    different session is not expected again for this one.
//  • Absent = expected but no present/late record in this session (an explicit
//    "absent" record counts as absent too). Late counts as attended.
//  • Attendance % = (present + late) / expected. With nobody expected the
//    percentage is unavailable (null), never a made-up 0 / 100.
export type AttendanceStatus = "present" | "late" | "absent";
export type StatusFilter = "all" | AttendanceStatus;
export type SessionState = "active" | "closed" | "expired";

export interface SessionInfo {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  expiresAt: string;
  active: boolean;
  state: SessionState;
  generatedByName: string | null;
}

export interface SessionDetail extends SessionInfo {
  eligible: number;
  present: number;
  late: number;
  absent: number;
  /** Records linked to this session in the database. */
  recordCount: number;
  percentage: number | null;
}

export interface AttendanceSummary {
  totalStudents: number;
  eligible: number;
  present: number;
  late: number;
  absent: number;
  percentage: number | null;
}

export interface AttendanceRow {
  studentId: string;
  recordId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  registerNumber: string | null;
  department: string | null;
  year: string | null;
  hostelBlock: string | null;
  roomNumber: string | null;
  date: string;
  /** Check-in time; null for students who did not check in. */
  markedAt: string | null;
  status: AttendanceStatus;
  markingMethod: "QR_GPS" | "GPS" | null;
  distanceMeters: number | null;
  sessionId: string;
}

export interface AttendanceResponse {
  dates: string[];
  sessions: SessionInfo[];
  session: SessionDetail | null;
  summary: AttendanceSummary | null;
  records: AttendanceRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filterOptions: { blocks: string[] };
}

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
];

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
};

export const SESSION_STATE_LABEL: Record<SessionState, string> = {
  active: "Active",
  closed: "Closed",
  expired: "Expired",
};

export const METHOD_LABEL: Record<"QR_GPS" | "GPS", string> = {
  QR_GPS: "QR code + GPS",
  GPS: "GPS only",
};

/** Same meaning as the existing status route: closed flag, or past expiry. */
export function getSessionState(active: boolean, expiresAtMs: number, nowMs: number): SessionState {
  if (!active) return "closed";
  return nowMs >= expiresAtMs ? "expired" : "active";
}

export function attendancePercentage(attended: number, eligible: number): number | null {
  if (!Number.isFinite(eligible) || eligible <= 0) return null;
  return Math.min(100, Math.round((attended / eligible) * 100));
}

// ------------------------------------------------------- classification

export interface RecordLite {
  student: string;
  sessionId: string;
  status: AttendanceStatus;
  markedAtMs: number;
}

export interface Classification {
  eligible: string[];
  present: string[];
  late: string[];
  absent: string[];
  /** Records of eligible students linked to this session (after de-duplication). */
  recordCount: number;
}

/**
 * Classify every EXPECTED student for one session, from the records of that
 * session's DATE (unique per student+date in the schema; duplicates are still
 * collapsed defensively: an attended record beats an absent one, and among
 * attended records the earliest check-in wins).
 */
export function classifyStudents(
  expectedStudentIds: string[],
  dateRecords: RecordLite[],
  sessionId: string
): Classification {
  const best = new Map<string, RecordLite>();
  for (const rec of dateRecords) {
    const current = best.get(rec.student);
    const attended = rec.status !== "absent";
    const currentAttended = current ? current.status !== "absent" : false;
    if (
      !current ||
      (attended && !currentAttended) ||
      (attended === currentAttended && rec.markedAtMs < current.markedAtMs)
    ) {
      best.set(rec.student, rec);
    }
  }

  const out: Classification = { eligible: [], present: [], late: [], absent: [], recordCount: 0 };
  for (const id of expectedStudentIds) {
    const rec = best.get(id);
    // Already attended this date through another session -> not expected here.
    if (rec && rec.status !== "absent" && rec.sessionId !== sessionId) continue;

    out.eligible.push(id);
    if (rec && rec.sessionId === sessionId) {
      out.recordCount += 1;
      if (rec.status === "present") out.present.push(id);
      else if (rec.status === "late") out.late.push(id);
      else out.absent.push(id);
    } else {
      out.absent.push(id);
    }
  }
  return out;
}

// ----------------------------------------------------------- formatting
// Fixed to India time so server-rendered and client-rendered text agree.

const TZ = "Asia/Kolkata";

export function formatSessionDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: TZ }).toUpperCase();
}

export function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ })}, ${formatTime(iso)}`;
}
