// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { toSafeUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ message: "Session expired or invalid." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    return NextResponse.json({ user: toSafeUser(user) }, { status: 200 });
  } catch (error) {
    console.error("Fetch current user error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
