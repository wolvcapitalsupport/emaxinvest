import { base44 } from "@/api/base44Client";
import { computeDueRoiAccrual, calcMaturityDate } from "@/lib/plans";

/**
 * Credits any ROI-days that have come due for a single active investment
 * directly into the investor's wallet balance, logs a transaction, and
 * once fully matured and fully credited, automatically rolls the original
 * principal over into a brand new cycle of the same plan (capital is never
 * paid out to the wallet — it compounds forward instead). Safe to call
 * repeatedly (idempotent) — it only credits new whole days.
 */
export const accrueInvestmentRoi = async (investment) => {
  const due = computeDueRoiAccrual(investment);
  if (!due || due.dueDays <= 0) {
    return { investment, credited: 0 };
  }

  const profiles = await base44.entities.UserProfile.filter({ user_id: investment.user_id });
  const profile = profiles[0];
  if (profile) {
    await base44.entities.UserProfile.update(profile.id, {
      wallet_balance: (profile.wallet_balance || 0) + due.creditAmount,
      total_roi_earned: (profile.total_roi_earned || 0) + due.creditAmount,
    });
  }

  const updatedRoiDaysCredited = (Number(investment.roi_days_credited) || 0) + due.dueDays;
  const isComplete = due.isFullyMatured && updatedRoiDaysCredited >= due.durationDays;

  // Foundation is a one-time onboarding cycle — it never auto-rolls over and
  // never auto-releases; the investor is prompted to choose their next plan.
  // Any other plan rolls over automatically unless the investor opted out,
  // in which case it goes into a pending admin-approved release instead.
  const isFoundation = investment.plan === "Foundation";
  const optedOut = !!investment.rollover_opt_out;
  const awaitingRelease = isComplete && !isFoundation && optedOut;

  const updatedInvestment = await base44.entities.Investment.update(investment.id, {
    roi_days_credited: updatedRoiDaysCredited,
    roi_credited_date: new Date().toISOString(),
    ...(isComplete
      ? {
          status: awaitingRelease ? "matured_awaiting_release" : "completed",
          roi_credited: true,
        }
      : {}),
  });

  await base44.entities.Transaction.create({
    user_id: investment.user_id,
    user_email: investment.user_email,
    investment_id: investment.id,
    type: "roi_credit",
    amount: due.creditAmount,
    description: `${investment.plan} plan — daily ROI accrual (${due.dueDays} day${due.dueDays > 1 ? "s" : ""})`,
    status: "completed",
  });

  let rolledOverInvestment = null;
  if (isComplete && !isFoundation && !optedOut) {
    rolledOverInvestment = await rolloverInvestment(investment);
  }

  if (awaitingRelease) {
    await base44.entities.Transaction.create({
      user_id: investment.user_id,
      user_email: investment.user_email,
      investment_id: investment.id,
      type: "adjustment",
      amount: 0,
      description: `${investment.plan} plan matured — principal release requested, pending admin approval`,
      status: "pending",
    });
  }

  return {
    investment: updatedInvestment || { ...investment, roi_days_credited: updatedRoiDaysCredited },
    credited: due.creditAmount,
    rolledOverInvestment,
  };
};

/**
 * Automatically reinvests the original principal into a brand new cycle of
 * the same plan once the previous cycle completes. Principal is never
 * released to the wallet — it compounds forward instead, only the daily
 * profit is ever withdrawable (see accrueInvestmentRoi above).
 */
export const rolloverInvestment = async (completedInvestment) => {
  const now = new Date().toISOString();
  const maturityDate = calcMaturityDate(now, completedInvestment.duration_days);

  const newInvestment = await base44.entities.Investment.create({
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
    maturity_date: maturityDate,
    roi_days_credited: 0,
    payment_method: completedInvestment.payment_method,
    admin_note: `Auto-renewed from investment ${completedInvestment.id} (principal rolled over, not withdrawn).`,
  });

  await base44.entities.Transaction.create({
    user_id: completedInvestment.user_id,
    user_email: completedInvestment.user_email,
    investment_id: newInvestment?.id || completedInvestment.id,
    type: "rollover",
    amount: completedInvestment.amount,
    description: `${completedInvestment.plan} plan matured — $${Number(completedInvestment.amount).toLocaleString()} principal automatically renewed into a new ${completedInvestment.duration_days}-day cycle`,
    status: "completed",
  });

  return newInvestment;
};

/**
 * Admin-approved release of principal for a matured investment that the
 * investor opted out of auto-rollover for. Credits the principal into the
 * investor's wallet_balance (making it withdrawable) and finalizes the
 * investment as completed + principal_released.
 */
export const approvePrincipalRelease = async (investment, adminNote) => {
  const profiles = await base44.entities.UserProfile.filter({ user_id: investment.user_id });
  const profile = profiles[0];
  if (profile) {
    await base44.entities.UserProfile.update(profile.id, {
      wallet_balance: (profile.wallet_balance || 0) + (Number(investment.amount) || 0),
    });
  }

  const updated = await base44.entities.Investment.update(investment.id, {
    status: "completed",
    principal_released: true,
    principal_released_date: new Date().toISOString(),
    admin_note: adminNote || "Principal release approved by admin",
  });

  await base44.entities.Transaction.create({
    user_id: investment.user_id,
    user_email: investment.user_email,
    investment_id: investment.id,
    type: "principal_release",
    amount: investment.amount,
    description: `${investment.plan} plan — principal released to wallet by admin approval`,
    status: "completed",
  });

  return updated;
};

/**
 * Admin rejection of a principal release request — the investor's capital
 * simply rolls over into a new cycle instead of being released.
 */
export const rejectPrincipalRelease = async (investment, adminNote) => {
  const rolledOver = await rolloverInvestment(investment);

  await base44.entities.Investment.update(investment.id, {
    status: "completed",
    admin_note: adminNote || "Principal release rejected — rolled over into a new cycle instead",
  });

  return rolledOver;
};


/**
 * Runs accrual across a list of investments, skipping any that are not
 * active. Returns the list with active investments replaced by their
 * post-accrual state (non-active investments pass through unchanged).
 */
export const accrueActiveInvestments = async (investments) => {
  const results = [];
  for (const inv of investments) {
    if (inv.status !== "active") {
      results.push(inv);
      continue;
    }
    try {
      const { investment: updated } = await accrueInvestmentRoi(inv);
      results.push(updated);
    } catch (error) {
      console.error("ROI accrual failed for investment", inv.id, error);
      results.push(inv);
    }
  }
  return results;
};
