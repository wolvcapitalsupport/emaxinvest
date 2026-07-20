// Handles Supabase Database Webhooks for the Investment, WithdrawalRequest,
// and UserProfile tables, and routes each insert/status-change to the
// correct branded transactional email (+ admin notification where relevant).
//
// Set up via Dashboard: Database -> Webhooks -> Create a new hook, once per
// table (Investment, WithdrawalRequest, UserProfile), each on INSERT and
// UPDATE, calling this function's URL with header
// "x-webhook-secret: <DB_WEBHOOK_SECRET>". See EMAIL_SYSTEM_README.md for
// the exact settings.
//
// Deploy: supabase functions deploy db-email-webhook --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=... DB_WEBHOOK_SECRET=... APP_BASE_URL=https://emaxinvest.site

import { createClient } from "jsr:@supabase/supabase-js@2";
import { BRAND, sendEmail } from "../_shared/email.ts";
import {
  accountStatusChangedEmail,
  adminNewInvestmentEmail,
  adminNewWithdrawalEmail,
  investmentApprovedEmail,
  investmentPausedEmail,
  investmentRejectedEmail,
  investmentResumedEmail,
  investmentSubmittedEmail,
  kycApprovedEmail,
  kycRejectedEmail,
  principalReleaseApprovedEmail,
  principalReleaseRejectedEmail,
  withdrawalApprovedEmail,
  withdrawalPaidEmail,
  withdrawalRejectedEmail,
  withdrawalSubmittedEmail,
} from "../_shared/templates.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const WEBHOOK_SECRET = Deno.env.get("DB_WEBHOOK_SECRET") || "";

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: any;
  old_record: any | null;
};

Deno.serve(async (req: Request) => {
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
  } else {
    console.error("DB_WEBHOOK_SECRET not set — accepting request unverified. Set this secret before going live.");
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400 });
  }

  const { type, table, record, old_record } = payload;

  try {
    if (table === "Investment") await handleInvestment(type, record, old_record);
    else if (table === "WithdrawalRequest") await handleWithdrawal(type, record, old_record);
    else if (table === "UserProfile") await handleUserProfile(type, record, old_record);
    else if (table === "kyc_verifications") await handleKycVerification(type, record, old_record);
    else console.log(`db-email-webhook: no handler for table "${table}", ignoring`);
  } catch (err) {
    // Never let an email failure surface as an error to the DB webhook
    // caller — the underlying row write already succeeded and must not be
    // affected by mail delivery problems.
    console.error("db-email-webhook handler error", err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});

async function handleInvestment(type: string, record: any, old: any | null) {
  if (type === "INSERT" && record.status === "pending") {
    await sendIfEmail(record.user_email, investmentSubmittedEmail(record));
    await sendIfEmail(BRAND.adminNotifyEmail, adminNewInvestmentEmail(record));
    return;
  }

  if (type === "UPDATE" && old) {
    if (old.status === "pending" && record.status === "active") {
      await sendIfEmail(record.user_email, investmentApprovedEmail(record));
      return;
    }
    if (old.status === "pending" && record.status === "rejected") {
      await sendIfEmail(record.user_email, investmentRejectedEmail(record));
      return;
    }
    if (old.status === "matured_awaiting_release" && record.status === "completed") {
      if (record.principal_released) {
        await sendIfEmail(record.user_email, principalReleaseApprovedEmail(record));
      } else {
        await sendIfEmail(record.user_email, principalReleaseRejectedEmail(record));
      }
      return;
    }
    if (!old.paused && record.paused) {
      await sendIfEmail(record.user_email, investmentPausedEmail(record));
      return;
    }
    if (old.paused && !record.paused) {
      await sendIfEmail(record.user_email, investmentResumedEmail(record));
      return;
    }
  }
}

async function handleWithdrawal(type: string, record: any, old: any | null) {
  if (type === "INSERT" && record.status === "pending") {
    await sendIfEmail(record.user_email, withdrawalSubmittedEmail(record));
    await sendIfEmail(BRAND.adminNotifyEmail, adminNewWithdrawalEmail(record));
    return;
  }

  if (type === "UPDATE" && old) {
    if (old.status === "pending" && record.status === "approved") {
      await sendIfEmail(record.user_email, withdrawalApprovedEmail(record));
      return;
    }
    if (old.status === "pending" && record.status === "rejected") {
      await sendIfEmail(record.user_email, withdrawalRejectedEmail(record));
      return;
    }
    if (old.status === "approved" && record.status === "paid") {
      await sendIfEmail(record.user_email, withdrawalPaidEmail(record));
      return;
    }
  }
}

async function handleUserProfile(type: string, record: any, old: any | null) {
  if (type !== "UPDATE" || !old) return;
  if (record.account_status && record.account_status !== old.account_status) {
    await sendIfEmail(record.user_email, accountStatusChangedEmail(record));
  }
}

async function handleKycVerification(type: string, record: any, old: any | null) {
  if (type !== "UPDATE" || !old) return;
  if (record.status === old.status) return;
  if (record.status !== "approved" && record.status !== "rejected") return;

  const { data: profiles } = await adminClient
    .from("UserProfile")
    .select("user_email, full_name")
    .eq("user_id", record.user_id)
    .limit(1);
  const profile = profiles?.[0];
  if (!profile?.user_email) {
    console.error("No UserProfile found for kyc_verifications.user_id:", record.user_id);
    return;
  }

  const email =
    record.status === "approved"
      ? kycApprovedEmail({ name: profile.full_name || profile.user_email.split("@")[0], email: profile.user_email })
      : kycRejectedEmail({
          name: profile.full_name || profile.user_email.split("@")[0],
          email: profile.user_email,
          reason: record.result,
        });

  await sendIfEmail(profile.user_email, email);
}

async function sendIfEmail(to: string | undefined | null, email: { subject: string; html: string }) {
  if (!to) {
    console.error("Missing recipient for email:", email.subject);
    return;
  }
  const result = await sendEmail({ to, subject: email.subject, html: email.html });
  if (!result.ok) {
    console.error(`Failed to send "${email.subject}" to ${to}:`, result.error);
  }
}
