// SuperAdminStudents.tsx — "View Student Report" page (Super Admin dashboard
// -> Quick Actions -> student action): header + breadcrumb, 4 summary cards,
// Student Directory (search + 5 filters + reset), responsive table / cards,
// pagination and a read-only student details modal.
//
// LIVE DATA: everything comes from GET /api/super-admin/students (MongoDB).
// Search / filters / page are sent to the API and applied in the database;
// summary cards, filter options and per-student attendance (calculated from
// the real attendance records and sessions) come back in the same response.
// The list re-fetches whenever a filter changes and when the browser tab
// regains focus, so it reflects database changes without a manual reload.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  DoorClosed,
  DoorOpen,
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
  EMPTY_SUMMARY,
  filtersAreActive,
  type StudentFilters as Filters,
  type StudentRow,
  type StudentsResponse,
} from "@/lib/super-admin-students";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const FOCUS_REFETCH_MIN_MS = 5000;

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 " +
  "hover:border-primary/40 hover:bg-white hover:text-heading disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading students" className="flex flex-col gap-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="sa-student-action-btn flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-3 backdrop-blur-md"
        >
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-200/70" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3.5 w-40 max-w-full animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-56 max-w-full animate-pulse rounded bg-slate-200/50" />
          </div>
          <div className="hidden h-5 w-20 animate-pulse rounded-full bg-slate-200/60 md:block" />
          <div className="hidden h-3.5 w-24 animate-pulse rounded bg-slate-200/50 lg:block" />
        </div>
      ))}
    </div>
  );
}

function StateMessage({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-[15px] font-semibold text-heading">{title}</p>
        <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SuperAdminStudents() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<StudentRow | null>(null);
  const lastFetchedAt = useRef(0);

  // Search is sent to the API after a short pause in typing.
  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(filters.query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.query]);

  const { department, year, block, allocation, status } = filters;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsFetching(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (appliedQuery) params.set("query", appliedQuery);
        if (department !== "all") params.set("department", department);
        if (year !== "all") params.set("year", year);
        if (block !== "all") params.set("block", block);
        if (allocation !== "all") params.set("allocation", allocation);
        if (status !== "all") params.set("status", status);

        const res = await fetch(`/api/super-admin/students?${params.toString()}`, {
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
        setData(body as StudentsResponse);
        lastFetchedAt.current = Date.now();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load students. Please try again.");
      } finally {
        if (!controller.signal.aborted) setIsFetching(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [appliedQuery, department, year, block, allocation, status, page, reloadKey]);

  // Pick up database changes made elsewhere when the tab becomes active again.
  useEffect(() => {
    function onFocus() {
      if (Date.now() - lastFetchedAt.current > FOCUS_REFETCH_MIN_MS) setReloadKey((k) => k + 1);
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // If records were removed and the current page no longer exists, go to the last page.
  useEffect(() => {
    if (data && data.students.length === 0 && data.total > 0 && page > data.totalPages) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  const updateFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1); // any filter change starts again from the first page
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAppliedQuery("");
    setPage(1);
  }, []);

  const active = filtersAreActive(filters);
  const summary = data?.summary ?? EMPTY_SUMMARY;
  const show = (value: number) => (data ? value : "—");
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const rangeStart = total === 0 ? 0 : ((data?.page ?? 1) - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min((data?.page ?? 1) * PAGE_SIZE, total);

  const summaryCards = [
    { id: "total", label: "Total Students", value: show(summary.total), caption: "registered accounts", Icon: Users },
    { id: "allocated", label: "Allocated Students", value: show(summary.allocated), caption: "assigned to a room", Icon: DoorOpen },
    { id: "unallocated", label: "Unallocated Students", value: show(summary.unallocated), caption: "no room assigned", Icon: DoorClosed },
    { id: "active", label: "Active Students", value: show(summary.active), caption: "currently active", Icon: UserCheck },
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
        subtitle={data ? `Showing ${data.total} of ${data.summary.total} ${data.summary.total === 1 ? "student" : "students"}` : "Loading students"}
        icon={<Users className="h-[18px] w-[18px]" />}
        className="sa-dashboard-card sa-dashboard-card--pearl"
        bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
      >
        <div className="flex flex-col gap-4">
          <StudentFilters
            filters={filters}
            options={data?.filterOptions ?? { departments: [], years: [], blocks: [] }}
            active={active}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <div aria-live="polite">
            {!data && !error ? (
              <ListSkeleton />
            ) : error && !data ? (
              <StateMessage
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Couldn't load students"
                description={error}
              >
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={GLASS_BUTTON}>
                  Try again
                </button>
              </StateMessage>
            ) : data && data.summary.total === 0 ? (
              <StateMessage
                icon={<Users className="h-5 w-5" />}
                title="No students registered yet"
                description="Student accounts will appear here once they are created."
              />
            ) : data && data.total === 0 ? (
              <StateMessage
                icon={<Search className="h-5 w-5" />}
                title="No students match your search"
                description="Try a different name, register number or email, or reset the filters."
              >
                {active && (
                  <button type="button" onClick={resetFilters} className={GLASS_BUTTON}>
                    Reset filters
                  </button>
                )}
              </StateMessage>
            ) : data ? (
              <div className={isFetching ? "opacity-60 transition-opacity duration-200" : "transition-opacity duration-200"}>
                {error && (
                  <p
                    role="alert"
                    className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-200/70 bg-red-50/70 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600"
                  >
                    {error}
                    <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline underline-offset-2">
                      Try again
                    </button>
                  </p>
                )}

                <StudentList students={data.students} onView={setSelected} />

                <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-heading/[0.06] pt-4 sm:flex-row">
                  <p className="text-[12.5px] font-medium text-heading/50">
                    Showing {rangeStart}–{rangeEnd} of {total}
                  </p>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1 || isFetching}
                        className={GLASS_BUTTON}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Previous
                      </button>
                      <span className="px-1 text-[12.5px] font-semibold text-heading/60">
                        {data.page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages || isFetching}
                        className={GLASS_BUTTON}
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DashboardCard>

      {selected && <StudentDetailsModal student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
