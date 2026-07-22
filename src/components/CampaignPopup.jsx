import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Megaphone, Gift, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLiveCampaigns } from "@/lib/campaigns";
import { INVESTMENT_PLANS } from "@/lib/plans";

const typeIcon = {
  announcement: Megaphone,
  bonus: Gift,
  discount: Tag,
};

// Dismissal is keyed to (user id + this login's last_sign_in_at timestamp),
// stored in localStorage so it survives page navigation and even closing the
// tab — but resets automatically on every fresh login, since Supabase stamps
// a new last_sign_in_at each time. This intentionally does NOT use
// sessionStorage: we want users to see a live campaign again each time they
// log back in, not just once until the tab closes.
const dismissedKeyFor = (userId, loginStamp) => `emax_dismissed_${userId}_${loginStamp}`;

const getDismissedIds = (userId, loginStamp) => {
  try {
    return JSON.parse(localStorage.getItem(dismissedKeyFor(userId, loginStamp)) || "[]");
  } catch {
    return [];
  }
};

const markDismissed = (userId, loginStamp, campaignId) => {
  try {
    const current = getDismissedIds(userId, loginStamp);
    if (!current.includes(campaignId)) {
      localStorage.setItem(dismissedKeyFor(userId, loginStamp), JSON.stringify([...current, campaignId]));
    }
  } catch {
    // localStorage unavailable — fail silently, popup will just reshow
  }
};

export default function CampaignPopup() {
  const [campaign, setCampaign] = useState(null);
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loginStamp, setLoginStamp] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const stamp = user.last_sign_in_at || "unknown";
        if (cancelled) return;
        setUserId(user.id);
        setLoginStamp(stamp);

        const all = await base44.entities.Campaign.list("-created_date", 50);
        const live = getLiveCampaigns(all);
        const dismissed = getDismissedIds(user.id, stamp);
        const next = live.find(c => !dismissed.includes(c.id));
        if (!cancelled && next) {
          setCampaign(next);
          setTimeout(() => setVisible(true), 600);
        }
      } catch {
        // Campaign table may not exist yet, or auth not ready — fail silently
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!campaign) return null;

  const close = () => {
    setVisible(false);
    if (userId && loginStamp) markDismissed(userId, loginStamp, campaign.id);
    setTimeout(() => setCampaign(null), 200);
  };

  const Icon = typeIcon[campaign.type] || Megaphone;
  const plan = campaign.type === "discount" ? INVESTMENT_PLANS.find(p => p.name === campaign.plan_name) : null;
  const discountedAmount = campaign.type === "discount" ? Number(campaign.discounted_amount) : null;
  const percentOff = plan && discountedAmount ? Math.round((1 - discountedAmount / plan.amount) * 100) : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={close}
    >
      <div
        className={`bg-card border border-border rounded-2xl p-6 max-w-sm w-full relative transition-transform duration-200 ${visible ? "scale-100" : "scale-95"}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={close} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(147,197,253,0.15)", border: "1px solid rgba(147,197,253,0.25)" }}
        >
          <Icon size={22} className="text-blue-300" />
        </div>
        <h3 className="text-lg font-display font-bold mb-2">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{campaign.message}</p>

        {campaign.type === "discount" && plan && (
          <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2 mb-4 space-y-1">
            <p className="text-xs text-muted-foreground">{campaign.plan_name} plan entry</p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground line-through">${plan.amount.toLocaleString()}</span>
              <span className="text-base font-semibold text-primary">${discountedAmount.toLocaleString()}</span>
              {percentOff !== null && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-300 border border-orange-700/50">
                  {percentOff}% off
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.duration}-day term · {plan.roi}% ROI (unchanged)
            </p>
          </div>
        )}

        {campaign.type === "bonus" && campaign.bonus_amount && (
          <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2 mb-4">
            <p className="text-xs text-muted-foreground">Bonus credit</p>
            <p className="text-base font-semibold text-primary">
              ${Number(campaign.bonus_amount).toLocaleString()}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-4">
          Ends {new Date(campaign.ends_at).toLocaleDateString()}
        </p>

        <div className="flex gap-2">
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-secondary"
          >
            Dismiss
          </button>
          {campaign.type === "discount" && plan ? (
            <Link
              to={`/invest?plan=${encodeURIComponent(plan.name)}`}
              onClick={close}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-center hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            >
              View Plan
            </Link>
          ) : campaign.type === "bonus" ? (
            <Link
              to="/history"
              onClick={close}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-center hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            >
              View History
            </Link>
          ) : (
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
