// Admin-only: send a branded email to a single user or broadcast to every
// user. Called from the "Send Email" tab in Admin.jsx via
// supabase.functions.invoke("admin-send-email", { body }).
//
// SECURITY: this function is deployed WITH JWT verification (i.e. deploy
// WITHOUT --no-verify-jwt), so Supabase's gateway rejects any request that
// isn't from an authenticated user before it even reaches this code. We
// then additionally check the caller actually has the admin role — anyone
// authenticated but not admin gets a 403. This is the only edge function in
// the project that can message every user at once, so it deliberately has
// the strictest checks.
//
// Deploy: supabase functions deploy admin-send-email
// (no --no-verify-jwt flag — this one requires a valid user JWT)
// Secrets used: RESEND_API_KEY (already set), SUPABASE_URL + SUPABASE_ANON_KEY
// + SUPABASE_SERVICE_ROLE_KEY (all provided automatically by Supabase, no
// need to set these yourself)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email.ts";
import {
  accountStatusChangedEmail,
  adminCustomEmail,
  investmentApprovedEmail,
  investmentRejectedEmail,
  principalReleaseApprovedEmail,
  principalReleaseRejectedEmail,
  withdrawalApprovedEmail,
  withdrawalPaidEmail,
  withdrawalRejectedEmail,
} from "../_shared/templates.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Templates that require pre-existing structured data (mirrors the
// "resend a transactional email manually" use case). Each maps to a small
// set of fields the admin fills in on the frontend.
const TEMPLATE_BUILDERS: Record<string, (data: any) => { subject: string; html: string }> = {
  investment_approved: investmentApprovedEmail,
  investment_rejected: investmentRejectedEmail,
  principal_release_approved: principalReleaseApprovedEmail,
  principal_release_rejected: principalReleaseRejectedEmail,
  withdrawal_approved: withdrawalApprovedEmail,
  withdrawal_rejected: withdrawalRejectedEmail,
  withdrawal_paid: withdrawalPaidEmail,
  account_status_changed: accountStatusChangedEmail,
};

function buildEmailForRecipient(body: any, recipientName: string, recipientEmail: string) {
  if (body.mode === "template") {
    const builder = TEMPLATE_BUILDERS[body.templateId];
    if (!builder) throw new Error(`Unknown templateId: ${body.templateId}`);
    // Merge admin-provided fields with this recipient's identity so the
    // same shared templates used by db-email-webhook work here too.
    const data = {
      ...body.templateData,
      user_name: recipientName,
      user_email: recipientEmail,
      full_name: recipientName,
    };
    return builder(data);
  }
  // freeform
  return adminCustomEmail({
    name: recipientName,
    subject: body.subject || "A message from EMAX Invest",
    message: body.message || "",
  });
}

async function sendInChunks(recipients: { email: string; name: string }[], body: any) {
  const results: { email: string; ok: boolean; error?: string }[] = [];
  const CHUNK_SIZE = 8;
  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);
    const settled = await Promise.all(
      chunk.map(async (r) => {
        try {
          const { subject, html } = buildEmailForRecipient(body, r.name, r.email);
          const result = await sendEmail({ to: r.email, subject, html });
          return { email: r.email, ok: result.ok, error: result.error };
        } catch (err) {
          return { email: r.email, ok: false, error: String(err) };
        }
      })
    );
    results.push(...settled);
    // Small pause between chunks to stay well under Resend's rate limits.
    if (i + CHUNK_SIZE < recipients.length) {
      await new Promise((res) => setTimeout(res, 300));
    }
  }
  return results;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "missing authorization" }), {
      status: 401,
      headers: CORS_HEADERS,
    });
  }

  // Verify the caller's identity using their own JWT against the anon client.
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "invalid session" }), { status: 401, headers: CORS_HEADERS });
  }

  // Look up admin status server-side from the JWT's own metadata — mirrors
  // isAdminUser() in src/api/base44Client.js exactly. (UserProfile has no
  // `role` column, confirmed against the live schema, so we don't check it.)
  const roleCandidates = [
    userData.user.app_metadata?.role,
    userData.user.app_metadata?.user_role,
    userData.user.app_metadata?.account_role,
    userData.user.user_metadata?.role,
    userData.user.user_metadata?.user_role,
    userData.user.user_metadata?.account_role,
  ];
  const isAdmin = roleCandidates.some((r) => String(r || "").toLowerCase().trim() === "admin");

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "forbidden — admin only" }), {
      status: 403,
      headers: CORS_HEADERS,
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: CORS_HEADERS });
  }

  if (body.mode === "template" && !TEMPLATE_BUILDERS[body.templateId]) {
    return new Response(
      JSON.stringify({ error: `Unknown templateId. Valid options: ${Object.keys(TEMPLATE_BUILDERS).join(", ")}` }),
      { status: 400, headers: CORS_HEADERS }
    );
  }
  if (body.mode === "freeform" && !body.message) {
    return new Response(JSON.stringify({ error: "message is required for freeform mode" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  try {
    if (body.audience === "single") {
      if (!body.to) {
        return new Response(JSON.stringify({ error: "to is required for single audience" }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }
      const { data: recipientProfiles } = await adminClient
        .from("UserProfile")
        .select("user_email, full_name")
        .eq("user_email", body.to)
        .limit(1);
      const name = recipientProfiles?.[0]?.full_name || body.to.split("@")[0];

      const { subject, html } = buildEmailForRecipient(body, name, body.to);
      const result = await sendEmail({ to: body.to, subject, html });
      if (!result.ok) {
        return new Response(JSON.stringify({ error: result.error }), { status: 502, headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ ok: true, sent: 1 }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (body.audience === "broadcast") {
      const { data: allProfiles, error: listError } = await adminClient
        .from("UserProfile")
        .select("user_email, full_name");
      if (listError) throw listError;

      const seen = new Set<string>();
      const recipients = (allProfiles || [])
        .filter((p: any) => {
          if (!p.user_email || seen.has(p.user_email)) return false;
          seen.add(p.user_email);
          return true;
        })
        .map((p: any) => ({ email: p.user_email, name: p.full_name || p.user_email.split("@")[0] }));

      if (recipients.length === 0) {
        return new Response(JSON.stringify({ error: "no recipients found" }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }

      const results = await sendInChunks(recipients, body);
      const sent = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok);

      return new Response(
        JSON.stringify({ ok: true, sent, failedCount: failed.length, failed: failed.slice(0, 20) }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "audience must be 'single' or 'broadcast'" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error("admin-send-email error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
});
