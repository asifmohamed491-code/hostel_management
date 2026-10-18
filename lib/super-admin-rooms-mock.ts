// lib/super-admin-rooms-mock.ts
//
// ╔══════════════════════════════════════════════════════════════════════╗
// ║  TEMPORARY MOCK DATA — UI PHASE ONLY. NOTHING HERE COMES FROM MONGODB ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// Powers the Super Admin "View Rooms" page (Manage Hostel Blocks -> View
// Rooms) while the backend is not connected. Every room and student below
// is generated locally and deterministically (no randomness, so server and
// client render identically). Delete this file's generators and replace the
// calls in SuperAdminRooms.tsx with API data in the next phase.
//
// MAPPING TO THE REAL DATA (for the backend phase)
// ┌────────────────────┬────────────────────────────────────────────────┐
// │ UI field           │ Real source                                    │
// ├────────────────────┼────────────────────────────────────────────────┤
// │ RoomRow.roomNumber │ Room.roomNumber (unique, string)               │
// │ RoomRow.hostelBlock│ Room.hostelBlock (string — there is NO         │
// │                    │ HostelBlock model; a block is just this name)  │
// │ RoomRow.capacity   │ Room.capacity (number, default 4)              │
// │ RoomRow.occupied   │ NOT stored on Room. Derive: count of           │
// │                    │ User{role:"student", hostelBlock, roomNumber}  │
// │ RoomRow.id         │ Room._id                                       │
// │ RoomStudent.*      │ User.fullName / registerNumber / department /  │
// │                    │ year / roomNumber (never the password)         │
// │ Floor              │ NOT in the Room model, so it is deliberately   │
// │                    │ not shown or edited anywhere in this UI.       │
// └────────────────────┴────────────────────────────────────────────────┘

export type RoomStatus = "available" | "partial" | "full";
export type RoomStatusFilter = "all" | RoomStatus;

export interface RoomRow {
  id: string;
  roomNumber: string;
  hostelBlock: string;
  capacity: number;
  /** MOCK: derived from assigned students in the real backend. */
  occupied: number;
}

export interface RoomStudent {
  id: string;
  fullName: string;
  registerNumber: string;
  department: string;
  year: string;
  roomNumber: string;
}

export interface RoomsSummary {
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercent: number;
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

/** UI-only sanity bounds for the capacity input (the Room schema has none). */
export const ROOM_CAPACITY_LIMITS = { min: 1, max: 20 } as const;

// ---------------------------------------------------------------- helpers

export function getRoomStatus(room: Pick<RoomRow, "capacity" | "occupied">): RoomStatus {
  if (room.occupied <= 0) return "available";
  if (room.occupied >= room.capacity) return "full";
  return "partial";
}

export function getOccupancyPercent(room: Pick<RoomRow, "capacity" | "occupied">): number {
  if (room.capacity <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((room.occupied / room.capacity) * 100)));
}

export function summarizeRooms(rooms: RoomRow[]): RoomsSummary {
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + Math.min(r.occupied, r.capacity), 0);
  return {
    totalRooms: rooms.length,
    totalCapacity,
    occupiedBeds,
    availableBeds: Math.max(0, totalCapacity - occupiedBeds),
    occupancyPercent: totalCapacity === 0 ? 0 : Math.round((occupiedBeds / totalCapacity) * 100),
  };
}

export function compareRoomNumbers(a: RoomRow, b: RoomRow): number {
  return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: "base" });
}

/** "Block A" -> "A"; "North Wing" -> "NW"; fallback "R". Used only to make mock room numbers. */
function getBlockPrefix(blockName: string): string {
  const stripped = blockName.replace(/^block\s+/i, "").trim();
  if (/^[A-Za-z0-9]{1,3}$/.test(stripped)) return stripped.toUpperCase();
  const initials = stripped
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return initials || "R";
}

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ---------------------------------------------------------- mock rooms

// 3 floors x 4 rooms, with a deliberate spread of Available / Partially
// Occupied / Full rooms so every badge and filter can be exercised.
const MOCK_CAPACITIES = [4, 4, 3, 6, 4, 4, 6, 3, 4, 2, 4, 6];
const MOCK_OCCUPIED = [4, 3, 0, 6, 2, 4, 1, 3, 0, 1, 2, 5];

/** MOCK: sample rooms for the selected block. Replace with GET rooms by block. */
export function getMockRoomsForBlock(blockName: string): RoomRow[] {
  const prefix = getBlockPrefix(blockName);
  return MOCK_CAPACITIES.map((capacity, index) => {
    const floor = Math.floor(index / 4) + 1;
    const roomNumber = `${prefix}-${floor}0${(index % 4) + 1}`;
    return {
      id: `mock-${prefix}-${roomNumber}`,
      roomNumber,
      hostelBlock: blockName,
      capacity,
      occupied: MOCK_OCCUPIED[index] ?? 0,
    };
  });
}

// -------------------------------------------------------- mock students

const MOCK_NAMES = [
  "Aarav Sharma", "Karthik Raman", "Mohammed Faizal", "Vikram Nair", "Sanjay Kumar",
  "Rohan Mehta", "Arjun Pillai", "Dinesh Babu", "Harish Venkat", "Imran Sheikh",
  "Naveen Reddy", "Pranav Iyer", "Suresh Menon", "Tarun Gupta", "Yusuf Ali",
  "Ganesh Murthy", "Lokesh Rao", "Manoj Prasad", "Nikhil Joseph", "Praveen Das",
  "Rahul Verma", "Siddharth Jain", "Varun Krishnan", "Ashwin Kannan", "Balaji Subramani",
  "Deepak Chandran", "Ezhil Arasu", "Gokul Raj", "Hemanth Kumar", "Jegan Paul",
];
const MOCK_DEPARTMENTS: { name: string; code: string }[] = [
  { name: "Computer Science", code: "CS" },
  { name: "Information Technology", code: "IT" },
  { name: "Electronics", code: "EC" },
  { name: "Mechanical", code: "ME" },
  { name: "Civil", code: "CE" },
  { name: "Electrical", code: "EE" },
];
const MOCK_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const FALLBACK_DEPARTMENT = { name: "Computer Science", code: "CS" };

/**
 * MOCK: sample students for a room — exactly `room.occupied` of them, seeded
 * by the room id so a renamed room keeps the same occupants. Replace with
 * GET students where hostelBlock + roomNumber match.
 */
export function getMockStudentsForRoom(room: RoomRow): RoomStudent[] {
  const seed = hashString(room.id);
  return Array.from({ length: Math.max(0, room.occupied) }, (_, i) => {
    const dept = MOCK_DEPARTMENTS[(seed + i * 5) % MOCK_DEPARTMENTS.length] ?? FALLBACK_DEPARTMENT;
    const yearIndex = (seed + i * 3) % MOCK_YEARS.length;
    const admissionYear = 25 - yearIndex; // 1st year -> 25 ... 4th year -> 22
    const serial = String(100 + ((seed + i * 37) % 900));
    return {
      id: `${room.id}-student-${i}`,
      fullName: MOCK_NAMES[(seed + i * 7) % MOCK_NAMES.length] ?? "Student",
      registerNumber: `OIT${admissionYear}${dept.code}${serial}`,
      department: dept.name,
      year: MOCK_YEARS[yearIndex] ?? "1st Year",
      roomNumber: room.roomNumber,
    };
  });
}
