export const isCampaignLive = (campaign) => {
  if (!campaign || !campaign.active) return false;
  const now = new Date();
  const starts = campaign.starts_at ? new Date(campaign.starts_at) : null;
  const ends = campaign.ends_at ? new Date(campaign.ends_at) : null;
  if (starts && now < starts) return false;
  if (ends && now > ends) return false;
  return true;
};

export const getLiveCampaigns = (campaigns) => (campaigns || []).filter(isCampaignLive);

export const getActiveDiscountForPlan = (campaigns, planName) => {
  return getLiveCampaigns(campaigns).find(
    (c) => c.type === "discount" && c.plan_name === planName && Number(c.discounted_amount) > 0
  ) || null;
};

<<<<<<< HEAD
=======
// Concrete, non-vague discount facts for a plan + its live discount campaign —
// used by the admin form, admin list, popup, and Invest page so the real
// numbers are always shown, regardless of what the admin typed in "message".
export const getDiscountDetails = (plan, discount) => {
  if (!plan || !discount) return null;
  const discountedAmount = Number(discount.discounted_amount);
  const percentOff = Math.round((1 - discountedAmount / plan.amount) * 100);
  return {
    planName: plan.name,
    normalAmount: plan.amount,
    discountedAmount,
    percentOff,
    durationDays: plan.duration,
    roiPercent: plan.roi,
    endsAt: discount.ends_at,
  };
};

>>>>>>> 4bfc9018e824f455824599e93746a73686aaaafc
// sessionStorage-based dismissal so the popup shows once per login session,
// not on every page navigation, but reappears on a fresh login.
const DISMISSED_KEY = "emax_dismissed_campaigns";

export const getDismissedCampaignIds = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
};

export const dismissCampaign = (id) => {
  try {
    const current = getDismissedCampaignIds();
    if (!current.includes(id)) {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // sessionStorage unavailable — fail silently, popup will just reshow
  }
};
