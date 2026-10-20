"use client";

// StudentFilters.tsx — search box + the five filters + reset. Compact glass
// controls in the same style as the Manage Wardens / Hostel Blocks toolbars.
import { ChevronDown, RotateCcw, Search, X } from "lucide-react";

import {
  ALLOCATION_OPTIONS,
  STATUS_OPTIONS,
  type AllocationFilter,
  type StatusFilter,
  type StudentFilters as Filters,
} from "@/lib/super-admin-students-mock";

interface StudentFiltersProps {
  filters: Filters;
  options: { departments: string[]; years: string[]; blocks: string[] };
  active: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

const SELECT =
  "sa-student-action-btn w-full appearance-none rounded-xl border border-slate-200/80 bg-white/80 py-2 pl-3 pr-8 text-[12.5px] font-medium text-heading " +
  "backdrop-blur-md focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30";

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-heading/45">
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-heading/50" />
      </div>
    </div>
  );
}

export function StudentFilters({ filters, options, active, onChange, onReset }: StudentFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="relative block w-full">
        <span className="sr-only">Search students</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heading/40" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search by name, register number or email"
          maxLength={80}
          className="sa-student-action-btn w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-9 text-[12px] font-medium text-heading backdrop-blur-md placeholder:text-heading/40 sm:text-[13px] focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => onChange({ query: "" })}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-heading/40 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </label>

      <div className="grid grid-cols-2 items-end gap-2.5 sm:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
        <Field label="Department" id="filter-department">
          <select id="filter-department" value={filters.department} onChange={(e) => onChange({ department: e.target.value })} className={SELECT}>
            <option value="all">All</option>
            {options.departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Academic Year" id="filter-year">
          <select id="filter-year" value={filters.year} onChange={(e) => onChange({ year: e.target.value })} className={SELECT}>
            <option value="all">All</option>
            {options.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="Hostel Block" id="filter-block">
          <select id="filter-block" value={filters.block} onChange={(e) => onChange({ block: e.target.value })} className={SELECT}>
            <option value="all">All</option>
            {options.blocks.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Room Allocation" id="filter-allocation">
          <select id="filter-allocation" value={filters.allocation} onChange={(e) => onChange({ allocation: e.target.value as AllocationFilter })} className={SELECT}>
            {ALLOCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Account Status" id="filter-status">
          <select id="filter-status" value={filters.status} onChange={(e) => onChange({ status: e.target.value as StatusFilter })} className={SELECT}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          onClick={onReset}
          disabled={!active}
          className="sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset filters
        </button>
      </div>
    </div>
  );
}
