import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

function getAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(request: NextRequest) {
  const payload = getAuth(request);
  if (!payload) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const notifications = await Notification.find({ recipient: payload.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        href: notification.href,
        read: Boolean(notification.readAt),
        createdAt: notification.createdAt,
      })),
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ message: "Could not load notifications." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const payload = getAuth(request);
  if (!payload) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const notificationId = typeof body?.notificationId === "string" ? body.notificationId : "";
  if (!notificationId) {
    return NextResponse.json({ message: "Notification id is required." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await Notification.updateOne(
      { _id: notificationId, recipient: payload.userId },
      { $set: { readAt: new Date() } }
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ message: "Could not update notification." }, { status: 500 });
  }
}