// app/api/super-admin/rooms/[id]/students/route.ts
//   GET /api/super-admin/rooms/:id/students — the students assigned to ONE room
// A student is assigned when User.roomNumber equals the room's number (the
// same rule the dashboard stats use). Only name, register number, department,
// year and room are returned — never the password/hash or any auth data.
// Super Admin only.
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { requireSuperAdmin } from "@/lib/require-super-admin";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const { id } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(id) || !isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid room ID." }, { status: 400 });
    }

    await connectToDatabase();

    const room = await Room.findById(id).select("roomNumber hostelBlock capacity").lean();
    if (!room) {
      return NextResponse.json({ message: "Room not found." }, { status: 404 });
    }

    const roomNumber = room.roomNumber.trim();
    const students = await User.find({ role: "student", roomNumber })
      .select("fullName registerNumber department year roomNumber")
      .sort({ fullName: 1 })
      .lean();

    return NextResponse.json(
      {
        room: {
          id: room._id.toString(),
          roomNumber,
          hostelBlock: room.hostelBlock.trim(),
          capacity: room.capacity,
        },
        students: students.map((s) => ({
          id: s._id.toString(),
          fullName: s.fullName,
          registerNumber: s.registerNumber?.trim() || null,
          department: s.department?.trim() || null,
          year: s.year?.trim() || null,
          roomNumber,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List room students error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
