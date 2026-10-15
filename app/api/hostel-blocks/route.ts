// app/api/hostel-blocks/route.ts
//
// GET /api/hostel-blocks — the hostel blocks that currently exist in
// MongoDB (see lib/hostel-blocks.ts), used by the Create/Edit Warden
// forms to populate the Hostel Block dropdown. Super Admin only.
import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthPayload } from "@/lib/auth";
import { listHostelBlocks } from "@/lib/hostel-blocks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (payload.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only a Super Admin can view hostel blocks." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    return NextResponse.json({ blocks: await listHostelBlocks() }, { status: 200 });
  } catch (error) {
    console.error("List hostel blocks error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
