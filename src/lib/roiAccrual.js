import { base44 } from "@/api/base44Client";
import { computeDueRoiAccrual } from "@/lib/plans";

/**
 * Credits any ROI-days that have come due for a single active investment
 * directly into the investor's wallet balance, logs a transaction, and
 * marks the investment completed once fully matured and fully credited.
 * Safe to call repeatedly (idempotent) — it only credits new whole days.
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

  const updatedInvestment = await base44.entities.Investment.update(investment.id, {
    roi_days_credited: updatedRoiDaysCredited,
    roi_credited_date: new Date().toISOString(),
    ...(isComplete ? { status: "completed", roi_credited: true } : {}),
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

  return { investment: updatedInvestment || { ...investment, roi_days_credited: updatedRoiDaysCredited }, credited: due.creditAmount };
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
