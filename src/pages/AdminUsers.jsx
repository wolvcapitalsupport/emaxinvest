import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Users, Search, ChevronDown, ChevronUp } from "lucide-react";
import { INVESTMENT_PLANS, calcMaturityDate, calcExpectedReturn } from "@/lib/plans";

const statusColors = {
  active: "bg-green-900/40 text-green-300 border-green-700/50",
  suspended: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  banned: "bg-red-900/40 text-red-300 border-red-700/50"
};

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editBalance, setEditBalance] = useState({});
  const [selectedPlan, setSelectedPlan] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [assignError, setAssignError] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const up = await base44.entities.UserProfile.filter({ user_id: u.id });
    setUserProfile(up[0] || null);
    const allProfiles = await base44.entities.UserProfile.list("-created_date", 200);
    setProfiles(allProfiles);
    const allInvs = await base44.entities.Investment.list("-created_date", 200);
    setInvestments(allInvs);
    setLoading(false);
  };

  const updateBalance = async (profile) => {
    const newBal = parseFloat(editBalance[profile.id]);
    if (isNaN(newBal)) return;
    setActionLoading(profile.id + "_bal");
    try {
      await base44.entities.UserProfile.update(profile.id, { wallet_balance: newBal });
      await base44.entities.Transaction.create({
        user_id: profile.user_id,
        user_email: profile.user_email,
        type: "adjustment",
        amount: newBal,
        description: `Admin balance adjustment to $${newBal.toLocaleString()}`,
        status: "completed"
      });
      await loadData();
      setEditBalance(b => ({ ...b, [profile.id]: "" }));
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (profile, status) => {
    setActionLoading(profile.id + "_status");
    try {
      await base44.entities.UserProfile.update(profile.id, { account_status: status });
      await loadData();
    } catch (error) {
      setAssignError(e => ({ ...e, [profile.id]: error.message || "Unable to update account status." }));
    } finally {
      setActionLoading(null);
    }
  };

  const assignPlan = async (profile) => {
    const planName = selectedPlan[profile.id];
    const plan = INVESTMENT_PLANS.find(p => p.name === planName);
    setAssignError(e => ({ ...e, [profile.id]: "" }));
    if (!plan) {
      setAssignError(e => ({ ...e, [profile.id]: "Select a plan first." }));
      return;
    }
    const balance = profile.wallet_balance || 0;
    if (plan.amount > balance) {
      setAssignError(e => ({ ...e, [profile.id]: `Insufficient balance. Available: $${balance.toLocaleString()}, plan requires $${plan.amount.toLocaleString()}.` }));
      return;
    }
    setActionLoading(profile.id + "_assign");
    try {
      const now = new Date().toISOString();
      const maturityDate = calcMaturityDate(now, plan.duration);
      const expectedReturn = calcExpectedReturn(plan.amount, plan.roi);

      await base44.entities.Investment.create({
        user_id: profile.user_id,
        user_email: profile.user_email,
        plan: plan.name,
        amount: plan.amount,
        duration_days: plan.duration,
        roi_percentage: plan.roi,
        expected_return: expectedReturn,
        status: "active",
        approved_date: now,
        maturity_date: maturityDate,
        payment_method: "Admin assigned",
        admin_note: "Plan assigned directly by admin"
      });

      const newBalance = balance - plan.amount;
      await base44.entities.UserProfile.update(profile.id, {
        wallet_balance: newBalance,
        total_invested: (profile.total_invested || 0) + plan.amount
      });

      await base44.entities.Transaction.create({
        user_id: profile.user_id,
        user_email: profile.user_email,
        type: "deposit",
        amount: plan.amount,
        description: `${plan.name} plan assigned by admin — matures ${new Date(maturityDate).toLocaleDateString()}`,
        status: "completed"
      });

      await loadData();
      setSelectedPlan(s => ({ ...s, [profile.id]: "" }));
    } catch (error) {
      setAssignError(e => ({ ...e, [profile.id]: error.message || "Unable to assign plan." }));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = profiles.filter(p =>
    !search ||
    (p.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const getUserInvestments = (userId) => investments.filter(i => i.user_id === userId);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout user={user} userProfile={userProfile}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage investor accounts, balances, and account status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: profiles.length, color: "text-blue-400" },
            { label: "Active Accounts", value: profiles.filter(p => p.account_status === "active").length, color: "text-green-400" },
            { label: "Suspended", value: profiles.filter(p => p.account_status !== "active").length, color: "text-yellow-400" },
            { label: "Total Invested", value: `$${profiles.reduce((s, p) => s + (p.total_invested || 0), 0).toLocaleString()}`, color: "text-primary" }
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* User List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Users size={28} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          ) : filtered.map(profile => {
            const userInvs = getUserInvestments(profile.user_id);
            const activeInvs = userInvs.filter(i => i.status === "active").length;
            return (
              <div key={profile.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,197,253,0.15)", border: "1px solid rgba(147,197,253,0.25)" }}>
                      <span className="font-bold text-blue-200">
                        {(profile.full_name || profile.user_email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold truncate">{profile.full_name || "—"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[profile.account_status || "active"]}`}>
                          {profile.account_status || "active"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{profile.user_email}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>Balance: <strong className="text-primary">${(profile.wallet_balance || 0).toLocaleString()}</strong></span>
                        <span>Invested: <strong>${(profile.total_invested || 0).toLocaleString()}</strong></span>
                        <span>ROI: <strong className="text-green-400">${(profile.total_roi_earned || 0).toLocaleString()}</strong></span>
                        <span>Active: <strong>{activeInvs}</strong> plan(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(expanded === profile.id ? null : profile.id)}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        {expanded === profile.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {expanded === profile.id && (
                  <div className="border-t border-border p-5 bg-secondary/20 space-y-4">
                    {/* Balance Adjustment */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Adjust Wallet Balance</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editBalance[profile.id] || ""}
                          onChange={e => setEditBalance(b => ({ ...b, [profile.id]: e.target.value }))}
                          placeholder={`Current: $${(profile.wallet_balance || 0).toLocaleString()}`}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => updateBalance(profile)}
                          disabled={!!actionLoading}
                          className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
                        >
                          {actionLoading === profile.id + "_bal" ? "..." : "Update"}
                        </button>
                      </div>
                    </div>

                    {/* Assign Plan */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Assign Investment Plan</p>
                      <div className="flex gap-2">
                        <select
                          value={selectedPlan[profile.id] || ""}
                          onChange={e => setSelectedPlan(s => ({ ...s, [profile.id]: e.target.value }))}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="">Select a plan...</option>
                          {INVESTMENT_PLANS.map(p => (
                            <option key={p.name} value={p.name}>
                              {p.name} — ${p.amount.toLocaleString()} · {p.duration}d · {p.roi}% ROI
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignPlan(profile)}
                          disabled={!!actionLoading}
                          className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
                        >
                          {actionLoading === profile.id + "_assign" ? "..." : "Assign"}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Deducts the plan amount from wallet balance and activates immediately — no approval step.
                      </p>
                      {assignError[profile.id] && (
                        <p className="text-xs text-destructive mt-1.5">{assignError[profile.id]}</p>
                      )}
                    </div>

                    {/* Account Status */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Account Status</p>
                      <div className="flex gap-2">
                        {["active", "suspended", "banned"].map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(profile, s)}
                            disabled={!!actionLoading || profile.account_status === s}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize disabled:opacity-50 ${profile.account_status === s ? "text-slate-900" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`} style={profile.account_status === s ? { background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" } : {}}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* User Investments */}
                    {userInvs.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-2">Investment History ({userInvs.length})</p>
                        <div className="space-y-2">
                          {userInvs.slice(0, 5).map(inv => (
                            <div key={inv.id} className="flex justify-between text-xs bg-secondary rounded-lg px-3 py-2">
                              <span>{inv.plan} · ${inv.amount.toLocaleString()} · {inv.roi_percentage}%</span>
                              <span className={`font-medium capitalize ${inv.status === "active" ? "text-blue-400" : inv.status === "completed" ? "text-green-400" : inv.status === "pending" ? "text-yellow-400" : "text-red-400"}`}>{inv.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
