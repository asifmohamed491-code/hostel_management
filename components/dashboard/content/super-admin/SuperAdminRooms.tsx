// SuperAdminRooms.tsx
//
// "View Rooms" page (Manage Hostel Blocks -> View Rooms for ONE block).
// Live data: GET /api/super-admin/rooms?block=<name> returns only that
// block's rooms with occupancy derived from the real students; Add Room /
// Edit Room call POST / PATCH /api/super-admin/rooms and the list is
// re-fetched afterwards; View Students loads the room's real students.
// The status filter and search run on the fetched rooms.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  BedSingle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  KeyRound,
  Plus,
  Search,
  UserCheck,
  X,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { RoomCard } from "@/components/dashboard/content/super-admin/rooms/RoomCard";
import {
  RoomFormModal,
  type RoomFormValues,
  type RoomSubmitError,
} from "@/components/dashboard/content/super-admin/rooms/RoomFormModal";
import { RoomStudentsModal } from "@/components/dashboard/content/super-admin/rooms/RoomStudentsModal";
import {
  ROOM_FILTER_OPTIONS,
  compareRoomNumbers,
  getRoomStatus,
  summarizeRooms,
  type RoomRow,
  type RoomStatusFilter,
} from "@/lib/hostel-rooms";

const HOSTEL_BLOCKS_HREF = "/dashboard/super-admin/hostel-blocks";
const NOTICE_MS = 5000;

type ModalState =
  | { type: "add" }
  | { type: "edit"; roomId: string }
  | { type: "students"; roomId: string }
  | null;

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white " +
  "shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 " +
  "text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 " +
  "hover:border-primary/40 hover:bg-white hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

interface SuperAdminRoomsProps {
  /** Selected hostel block, taken from the route (/hostel-blocks/[block]/rooms). */
  blockName: string;
}

interface LoadFailure {
  message: string;
  notFound: boolean;
}

export function SuperAdminRooms({ blockName }: SuperAdminRoomsProps) {
  const [rooms, setRooms] = useState<RoomRow[] | null>(null);
  const [failure, setFailure] = useState<LoadFailure | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatusFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setFailure(null);
      try {
        const res = await fetch(`/api/super-admin/rooms?block=${encodeURIComponent(blockName)}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          setFailure({
            message:
              (body && typeof body.message === "string" && body.message) ||
              "Unable to load rooms. Please try again.",
            notFound: res.status === 404,
          });
          return;
        }
        setRooms(Array.isArray(body?.rooms) ? (body.rooms as RoomRow[]) : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailure({ message: "Unable to load rooms. Please try again.", notFound: false });
      }
    }

    void load();
    return () => controller.abort();
  }, [blockName, reloadKey]);

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

  const roomList = useMemo(() => rooms ?? [], [rooms]);
  const summary = useMemo(() => summarizeRooms(roomList), [roomList]);

  const visibleRooms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return roomList
      .filter((room) => (needle ? room.roomNumber.toLowerCase().includes(needle) : true))
      .filter((room) => (statusFilter === "all" ? true : getRoomStatus(room) === statusFilter))
      .sort(compareRoomNumbers);
  }, [roomList, query, statusFilter]);

  const filtersActive = query.trim() !== "" || statusFilter !== "all";
  const editingRoom = modal?.type === "edit" ? roomList.find((r) => r.id === modal.roomId) : undefined;
  const studentsRoom = modal?.type === "students" ? roomList.find((r) => r.id === modal.roomId) : undefined;

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  async function submitRoom(
    target: { mode: "add" } | { mode: "edit"; id: string },
    values: RoomFormValues
  ): Promise<RoomSubmitError | null> {
    try {
      const res = await fetch(
        target.mode === "add" ? "/api/super-admin/rooms" : `/api/super-admin/rooms/${target.id}`,
        {
          method: target.mode === "add" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            target.mode === "add"
              ? { hostelBlock: blockName, roomNumber: values.roomNumber, capacity: values.capacity }
              : { roomNumber: values.roomNumber, capacity: values.capacity }
          ),
        }
      );
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const message: string =
          (body && typeof body.message === "string" && body.message) ||
          "Something went wrong. Please try again.";
        const field = /capacity/i.test(message)
          ? "capacity"
          : /number/i.test(message)
            ? "roomNumber"
            : undefined;
        return { message, field };
      }

      if (target.mode === "add") clearFilters(); // make sure the new room is visible
      setModal(null);
      showNotice(
        target.mode === "add"
          ? `Room ${values.roomNumber} created successfully.`
          : `Room ${values.roomNumber} updated successfully.`
      );
      setReloadKey((k) => k + 1); // re-fetch so the list shows the saved data
      return null;
    } catch {
      return { message: "Something went wrong. Please try again." };
    }
  }

  const summaryCards = [
    { id: "rooms", label: "Total Rooms", value: summary.totalRooms, caption: `in ${blockName}`, Icon: KeyRound },
    { id: "capacity", label: "Total Capacity", value: summary.totalCapacity, caption: "beds across all rooms", Icon: BedDouble },
    { id: "occupied", label: "Occupied Beds", value: summary.occupiedBeds, caption: `${summary.occupancyPercent}% of capacity`, Icon: UserCheck, progress: summary.occupancyPercent },
    { id: "available", label: "Available Beds", value: summary.availableBeds, caption: "free beds right now", Icon: BedSingle },
  ];

  const toolbar = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <label className="relative block w-full sm:w-64">
        <span className="sr-only">Search rooms by room number</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heading/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search room number..."
          maxLength={30}
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

      <label className="relative block w-full sm:w-52">
        <span className="sr-only">Filter rooms by status</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RoomStatusFilter)}
          className="sa-student-action-btn w-full appearance-none rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-3.5 pr-9 text-[13px] font-medium text-heading backdrop-blur-md focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {ROOM_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-heading/50" />
      </label>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold text-heading xl:text-[28px]">View Rooms</h1>
          <nav aria-label="Breadcrumb" className="mt-1.5">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-medium text-heading/45">
              <li>
                <Link href="/dashboard/super-admin" className="transition-colors hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <li>
                <Link href={HOSTEL_BLOCKS_HREF} className="transition-colors hover:text-primary">
                  Hostel Blocks
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <li className="max-w-[40vw] truncate text-heading/70 sm:max-w-none">{blockName}</li>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <li aria-current="page" className="text-heading/70">
                Rooms
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={HOSTEL_BLOCKS_HREF} className={GLASS_BUTTON}>
            <ArrowLeft className="h-4 w-4" />
            Back to Hostel Blocks
          </Link>
          <button
            type="button"
            onClick={() => setModal({ type: "add" })}
            disabled={rooms === null}
            className={`${PRIMARY_BUTTON} disabled:opacity-60`}
          >
            <Plus className="h-4 w-4" />
            Add Room
          </button>
        </div>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4 xl:gap-4">
        {summaryCards.map(({ id, label, value, caption, Icon, progress }) => (
          <div
            key={id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] sa-dashboard-card sa-dashboard-card--stat border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white hover:shadow-xl xl:p-5"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/45 xl:text-[11.5px]">
                {label}
              </p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="relative z-10 mt-3 text-2xl font-bold tracking-tight text-heading xl:text-[28px]">
              {value}
            </p>
            {progress !== undefined ? (
              <div className="relative z-10 mt-3 h-2 w-full overflow-hidden rounded-full bg-heading/[0.08]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            ) : (
              <p className="relative z-10 mt-2 truncate text-[12px] font-medium text-heading/50">{caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Rooms */}
      <DashboardCard
        title={`Rooms in ${blockName}`}
        subtitle={
          rooms === null
            ? "Loading rooms"
            : rooms.length === 0
              ? "No rooms yet"
              : `Showing ${visibleRooms.length} of ${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`
        }
        icon={<Building2 className="h-[18px] w-[18px]" />}
        action={rooms && rooms.length > 0 ? toolbar : undefined}
        className="sa-dashboard-card sa-dashboard-card--pearl"
        headerClassName="flex-col items-stretch lg:flex-row lg:items-center"
        bodyClassName="px-[15px] pb-4 pt-4 sm:px-[19px] sm:pb-5"
      >
        <div aria-live="polite">
          {rooms === null && !failure ? (
            <div
              aria-busy="true"
              aria-label="Loading rooms"
              className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[230px] animate-pulse rounded-[20px] bg-slate-200/50" />
              ))}
            </div>
          ) : failure && rooms === null ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-heading">
                  {failure.notFound ? "Hostel block not found" : "Couldn't load rooms"}
                </p>
                <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">{failure.message}</p>
              </div>
              {failure.notFound ? (
                <Link href={HOSTEL_BLOCKS_HREF} className={GLASS_BUTTON}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Hostel Blocks
                </Link>
              ) : (
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={GLASS_BUTTON}>
                  Try again
                </button>
              )}
            </div>
          ) : roomList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <DoorOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-heading">No rooms in {blockName} yet</p>
                <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">
                  Add the first room to start assigning students to this block.
                </p>
              </div>
              <button type="button" onClick={() => setModal({ type: "add" })} className={PRIMARY_BUTTON}>
                <Plus className="h-4 w-4" />
                Add Room
              </button>
            </div>
          ) : visibleRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-heading">No rooms match your search</p>
                <p className="mt-1 max-w-sm text-[12.5px] font-medium text-heading/50">
                  {query.trim()
                    ? `Nothing matched “${query.trim()}”${statusFilter !== "all" ? " with this status filter" : ""}.`
                    : "No rooms have this status."}{" "}
                  Try a different room number or status.
                </p>
              </div>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className={GLASS_BUTTON}>
                  Clear search & filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-3.5">
              {visibleRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onViewStudents={(r) => setModal({ type: "students", roomId: r.id })}
                  onEdit={(r) => setModal({ type: "edit", roomId: r.id })}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Modals — mounted only while open, so each open starts with fresh form state */}
      {modal?.type === "add" && (
        <RoomFormModal
          mode="add"
          blockName={blockName}
          takenRoomNumbers={roomList.map((r) => r.roomNumber)}
          onClose={() => setModal(null)}
          onSubmit={(values) => submitRoom({ mode: "add" }, values)}
        />
      )}
      {modal?.type === "edit" && editingRoom && (
        <RoomFormModal
          key={editingRoom.id}
          mode="edit"
          blockName={blockName}
          room={editingRoom}
          takenRoomNumbers={roomList.filter((r) => r.id !== editingRoom.id).map((r) => r.roomNumber)}
          onClose={() => setModal(null)}
          onSubmit={(values) => submitRoom({ mode: "edit", id: editingRoom.id }, values)}
        />
      )}
      {modal?.type === "students" && studentsRoom && (
        <RoomStudentsModal key={studentsRoom.id} room={studentsRoom} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
