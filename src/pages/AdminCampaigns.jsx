import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Megaphone, Plus, Trash2, X, Gift } from "lucide-react";
import { INVESTMENT_PLANS } from "@/lib/plans";
import { isCampaignLive } from "@/lib/campaigns";

const emptyForm = {
  type: "announcement",
  title: "",
  message: "",
  plan_name: "",
  discounted_amount: "",
  bonus_amount: "",
  starts_at: "",
  ends_at: "",
  active: true,
};

export default function AdminCampaigns() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const up = await base44.entities.UserProfile.filter({ user_id: u.id });
    setUserProfile(up[0] || null);
    const all = await base44.entities.Campaign.list("-created_date", 100);
    setCampaigns(all);
    setLoading(false);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setError("");
  };

  const submitCampaign = async () => {
    setError("");
    if (!form.title.trim() || !form.message.trim() || !form.ends_at) {
      setError("Title, message, and end date are required.");
      return;
    }
    if (form.type === "discount") {
      const plan = INVESTMENT_PLANS.find(p => p.name === form.plan_name);
      if (!plan) {
        setError("Select a plan for the discount.");
        return;
      }
      const discounted = parseFloat(form.discounted_amount);
      if (isNaN(discounted) || discounted <= 0 || discounted >= plan.amount) {
        setError(`Discounted amount must be a real number less than the normal $${plan.amount.toLocaleString()} minimum.`);
        return;
      }
    }
    if (form.type === "bonus") {
      const bonus = parseFloat(form.bonus_amount);
      if (isNaN(bonus) || bonus <= 0) {
        setError("Enter a real bonus amount greater than $0.");
        return;
      }
    }
    setSaving(true);
    try {
      await base44.entities.Campaign.create({
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim(),
        plan_name: form.type === "discount" ? form.plan_name : null,
        discounted_amount: form.type === "discount" ? parseFloat(form.discounted_amount) : null,
        bonus_amount: form.type === "bonus" ? parseFloat(form.bonus_amount) : null,
        applied: false,
        starts_at: form.starts_at || new Date().toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        active: true,
      });
      await loadData();
      resetForm();
    } catch (e) {
      setError(e.message || "Unable to create campaign.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (campaign) => {
    await base44.entities.Campaign.update(campaign.id, { active: !campaign.active });
    await loadData();
  };

  const deleteCampaign = async (campaign) => {
    if (!confirm(`Delete "${campaign.title}"? This can't be undone.`)) return;
    await base44.entities.Campaign.delete(campaign.id);
    await loadData();
  };

  const applyBonus = async (campaign) => {
    const amount = Number(campaign.bonus_amount);
    if (!amount || amount <= 0) return;
    if (!confirm(`Credit $${amount.toLocaleString()} to every active user's wallet? This applies once and can't be undone.`)) return;

    setApplyingId(campaign.id);
    try {
      const profiles = await base44.entities.UserProfile.list("-created_date", 1000);
      const activeProfiles = profiles.filter(p => (p.account_status || "active") === "active");

      for (const profile of activeProfiles) {
        const newBalance = (Number(profile.wallet_balance) || 0) + amount;
        await base44.entities.UserProfile.update(profile.id, { wallet_balance: newBalance });
        await base44.entities.Transaction.create({
          user_id: profile.user_id,
          user_email: profile.user_email || profile.email,
          investment_id: "",
          type: "adjustment",
          amount: amount,
          description: `${campaign.title} — bonus credit`,
          status: "completed",
        });
      }

      await base44.entities.Campaign.update(campaign.id, { applied: true });
      await loadData();
    } catch (e) {
      setError(e.message || "Failed to apply bonus to all users.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout user={user} userProfile={userProfile}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Campaigns</h1>
            <p className="text-muted-foreground text-sm">Announcements, bonuses, and periodic plan discounts shown to investors on login</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Campaign"}
          </button>
        </div>

        {error && !showForm && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {["announcement", "bonus", "discount"].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-2 rounded-lg text-sm font-medium capitalize border ${form.type === t ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title (e.g. Weekend Bonus)"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Message shown to investors — must be accurate, this is exactly what they'll read"
              rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            />

            {form.type === "discount" && (
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.plan_name}
                  onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select plan...</option>
                  {INVESTMENT_PLANS.map(p => (
                    <option key={p.name} value={p.name}>{p.name} (normally ${p.amount.toLocaleString()})</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={form.discounted_amount}
                  onChange={e => setForm(f => ({ ...f, discounted_amount: e.target.value }))}
                  placeholder="New minimum entry amount ($)"
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {form.type === "bonus" && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Bonus amount per active user ($) — credited to real wallet balance when you click "Apply" below
                </label>
                <input
                  type="number"
                  value={form.bonus_amount}
                  onChange={e => setForm(f => ({ ...f, bonus_amount: e.target.value }))}
                  placeholder="e.g. 25"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Starts (optional, defaults to now)</label>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ends *</label>
                <input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              onClick={submitCampaign}
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            >
              {saving ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Megaphone size={28} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No campaigns yet</p>
            </div>
          ) : campaigns.map(c => {
            const live = isCampaignLive(c);
            return (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{c.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-border capitalize text-muted-foreground">{c.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${live ? "bg-green-900/40 text-green-300 border-green-700/50" : "bg-secondary text-muted-foreground border-border"}`}>
                        {live ? "Live" : c.active ? "Scheduled/Expired" : "Disabled"}
                      </span>
                      {c.type === "bonus" && c.applied && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/50">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{c.message}</p>
                    {c.type === "discount" && (
                      <p className="text-xs text-primary">
                        {c.plan_name}: ${c.discounted_amount?.toLocaleString()} entry (discounted)
                      </p>
                    )}
                    {c.type === "bonus" && (
                      <p className="text-xs text-primary">
                        ${Number(c.bonus_amount).toLocaleString()} per active user
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(c.starts_at).toLocaleString()} → {new Date(c.ends_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {c.type === "bonus" && !c.applied && (
                      <button
                        onClick={() => applyBonus(c)}
                        disabled={applyingId === c.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
                      >
                        <Gift size={13} />
                        {applyingId === c.id ? "Applying..." : "Apply to All"}
                      </button>
                    )}
                    <button
                      onClick={() => toggleActive(c)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
                    >
                      {c.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => deleteCampaign(c)}
                      className="p-1.5 rounded-lg bg-secondary border border-border hover:bg-red-900/30 text-muted-foreground hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
