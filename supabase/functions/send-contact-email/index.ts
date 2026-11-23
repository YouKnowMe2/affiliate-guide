import { checkRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL =
  Deno.env.get("SPONSORED_RECEIVER_EMAIL") || "info@affiliateguidance.com";

interface Body {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  recaptchaToken?: string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

async function verifyRecaptcha(token: string, ip?: string): Promise<{ ok: boolean; score?: number; error?: string }> {
  const secret = Deno.env.get("RECAPTCHA_SECRET_KEY");
  if (!secret) return { ok: false, error: "RECAPTCHA_SECRET_KEY not configured" };
  if (!token) return { ok: false, error: "Missing reCAPTCHA token" };
  try {
    const params = new URLSearchParams({ secret, response: token });
    if (ip) params.set("remoteip", ip);
    const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await r.json();
    if (!data.success) return { ok: false, error: "reCAPTCHA verification failed" };
    const score = typeof data.score === "number" ? data.score : 1;
    if (score < 0.5) return { ok: false, score, error: "Low reCAPTCHA score" };
    return { ok: true, score };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "verify error" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const rl = checkRateLimit(req, { windowMs: 10 * 60_000, max: 5, key: "contact" });
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: rl.message }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as Body;
    const name = (body.name || "").trim().slice(0, 200);
    const email = (body.email || "").trim().slice(0, 255);
    const subject = (body.subject || "").trim().slice(0, 200);
    const message = (body.message || "").trim().slice(0, 5000);
    const recaptchaToken = (body.recaptchaToken || "").trim();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !emailRe.test(email) || !message) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid name, email and message." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      undefined;
    const captcha = await verifyRecaptcha(recaptchaToken, ip);
    if (!captcha.ok) {
      console.warn("reCAPTCHA failed", captcha);
      return new Response(
        JSON.stringify({ error: captcha.error || "reCAPTCHA verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const subj = subject || `New contact form message from ${name}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;background:#fff">
        <h2 style="margin:0 0 12px;color:#111">New contact form submission</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333">
          <tr><td style="padding:6px 0;width:90px;color:#666">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Subject</td><td>${escapeHtml(subj)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">reCAPTCHA score</td><td>${captcha.score ?? "n/a"}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
        <p style="white-space:pre-wrap;font-size:14px;line-height:1.6;color:#222">${escapeHtml(message)}</p>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Affiliate Guidance <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        reply_to: email,
        subject: subj,
        html,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("Resend error", resp.status, data);
      return new Response(
        JSON.stringify({ error: "Failed to send message. Please try again later." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("send-contact-email error", msg);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
