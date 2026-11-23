// Listens for cache version bumps from the wp-revalidate edge function and
// clears the React Query cache + persisted localStorage cache instantly so
// the next page load fetches fresh WordPress content.
// Also performs a periodic cache purge twice daily to guarantee fresh data.

import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ag.rq-cache";
const VERSION_KEY = "ag.cache-version";
const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 43,200,000 ms
const CHANNEL_NAME = "cache-version";

async function fetchCurrentVersion(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("cache_version")
      .select("version")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return Number((data as { version: number | string }).version) || null;
  } catch {
    return null;
  }
}

export function purgeAndRefetch(qc: QueryClient, newVersion: number) {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, String(newVersion));
  } catch {
    /* noop */
  }
  qc.clear();
  // Trigger refetches for any active queries on the current page
  qc.invalidateQueries();
}

export async function setupRevalidationListener(qc: QueryClient) {
  if (typeof window === "undefined") return;

  // 1) On boot, compare last-known version with server. If the server bumped
  //    while the user was away, wipe the persisted cache before queries run.
  const stored = Number(localStorage.getItem(VERSION_KEY) || 0);
  const current = await fetchCurrentVersion();
  if (current && current !== stored) {
    purgeAndRefetch(qc, current);
  }

  // 2) Subscribe to realtime updates so refreshes happen instantly while the
  //    user has the site open. Remove any existing channel first to avoid
  //    duplicate subscriptions in React Strict Mode.
  try {
    await supabase.removeChannel(supabase.channel(CHANNEL_NAME));
  } catch {
    /* noop — channel may not exist yet */
  }

  const channel = supabase
    .channel(CHANNEL_NAME)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "cache_version" },
      (payload) => {
        const next = Number(
          (payload.new as { version?: number | string })?.version ?? 0,
        );
        if (next && next !== Number(localStorage.getItem(VERSION_KEY) || 0)) {
          purgeAndRefetch(qc, next);
        }
      },
    )
    .subscribe();

  // 3) Periodic cache purge — twice daily (every 12 hours) — ensures users
  //    always see relatively fresh data even if no WordPress edits occurred.
  const periodicPurge = setInterval(() => {
    const nextVersion = Date.now();
    purgeAndRefetch(qc, nextVersion);
    console.log("[Cache] Periodic purge executed — version:", nextVersion);
  }, TWELVE_HOURS);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(periodicPurge);
  };
}
