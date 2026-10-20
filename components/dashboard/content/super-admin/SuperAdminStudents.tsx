// SuperAdminStudents.tsx — "View Students" page (Super Admin dashboard ->
// Quick Actions -> student action): header + breadcrumb, 4 summary cards,
// Student Directory (search + 5 filters + reset), responsive table / cards,
// pagination and a read-only student details modal.
//
// ╔══════════════════════════════════════════════════════════════════════╗
// ║ UI PHASE ONLY — all students shown are TEMPORARY MOCK DATA from      ║
// ║ lib/super-admin-students-mock.ts, filtered locally. No API call, no  ║
// ║ database access; a visible notice on the page says so. Nothing on    ║
// ║ this page changes any student (no edit / delete / status change).    ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// Backend phase: replace MOCK_STUDENTS below with the API response (same
// StudentRow shape — see the mapping table in the mock file); filtering can
// stay local or move server-side without redesigning the page.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  DoorClosed,
  DoorOpen,
  Info,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { StudentDetailsModal } from "@/components/dashboard/content/super-admin/students/StudentDetailsModal";
import { StudentFilters } from "@/components/dashboard/content/super-admin/students/StudentFilters";
import { StudentList } from "@/components/dashboard/content/super-admin/students/StudentList";
import {
  DEFAULT_FILTERS,
  MOCK_STUDENTS,
  filterStudents,
  filtersAreActive,
  getFilterOptions,
  summarizeStudents,
  type StudentFilters as Filters,
} from "@/lib/super-admin-students-mock";

const PAGE_SIZE = 10;

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 " +
  "hover:border-primary/40 hover:bg-white hover:text-heading disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export function SuperAdminStudents() {
  // TEMPORARY MOCK DATA — replace with the students API response.
  const students = MOCK_STUDENTS;

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const summary = useMemo(() => summarizeStudents(students), [students]);
  const options = useMemo(() => getFilterOptions(students), [students]);
  const filtered = useMemo(() => filterStudents(students, filters), [students, filters]);
  const active = filtersAreActive(filters);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStudents = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);
  const selected = selectedId ? students.find((s) => s.id === selectedId) : undefined;

  function updateFilters(patch: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1); // any filter change starts again from the first page
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  const summaryCards = [
    { id: "total", label: "Total Students", value: summary.total, caption: "registered accounts", Icon: Users },
    { id: "allocated", label: "Allocated Students", value: summary.allocated, caption: "assigned to a room", Icon: DoorOpen },
    { id: "unallocated", label: "Unallocated Students", value: summary.unallocated, caption: "no room assigned", Icon: DoorClosed },
    { id: "active", label: "Active Students", value: summary.active, caption: "currently active", Icon: UserCheck },
  ];

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-semibold text-heading xl:text-[28px]">View Students</h1>
        <p className="mt-1 text-[13px] font-medium text-heading/55">
          View and manage registered hostel students.
        </p>
        <nav aria-label="Breadcrumb" className="mt-1.5">
          <ol className="flex items-center gap-1.5 text-[12.5px] font-medium text-heading/45">
            <li>
              <Link href="/dashboard/super-admin" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <li aria-current="page" className="text-heading/70">
              Students
            </li>
          </ol>
        </nav>
      </div>

      {/* UI-phase notice: this is NOT database data */}
      <p className="flex items-start gap-2 rounded-2xl border border-primary/15 bg-primary/[0.06] px-3.5 py-2.5 text-[12.5px] font-medium text-heading/65">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>UI preview: the students on this page are sample data, not loaded from the database.</span>
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4 xl:gap-4">
        {summaryCards.map(({ id, label, value, caption, Icon }) => (
          <div
            key={id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] sa-dashboard-card sa-dashboard-card--stat border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white hover:shadow-xl xl:p-5"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/45 xl:text-[11.5px]">{label}</p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="relative z-10 mt-3 text-2xl font-bold tracking-tight text-heading xl:text-[28px]">{value}</p>
            <p className="relative z-10 mt-2 truncate text-[12px] font-medium text-heading/50">{caption}</p>
          </div>
        ))}
      </div>

      {/* Student Directory */}
      <DashboardCard
        title="Student Directory"
        subtitle={`Showing ${filtered.length} of ${students.length} ${students.length === 1 ? "student" : "students"}`}
        icon={<Users className="h-[18px] w-[18px]" />}
        className="sa-dashboard-card sa-dashboard-card--pearl"
        bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
      >
        <div className="flex flex-col gap-4">
          <StudentFilters
            filters={filters}
            options={options}
            active={active}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <div aria-live="polite">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-heading">No students match your search</p>
                  <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">
                    Try a different name, register number or email, or reset the filters.
                  </p>
                </div>
                {active && (
                  <button type="button" onClick={resetFilters} className={GLASS_BUTTON}>
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <StudentList students={pageStudents} onView={(s) => setSelectedId(s.id)} />

                <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-heading/[0.06] pt-4 sm:flex-row">
                  <p className="text-[12.5px] font-medium text-heading/50">
                    Showing {rangeStart}–{rangeEnd} of {filtered.length}
                  </p>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage(Math.max(1, safePage - 1))}
                        disabled={safePage <= 1}
                        className={GLASS_BUTTON}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Previous
                      </button>
                      <span className="px-1 text-[12.5px] font-semibold text-heading/60">
                        {safePage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                        disabled={safePage >= totalPages}
                        className={GLASS_BUTTON}
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardCard>

      {selected && <StudentDetailsModal student={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
