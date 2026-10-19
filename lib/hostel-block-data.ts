// lib/hostel-block-data.ts
//
// Server-side data access for hostel blocks and rooms. Callers must have
// connected to the database (connectToDatabase) first.
//
// Everything about occupancy is DERIVED from real records on every request:
//   occupied beds of a room = students whose User.roomNumber equals
//   Room.roomNumber (same rule as the dashboard stats). No counters are
//   stored, so they can never drift out of sync.
import { HostelBlock } from "@/models/HostelBlock";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import {
  summarizeRooms,
  type BlockSummary,
  type RoomRow,
} from "@/lib/hostel-rooms";

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const exactCaseInsensitive = (value: string) =>
  new RegExp(`^${escapeRegex(value)}$`, "i");

function cleanNames(values: unknown[]): string[] {
  return values
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

/** Every block that exists: registered HostelBlocks + names found on rooms / students. */
export async function listBlockNames(): Promise<string[]> {
  const [registered, roomBlocks, studentBlocks] = await Promise.all([
    HostelBlock.distinct("name"),
    Room.distinct("hostelBlock"),
    User.distinct("hostelBlock", { role: "student", hostelBlock: { $exists: true, $ne: "" } }),
  ]);
  return Array.from(new Set(cleanNames([...registered, ...roomBlocks, ...studentBlocks]))).sort(
    (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}

export async function blockExists(name: string): Promise<boolean> {
  const [registered, room, student] = await Promise.all([
    HostelBlock.exists({ name }),
    Room.exists({ hostelBlock: name }),
    User.exists({ role: "student", hostelBlock: name }),
  ]);
  return Boolean(registered || room || student);
}

/** Students per room number (same grouping the dashboard stats use). */
export async function getStudentCountsByRoom(): Promise<Map<string, number>> {
  const rows = await User.aggregate<{ _id: string; count: number }>([
    { $match: { role: "student", roomNumber: { $exists: true, $ne: "" } } },
    { $group: { _id: "$roomNumber", count: { $sum: 1 } } },
  ]);
  const map = new Map<string, number>();
  for (const row of rows) map.set(String(row._id).trim(), row.count);
  return map;
}

async function getWardenCountsByBlock(): Promise<Map<string, number>> {
  const rows = await User.aggregate<{ _id: string; count: number }>([
    { $match: { role: "warden", hostelBlock: { $exists: true, $ne: "" } } },
    { $group: { _id: "$hostelBlock", count: { $sum: 1 } } },
  ]);
  const map = new Map<string, number>();
  for (const row of rows) map.set(String(row._id).trim(), row.count);
  return map;
}

interface RoomLean {
  _id: { toString(): string };
  roomNumber: string;
  hostelBlock: string;
  capacity: number;
}

function toRoomRow(room: RoomLean, counts: Map<string, number>): RoomRow {
  const roomNumber = room.roomNumber.trim();
  return {
    id: room._id.toString(),
    roomNumber,
    hostelBlock: room.hostelBlock.trim(),
    capacity: Number.isFinite(room.capacity) ? room.capacity : 0,
    occupied: counts.get(roomNumber) ?? 0,
  };
}

export function toSingleRoomRow(room: RoomLean, occupied: number): RoomRow {
  return toRoomRow(room, new Map([[room.roomNumber.trim(), occupied]]));
}

export async function loadRoomRows(blockName: string): Promise<RoomRow[]> {
  const [rooms, counts] = await Promise.all([
    Room.find({ hostelBlock: blockName }).select("roomNumber hostelBlock capacity").lean(),
    getStudentCountsByRoom(),
  ]);
  return rooms.map((room) => toRoomRow(room as unknown as RoomLean, counts));
}

export async function buildBlockSummaries(): Promise<BlockSummary[]> {
  const [names, registeredDocs, rooms, counts, wardens] = await Promise.all([
    listBlockNames(),
    HostelBlock.find({}).select("name code description").lean(),
    Room.find({}).select("roomNumber hostelBlock capacity").lean(),
    getStudentCountsByRoom(),
    getWardenCountsByBlock(),
  ]);

  const registered = new Map(registeredDocs.map((doc) => [doc.name.trim(), doc]));
  const roomsByBlock = new Map<string, RoomRow[]>();
  for (const room of rooms) {
    const row = toRoomRow(room as unknown as RoomLean, counts);
    const list = roomsByBlock.get(row.hostelBlock) ?? [];
    list.push(row);
    roomsByBlock.set(row.hostelBlock, list);
  }

  return names.map((name) => {
    const doc = registered.get(name);
    return {
      id: doc ? doc._id.toString() : null,
      name,
      code: doc?.code ?? null,
      description: doc?.description?.trim() ? doc.description.trim() : null,
      registered: Boolean(doc),
      wardens: wardens.get(name) ?? 0,
      ...summarizeRooms(roomsByBlock.get(name) ?? []),
    };
  });
}

export async function getBlockSummary(name: string): Promise<BlockSummary | null> {
  const all = await buildBlockSummaries();
  return all.find((b) => b.name === name) ?? null;
}
