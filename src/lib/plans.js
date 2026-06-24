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
  const elapsed = now - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

export const isMatured = (maturityDate) => {
  return new Date() >= new Date(maturityDate);
};