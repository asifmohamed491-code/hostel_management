"use client";

// RoomStudentsModal.tsx
// "View Students" for one room: name, register number, department, year and
// the room assignment. Read-only; shows a polished empty state when nobody
// is assigned. Never shows passwords or any authentication data.
//
// TEMPORARY (UI phase): `students` is MOCK data from
// lib/super-admin-rooms-mock.ts — not fetched from MongoDB.
import { BedDouble, GraduationCap, Users } from "lucide-react";

import { RoomModal } from "@/components/dashboard/content/super-admin/rooms/RoomModal";
import { getInitials } from "@/lib/user-display";
import type { RoomRow, RoomStudent } from "@/lib/super-admin-rooms-mock";

interface RoomStudentsModalProps {
  room: RoomRow;
  students: RoomStudent[];
  onClose: () => void;
}

export function RoomStudentsModal({ room, students, onClose }: RoomStudentsModalProps) {
  return (
    <RoomModal
      title={`Students in ${room.roomNumber}`}
      description={`${room.hostelBlock} · ${room.occupied} of ${room.capacity} beds occupied`}
      icon={<Users className="h-[18px] w-[18px]" />}
      onClose={onClose}
    >
      {students.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BedDouble className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-heading">
              No students assigned to this room yet.
            </p>
            <p className="mt-1 text-[12.5px] font-medium text-heading/50">
              All {room.capacity} beds in {room.roomNumber} are available.
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5" aria-label={`Students assigned to room ${room.roomNumber}`}>
          {students.map((student) => (
            <li
              key={student.id}
              className="sa-student-action-btn flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-3 backdrop-blur-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[12px] font-semibold text-primary">
                {getInitials(student.fullName) || "S"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">
                  {student.fullName}
                </p>
                <p className="truncate text-[12px] font-medium text-heading/55">
                  {student.registerNumber}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-medium text-heading/45">
                  <GraduationCap className="h-3 w-3 shrink-0" aria-hidden />
                  {student.department} · {student.year}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11.5px] font-semibold text-primary">
                {student.roomNumber}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[11px] font-medium text-heading/40">
        Preview only — sample students, not loaded from the database.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="sa-student-action-btn mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        Close
      </button>
    </RoomModal>
  );
}
