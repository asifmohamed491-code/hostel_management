// lib/hostel-rooms.ts
//
// Shared (client + server) types and PURE helpers for rooms and blocks, so
// the API and the UI always calculate status / occupancy the same way.
//
// Data model facts (inspected, not assumed):
//  - Room has only roomNumber (globally unique), hostelBlock (name string)
//    and capacity. There is NO floor field and NO occupants field.
//  - A student is "in" a room when User.roomNumber === Room.roomNumber (the
//    same rule the Super Admin dashboard stats use). Occupied beds are
//    therefore always DERIVED from students, never stored.

export type RoomStatus = "available" | "partial" | "full";
export type RoomStatusFilter = "all" | RoomStatus;

export interface RoomRow {
  id: string;
  roomNumber: string;
  hostelBlock: string;
  capacity: number;
  /** Number of students currently assigned to this room (derived). */
  occupied: number;
}

export interface RoomStudent {
  id: string;
  fullName: string;
  registerNumber: string | null;
  department: string | null;
  year: string | null;
  roomNumber: string;
}

export interface RoomsSummary {
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercent: number;
}

export interface BlockSummary extends RoomsSummary {
  /** HostelBlock _id, or null for a block that only exists as a name on rooms/students. */
  id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  registered: boolean;
  wardens: number;
}

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  available: "Available",
  partial: "Partially Occupied",
  full: "Full",
};

export const ROOM_FILTER_OPTIONS: { value: RoomStatusFilter; label: string }[] = [
  { value: "all", label: "All Rooms" },
  { value: "available", label: "Available" },
  { value: "partial", label: "Partially Occupied" },
  { value: "full", label: "Full" },
];

/** Sanity bounds for the capacity input (the Room schema itself has none). */
export const ROOM_CAPACITY_LIMITS = { min: 1, max: 20 } as const;

function safeCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function getRoomStatus(room: Pick<RoomRow, "capacity" | "occupied">): RoomStatus {
  const occupied = safeCount(room.occupied);
  if (occupied <= 0) return "available";
  if (occupied >= safeCount(room.capacity)) return "full";
  return "partial";
}

/** 0–100, never NaN: zero / invalid capacity gives 0. */
export function getOccupancyPercent(room: Pick<RoomRow, "capacity" | "occupied">): number {
  const capacity = safeCount(room.capacity);
  if (capacity === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((safeCount(room.occupied) / capacity) * 100)));
}

export function summarizeRooms(
  rooms: Pick<RoomRow, "capacity" | "occupied">[]
): RoomsSummary {
  const totalCapacity = rooms.reduce((sum, r) => sum + safeCount(r.capacity), 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + safeCount(r.occupied), 0);
  const availableBeds = rooms.reduce(
    (sum, r) => sum + Math.max(0, safeCount(r.capacity) - safeCount(r.occupied)),
    0
  );
  return {
    totalRooms: rooms.length,
    totalCapacity,
    occupiedBeds,
    availableBeds,
    occupancyPercent:
      totalCapacity === 0 ? 0 : Math.min(100, Math.round((occupiedBeds / totalCapacity) * 100)),
  };
}

export function compareRoomNumbers(a: Pick<RoomRow, "roomNumber">, b: Pick<RoomRow, "roomNumber">): number {
  return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: "base" });
}
