import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
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