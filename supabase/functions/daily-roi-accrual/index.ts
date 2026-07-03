// Supabase Edge Function: daily-roi-accrual
//
// Credits any ROI-days that have come due for every active Investment,
// directly into each investor's UserProfile.wallet_balance, logs a
// Transaction row, and marks investments completed once fully matured
// and fully credited. Mirrors the client-side logic in
// src/lib/plans.js (computeDueRoiAccrual) and src/lib/roiAccrual.js
// (accrueInvestmentRoi), so behavior stays consistent whether accrual
// is triggered by a user visiting the dashboard, an admin clicking
// "Run Daily Accrual", or this scheduled function.
//
// Deploy:
//   supabase functions deploy daily-roi-accrual --no-verify-jwt
//
// Required secrets (set once):
//   supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
//
// Schedule it with pg_cron + pg_net (see accompanying SQL snippet).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function resolveTimeline(investment: Record<string, any>) {
  const start = investment.approved_date
    ? new Date(investment.approved_date)
    : investment.created_date
      ? new Date(investment.created_date)
      : null;

  let end: Date | null = investment.maturity_date ? new Date(investment.maturity_date) : null;

  if (!end && start && investment.duration_days) {
    end = new Date(start);
    end.setDate(end.getDate() + Number(investment.duration_days));
  }

  return { start, end };
}

function computeDueRoiAccrual(investment: Record<string, any>) {
  if (!investment || investment.status !== "active") return null;

  const { start, end } = resolveTimeline(investment);
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const durationDays = Number(investment.duration_days) || 0;
  if (durationDays <= 0) return null;

  const now = new Date();
  const cappedNow = now < end ? now : end;
  const elapsedDays = Math.min(
    durationDays,
    Math.max(0, Math.floor((cappedNow.getTime() - start.getTime()) / MS_PER_DAY)),
  );

  const alreadyCredited = Number(investment.roi_days_credited) || 0;
  const dueDays = Math.max(0, elapsedDays - alreadyCredited);

  const principal = Number(investment.amount) || 0;
  const expectedReturn = Number(investment.expected_return) || principal;
  const dailyRate = Math.max(0, expectedReturn - principal) / durationDays;

  return {
    dueDays,
    creditAmount: dueDays * dailyRate,
    elapsedDays,
    durationDays,
    isFullyMatured: now >= end,
  };
}

async function rolloverInvestment(completedInvestment: Record<string, any>) {
  const now = new Date().toISOString();
  const maturityDate = new Date(now);
  maturityDate.setDate(maturityDate.getDate() + Number(completedInvestment.duration_days));

  const { data: created } = await supabase
    .from("Investment")
    .insert([
      {
        user_id: completedInvestment.user_id,
        user_email: completedInvestment.user_email,
        user_name: completedInvestment.user_name,
        plan: completedInvestment.plan,
        amount: completedInvestment.amount,
        roi_percentage: completedInvestment.roi_percentage,
        duration_days: completedInvestment.duration_days,
        expected_return: completedInvestment.expected_return,
        status: "active",
        approved_date: now,
        maturity_date: maturityDate.toISOString(),
        roi_days_credited: 0,
        payment_method: completedInvestment.payment_method,
        admin_note: `Auto-renewed from investment ${completedInvestment.id} (principal rolled over, not withdrawn).`,
      },
    ])
    .select();

  const newInvestment = created?.[0];

  await supabase.from("Transaction").insert([
    {
      user_id: completedInvestment.user_id,
      user_email: completedInvestment.user_email,
      investment_id: newInvestment?.id || completedInvestment.id,
      type: "rollover",
      amount: completedInvestment.amount,
      description: `${completedInvestment.plan} plan matured — $${Number(completedInvestment.amount).toLocaleString()} principal automatically renewed into a new ${completedInvestment.duration_days}-day cycle`,
      status: "completed",
    },
  ]);

  return newInvestment;
}

async function accrueInvestment(investment: Record<string, any>) {
  const due = computeDueRoiAccrual(investment);
  if (!due || due.dueDays <= 0) {
    return { id: investment.id, credited: 0 };
  }

  const { data: profiles } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("user_id", investment.user_id)
    .limit(1);

  const profile = profiles?.[0];
  if (profile) {
    await supabase
      .from("UserProfile")
      .update({
        wallet_balance: (profile.wallet_balance || 0) + due.creditAmount,
        total_roi_earned: (profile.total_roi_earned || 0) + due.creditAmount,
      })
      .eq("id", profile.id);
  }

  const updatedRoiDaysCredited = (Number(investment.roi_days_credited) || 0) + due.dueDays;
  const isComplete = due.isFullyMatured && updatedRoiDaysCredited >= due.durationDays;

  // Foundation is a one-time onboarding cycle — it never auto-rolls over and
  // never auto-releases; the investor is prompted client-side to choose
  // their next plan. Any other plan rolls over automatically unless the
  // investor opted out, in which case it awaits admin-approved release.
  const isFoundation = investment.plan === "Foundation";
  const optedOut = !!investment.rollover_opt_out;
  const awaitingRelease = isComplete && !isFoundation && optedOut;

  await supabase
    .from("Investment")
    .update({
      roi_days_credited: updatedRoiDaysCredited,
      roi_credited_date: new Date().toISOString(),
      ...(isComplete
        ? { status: awaitingRelease ? "matured_awaiting_release" : "completed", roi_credited: true }
        : {}),
    })
    .eq("id", investment.id);

  await supabase.from("Transaction").insert([
    {
      user_id: investment.user_id,
      user_email: investment.user_email,
      investment_id: investment.id,
      type: "roi_credit",
      amount: due.creditAmount,
      description: `${investment.plan} plan — daily ROI accrual (${due.dueDays} day${due.dueDays > 1 ? "s" : ""})`,
      status: "completed",
    },
  ]);

  let rolledOver = null;
  if (isComplete && !isFoundation && !optedOut) {
    rolledOver = await rolloverInvestment(investment);
  }

  if (awaitingRelease) {
    await supabase.from("Transaction").insert([
      {
        user_id: investment.user_id,
        user_email: investment.user_email,
        investment_id: investment.id,
        type: "adjustment",
        amount: 0,
        description: `${investment.plan} plan matured — principal release requested, pending admin approval`,
        status: "pending",
      },
    ]);
  }

  return { id: investment.id, credited: due.creditAmount, dueDays: due.dueDays, completed: isComplete, rolledOverTo: rolledOver?.id ?? null };
}

Deno.serve(async () => {
  try {
    const { data: activeInvestments, error } = await supabase
      .from("Investment")
      .select("*")
      .eq("status", "active");

    if (error) throw error;

    const results = [];
    for (const inv of activeInvestments ?? []) {
      try {
        results.push(await accrueInvestment(inv));
      } catch (err) {
        results.push({ id: inv.id, error: (err as Error).message });
      }
    }

    const creditedCount = results.filter((r) => "credited" in r && r.credited > 0).length;

    return new Response(
      JSON.stringify({ processed: results.length, credited: creditedCount, results }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
