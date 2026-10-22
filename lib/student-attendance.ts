// lib/student-attendance.ts
//
// Per-student attendance numbers, calculated from REAL attendance records and
// REAL attendance sessions with the same rule the student's own attendance
// history uses (app/api/attendance/history/route.ts), so the Super Admin and
// the student always see the same percentage:
//
//   • present / late  = the student's records with that status
//   • attended days   = dates on which the student has a present or late record
//   • missed sessions = distinct session dates (AttendanceSession.date) the
//                       student did not attend
//   • absent          = max(explicit "absent" records, missed sessions)
//
// Returns null when there is nothing to count (no records and no sessions):
// "no data" is not the same as 0%.
import type { StudentAttendance } from "@/lib/super-admin-students";

export interface AttendanceRecordLite {
  date: string;
  status: "present" | "late" | "absent";
}

export function computeStudentAttendance(
  records: AttendanceRecordLite[],
  sessionDates: string[]
): StudentAttendance | null {
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const explicitAbsent = records.filter((r) => r.status === "absent").length;

  const attendedDates = new Set(
    records.filter((r) => r.status === "present" || r.status === "late").map((r) => r.date)
  );
  const missedSessions = sessionDates.filter((date) => !attendedDates.has(date)).length;
  const absent = Math.max(explicitAbsent, missedSessions);

  if (present + late + absent === 0) return null;
  return { present, late, absent };
}
