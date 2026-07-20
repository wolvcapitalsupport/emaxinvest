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
