import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // These two account-creation pages must render the full-screen Auth
  // layout (same as /signup), not the Dashboard layout — but their URLs
  // still need to live under /dashboard/... so they match each role's
  // home-path prefix. Since every route physically inside app/dashboard/
  // always inherits app/dashboard/layout.tsx (Next.js nested layouts
  // can't be opted out of from a child segment), the actual pages live
  // at the top level (app/students/create, app/wardens/create) and are
  // rewritten here — the browser URL is unchanged, only the internally
  // matched route differs, so no Sidebar/Topbar is ever rendered for
  // these two pages.
  async rewrites() {
    return [
      {
        source: "/dashboard/warden/students/create",
        destination: "/students/create",
      },
      {
        source: "/dashboard/super-admin/wardens/create",
        destination: "/wardens/create",
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  // Source service worker — compiled into public/sw.js at build time.
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // The dev server + a live service worker fight each other (stale
  // caches vs. Fast Refresh), so the SW is only built/registered in
  // production. This is the standard Serwist/Next.js recommendation.
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

export default withSerwist(nextConfig);