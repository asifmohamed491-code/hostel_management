"use client";

// AttendanceDetailsModal.tsx — read-only details of one student's attendance
// in the selected session: student, attendance, session and verification.
// Shows only what the database stores (method, distance from the hostel) —
// never passwords, tokens or GPS coordinates.
import { ClipboardCheck, IdCard, MapPin, QrCode, UserRound } from "lucide-react";

import { AttendanceStatusBadge, SessionStateBadge } from "@/components/dashboard/content/super-admin/attendance/AttendanceBadges";
import { RoomModal } from "@/components/dashboard/content/super-admin/rooms/RoomModal";
import {
  METHOD_LABEL,
  formatDateTime,
  formatSessionDate,
  formatTime,
  type AttendanceRow,
  type SessionDetail,
} from "@/lib/attendance-report";

const NOT_SET = <span className="text-heading/40">Not available</span>;

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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

export function AttendanceDetailsModal({
  row,
  session,
  onClose,
}: {
  row: AttendanceRow;
  session: SessionDetail | null;
  onClose: () => void;
}) {
  const checkedIn = row.markedAt !== null;

  return (
    <RoomModal
      title={row.fullName}
      description={[row.registerNumber, row.department].filter(Boolean).join(" · ") || row.email}
      icon={<UserRound className="h-[18px] w-[18px]" />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <Section title="Student Details" icon={<IdCard className="h-3.5 w-3.5" />}>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <Item label="Register Number">{row.registerNumber ?? NOT_SET}</Item>
            <Item label="College Email">{row.email}</Item>
            <Item label="Department">{row.department ?? NOT_SET}</Item>
            <Item label="Academic Year">{row.year ?? NOT_SET}</Item>
            <Item label="Hostel Block">{row.hostelBlock ?? NOT_SET}</Item>
            <Item label="Room Number">{row.roomNumber ?? NOT_SET}</Item>
          </dl>
        </Section>

        <Section title="Attendance" icon={<ClipboardCheck className="h-3.5 w-3.5" />}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <Item label="Status"><AttendanceStatusBadge status={row.status} /></Item>
            <Item label="Date">{formatSessionDate(row.date)}</Item>
            <Item label="Check-in Time">
              {checkedIn ? formatDateTime(row.markedAt) : <span className="text-heading/50">No check-in recorded</span>}
            </Item>
            <Item label="Session">
              {session ? `Started ${formatTime(session.createdAt) ?? ""}` : NOT_SET}
            </Item>
            {session && (
              <>
                <Item label="Session Status"><SessionStateBadge state={session.state} /></Item>
                <Item label="Session Expires">{formatDateTime(session.expiresAt) ?? NOT_SET}</Item>
              </>
            )}
          </dl>
        </Section>

        <Section title="Verification" icon={<QrCode className="h-3.5 w-3.5" />}>
          {checkedIn && row.markingMethod ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Item label="Method">{METHOD_LABEL[row.markingMethod]}</Item>
              <Item label="Distance From Hostel">
                {row.distanceMeters !== null ? (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />{row.distanceMeters} m</span>
                ) : (
                  NOT_SET
                )}
              </Item>
            </dl>
          ) : checkedIn ? (
            <p className="text-[13px] font-medium text-heading/50">No verification details were stored for this record.</p>
          ) : (
            <p className="text-[13px] font-medium text-heading/50">No verification — the student did not check in for this session.</p>
          )}
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
