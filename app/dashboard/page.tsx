// app/dashboard/page.tsx
// Not a dashboard UI page — this route only exists to send an
// authenticated user to their role's own dashboard, so there is a
// single stable "just log in and go here" URL. It reuses the same
// JWT verification used everywhere else (lib/jwt.ts) rather than
// re-implementing auth, and renders no dashboard content itself, so
// the Warden/Student/Super Admin dashboards each have exactly one
// route that renders them:
//   /dashboard/super-admin, /dashboard/warden, /dashboard/student
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import type { UserRole } from "@/models/User";

const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  super_admin: "/dashboard/super-admin",
  warden: "/dashboard/warden",
  student: "/dashboard/student",
};

export default async function DashboardIndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    redirect("/login");
  }

  redirect(ROLE_DASHBOARD_PATH[payload.role]);
}
