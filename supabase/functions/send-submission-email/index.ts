/**
 * Generic submission notification email via Resend.
 *
 * Two submission types:
 *   - "guest_post"  → routed to GUEST_POST_RECEIVER_EMAIL
 *   - "sponsored"   → routed to SPONSORED_RECEIVER_EMAIL
 *
 * Optional `attachment` (base64) is forwarded to Resend as an email attachment
 * — used for guest-post .docx uploads.
 */
import { checkRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SubmissionType = "guest_post" | "sponsored";

interface Attachment {
  filename: string;
  // Base64-encoded file content (no data: prefix). Resend accepts this directly.
  content: string;
  contentType?: string;
}

interface Body {
  type?: SubmissionType;
  // Free-form key/value payload — rendered into the email body
  payload?: Record<string, string>;
  // For guest-post replies & for sponsorship deal correspondence
  replyTo?: string;
  attachment?: Attachment | null;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Soft size limit: Resend rejects >40MB raw; cap base64 payload at ~14MB
// (≈10MB binary). If you need bigger files, switch to upload-to-storage flow.
const MAX_ATTACHMENT_B64_BYTES = 14 * 1024 * 1024;

const renderRows = (payload: Record<string, string>) =>
  Object.entries(payload)
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 12px 8px 0;color:#666;vertical-align:top;width:140px;text-transform:capitalize">
            ${escapeHtml(k.replace(/_/g, " "))}
          </td>
          <td style="padding:8px 0;color:#222;white-space:pre-wrap;word-break:break-word">
            ${escapeHtml(v)}
          </td>
        </tr>`,
    )
    .join("");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Anti-abuse: cap form submissions per IP (5 per 10 minutes).
  const rl = checkRateLimit(req, { windowMs: 10 * 60_000, max: 5, key: "submission" });
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

    const body = (await req.json().catch(() => ({}))) as Body;
    const type = body.type;
    if (type !== "guest_post" && type !== "sponsored") {
      return new Response(
        JSON.stringify({ error: "Invalid submission type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const receiver =
      type === "guest_post"
        ? Deno.env.get("GUEST_POST_RECEIVER_EMAIL")
        : Deno.env.get("SPONSORED_RECEIVER_EMAIL");

    if (!receiver || !emailRe.test(receiver)) {
      return new Response(
        JSON.stringify({
          error: `Receiver email not configured for ${type} submissions.`,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = body.payload ?? {};
    if (!payload || Object.keys(payload).length === 0) {
      return new Response(
        JSON.stringify({ error: "Empty submission payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const replyTo = (body.replyTo || "").trim();
    if (replyTo && !emailRe.test(replyTo)) {
      return new Response(
        JSON.stringify({ error: "Invalid reply-to email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate attachment if present
    const attachments: Attachment[] = [];
    if (body.attachment && body.attachment.content && body.attachment.filename) {
      if (body.attachment.content.length > MAX_ATTACHMENT_B64_BYTES) {
        return new Response(
          JSON.stringify({ error: "Attachment too large (max ~10MB)." }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      attachments.push({
        filename: body.attachment.filename.slice(0, 200),
        content: body.attachment.content,
        contentType:
          body.attachment.contentType ||
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    }

    const heading =
      type === "guest_post"
        ? "📝 New Guest Post Submission"
        : "💼 New Sponsored Content Inquiry";

    const subject =
      type === "guest_post"
        ? `Guest Post: ${payload.title || payload.name || "New submission"}`
        : `Sponsored Inquiry: ${payload.company || payload.name || "New inquiry"}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;background:#fff;color:#222">
        <h2 style="margin:0 0 16px;color:#111;font-size:20px">${heading}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${renderRows(payload)}
        </table>
        ${
          attachments.length > 0
            ? `<p style="margin-top:18px;font-size:13px;color:#555">📎 Attached: ${escapeHtml(attachments[0].filename)}</p>`
            : ""
        }
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
        <p style="font-size:12px;color:#888;margin:0">Sent via Affiliate Guidance — ${type.replace("_", " ")} form</p>
      </div>`;

    const resendBody: Record<string, unknown> = {
      from: "Affiliate Guidance <onboarding@resend.dev>",
      to: [receiver],
      subject,
      html,
    };
    if (replyTo) resendBody.reply_to = replyTo;
    if (attachments.length > 0) resendBody.attachments = attachments;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendBody),
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
    console.error("send-submission-email error", msg);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
