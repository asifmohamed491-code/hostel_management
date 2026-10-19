// SuperAdminHostelBlocks.tsx — "Manage Hostel Blocks" page (Super Admin
// dashboard -> Quick Actions -> Manage Hostel Blocks). Live data from
// GET /api/super-admin/hostel-blocks; Add / Edit save through
// POST / PATCH on the same API and the list is re-fetched afterwards.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { BlockCard } from "@/components/dashboard/content/super-admin/hostel-blocks/BlockCard";
import {
  BlockFormModal,
  type BlockSubmitError,
} from "@/components/dashboard/content/super-admin/hostel-blocks/BlockFormModal";
import type { HostelBlockFormValues } from "@/lib/hostel-validation";
import type { BlockSummary } from "@/lib/hostel-rooms";

type ModalState = { type: "add" } | { type: "edit"; name: string } | null;

const NOTICE_MS = 5000;

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white " +
  "shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 " +
  "text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 " +
  "hover:border-primary/40 hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

function CardsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading hostel blocks"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="sa-student-action-btn flex flex-col gap-3.5 rounded-[20px] border border-slate-200/80 bg-white/80 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200/70" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200/50" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="h-12 animate-pulse rounded-xl bg-slate-200/50" />
            ))}
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-slate-200/60" />
          <div className="h-9 w-full animate-pulse rounded-xl bg-slate-200/50" />
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

export function SuperAdminHostelBlocks() {
  const [blocks, setBlocks] = useState<BlockSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setError(null);
      try {
        const res = await fetch("/api/super-admin/hostel-blocks", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (body && typeof body.message === "string" && body.message) ||
              "Unable to load hostel blocks. Please try again."
          );
        }
        setBlocks(Array.isArray(body?.blocks) ? (body.blocks as BlockSummary[]) : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load hostel blocks. Please try again.");
      }
    }

    void load();
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    []
  );

  const showNotice = useCallback((text: string) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const visibleBlocks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!blocks) return [];
    if (!needle) return blocks;
    return blocks.filter((b) =>
      [b.name, b.code ?? "", b.description ?? ""].some((v) => v.toLowerCase().includes(needle))
    );
  }, [blocks, query]);

  const editingBlock = modal?.type === "edit" ? blocks?.find((b) => b.name === modal.name) : undefined;

  async function saveBlock(
    target: BlockSummary | null,
    values: HostelBlockFormValues
  ): Promise<BlockSubmitError | null> {
    // Edit of a registered block -> PATCH; add, or first-time details for a
    // block that only existed as a name on rooms/students -> POST.
    const isPatch = Boolean(target?.registered && target.id);
    try {
      const res = await fetch(
        isPatch ? `/api/super-admin/hostel-blocks/${target?.id}` : "/api/super-admin/hostel-blocks",
        {
          method: isPatch ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            isPatch
              ? { code: values.code, description: values.description }
              : { name: values.name, code: values.code, description: values.description }
          ),
        }
      );
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const message: string =
          (body && typeof body.message === "string" && body.message) ||
          "Something went wrong. Please try again.";
        const field = /\bcode\b/i.test(message)
          ? "code"
          : /\bdescription\b/i.test(message)
            ? "description"
            : /\bname\b|named/i.test(message)
              ? "name"
              : undefined;
        return { message, field };
      }

      setModal(null);
      showNotice(
        isPatch || target
          ? `${values.name} updated successfully.`
          : `${values.name} added successfully.`
      );
      setReloadKey((k) => k + 1); // re-fetch so the list shows the saved values
      return null;
    } catch {
      return { message: "Something went wrong. Please try again." };
    }
  }

  const loading = blocks === null && !error;

  const searchBox = (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">Search hostel blocks</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heading/40" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search blocks..."
        maxLength={50}
        className="sa-student-action-btn w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-9 text-[13px] font-medium text-heading backdrop-blur-md placeholder:text-heading/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-heading xl:text-[28px]">Manage Hostel Blocks</h1>
          <nav aria-label="Breadcrumb" className="mt-1.5">
            <ol className="flex items-center gap-1.5 text-[12.5px] font-medium text-heading/45">
              <li>
                <Link href="/dashboard/super-admin" className="transition-colors hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <li aria-current="page" className="text-heading/70">
                Hostel Blocks
              </li>
            </ol>
          </nav>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "add" })}
          className={`${PRIMARY_BUTTON} self-start sm:self-auto`}
        >
          <Plus className="h-4 w-4" />
          Add Hostel Block
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-3.5 py-2.5 text-[12.5px] font-semibold text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      <DashboardCard
        title="Hostel Blocks"
        subtitle={
          blocks
            ? `${blocks.length} ${blocks.length === 1 ? "block" : "blocks"}${query.trim() ? ` · ${visibleBlocks.length} shown` : ""}`
            : "Loading hostel blocks"
        }
        icon={<Building2 className="h-[18px] w-[18px]" />}
        action={blocks && blocks.length > 0 ? searchBox : undefined}
        className="sa-dashboard-card sa-dashboard-card--pearl"
        headerClassName="flex-col items-stretch sm:flex-row sm:items-center"
        bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
      >
        {loading ? (
          <CardsSkeleton />
        ) : error && !blocks ? (
          <StateMessage
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Couldn't load hostel blocks"
            description={error}
          >
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={GLASS_BUTTON}>
              Try again
            </button>
          </StateMessage>
        ) : blocks && blocks.length === 0 ? (
          <StateMessage
            icon={<Building2 className="h-5 w-5" />}
            title="No hostel blocks yet"
            description="Add your first hostel block to start organising rooms and students."
          >
            <button type="button" onClick={() => setModal({ type: "add" })} className={PRIMARY_BUTTON}>
              <Plus className="h-4 w-4" />
              Add Hostel Block
            </button>
          </StateMessage>
        ) : visibleBlocks.length === 0 ? (
          <StateMessage
            icon={<Search className="h-5 w-5" />}
            title="No hostel blocks match your search"
            description={`Nothing matched “${query.trim()}”. Try a different name or code.`}
          >
            <button type="button" onClick={() => setQuery("")} className={GLASS_BUTTON}>
              Clear search
            </button>
          </StateMessage>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-3.5">
            {visibleBlocks.map((block) => (
              <BlockCard
                key={block.name}
                block={block}
                onEdit={(b) => setModal({ type: "edit", name: b.name })}
              />
            ))}
          </div>
        )}
      </DashboardCard>

      {modal?.type === "add" && (
        <BlockFormModal
          mode="add"
          onClose={() => setModal(null)}
          onSubmit={(values) => saveBlock(null, values)}
        />
      )}
      {modal?.type === "edit" && editingBlock && (
        <BlockFormModal
          key={editingBlock.name}
          mode="edit"
          block={editingBlock}
          onClose={() => setModal(null)}
          onSubmit={(values) => saveBlock(editingBlock, values)}
        />
      )}
    </div>
  );
}
