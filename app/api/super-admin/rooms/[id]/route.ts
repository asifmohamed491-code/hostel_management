// app/api/super-admin/rooms/[id]/route.ts
//   PATCH /api/super-admin/rooms/:id — edit a room's number and/or capacity
//
// Student assignments are stored on the STUDENT (User.roomNumber), so this
// endpoint protects them instead of overwriting anything:
//  - capacity can't go below the number of students currently in the room
//  - a room that has students can't be renumbered (that would orphan them);
//    reassign the students first
// The room's block can't be changed here. Super Admin only.
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { roomUpdateSchema } from "@/lib/hostel-validation";
import { exactCaseInsensitive, toSingleRoomRow } from "@/lib/hostel-block-data";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const { id } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(id) || !isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid room ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = roomUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid room details." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const room = await Room.findById(id).select("roomNumber hostelBlock capacity").lean();
    if (!room) {
      return NextResponse.json({ message: "Room not found." }, { status: 404 });
    }

    const currentNumber = room.roomNumber.trim();
    const occupants = await User.countDocuments({ role: "student", roomNumber: currentNumber });
    const { roomNumber, capacity } = parsed.data;

    if (capacity !== undefined && capacity < occupants) {
      return NextResponse.json(
        {
          message: `${occupants} ${occupants === 1 ? "student is" : "students are"} assigned to this room, so its capacity can't be lower than ${occupants}.`,
        },
        { status: 409 }
      );
    }

    const renaming = roomNumber !== undefined && roomNumber !== currentNumber;

    if (renaming && occupants > 0) {
      return NextResponse.json(
        {
          message: "Students are assigned to this room, so its number can't be changed. Reassign them first.",
        },
        { status: 409 }
      );
    }

    if (
      renaming &&
      (await Room.exists({ roomNumber: exactCaseInsensitive(roomNumber), _id: { $ne: id } }))
    ) {
      return NextResponse.json(
        { message: "A room with this number already exists." },
        { status: 409 }
      );
    }

    const $set: Record<string, string | number> = {};
    if (roomNumber !== undefined) $set.roomNumber = roomNumber;
    if (capacity !== undefined) $set.capacity = capacity;

    await Room.updateOne({ _id: id }, { $set }, { runValidators: true });

    const updated = await Room.findById(id).select("roomNumber hostelBlock capacity").lean();
    if (!updated) {
      return NextResponse.json({ message: "Room not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Room updated successfully.", room: toSingleRoomRow(updated, occupants) },
      { status: 200 }
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: "A room with this number already exists." },
        { status: 409 }
      );
    }
    console.error("Update room error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
