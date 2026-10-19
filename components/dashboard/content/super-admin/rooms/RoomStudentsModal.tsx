"use client";

// RoomStudentsModal.tsx
// "View Students" for one room. Loads the room's REAL students from
// GET /api/super-admin/rooms/:id/students (students whose roomNumber equals
// this room's number) and shows name, register number, department and year.
// The API never returns passwords or any authentication data.
import { useEffect, useState } from "react";
import { AlertTriangle, BedDouble, GraduationCap, Users } from "lucide-react";

import { RoomModal } from "@/components/dashboard/content/super-admin/rooms/RoomModal";
import { getInitials } from "@/lib/user-display";
import type { RoomRow, RoomStudent } from "@/lib/hostel-rooms";

interface RoomStudentsModalProps {
  room: RoomRow;
  onClose: () => void;
}

export function RoomStudentsModal({ room, onClose }: RoomStudentsModalProps) {
  const [students, setStudents] = useState<RoomStudent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStudents(null);
      setError(null);
      try {
        const res = await fetch(`/api/super-admin/rooms/${room.id}/students`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (body && typeof body.message === "string" && body.message) ||
              "Unable to load students. Please try again."
          );
        }
        setStudents(Array.isArray(body?.students) ? (body.students as RoomStudent[]) : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load students. Please try again.");
      }
    }

    void load();
    return () => controller.abort();
  }, [room.id, reloadKey]);

  return (
    <RoomModal
      title={`Students in ${room.roomNumber}`}
      description={`${room.hostelBlock} · ${room.occupied} of ${room.capacity} beds occupied`}
      icon={<Users className="h-[18px] w-[18px]" />}
      onClose={onClose}
    >
      {error ? (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p role="alert" className="text-[13px] font-semibold text-heading">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="sa-student-action-btn rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-[13px] font-semibold text-heading/70 hover:border-primary/40 hover:text-heading"
          >
            Try again
          </button>
        </div>
      ) : students === null ? (
        <div aria-busy="true" aria-label="Loading students" className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-slate-200/50" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BedDouble className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-heading">No students assigned to this room yet.</p>
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
                <p className="truncate text-[13px] font-semibold text-heading">{student.fullName}</p>
                <p className="truncate text-[12px] font-medium text-heading/55">
                  {student.registerNumber ?? "Register number not set"}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-medium text-heading/45">
                  <GraduationCap className="h-3 w-3 shrink-0" aria-hidden />
                  {[student.department, student.year].filter(Boolean).join(" · ") || "Department / year not set"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11.5px] font-semibold text-primary">
                {student.roomNumber}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onClose}
        className="sa-student-action-btn mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        Close
      </button>
    </RoomModal>
  );
}
