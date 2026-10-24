// SuperAdminAttendance.tsx — "View Attendance" page (Super Admin dashboard ->
// Quick Actions -> View Attendance).
//
// LIVE DATA from GET /api/super-admin/attendance (MongoDB): the date and
// session selectors, the session details, the 5 summary cards and the
// attendance table all describe the SAME selected session and come from one
// server-side classification, so they always agree. Search, status and block
// filters and pagination are applied in the database. The page re-fetches when
// anything changes, when the tab regains focus, and via the Refresh button.
// Attendance rules: see lib/attendance-report.ts.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Percent,
  QrCode,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { AttendanceDetailsModal } from "@/components/dashboard/content/super-admin/attendance/AttendanceDetailsModal";
import { AttendanceList } from "@/components/dashboard/content/super-admin/attendance/AttendanceList";
import { SessionStateBadge } from "@/components/dashboard/content/super-admin/attendance/AttendanceBadges";
import {
  SESSION_STATE_LABEL,
  STATUS_FILTER_OPTIONS,
  formatDateTime,
  formatSessionDate,
  formatTime,
  type AttendanceResponse,
  type AttendanceRow,
  type StatusFilter,
} from "@/lib/attendance-report";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const FOCUS_REFETCH_MIN_MS = 5000;

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 " +
  "hover:border-primary/40 hover:bg-white hover:text-heading disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const SELECT =
  "sa-student-action-btn w-full appearance-none rounded-xl border border-slate-200/80 bg-white/80 py-2 pl-3 pr-8 text-[12.5px] font-medium text-heading " +
  "backdrop-blur-md focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30";

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-heading/45">{label}</label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-heading/50" />
      </div>
    </div>
  );
}

function StateMessage({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
      <div>
        <p className="text-[15px] font-semibold text-heading">{title}</p>
        <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading attendance" className="flex flex-col gap-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="sa-student-action-btn flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-200/70" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3.5 w-40 max-w-full animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-56 max-w-full animate-pulse rounded bg-slate-200/50" />
          </div>
          <div className="hidden h-5 w-20 animate-pulse rounded-full bg-slate-200/60 md:block" />
        </div>
      ))}
    </div>
  );
}

export function SuperAdminAttendance() {
  const [dateSel, setDateSel] = useState<string | null>(null);
  const [sessionSel, setSessionSel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [block, setBlock] = useState("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<AttendanceRow | null>(null);
  const lastFetchedAt = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsFetching(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (sessionSel) params.set("sessionId", sessionSel);
        else if (dateSel) params.set("date", dateSel);
        if (appliedQuery) params.set("query", appliedQuery);
        if (status !== "all") params.set("status", status);
        if (block !== "all") params.set("block", block);

        const res = await fetch(`/api/super-admin/attendance?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error((body && typeof body.message === "string" && body.message) || "Unable to load attendance. Please try again.");
        }
        setData(body as AttendanceResponse);
        lastFetchedAt.current = Date.now();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load attendance. Please try again.");
      } finally {
        if (!controller.signal.aborted) setIsFetching(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [sessionSel, dateSel, appliedQuery, status, block, page, reloadKey]);

  useEffect(() => {
    function onFocus() {
      if (Date.now() - lastFetchedAt.current > FOCUS_REFETCH_MIN_MS) setReloadKey((k) => k + 1);
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (data && data.records.length === 0 && data.total > 0 && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  const onDateChange = useCallback((date: string) => {
    setDateSel(date);
    setSessionSel(null); // the API picks that date's latest session
    setPage(1);
  }, []);
  const onSessionChange = useCallback((id: string) => {
    setSessionSel(id);
    setPage(1);
  }, []);
  const clearFilters = useCallback(() => {
    setQuery("");
    setAppliedQuery("");
    setStatus("all");
    setBlock("all");
    setPage(1);
  }, []);

  const filtersActive = query.trim() !== "" || status !== "all" || block !== "all";
  const session = data?.session ?? null;
  const summary = data?.summary ?? null;
  const show = (value: number | undefined) => (data && value !== undefined ? value : "—");
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : ((data?.page ?? 1) - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min((data?.page ?? 1) * PAGE_SIZE, total);

  const cards = [
    { id: "total", label: "Total Students", value: show(summary?.totalStudents), caption: session ? `${summary?.eligible ?? 0} expected this session` : "registered students", Icon: Users },
    { id: "present", label: "Present", value: show(summary?.present), caption: "marked present", Icon: UserCheck },
    { id: "late", label: "Late", value: show(summary?.late), caption: "marked late", Icon: Clock },
    { id: "absent", label: "Absent", value: show(summary?.absent), caption: "expected, not marked", Icon: UserX },
    {
      id: "percent",
      label: "Attendance",
      value: data ? (summary?.percentage != null ? `${summary.percentage}%` : "N/A") : "—",
      caption: data && summary?.percentage == null ? (session ? "no students expected" : "no session yet") : "of expected students",
      Icon: Percent,
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3">
      <label className="relative block w-full">
        <span className="sr-only">Search by student name or register number</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heading/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search by student name or register number"
          maxLength={80}
          className="sa-student-action-btn w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-9 text-[12px] font-medium text-heading backdrop-blur-md placeholder:text-heading/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-[13px] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setPage(1); }} aria-label="Clear search" className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-heading/40 transition-colors hover:bg-primary/10 hover:text-primary">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </label>
      <div className="grid grid-cols-2 items-end gap-2.5 sm:grid-cols-3">
        <Field label="Status" id="filter-status">
          <select id="filter-status" value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }} className={SELECT}>
            {STATUS_FILTER_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </Field>
        <Field label="Hostel Block" id="filter-block">
          <select id="filter-block" value={block} onChange={(e) => { setBlock(e.target.value); setPage(1); }} className={SELECT}>
            <option value="all">All</option>
            {(data?.filterOptions.blocks ?? []).map((b) => (<option key={b} value={b}>{b}</option>))}
          </select>
        </Field>
        <button type="button" onClick={clearFilters} disabled={!filtersActive} className={`${GLASS_BUTTON} col-span-2 sm:col-span-1`}>
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      </div>
    </div>
  );

  const activeDate = dateSel ?? session?.date ?? "";
  const activeSessionId = sessionSel ?? session?.id ?? "";

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      <div>
        <h1 className="text-[22px] font-semibold text-heading xl:text-[28px]">View Attendance</h1>
        <p className="mt-1 text-[13px] font-medium text-heading/55">Monitor attendance sessions and student check-ins.</p>
        <nav aria-label="Breadcrumb" className="mt-1.5">
          <ol className="flex items-center gap-1.5 text-[12.5px] font-medium text-heading/45">
            <li><Link href="/dashboard/super-admin" className="transition-colors hover:text-primary">Dashboard</Link></li>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <li aria-current="page" className="text-heading/70">Attendance</li>
          </ol>
        </nav>
      </div>

      {/* Summary cards (selected session) */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-5 xl:gap-4">
        {cards.map(({ id, label, value, caption, Icon }) => (
          <div key={id} className={`group relative flex flex-col justify-between overflow-hidden rounded-[22px] sa-dashboard-card sa-dashboard-card--stat border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white hover:shadow-xl xl:p-5 ${id === "percent" ? "col-span-2 xl:col-span-1" : ""}`}>
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/45 xl:text-[11.5px]">{label}</p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
            </div>
            <p className="relative z-10 mt-3 text-2xl font-bold tracking-tight text-heading xl:text-[28px]">{value}</p>
            <p className="relative z-10 mt-2 truncate text-[12px] font-medium text-heading/50">{caption}</p>
          </div>
        ))}
      </div>

      {/* Session selector + details */}
      <DashboardCard
        title="Attendance Session"
        subtitle={session ? `${formatSessionDate(session.date)} · started ${formatTime(session.createdAt)}` : data ? "No session selected" : "Loading session"}
        icon={<QrCode className="h-[18px] w-[18px]" />}
        action={
          data && data.dates.length > 0 ? (
            <div className="grid w-full grid-cols-[1fr_1fr_auto] items-end gap-2.5 sm:w-auto">
              <Field label="Date" id="select-date">
                <select id="select-date" value={activeDate} onChange={(e) => onDateChange(e.target.value)} className={`${SELECT} sm:min-w-[170px]`}>
                  {data.dates.map((d) => (<option key={d} value={d}>{formatSessionDate(d)}</option>))}
                </select>
              </Field>
              <Field label="Session" id="select-session">
                <select id="select-session" value={activeSessionId} onChange={(e) => onSessionChange(e.target.value)} className={`${SELECT} sm:min-w-[170px]`}>
                  {data.sessions.map((s, i) => (
                    <option key={s.id} value={s.id}>{`${formatTime(s.createdAt)} · ${SESSION_STATE_LABEL[s.state]}${data.sessions.length > 1 ? ` (#${data.sessions.length - i})` : ""}`}</option>
                  ))}
                </select>
              </Field>
              <button type="button" onClick={() => setReloadKey((k) => k + 1)} aria-label="Refresh attendance" className={GLASS_BUTTON}>
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          ) : undefined
        }
        className="sa-dashboard-card sa-dashboard-card--pearl"
        headerClassName="flex-col items-stretch lg:flex-row lg:items-center"
        bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
      >
        {!data && !error ? (
          <div aria-busy="true" aria-label="Loading session" className="h-16 animate-pulse rounded-2xl bg-slate-200/50" />
        ) : error && !data ? (
          <StateMessage icon={<AlertTriangle className="h-5 w-5" />} title="Couldn't load attendance" description={error}>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={GLASS_BUTTON}>Try again</button>
          </StateMessage>
        ) : !session ? (
          <StateMessage icon={<CalendarDays className="h-5 w-5" />} title="No attendance sessions yet" description="Sessions appear here once a warden generates an attendance QR code." />
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 xl:grid-cols-5">
            {[
              ["Session Created", formatDateTime(session.createdAt)],
              ["Expires", formatDateTime(session.expiresAt)],
              ["Generated By", session.generatedByName],
              ["Eligible Students", String(session.eligible)],
              ["Records Stored", String(session.recordCount)],
              ["Present", String(session.present)],
              ["Late", String(session.late)],
              ["Absent", String(session.absent)],
              ["Attendance", session.percentage != null ? `${session.percentage}%` : "N/A"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-heading/45">{label}</dt>
                <dd className="mt-0.5 truncate text-[13px] font-semibold text-heading">{value ?? <span className="text-heading/40">Not available</span>}</dd>
              </div>
            ))}
            <div className="min-w-0">
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-heading/45">Status</dt>
              <dd className="mt-0.5"><SessionStateBadge state={session.state} /></dd>
            </div>
          </dl>
        )}
      </DashboardCard>

      {/* Attendance records */}
      {(data?.session || !data) && (
        <DashboardCard
          title="Attendance Records"
          subtitle={data ? `Showing ${data.total} of ${session?.eligible ?? 0} expected students` : "Loading records"}
          icon={<CheckCircle2 className="h-[18px] w-[18px]" />}
          className="sa-dashboard-card sa-dashboard-card--pearl"
          bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
        >
          <div className="flex flex-col gap-4">
            {toolbar}
            <div aria-live="polite">
              {!data && !error ? (
                <ListSkeleton />
              ) : error && !data ? (
                <StateMessage icon={<AlertTriangle className="h-5 w-5" />} title="Couldn't load attendance" description={error}>
                  <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={GLASS_BUTTON}>Try again</button>
                </StateMessage>
              ) : data && session && session.eligible === 0 ? (
                <StateMessage icon={<Users className="h-5 w-5" />} title="No students were expected for this session" description="No student accounts existed when this session was generated." />
              ) : data && data.total === 0 ? (
                <StateMessage icon={<Search className="h-5 w-5" />} title="No attendance records match your filters" description="Try a different name or register number, or clear the filters.">
                  {filtersActive && <button type="button" onClick={clearFilters} className={GLASS_BUTTON}>Clear filters</button>}
                </StateMessage>
              ) : data ? (
                <div className={isFetching ? "opacity-60 transition-opacity duration-200" : "transition-opacity duration-200"}>
                  {error && (
                    <p role="alert" className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-200/70 bg-red-50/70 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600">
                      {error}
                      <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline underline-offset-2">Try again</button>
                    </p>
                  )}
                  <AttendanceList rows={data.records} onView={setSelected} />
                  <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-heading/[0.06] pt-4 sm:flex-row">
                    <p className="text-[12.5px] font-medium text-heading/50">Showing {rangeStart}–{rangeEnd} of {total}</p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || isFetching} className={GLASS_BUTTON}>
                          <ChevronLeft className="h-3.5 w-3.5" />Previous
                        </button>
                        <span className="px-1 text-[12.5px] font-semibold text-heading/60">{data.page} / {totalPages}</span>
                        <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages || isFetching} className={GLASS_BUTTON}>
                          Next<ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </DashboardCard>
      )}

      {selected && <AttendanceDetailsModal row={selected} session={session} onClose={() => setSelected(null)} />}
    </div>
  );
}
