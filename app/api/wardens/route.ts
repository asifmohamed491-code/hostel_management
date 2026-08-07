// app/api/wardens/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthPayload, toSafeUser } from "@/lib/auth";
import { wardenSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (payload.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only a Super Admin can create Warden accounts." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = wardenSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid warden details." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Role is never taken from the client — always forced to "warden".
    const { fullName, phone, password } = parsed.data;

    const warden = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "warden",
    });

    return NextResponse.json({ user: toSafeUser(warden) }, { status: 201 });
  } catch (error) {
    console.error("Create warden error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
