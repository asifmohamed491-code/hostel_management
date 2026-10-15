"use client";

// useHostelBlocks.ts
// Loads the hostel blocks that exist in MongoDB (GET /api/hostel-blocks)
// for the Create Warden form's dropdown, with loading + error + retry.
import { useCallback, useEffect, useState } from "react";

export interface UseHostelBlocksResult {
  blocks: string[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHostelBlocks(): UseHostelBlocksResult {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hostel-blocks", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            (body && typeof body.message === "string" && body.message) ||
              "Unable to load hostel blocks."
          );
        }
        setBlocks(Array.isArray(body?.blocks) ? (body.blocks as string[]) : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Unable to load hostel blocks."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { blocks, loading, error, reload };
}
