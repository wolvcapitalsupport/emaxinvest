// Public edge function invoked directly from the Contact page (src/pages/Contact.jsx).
// Sends an admin-notify email and an auto-reply confirmation to the sender.
// Public/unauthenticated (contact page has no login), so this is deployed
// with --no-verify-jwt and instead relies on basic payload validation +
// Resend's own abuse protections. Consider adding rate limiting/captcha at
// the frontend if spam becomes an issue.
//
// Deploy: supabase functions deploy send-contact-email --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=...

import { BRAND, sendEmail } from "../_shared/email.ts";
import { contactAdminNotifyEmail, contactAutoReplyEmail } from "../_shared/templates.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: CORS_HEADERS });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!email || !message) {
    return new Response(JSON.stringify({ error: "email and message are required" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  // Minimal shape check — not exhaustive email validation, just guards
  // against obviously malformed submissions.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "invalid email" }), { status: 400, headers: CORS_HEADERS });
  }

  const admin = contactAdminNotifyEmail({ name, email, subject, message });
  const autoReply = contactAutoReplyEmail({ name, message });

  const [adminResult, replyResult] = await Promise.all([
    sendEmail({ to: BRAND.adminNotifyEmail, subject: admin.subject, html: admin.html, replyTo: email }),
    sendEmail({ to: email, subject: autoReply.subject, html: autoReply.html }),
  ]);

  if (!adminResult.ok) console.error("Failed to notify admin of contact submission:", adminResult.error);
  if (!replyResult.ok) console.error("Failed to send contact auto-reply:", replyResult.error);

  // Even if email delivery had issues, don't fail the user's submission —
  // log it server-side and return success so the UI doesn't show an error
  // for something outside their control.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
