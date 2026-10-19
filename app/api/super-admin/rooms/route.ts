// app/api/super-admin/rooms/route.ts
//   GET  /api/super-admin/rooms?block=<block name> — that block's rooms with derived occupancy
//   POST /api/super-admin/rooms                    — create a room in an existing block
// Super Admin only. Room.roomNumber is unique across ALL blocks in the
// existing schema, so a duplicate number is rejected wherever it already is.
import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { HostelBlock } from "@/models/HostelBlock";
import { Room } from "@/models/Room";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { roomCreateSchema } from "@/lib/hostel-validation";
import {
  blockExists,
  exactCaseInsensitive,
  loadRoomRows,
  toSingleRoomRow,
} from "@/lib/hostel-block-data";

export const dynamic = "force-dynamic";

const SERVER_ERROR = { message: "Something went wrong. Please try again." };

export async function GET(request: NextRequest) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const block = (request.nextUrl.searchParams.get("block") ?? "").trim();
    if (!block || block.length > 60) {
      return NextResponse.json({ message: "A valid hostel block is required." }, { status: 400 });
    }

    await connectToDatabase();

    if (!(await blockExists(block))) {
      return NextResponse.json({ message: "Hostel block not found." }, { status: 404 });
    }

    const [rooms, details] = await Promise.all([
      loadRoomRows(block),
      HostelBlock.findOne({ name: block }).select("name code description").lean(),
    ]);

    return NextResponse.json(
      {
        block: {
          name: block,
          code: details?.code ?? null,
          description: details?.description?.trim() ? details.description.trim() : null,
          registered: Boolean(details),
        },
        rooms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List rooms error:", error);
    return NextResponse.json(SERVER_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const parsed = roomCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid room details." },
        { status: 400 }
      );
    }
    const { hostelBlock, roomNumber, capacity } = parsed.data;

    await connectToDatabase();

    if (!(await blockExists(hostelBlock))) {
      return NextResponse.json({ message: "Hostel block not found." }, { status: 404 });
    }

    if (await Room.exists({ roomNumber: exactCaseInsensitive(roomNumber) })) {
      return NextResponse.json(
        { message: "A room with this number already exists." },
        { status: 409 }
      );
    }

    const room = await Room.create({ roomNumber, hostelBlock, capacity });

    return NextResponse.json(
      {
        message: "Room created successfully.",
        room: toSingleRoomRow(
          { _id: room._id, roomNumber: room.roomNumber, hostelBlock: room.hostelBlock, capacity: room.capacity },
          0
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: "A room with this number already exists." },
        { status: 409 }
      );
    }
    console.error("Create room error:", error);
    return NextResponse.json(SERVER_ERROR, { status: 500 });
  }
}
