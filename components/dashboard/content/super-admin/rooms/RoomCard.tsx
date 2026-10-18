"use client";

// RoomCard.tsx
// One room in the View Rooms grid: room number + block, status badge,
// capacity / occupied / available, occupancy % with a progress bar, and the
// View Students / Edit Room actions. Purely presentational.
import { Building2, Pencil, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  ROOM_STATUS_LABEL,
  getOccupancyPercent,
  getRoomStatus,
  type RoomRow,
  type RoomStatus,
} from "@/lib/super-admin-rooms-mock";

const STATUS_STYLES: Record<RoomStatus, { badge: string; bar: string }> = {
  available: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/70", bar: "bg-emerald-400" },
  partial: { badge: "bg-primary/10 text-primary ring-primary/20", bar: "bg-primary" },
  full: { badge: "bg-rose-50 text-rose-600 ring-rose-200/70", bar: "bg-rose-400" },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset",
        STATUS_STYLES[status].badge
      )}
    >
      {ROOM_STATUS_LABEL[status]}
    </span>
  );
}

const ACTION_BUTTON =
  "sa-student-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

interface RoomCardProps {
  room: RoomRow;
  onViewStudents: (room: RoomRow) => void;
  onEdit: (room: RoomRow) => void;
}

export function RoomCard({ room, onViewStudents, onEdit }: RoomCardProps) {
  const status = getRoomStatus(room);
  const percent = getOccupancyPercent(room);
  const available = Math.max(0, room.capacity - room.occupied);

  const stats = [
    { label: "Capacity", value: room.capacity },
    { label: "Occupied", value: room.occupied },
    { label: "Available", value: available },
  ];

  return (
    <article
      className="sa-dashboard-card sa-dashboard-card--pearl flex flex-col gap-3.5 rounded-[20px] border border-white/60 p-4 backdrop-blur-[20px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      aria-label={`Room ${room.roomNumber}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-semibold text-heading">{room.roomNumber}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] font-medium text-heading/50">
            <Building2 className="h-3 w-3 shrink-0" aria-hidden />
            {room.hostelBlock}
          </p>
        </div>
        <RoomStatusBadge status={status} />
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="sa-student-action-btn rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-2 text-center"
          >
            <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-heading/45">
              {stat.label}
            </dt>
            <dd className="mt-0.5 text-[17px] font-bold text-heading">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
          <span className="text-heading/55">Occupancy</span>
          <span className="text-heading">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`Occupancy of room ${room.roomNumber}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-2 w-full overflow-hidden rounded-full bg-heading/[0.08]"
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", STATUS_STYLES[status].bar)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onViewStudents(room)}
          aria-label={`View students in room ${room.roomNumber}`}
          className={ACTION_BUTTON}
        >
          <Users className="h-3.5 w-3.5" />
          View Students
        </button>
        <button
          type="button"
          onClick={() => onEdit(room)}
          aria-label={`Edit room ${room.roomNumber}`}
          className={ACTION_BUTTON}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Room
        </button>
      </div>
    </article>
  );
}
