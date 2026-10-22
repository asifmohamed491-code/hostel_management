"use client";

// StudentList.tsx — the student directory: a table on xl screens and stacked
// cards below that (no horizontal page overflow). Row styling follows the
// Manage Wardens table.
import { Eye } from "lucide-react";

import {
  AttendanceValue,
  StudentAvatar,
  StudentStatusBadge,
  UnallocatedBadge,
} from "@/components/dashboard/content/super-admin/students/StudentBadges";
import { getAttendancePercent, isAllocated, type StudentRow } from "@/lib/super-admin-students";

const DASH = <span className="text-heading/35">—</span>;

const VIEW_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const CELL =
  "sa-student-action-btn border-y border-slate-200/80 bg-white/80 px-3.5 py-3 text-[12.5px] font-medium text-heading/75 transition-colors group-hover:bg-white";

function ViewDetails({ student, onView }: { student: StudentRow; onView: (s: StudentRow) => void }) {
  return (
    <button
      type="button"
      onClick={() => onView(student)}
      aria-label={`View details of ${student.fullName}`}
      className={VIEW_BUTTON}
    >
      <Eye className="h-3.5 w-3.5" />
      View Details
    </button>
  );
}

export function StudentList({ students, onView }: { students: StudentRow[]; onView: (s: StudentRow) => void }) {
  return (
    <>
      {/* Table (xl and up) */}
      <div className="oasys-scrollbar hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-heading/45">
              {["Student", "Register No.", "Department", "Year", "Hostel Block", "Room", "Attendance", "Status"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-3.5 pb-1 font-semibold">{h}</th>
              ))}
              <th scope="col" className="px-3.5 pb-1 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="group">
                <td className={`${CELL} rounded-l-2xl border-l`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <StudentAvatar name={s.fullName} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-heading">{s.fullName}</p>
                      <p className="truncate text-[12px] font-medium text-heading/50">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className={CELL}>{s.registerNumber ?? DASH}</td>
                <td className={CELL}>{s.department ?? DASH}</td>
                <td className={`${CELL} whitespace-nowrap`}>{s.year ?? DASH}</td>
                <td className={`${CELL} whitespace-nowrap`}>{s.hostelBlock ?? <span className="text-heading/35">—</span>}</td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {isAllocated(s) ? s.roomNumber : <UnallocatedBadge />}
                </td>
                <td className={CELL}>
                  <AttendanceValue percent={getAttendancePercent(s.attendance)} />
                </td>
                <td className={CELL}>
                  <StudentStatusBadge status={s.status} />
                </td>
                <td className={`${CELL} rounded-r-2xl border-r text-right`}>
                  <ViewDetails student={s} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (below xl) */}
      <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:hidden">
        {students.map((s) => (
          <li
            key={s.id}
            className="sa-student-action-btn flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <StudentAvatar name={s.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">{s.fullName}</p>
                <p className="truncate text-[12px] font-medium text-heading/50">{s.email}</p>
              </div>
              <StudentStatusBadge status={s.status} />
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-heading/[0.06] pt-3 text-[12px]">
              <div className="min-w-0">
                <dt className="font-medium text-heading/45">Register No.</dt>
                <dd className="mt-0.5 truncate font-semibold text-heading/80">{s.registerNumber ?? DASH}</dd>
              </div>
              <div className="min-w-0">
                <dt className="font-medium text-heading/45">Year</dt>
                <dd className="mt-0.5 font-semibold text-heading/80">{s.year ?? DASH}</dd>
              </div>
              <div className="col-span-2 min-w-0">
                <dt className="font-medium text-heading/45">Department</dt>
                <dd className="mt-0.5 truncate font-semibold text-heading/80">{s.department ?? DASH}</dd>
              </div>
              <div className="min-w-0">
                <dt className="font-medium text-heading/45">Room</dt>
                <dd className="mt-0.5 font-semibold text-heading/80">
                  {isAllocated(s) ? `${s.hostelBlock ?? ""} ${s.roomNumber}`.trim() : <UnallocatedBadge />}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-heading/45">Attendance</dt>
                <dd className="mt-0.5">
                  <AttendanceValue percent={getAttendancePercent(s.attendance)} />
                </dd>
              </div>
            </dl>

            <ViewDetails student={s} onView={onView} />
          </li>
        ))}
      </ul>
    </>
  );
}
