// SuperAdminWardens.tsx
//
// "Manage Wardens" page content (Super Admin -> Quick Actions -> Manage
// Wardens). Lists real warden accounts from MongoDB via GET /api/wardens
// (Super Admin only), with server-side search and pagination. Reuses the
// existing DashboardCard / sa-dashboard-card Liquid Glass tokens, and the
// existing Create Warden page for account creation.
//
// Edit / Delete are intentionally not offered here: no update/delete
// warden API exists, and wardens are referenced by attendance sessions,
// so removing one safely needs its own reviewed workflow.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { getInitials } from "@/lib/user-display";
import { cn } from "@/lib/cn";

const CREATE_WARDEN_HREF = "/dashboard/super-admin/wardens/create";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

interface WardenRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  hostelBlock: string | null;
  createdAt: string | null;
}

interface WardensResponse {
  wardens: WardenRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BlockBadge({ block }: { block: string | null }) {
  return block ? (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11.5px] font-semibold text-primary">
      {block}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-200/60 px-2.5 py-1 text-[11.5px] font-semibold text-heading/50">
      Unassigned
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[12px] font-semibold text-primary">
      {getInitials(name) || "W"}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading wardens" className="flex flex-col gap-2.5">
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
        <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white " +
  "shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 " +
  "text-[12.5px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 " +
  "hover:border-primary/40 hover:bg-white hover:text-heading disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export function SuperAdminWardens() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<WardensResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce the search box; a new search always returns to page 1.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };
  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setQuery("");
    setPage(1);
  };
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const load = useCallback(
    async (signal: AbortSignal) => {
      setIsFetching(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (query) params.set("q", query);

        const res = await fetch(`/api/wardens?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
          signal,
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            (body && typeof body.message === "string" && body.message) ||
              "Unable to load wardens. Please try again."
          );
        }
        setData(body as WardensResponse);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load wardens. Please try again."
        );
      } finally {
        if (!signal.aborted) setIsFetching(false);
      }
    },
    [page, query]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const wardens = data?.wardens ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const isInitialLoad = isFetching && !data && !error;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const searchBox = (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">Search wardens</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heading/40" />
      <input
        type="search"
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search name, email or block"
        maxLength={100}
        className="sa-student-action-btn w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-9 text-[13px] font-medium text-heading backdrop-blur-md placeholder:text-heading/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {searchInput && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-heading/40 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Page header: title + breadcrumb, Create Warden on the right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-heading xl:text-[28px]">
            Manage Wardens
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-heading/45">
            <Link
              href="/dashboard/super-admin"
              className="transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-heading/70">Manage Wardens</span>
          </div>
        </div>

        <Link href={CREATE_WARDEN_HREF} className={cn(PRIMARY_BUTTON, "self-start sm:self-auto")}>
          <UserPlus className="h-4 w-4" />
          Create Warden
        </Link>
      </div>

      <DashboardCard
        title="Warden Accounts"
        subtitle={
          data
            ? `${total} ${total === 1 ? "warden" : "wardens"}${query ? " found" : " registered"}`
            : "Loading warden records"
        }
        icon={<ShieldCheck className="h-[18px] w-[18px]" />}
        action={searchBox}
        className="sa-dashboard-card sa-dashboard-card--pearl"
        headerClassName="flex-col items-stretch sm:flex-row sm:items-center"
        bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
      >
        {isInitialLoad ? (
          <TableSkeleton />
        ) : error && !data ? (
          <StateMessage
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Couldn't load wardens"
            description={error}
          >
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className={GLASS_BUTTON}
            >
              Try again
            </button>
          </StateMessage>
        ) : wardens.length === 0 ? (
          query ? (
            <StateMessage
              icon={<Search className="h-5 w-5" />}
              title="No wardens match your search"
              description={`Nothing matched “${query}”. Check the spelling or try a different name, email or hostel block.`}
            >
              <button type="button" onClick={clearSearch} className={GLASS_BUTTON}>
                Clear search
              </button>
            </StateMessage>
          ) : (
            <StateMessage
              icon={<Users className="h-5 w-5" />}
              title="No wardens yet"
              description="Warden accounts you create will appear here."
            >
              <Link href={CREATE_WARDEN_HREF} className={PRIMARY_BUTTON}>
                <UserPlus className="h-4 w-4" />
                Create Warden
              </Link>
            </StateMessage>
          )
        ) : (
          <div
            className={cn(
              "transition-opacity duration-200",
              isFetching && "opacity-60"
            )}
          >
            {error && (
              <p
                role="alert"
                className="mb-3 rounded-xl border border-red-200/70 bg-red-50/70 px-3.5 py-2.5 text-[12.5px] font-medium text-red-600"
              >
                {error}
              </p>
            )}

            {/* Desktop / tablet table */}
            <div className="oasys-scrollbar hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wide text-heading/45">
                    <th className="px-4 pb-1 font-semibold">Warden</th>
                    <th className="px-4 pb-1 font-semibold">Phone</th>
                    <th className="px-4 pb-1 font-semibold">Hostel Block</th>
                    <th className="px-4 pb-1 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {wardens.map((w) => (
                    <tr key={w.id} className="group">
                      <td className="sa-student-action-btn rounded-l-2xl border-y border-l border-slate-200/80 bg-white/80 px-4 py-3 transition-colors group-hover:bg-white">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={w.fullName} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-heading">
                              {w.fullName}
                            </p>
                            <p className="truncate text-[12px] font-medium text-heading/50">
                              {w.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="sa-student-action-btn border-y border-slate-200/80 bg-white/80 px-4 py-3 text-[13px] font-medium text-heading/70 transition-colors group-hover:bg-white">
                        {w.phone || "—"}
                      </td>
                      <td className="sa-student-action-btn border-y border-slate-200/80 bg-white/80 px-4 py-3 transition-colors group-hover:bg-white">
                        <BlockBadge block={w.hostelBlock} />
                      </td>
                      <td className="sa-student-action-btn rounded-r-2xl border-y border-r border-slate-200/80 bg-white/80 px-4 py-3 text-[13px] font-medium text-heading/70 transition-colors group-hover:bg-white">
                        {formatDate(w.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="flex flex-col gap-2.5 md:hidden">
              {wardens.map((w) => (
                <li
                  key={w.id}
                  className="sa-student-action-btn rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={w.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-heading">
                        {w.fullName}
                      </p>
                      <p className="truncate text-[12px] font-medium text-heading/50">
                        {w.email}
                      </p>
                    </div>
                    <BlockBadge block={w.hostelBlock} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-heading/[0.06] pt-3 text-[12px]">
                    <div>
                      <dt className="font-medium text-heading/45">Phone</dt>
                      <dd className="mt-0.5 font-semibold text-heading/80">
                        {w.phone || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-heading/45">Created</dt>
                      <dd className="mt-0.5 font-semibold text-heading/80">
                        {formatDate(w.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-heading/[0.06] pt-4 sm:flex-row">
              <p className="text-[12.5px] font-medium text-heading/50">
                Showing {rangeStart}–{rangeEnd} of {total}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className={GLASS_BUTTON}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <span className="px-1 text-[12.5px] font-semibold text-heading/60">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        )}
      </DashboardCard>
    </div>
  );
}
