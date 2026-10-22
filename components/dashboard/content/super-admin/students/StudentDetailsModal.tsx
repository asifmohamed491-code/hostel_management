"use client";

// StudentDetailsModal.tsx — read-only student details, in four sections
// (Personal, Hostel Allocation, Attendance Summary, Account Information).
// Reuses the shared accessible modal shell (focus trap, Esc / backdrop / X
// close, bottom sheet on mobile). Never shows passwords or auth data.
//
// Data comes from GET /api/super-admin/students (real MongoDB records).
import { Activity, BedDouble, IdCard, ShieldCheck, UserRound } from "lucide-react";

import { RoomModal } from "@/components/dashboard/content/super-admin/rooms/RoomModal";
import { StudentStatusBadge } from "@/components/dashboard/content/super-admin/students/StudentBadges";
import {
  formatDate,
  getAttendancePercent,
  isAllocated,
  type StudentRow,
} from "@/lib/super-admin-students";

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="sa-student-action-btn rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 backdrop-blur-md">
      <h3 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-heading">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-heading/45">{label}</dt>
      <dd className="mt-0.5 break-words text-[13px] font-medium text-heading">{children}</dd>
    </div>
  );
}

const NOT_SET = <span className="text-heading/40">Not available</span>;

export function StudentDetailsModal({ student, onClose }: { student: StudentRow; onClose: () => void }) {
  const percent = getAttendancePercent(student.attendance);
  const allocated = isAllocated(student);

  return (
    <RoomModal
      title={student.fullName}
      description={[student.registerNumber, student.department].filter(Boolean).join(" · ") || student.email}
      icon={<UserRound className="h-[18px] w-[18px]" />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <Section title="Personal Details" icon={<IdCard className="h-3.5 w-3.5" />}>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <Item label="Full Name">{student.fullName}</Item>
            <Item label="Register Number">{student.registerNumber ?? NOT_SET}</Item>
            <Item label="College Email">{student.email}</Item>
            <Item label="Phone Number">{student.phone ?? NOT_SET}</Item>
            <Item label="Department">{student.department ?? NOT_SET}</Item>
            <Item label="Academic Year">{student.year ?? NOT_SET}</Item>
          </dl>
        </Section>

        <Section title="Hostel Allocation" icon={<BedDouble className="h-3.5 w-3.5" />}>
          {allocated ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Item label="Hostel Block">{student.hostelBlock ?? NOT_SET}</Item>
              <Item label="Room Number">{student.roomNumber}</Item>
            </dl>
          ) : (
            <p className="text-[13px] font-semibold text-amber-700">Not Allocated</p>
          )}
        </Section>

        <Section title="Attendance Summary" icon={<Activity className="h-3.5 w-3.5" />}>
          {student.attendance && percent !== null ? (
            <>
              <div className="mb-3">
                <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                  <span className="text-heading/55">Attendance</span>
                  <span className="text-heading">{percent}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Attendance percentage"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                  className="h-2 w-full overflow-hidden rounded-full bg-heading/[0.08]"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-2">
                {[
                  { label: "Present", value: student.attendance.present },
                  { label: "Absent", value: student.attendance.absent },
                  { label: "Late", value: student.attendance.late },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200/80 bg-white/80 px-2 py-2 text-center">
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-heading/45">{item.label}</dt>
                    <dd className="mt-0.5 text-[16px] font-bold text-heading">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="text-[13px] font-medium text-heading/50">
              No attendance data available for this student yet.
            </p>
          )}
        </Section>

        <Section title="Account Information" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <Item label="Account Status">
              <StudentStatusBadge status={student.status} />
            </Item>
            <Item label="Account Created">{formatDate(student.createdAt) ?? NOT_SET}</Item>
          </dl>
        </Section>

        <button
          type="button"
          onClick={onClose}
          className="sa-student-action-btn inline-flex w-full items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Close
        </button>
      </div>
    </RoomModal>
  );
}
