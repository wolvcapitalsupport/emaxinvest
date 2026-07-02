import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { calcMaturityDate, calcInvestmentProgress, computeDueRoiAccrual } from "@/lib/plans";
import { accrueInvestmentRoi, accrueActiveInvestments } from "@/lib/roiAccrual";
import {
  CheckCircle, XCircle, Clock, DollarSign, TrendingUp,
  Users, AlertCircle, ChevronDown, ChevronUp, Eye
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  active: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  completed: "bg-green-900/40 text-green-300 border-green-700/50",
  rejected: "bg-red-900/40 text-red-300 border-red-700/50"
};

export default function Admin() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [tab, setTab] = useState("investments");
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [noteMap, setNoteMap] = useState({});
  const [actionError, setActionError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      if (!u) {
        throw new Error("You are not authenticated. Please sign in again.");
      }

      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      setUserProfile(profiles[0] || null);
      const invs = await base44.entities.Investment.list("-created_date", 100);
      setInvestments(invs || []);
      const ws = await base44.entities.WithdrawalRequest.list("-created_date", 100);
      setWithdrawals(ws || []);
      setActionError("");
    } catch (error) {
      setActionError(error.message || "Unable to load admin data right now.");
      setInvestments([]);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const approveInvestment = async (inv) => {
    setActionLoading(inv.id + "_approve");
    try {
      const now = new Date().toISOString();
      const maturityDate = calcMaturityDate(now, inv.duration_days);
      await base44.entities.Investment.update(inv.id, {
        status: "active",
        approved_date: now,
        maturity_date: maturityDate,
        admin_note: noteMap[inv.id] || ""
      });
      // Update user profile
      const profiles = await base44.entities.UserProfile.filter({ user_id: inv.user_id });
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          total_invested: (profiles[0].total_invested || 0) + inv.amount
        });
      }
      // Log transaction
      await base44.entities.Transaction.create({
        user_id: inv.user_id,
        user_email: inv.user_email,
        investment_id: inv.id,
        type: "deposit",
        amount: inv.amount,
        description: `${inv.plan} plan approved — matures ${new Date(maturityDate).toLocaleDateString()}`,
        status: "completed"
      });
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const rejectInvestment = async (inv) => {
    setActionLoading(inv.id + "_reject");
    try {
      await base44.entities.Investment.update(inv.id, {
        status: "rejected",
        admin_note: noteMap[inv.id] || "Rejected by admin"
      });
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const creditROI = async (inv) => {
    setActionLoading(inv.id + "_roi");
    try {
      const { credited } = await accrueInvestmentRoi(inv);
      if (credited <= 0) {
        throw new Error("No new ROI is due for this investment yet.");
      }
      await loadData();
      setActionError("");
    } catch (error) {
      setActionError(error.message || "Unable to credit ROI at this time.");
    } finally {
      setActionLoading(null);
    }
  };

  const runDailyAccrualForAll = async () => {
    setActionLoading("global_accrual");
    try {
      const activeList = investments.filter(i => i.status === "active");
      await accrueActiveInvestments(activeList);
      await loadData();
      setActionError("");
    } catch (error) {
      setActionError(error.message || "Unable to run daily accrual right now.");
    } finally {
      setActionLoading(null);
    }
  };

  const approveWithdrawal = async (w) => {
    setActionLoading(w.id + "_wapprove");
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_id: w.user_id });
      if (profiles[0]) {
        const newBal = Math.max(0, (profiles[0].wallet_balance || 0) - w.amount);
        await base44.entities.UserProfile.update(profiles[0].id, {
          wallet_balance: newBal,
          total_withdrawn: (profiles[0].total_withdrawn || 0) + w.amount
        });
      }
      await base44.entities.WithdrawalRequest.update(w.id, {
        status: "approved",
        processed_date: new Date().toISOString(),
        admin_note: noteMap[w.id] || "Approved"
      });
      await base44.entities.Transaction.create({
        user_id: w.user_id,
        user_email: w.user_email,
        type: "withdrawal",
        amount: w.amount,
        description: `Withdrawal approved — ${w.wallet_type}`,
        status: "completed"
      });
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const rejectWithdrawal = async (w) => {
    setActionLoading(w.id + "_wreject");
    try {
      await base44.entities.WithdrawalRequest.update(w.id, {
        status: "rejected",
        processed_date: new Date().toISOString(),
        admin_note: noteMap[w.id] || "Rejected by admin"
      });
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const markPaid = async (w) => {
    setActionLoading(w.id + "_paid");
    try {
      await base44.entities.WithdrawalRequest.update(w.id, {
        status: "paid",
        admin_note: noteMap[w.id] || "Payment sent"
      });
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Stats
  const totalUsers = [...new Set(investments.map(i => i.user_id))].length;
  const pendingInvs = investments.filter(i => i.status === "pending").length;
  const activeInvs = investments.filter(i => i.status === "active").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

  const filteredInvestments = filter === "all" ? investments : investments.filter(i => i.status === filter);
  const filteredWithdrawals = filter === "all" ? withdrawals : withdrawals.filter(w => w.status === filter);

  return (
    <AppLayout user={user} userProfile={userProfile}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage investments, withdrawals, and daily ROI credits</p>
          </div>
          <button
            onClick={runDailyAccrualForAll}
            disabled={!!actionLoading || activeInvs === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex-shrink-0" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            title="Credit any ROI-days that have come due across all active investments"
          >
            <DollarSign size={14} />
            {actionLoading === "global_accrual" ? "Running..." : "Run Daily Accrual (All Active)"}
          </button>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Investments", value: pendingInvs, icon: Clock, color: "text-yellow-400" },
            { label: "Active Investments", value: activeInvs, icon: TrendingUp, color: "text-blue-400" },
            { label: "Pending Withdrawals", value: pendingWithdrawals, icon: DollarSign, color: "text-orange-400" },
            { label: "Total Investors", value: totalUsers, icon: Users, color: "text-green-400" }
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 card-glow">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Alert for pending actions */}
        {(pendingInvs > 0 || pendingWithdrawals > 0) && (
          <div className="flex items-center gap-2 p-4 bg-yellow-900/10 border border-yellow-800/30 rounded-xl">
            <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-300">
              {pendingInvs} investment(s) and {pendingWithdrawals} withdrawal(s) awaiting your review.
            </p>
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 p-4 bg-red-900/10 border border-red-800/30 rounded-xl">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{actionError}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {["investments", "withdrawals"].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setFilter("pending"); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(tab === "investments" ? ["pending", "active", "completed", "rejected", "all"] : ["pending", "approved", "paid", "rejected", "all"]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${filter === f ? "border-transparent text-slate-900" : "border-border text-muted-foreground hover:text-foreground"}`} style={filter === f ? { background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Investment List */}
        {tab === "investments" && (
          <div className="space-y-4">
            {filteredInvestments.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground text-sm">No {filter} investments</p>
              </div>
            ) : filteredInvestments.map(inv => (
              <div key={inv.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {inv.status === "active" && (
                  <div className="px-5 pt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Investment Progress</span>
                      <span>{calcInvestmentProgress(inv)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: "linear-gradient(135deg, #93C5FD, #BFDBFE)",
                          width: `${calcInvestmentProgress(inv)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold">{inv.plan}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[inv.status]}`}>{inv.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{inv.user_name || inv.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        ${inv.amount.toLocaleString()} · {inv.roi_percentage}% · {inv.duration_days} days
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted: {new Date(inv.created_date).toLocaleDateString()}
                        {inv.approved_date && ` · Approved: ${new Date(inv.approved_date).toLocaleDateString()}`}
                        {inv.maturity_date && ` · Matures: ${new Date(inv.maturity_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        {expanded === inv.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {inv.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveInvestment(inv)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-900/30 text-green-400 border border-green-700/40 text-xs font-medium hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === inv.id + "_approve" ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => rejectInvestment(inv)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/30 text-red-400 border border-red-700/40 text-xs font-medium hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            {actionLoading === inv.id + "_reject" ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {inv.status === "active" && !inv.roi_credited && (() => {
                        const due = computeDueRoiAccrual(inv);
                        const hasDue = !!due && due.dueDays > 0;
                        return (
                          <button
                            onClick={() => creditROI(inv)}
                            disabled={!!actionLoading || !hasDue}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
                            title={hasDue ? `Credit ${due.dueDays} day(s) — $${due.creditAmount.toFixed(2)}` : "No new ROI due yet"}
                          >
                            <DollarSign size={14} />
                            {actionLoading === inv.id + "_roi"
                              ? "..."
                              : hasDue
                                ? `Credit $${due.creditAmount.toFixed(2)}`
                                : "Up to date"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expanded === inv.id && (
                  <div className="border-t border-border p-5 bg-secondary/20 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div><p className="text-muted-foreground text-xs">Amount</p><p className="font-semibold">${inv.amount.toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground text-xs">Expected Return</p><p className="font-semibold text-green-400">${(inv.expected_return || 0).toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground text-xs">Payment Method</p><p className="font-semibold">{inv.payment_method || "—"}</p></div>
                      <div><p className="text-muted-foreground text-xs">Wallet</p><p className="font-semibold truncate">{inv.wallet_address || "—"}</p></div>
                    </div>
                    {inv.payment_proof && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment Proof</p>
                        <a href={inv.payment_proof} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Eye size={12} /> View Proof
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Admin Note</label>
                      <input
                        value={noteMap[inv.id] || ""}
                        onChange={e => setNoteMap(m => ({ ...m, [inv.id]: e.target.value }))}
                        placeholder="Add note (optional)"
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    {inv.admin_note && <p className="text-xs text-muted-foreground">Saved note: "{inv.admin_note}"</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Withdrawal List */}
        {tab === "withdrawals" && (
          <div className="space-y-4">
            {filteredWithdrawals.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground text-sm">No {filter} withdrawals</p>
              </div>
            ) : filteredWithdrawals.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold">${w.amount.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[w.status] || "bg-secondary text-muted-foreground border-border"}`}>{w.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{w.user_name || w.user_email}</p>
                      <p className="text-xs text-muted-foreground">{w.wallet_type} · {w.wallet_address}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Submitted: {new Date(w.created_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        {expanded === w.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {w.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveWithdrawal(w)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-900/30 text-green-400 border border-green-700/40 text-xs font-medium hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === w.id + "_wapprove" ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(w)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/30 text-red-400 border border-red-700/40 text-xs font-medium hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            {actionLoading === w.id + "_wreject" ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {w.status === "approved" && (
                        <button
                          onClick={() => markPaid(w)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
                        >
                          <DollarSign size={14} />
                          {actionLoading === w.id + "_paid" ? "..." : "Mark Paid"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {expanded === w.id && (
                  <div className="border-t border-border p-5 bg-secondary/20 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Admin Note</label>
                      <input
                        value={noteMap[w.id] || ""}
                        onChange={e => setNoteMap(m => ({ ...m, [w.id]: e.target.value }))}
                        placeholder="Add note (optional)"
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    {w.admin_note && <p className="text-xs text-muted-foreground">Saved note: "{w.admin_note}"</p>}
                    {w.processed_date && <p className="text-xs text-muted-foreground">Processed: {new Date(w.processed_date).toLocaleDateString()}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}