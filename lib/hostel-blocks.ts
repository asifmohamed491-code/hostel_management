// lib/hostel-blocks.ts
//
// Single source of truth for "which hostel blocks exist". There is no
// separate HostelBlock model in this project: a block is a plain name
// string stored on Room.hostelBlock and (for students/wardens) on
// User.hostelBlock. This uses the SAME definition as the Super Admin
// dashboard's "Total Hostel Blocks" stat (app/api/super-admin/stats):
// every registered HostelBlock plus every distinct, non-empty block name found
// on rooms or student accounts, trimmed and sorted — so the dropdown and that stat always
// agree. Callers must have connected to the database first.
import { HostelBlock } from "@/models/HostelBlock";
import { Room } from "@/models/Room";
import { User } from "@/models/User";

export async function listHostelBlocks(): Promise<string[]> {
  const [registeredBlocks, roomBlocks, studentBlocks] = await Promise.all([
    HostelBlock.distinct("name"),
    Room.distinct("hostelBlock"),
    User.distinct("hostelBlock", {
      role: "student",
      hostelBlock: { $exists: true, $ne: "" },
    }),
  ]);

  return Array.from(
    new Set(
      [...registeredBlocks, ...roomBlocks, ...studentBlocks]
        .map((b) => (typeof b === "string" ? b.trim() : ""))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}
