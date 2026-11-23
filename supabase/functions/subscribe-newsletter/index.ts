import { checkRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "info@affiliateguidance.com";
const FROM_ADDRESS = "Affiliate Guidance <onboarding@resend.dev>";

interface Body {
  email?: string;
  source?: string;
  postSlug?: string;
  postTitle?: string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Anti-abuse: subscribe-newsletter sends mail to arbitrary addresses, so it
  // is the most attractive abuse target. Cap to 3 per 10 minutes per IP.
  const rl = checkRateLimit(req, { windowMs: 10 * 60_000, max: 3, key: "subscribe" });
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
    const email = (body.email || "").trim().slice(0, 255).toLowerCase();
    const source = (body.source || "blog-post").trim().slice(0, 80);
    const postSlug = (body.postSlug || "").trim().slice(0, 200);
    const postTitle = (body.postTitle || "").trim().slice(0, 280);

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1) Notify admin about the new subscriber
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;background:#fff">
        <h2 style="margin:0 0 12px;color:#111">New newsletter subscriber</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333">
          <tr><td style="padding:6px 0;width:120px;color:#666">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Source</td><td>${escapeHtml(source)}</td></tr>
          ${postSlug ? `<tr><td style="padding:6px 0;color:#666">Post slug</td><td>${escapeHtml(postSlug)}</td></tr>` : ""}
          ${postTitle ? `<tr><td style="padding:6px 0;color:#666">Post title</td><td>${escapeHtml(postTitle)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#666">Time</td><td>${new Date().toISOString()}</td></tr>
        </table>
      </div>`;

    const adminResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [ADMIN_EMAIL],
        reply_to: email,
        subject: `📨 New subscriber: ${email}`,
        html: adminHtml,
      }),
    });
    const adminData = await adminResp.json().catch(() => ({}));
    if (!adminResp.ok) {
      console.error("Resend admin error", adminResp.status, adminData);
    }

    // 2) Send welcome / confirmation to the subscriber
    const welcomeHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#fff;color:#1a1a1a">
        <h2 style="margin:0 0 12px;font-size:22px">🎉 Welcome aboard!</h2>
        <p style="font-size:15px;line-height:1.6;margin:0 0 14px">
          ধন্যবাদ subscribe করার জন্য! আপনি এখন থেকে affiliate marketing-এর সাপ্তাহিক টিপস,
          নতুন রিভিউ ও টুলস আপডেট সরাসরি আপনার inbox-এ পাবেন।
        </p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 14px">
          শীঘ্রই আমাদের ফ্রি অ্যাফিলিয়েট গাইড PDF-ও পাঠানো হবে।
        </p>
        <p style="font-size:13px;color:#666;margin-top:24px">— Affiliate Guidance Team</p>
      </div>`;

    const userResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [email],
        subject: "🎉 You're subscribed — Affiliate Guidance",
        html: welcomeHtml,
      }),
    });
    const userData = await userResp.json().catch(() => ({}));
    if (!userResp.ok) {
      console.error("Resend welcome error", userResp.status, userData);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("subscribe-newsletter error", msg);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
