// Edge Function: wp-revalidate
// Called by WordPress (e.g. via a webhook plugin) whenever content is
// published, updated or deleted. Bumps the public.cache_version row, which
// the website listens to via Realtime to instantly clear its caches.
//
// Auth: shared secret. Send via either:
//   - Header:  X-Revalidate-Secret: <WP_REVALIDATE_SECRET>
//   - Query:   ?secret=<WP_REVALIDATE_SECRET>
//
// Optional body (JSON): { reason?: string, slug?: string, type?: string }
// `reason` is stored alongside the version for debugging / observability.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-revalidate-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SECRET = Deno.env.get("WP_REVALIDATE_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SECRET || !SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: "Server is not configured" }, 500);
  }

  const url = new URL(req.url);
  const provided =
    req.headers.get("x-revalidate-secret") ??
    url.searchParams.get("secret") ??
    "";

  if (provided !== SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  let payload: { reason?: string; slug?: string; type?: string } = {};
  if (req.method === "POST") {
    try {
      payload = (await req.json()) as typeof payload;
    } catch {
      // ignore — body is optional
    }
  }

  const reason =
    [payload.type, payload.slug].filter(Boolean).join(":") ||
    payload.reason ||
    "manual";

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const version = Date.now();
  const { error } = await supabase
    .from("cache_version")
    .update({ version, updated_at: new Date().toISOString(), reason })
    .eq("id", 1);

  if (error) {
    console.error("Failed to bump cache_version:", error);
    return json({ error: "Failed to revalidate", details: error.message }, 500);
  }

  return json({ ok: true, version, reason });
});
