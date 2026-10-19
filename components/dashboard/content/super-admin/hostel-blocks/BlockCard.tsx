"use client";

// BlockCard.tsx — one hostel block: name, code, description, rooms /
// capacity / occupied / available, occupancy bar, assigned wardens, and the
// View Rooms + Edit Block actions. All numbers come from the API (derived
// from real rooms and students).
import Link from "next/link";
import { Building2, DoorOpen, Pencil, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import type { BlockSummary } from "@/lib/hostel-rooms";

const ACTION =
  "sa-student-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export const roomsHref = (blockName: string) =>
  `/dashboard/super-admin/hostel-blocks/${encodeURIComponent(blockName)}/rooms`;

export function BlockCard({
  block,
  onEdit,
}: {
  block: BlockSummary;
  onEdit: (block: BlockSummary) => void;
}) {
  const stats = [
    { label: "Rooms", value: block.totalRooms },
    { label: "Capacity", value: block.totalCapacity },
    { label: "Occupied", value: block.occupiedBeds },
    { label: "Available", value: block.availableBeds },
  ];

  return (
    <article
      aria-label={`Hostel block ${block.name}`}
      className="sa-dashboard-card sa-dashboard-card--pearl flex flex-col gap-3.5 rounded-[20px] border border-white/60 p-4 backdrop-blur-[20px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-semibold text-heading">{block.name}</h3>
            {block.code ? (
              <p className="text-[12px] font-medium text-heading/50">Code: {block.code}</p>
            ) : (
              <p className="text-[12px] font-medium text-heading/40">No code set yet</p>
            )}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset",
            block.occupancyPercent >= 100
              ? "bg-rose-50 text-rose-600 ring-rose-200/70"
              : block.occupancyPercent > 0
                ? "bg-primary/10 text-primary ring-primary/20"
                : "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
          )}
        >
          {block.occupancyPercent}% full
        </span>
      </div>

      {block.description && (
        <p className="line-clamp-2 text-[12.5px] font-medium text-heading/55">{block.description}</p>
      )}

      <dl className="grid grid-cols-4 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="sa-student-action-btn rounded-xl border border-slate-200/80 bg-white/80 px-1.5 py-2 text-center"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-heading/45">
              {stat.label}
            </dt>
            <dd className="mt-0.5 text-[16px] font-bold text-heading">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
          <span className="text-heading/55">Occupancy</span>
          <span className="text-heading">{block.occupancyPercent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`Occupancy of ${block.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={block.occupancyPercent}
          className="h-2 w-full overflow-hidden rounded-full bg-heading/[0.08]"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${block.occupancyPercent}%` }}
          />
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[12px] font-medium text-heading/55">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
        {block.wardens} {block.wardens === 1 ? "warden" : "wardens"} assigned
      </p>

      <div className="flex gap-2">
        <Link href={roomsHref(block.name)} aria-label={`View rooms in ${block.name}`} className={ACTION}>
          <DoorOpen className="h-3.5 w-3.5" />
          View Rooms
        </Link>
        <button
          type="button"
          onClick={() => onEdit(block)}
          aria-label={`Edit block ${block.name}`}
          className={ACTION}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Block
        </button>
      </div>
    </article>
  );
}
