"use client";

// AttendanceList.tsx — attendance rows for the selected session: a table on
// xl screens and stacked cards below (no horizontal page overflow). Styling
// follows the Manage Wardens / View Student Report tables.
import { Eye } from "lucide-react";

import { AttendanceStatusBadge } from "@/components/dashboard/content/super-admin/attendance/AttendanceBadges";
import { StudentAvatar } from "@/components/dashboard/content/super-admin/students/StudentBadges";
import { formatSessionDate, formatTime, type AttendanceRow } from "@/lib/attendance-report";

const DASH = <span className="text-heading/35">—</span>;

const VIEW_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const CELL =
  "sa-student-action-btn border-y border-slate-200/80 bg-white/80 px-2.5 py-3 text-[12px] font-medium text-heading/75 transition-colors group-hover:bg-white";

const methodShort = (m: AttendanceRow["markingMethod"]) => (m === "QR_GPS" ? "QR + GPS" : m === "GPS" ? "GPS" : null);

function ViewDetails({ row, onView }: { row: AttendanceRow; onView: (r: AttendanceRow) => void }) {
  return (
    <button type="button" onClick={() => onView(row)} aria-label={`View attendance details of ${row.fullName}`} className={VIEW_BUTTON}>
      <Eye className="h-3.5 w-3.5" />
      View Details
    </button>
  );
}

export function AttendanceList({ rows, onView }: { rows: AttendanceRow[]; onView: (r: AttendanceRow) => void }) {
  return (
    <>
      <div className="oasys-scrollbar hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1060px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-[10.5px] font-semibold uppercase tracking-wide text-heading/45">
              {["Student", "Register No.", "Department", "Year", "Block", "Room", "Date", "Check-in", "Status", "Verification"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2.5 pb-1 font-semibold">{h}</th>
              ))}
              <th scope="col" className="px-2.5 pb-1 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.studentId} className="group">
                <td className={`${CELL} rounded-l-2xl border-l`}>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <StudentAvatar name={r.fullName} />
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-heading">{r.fullName}</p>
                      <p className="truncate text-[11.5px] font-medium text-heading/50">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className={CELL}>{r.registerNumber ?? DASH}</td>
                <td className={CELL}>{r.department ?? DASH}</td>
                <td className={`${CELL} whitespace-nowrap`}>{r.year ?? DASH}</td>
                <td className={`${CELL} whitespace-nowrap`}>{r.hostelBlock ?? DASH}</td>
                <td className={`${CELL} whitespace-nowrap`}>{r.roomNumber ?? DASH}</td>
                <td className={`${CELL} whitespace-nowrap`}>{formatSessionDate(r.date)}</td>
                <td className={`${CELL} whitespace-nowrap`}>{formatTime(r.markedAt) ?? DASH}</td>
                <td className={CELL}><AttendanceStatusBadge status={r.status} /></td>
                <td className={`${CELL} whitespace-nowrap`}>{methodShort(r.markingMethod) ?? DASH}</td>
                <td className={`${CELL} rounded-r-2xl border-r text-right`}><ViewDetails row={r} onView={onView} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:hidden">
        {rows.map((r) => (
          <li key={r.studentId} className="sa-student-action-btn flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <StudentAvatar name={r.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">{r.fullName}</p>
                <p className="truncate text-[12px] font-medium text-heading/50">{r.email}</p>
              </div>
              <AttendanceStatusBadge status={r.status} />
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-heading/[0.06] pt-3 text-[12px]">
              {[
                ["Register No.", r.registerNumber],
                ["Year", r.year],
                ["Department", r.department],
                ["Block / Room", [r.hostelBlock, r.roomNumber].filter(Boolean).join(" · ") || null],
                ["Date", formatSessionDate(r.date)],
                ["Check-in", formatTime(r.markedAt)],
                ["Verification", methodShort(r.markingMethod)],
              ].map(([label, value]) => (
                <div key={label as string} className="min-w-0">
                  <dt className="font-medium text-heading/45">{label}</dt>
                  <dd className="mt-0.5 truncate font-semibold text-heading/80">{value ?? DASH}</dd>
                </div>
              ))}
            </dl>
            <ViewDetails row={r} onView={onView} />
          </li>
        ))}
      </ul>
    </>
  );
}
