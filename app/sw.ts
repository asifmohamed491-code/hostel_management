import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// Declares the value of `injectionPoint` to TypeScript. Serwist's build
// step replaces `self.__SW_MANIFEST` with the real precache manifest
// (every hashed JS/CSS chunk Next.js produces) at build time.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: [
    // Every hashed static chunk Next.js built (JS, CSS, etc.) —
    // injected automatically by the Serwist build plugin.
    ...(self.__SW_MANIFEST ?? []),
    // Explicitly precache the auth entry points so they're available
    // immediately after install, even before the user has ever loaded
    // them online.
    { url: "/login", revision: "1" },
    { url: "/signup", revision: "1" },
    { url: "/manifest.webmanifest", revision: "1" },
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Runtime caching for everything requested after install: JS/CSS
  // chunks, web fonts, images, and other static assets, using
  // Serwist's recommended stale-while-revalidate / cache-first
  // strategies per asset type.
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        // If a page was never visited/precached and the network is
        // down, fall back to the login page rather than a blank tab —
        // this is what satisfies "the login page should still open
        // even if the connection is temporarily unavailable".
        url: "/login",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();