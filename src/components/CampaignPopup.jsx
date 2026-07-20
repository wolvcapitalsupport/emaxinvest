import { useState, useEffect } from "react";
import { X, Megaphone, Gift, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLiveCampaigns, getDismissedCampaignIds, dismissCampaign } from "@/lib/campaigns";

const typeIcon = {
  announcement: Megaphone,
  bonus: Gift,
  discount: Tag,
};

export default function CampaignPopup() {
  const [campaign, setCampaign] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Campaign.list("-created_date", 50);
        const live = getLiveCampaigns(all);
        const dismissed = getDismissedCampaignIds();
        const next = live.find(c => !dismissed.includes(c.id));
        if (!cancelled && next) {
          setCampaign(next);
          // Small delay so it appears a moment after the dashboard loads, not
          // instantly on top of the page transition.
          setTimeout(() => setVisible(true), 600);
        }
      } catch {
        // Campaign table may not exist yet in some environments — fail silently
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!campaign) return null;

  const close = () => {
    setVisible(false);
    dismissCampaign(campaign.id);
    setTimeout(() => setCampaign(null), 200);
  };

  const Icon = typeIcon[campaign.type] || Megaphone;

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
        {campaign.type === "discount" && campaign.plan_name && (
          <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2 mb-4">
            <p className="text-xs text-muted-foreground">{campaign.plan_name} plan entry</p>
            <p className="text-base font-semibold text-primary">
              ${Number(campaign.discounted_amount).toLocaleString()}
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-4">
          Ends {new Date(campaign.ends_at).toLocaleDateString()}
        </p>
        <button
          onClick={close}
          className="w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
