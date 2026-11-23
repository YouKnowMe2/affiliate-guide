/**
 * Best-effort in-memory IP rate limiter for edge functions.
 *
 * Edge functions run in isolates that may be reused across requests, so this
 * Map persists between invocations on the same instance. It does NOT
 * coordinate across instances — for stronger guarantees use a KV store.
 *
 * Usage:
 *   const rl = checkRateLimit(req, { windowMs: 60_000, max: 5 });
 *   if (!rl.ok) return new Response(JSON.stringify({ error: rl.message }),
 *     { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5000;

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
  message: string;
}

export function checkRateLimit(
  req: Request,
  opts: { windowMs: number; max: number; key?: string },
): RateLimitResult {
  const ip = clientIp(req);
  const key = `${opts.key ?? "default"}:${ip}`;
  const now = Date.now();

  // Garbage-collect oldest entries if the map grows unbounded
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
      if (buckets.size <= MAX_KEYS / 2) break;
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, retryAfterSeconds: 0, message: "" };
  }
  if (existing.count >= opts.max) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      message: "Too many requests. Please try again later.",
    };
  }
  existing.count += 1;
  return { ok: true, retryAfterSeconds: 0, message: "" };
}
