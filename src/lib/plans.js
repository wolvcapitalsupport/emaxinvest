export const INVESTMENT_PLANS = [
  {
    name: "Foundation",
    amount: 1000,
    duration: 7,
    roi: 10,
    color: "from-slate-600 to-slate-700",
    badge: "Starter",
    description: "Begin your wealth journey with a secure short-term plan.",
    features: ["7-day cycle", "10% ROI", "Manual approval", "24/7 support"]
  },
  {
    name: "Growth",
    amount: 5000,
    duration: 30,
    roi: 15,
    color: "from-blue-700 to-blue-900",
    badge: "Popular",
    description: "A balanced plan delivering steady monthly returns.",
    features: ["30-day cycle", "15% ROI", "Priority approval", "Dedicated support"]
  },
  {
    name: "Accelerator",
    amount: 20000,
    duration: 60,
    roi: 20,
    color: "from-amber-700 to-amber-900",
    badge: "Premium",
    description: "Accelerate your wealth with high-yield bi-monthly returns.",
    features: ["60-day cycle", "20% ROI", "VIP approval", "Personal manager"]
  },
  {
    name: "Legacy",
    amount: 50000,
    duration: 120,
    roi: 48,
    color: "from-yellow-600 to-amber-700",
    badge: "Elite",
    description: "Our flagship plan for serious wealth builders.",
    features: ["120-day cycle", "48% ROI", "Instant VIP approval", "Elite concierge"]
  }
];

export const getPlanByName = (name) => INVESTMENT_PLANS.find(p => p.name === name);

export const calcExpectedReturn = (amount, roi) => {
  return amount + (amount * roi / 100);
};

export const calcMaturityDate = (approvedDate, durationDays) => {
  const d = new Date(approvedDate);
  d.setDate(d.getDate() + durationDays);
  return d.toISOString();
};

export const calcProgress = (approvedDate, maturityDate) => {
  const now = new Date();
  const start = new Date(approvedDate);
  const end = new Date(maturityDate);
  const total = end - start;
  if (!Number.isFinite(total) || total <= 0) {
    return 0;
  }
  const elapsed = now - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

export const isMatured = (maturityDate) => {
  return new Date() >= new Date(maturityDate);
};

const toValidDate = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const resolveInvestmentTimeline = (investment) => {
  if (!investment) {
    return { start: null, end: null };
  }

  const start = toValidDate(investment.approved_date) || toValidDate(investment.created_date);
  let end = toValidDate(investment.maturity_date);

  if (!end && start) {
    const durationDays = Number(investment.duration_days);
    if (Number.isFinite(durationDays) && durationDays > 0) {
      end = new Date(start);
      end.setDate(end.getDate() + durationDays);
    }
  }

  return { start, end };
};

export const calcInvestmentProgress = (investment) => {
  const { start, end } = resolveInvestmentTimeline(investment);
  if (!start || !end) {
    return 0;
  }
  return calcProgress(start.toISOString(), end.toISOString());
};

export const isInvestmentMatured = (investment) => {
  const { end } = resolveInvestmentTimeline(investment);
  return !!end && new Date() >= end;
};

export const calcAccruedRoi = (investment) => {
  const { start, end } = resolveInvestmentTimeline(investment);
  if (!investment || !start || !end) {
    return 0;
  }

  const principal = Number(investment.amount) || 0;
  const expectedReturn = Number(investment.expected_return) || principal;
  const totalRoi = Math.max(0, expectedReturn - principal);
  const progress = calcProgress(start.toISOString(), end.toISOString()) / 100;

  return Math.max(0, totalRoi * progress);
};

export const calcAccruedPayout = (investment) => {
  const principal = Number(investment?.amount) || 0;
  return principal + calcAccruedRoi(investment);
};

// --- Real day-based ROI accrual (credited directly to wallet, not just estimated) ---

export const getDailyRoiRate = (investment) => {
  const principal = Number(investment?.amount) || 0;
  const expectedReturn = Number(investment?.expected_return) || principal;
  const durationDays = Number(investment?.duration_days) || 0;
  if (durationDays <= 0) {
    return 0;
  }
  return Math.max(0, expectedReturn - principal) / durationDays;
};

/**
 * Computes how many whole ROI-days are due to be credited right now for an
 * active investment, based on elapsed time since approval, capped at maturity
 * and minus whatever has already been credited (investment.roi_days_credited).
 */
export const computeDueRoiAccrual = (investment) => {
  if (!investment || investment.status !== "active") {
    return null;
  }

  const { start, end } = resolveInvestmentTimeline(investment);
  if (!start || !end) {
    return null;
  }

  const durationDays = Number(investment.duration_days) || 0;
  if (durationDays <= 0) {
    return null;
  }

  const now = new Date();
  const cappedNow = now < end ? now : end;
  const msPerDay = 24 * 60 * 60 * 1000;
  const elapsedDays = Math.min(durationDays, Math.max(0, Math.floor((cappedNow - start) / msPerDay)));

  const alreadyCredited = Number(investment.roi_days_credited) || 0;
  const dueDays = Math.max(0, elapsedDays - alreadyCredited);
  const dailyRate = getDailyRoiRate(investment);

  return {
    dueDays,
    creditAmount: dueDays * dailyRate,
    dailyRate,
    elapsedDays,
    durationDays,
    isFullyMatured: now >= end,
  };
};

export const calcCreditedRoi = (investment) => {
  const days = Number(investment?.roi_days_credited) || 0;
  return days * getDailyRoiRate(investment);
};

export const calcCreditedPayout = (investment) => {
  const principal = Number(investment?.amount) || 0;
  return principal + calcCreditedRoi(investment);
};