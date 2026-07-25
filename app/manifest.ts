import type { MetadataRoute } from "next";

// Next.js App Router's native manifest file convention. This is served
// automatically at /manifest.webmanifest and linked into <head> for us —
// no manual <link rel="manifest"> tag needed. This is the current
// recommended replacement for a static public/manifest.json under App
// Router (typed, colocated, and framework-managed).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OASYS Hostel Management",
    short_name: "OASYS",
    description: "Hostel Management System",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Matches the app's purple/lavender brand theme (see globals.css).
    background_color: "#F4F1FD",
    theme_color: "#6D28D9",
    lang: "en",
    icons: [
      { src: "/assets/logo/icon-72x72.png", sizes: "72x72", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-96x96.png", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-128x128.png", sizes: "128x128", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-144x144.png", sizes: "144x144", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-152x152.png", sizes: "152x152", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-180x180.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-384x384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/assets/logo/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable variants — safe-zone padded so Android's adaptive-icon
      // masks (circle, squircle, rounded square) never clip the mark.
      { src: "/assets/logo/maskable-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/assets/logo/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}