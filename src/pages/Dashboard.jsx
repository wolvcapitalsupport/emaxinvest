import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import {
  TrendingUp, DollarSign, Clock, ArrowUpRight, AlertCircle, ChevronRight,
  ArrowDownCircle, History as HistoryIcon, Sparkles, LineChart, RefreshCw, Unlock
} from "lucide-react";
import { calcInvestmentProgress, isInvestmentMatured, calcCreditedRoi, calcCreditedPayout } from "@/lib/plans";
import { accrueActiveInvestments } from "@/lib/roiAccrual";
import CampaignPopup from "@/components/CampaignPopup";

const statusColors = {
  pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  active: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  completed: "bg-green-900/40 text-green-300 border-green-700/50",
  rejected: "bg-red-900/40 text-red-300 border-red-700/50"
};

const quickActions = [
  { label: "New Investment", desc: "Explore plans", icon: TrendingUp, path: "/invest" },
  { label: "Withdraw", desc: "Request payout", icon: ArrowDownCircle, path: "/withdraw" },
  { label: "History", desc: "Full activity log", icon: HistoryIcon, path: "/history" },
];

const isSameDay = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const buildRoiGrowthSeries = (transactions) => {
  const roiTx = transactions
    .filter(t => t.type === "roi_credit")
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  let running = 0;
  return roiTx.map(t => {
    running += Number(t.amount) || 0;
    return {
      date: new Date(t.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: Math.round(running * 100) / 100,
    };
  });
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();

      if (!u) {
        window.location.href = "/login";
        return;
      }

      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      let profile = profiles[0];
      if (!profile) {
        profile = await base44.entities.UserProfile.create({
          user_id: u.id,
          user_email: u.email,
          full_name: u.full_name,
          wallet_balance: 0,
          total_invested: 0,
          total_roi_earned: 0
        });
      }
      setUserProfile(profile);
      const invs = await base44.entities.Investment.filter({ user_id: u.id }, "-created_date", 10);

      // Credit any ROI-days that have come due since the last visit, so the
      // wallet balance reflects real daily growth instead of waiting for maturity.
      const activeInvs = invs.filter(i => i.status === "active");
      if (activeInvs.length > 0) {
        const accrued = await accrueActiveInvestments(activeInvs);
        const merged = invs.map(i => accrued.find(a => a.id === i.id) || i);
        setInvestments(merged);

        const refreshedProfiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        setUserProfile(refreshedProfiles[0] || profile);
      } else {
        setInvestments(invs);
      }

      const txs = await base44.entities.Transaction.filter({ user_id: u.id }, "-created_date", 60);
      setTransactions(txs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleRollover = async (inv) => {
    const updated = await base44.entities.Investment.update(inv.id, { rollover_opt_out: !inv.rollover_opt_out });
    setInvestments(prev => prev.map(i => (i.id === inv.id ? { ...i, ...updated } : i)));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeInvestments = investments.filter(i => i.status === "active");
  const pendingInvestments = investments.filter(i => i.status === "pending");
  const completedInvestments = investments.filter(i => i.status === "completed");
  const activeSnapshots = activeInvestments.map((inv) => {
    const progress = calcInvestmentProgress(inv);
    return {
      ...inv,
      progress,
      accruedRoi: calcCreditedRoi(inv),
      accruedPayout: calcCreditedPayout(inv),
    };
  });
  const totalCreditedRoi = activeSnapshots.reduce((sum, inv) => sum + inv.accruedRoi, 0);
  const estimatedMaturityPayout = activeSnapshots.reduce((sum, inv) => sum + (inv.expected_return || 0), 0);
  const chartSeries = buildRoiGrowthSeries(transactions);
  const hasActiveOrPending = investments.some(i => i.status === "active" || i.status === "pending" || i.status === "matured_awaiting_release");
  const readyToGraduate = !hasActiveOrPending && investments.some(i => i.plan === "Foundation" && i.status === "completed");
  const todaysEarnings = transactions
    .filter(t => t.type === "roi_credit" && isSameDay(t.created_date, new Date()))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const stats = [
    {
      label: "Wallet Balance",
      value: `$${(userProfile?.wallet_balance || 0).toLocaleString()}`,
      icon: DollarSign,
      sub: "Available for withdrawal",
      color: "text-primary"
    },
    {
      label: "Total Invested",
      value: `$${(userProfile?.total_invested || 0).toLocaleString()}`,
      icon: TrendingUp,
      sub: `${activeInvestments.length} active plan(s)`,
      color: "text-blue-400"
    },
    {
      label: "ROI Earned",
      value: `$${(userProfile?.total_roi_earned || 0).toLocaleString()}`,
      icon: ArrowUpRight,
      sub: `${completedInvestments.length} completed`,
      color: "text-green-400"
    },
    {
      label: "ROI Credited to Date",
      value: `$${totalCreditedRoi.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: Clock,
      sub: `${activeSnapshots.length} active plan(s) growing daily`,
      color: "text-yellow-400"
    }
  ];

  return (
    <AppLayout user={user} userProfile={userProfile}>
      <CampaignPopup />
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
              Welcome back,             <span style={{ color: "#93C5FD" }}>{user?.full_name?.split(" ")[0] || "Investor"}</span>
            </h1>
            <p className="text-muted-foreground text-sm">Here's your investment portfolio overview</p>
          </div>
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-secondary/60 transition-all duration-200 group"
              >
                <action.icon size={16} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold hidden sm:inline">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {readyToGraduate && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-purple-700/40 bg-purple-900/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-purple-300" />
              </div>
              <p className="text-sm text-purple-200">
                Your Foundation cycle is complete! Choose your next plan to keep growing your wealth.
              </p>
            </div>
            <Link to="/invest" className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all text-center" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
              Choose Next Plan
            </Link>
          </motion.div>
        )}

        {todaysEarnings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 p-4 rounded-2xl border border-green-700/40 bg-green-900/10"
          >
            <div className="w-9 h-9 rounded-xl bg-green-900/40 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles size={16} className="text-green-400" />
            </div>
            <p className="text-sm text-green-300">
              <span className="font-bold">${todaysEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> in ROI credited to your wallet today — keep it growing!
            </p>
          </motion.div>
        )}

        {activeSnapshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-2xl p-5 card-glow"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-display font-semibold">Growth Progress Snapshot</h2>
                <p className="text-xs text-muted-foreground">Real ROI credited daily to your wallet balance</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Projected at Maturity</p>
                <p className="text-base font-semibold text-blue-300">${estimatedMaturityPayout.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-3">
              {activeSnapshots.map((inv) => (
                <div key={`${inv.id}_progress`} className="rounded-xl bg-secondary/40 border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{inv.plan}</p>
                      {inv.paused && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-900/40 text-orange-300 border-orange-700/50">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.progress}% elapsed</p>
                  </div>
                  {inv.paused && (
                    <div className="mb-2 rounded-lg bg-orange-900/20 border border-orange-700/30 px-3 py-2">
                      <p className="text-xs text-orange-300">
                        This plan is temporarily paused and isn't accruing new earnings right now.
                        {inv.pause_reason ? ` Reason: "${inv.pause_reason}"` : " Contact support for details."}
                      </p>
                    </div>
                  )}
                  <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${inv.progress}%`,
                        background: inv.paused ? "linear-gradient(135deg, #FDBA74, #FED7AA)" : "linear-gradient(135deg, #93C5FD, #BFDBFE)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Credited so far</span>
                    <span className="text-green-400 font-semibold">
                      ${inv.accruedRoi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Portfolio Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 card-glow"
        >
          <div className="flex items-center gap-2 mb-4">
            <LineChart size={16} className="text-primary" />
            <h2 className="text-lg font-display font-semibold">Portfolio Growth</h2>
          </div>
          {chartSeries.length >= 2 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="roiGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#93C5FD" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8b93a7" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8b93a7" }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip
                    contentStyle={{ background: "#0c0f18", border: "1px solid rgba(147,197,253,0.2)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#93C5FD" }}
                    formatter={(value) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Cumulative ROI"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#93C5FD" strokeWidth={2} fill="url(#roiGrowthGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <LineChart size={22} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Your growth chart will appear here once daily ROI starts crediting</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-card border border-border rounded-2xl p-5 card-glow"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              <p className={`text-2xl font-display font-bold ${s.color} mb-1`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div>
            <h2 className="text-lg font-display font-semibold mb-4">Active Investments</h2>
            <div className="space-y-4">
              {activeSnapshots.map((inv, i) => {
                const progress = inv.progress;
                const matured = isInvestmentMatured(inv);
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="bg-card border border-border rounded-2xl p-5 card-glow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-lg">{inv.plan}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors.active}`}>Active</span>
                          {matured && (
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-green-900/40 text-green-300 border-green-700/50">Matured</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${inv.amount.toLocaleString()} invested · {inv.roi_percentage}% ROI
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Expected Return</p>
                        <p className="font-bold text-green-400">${(inv.expected_return || 0).toLocaleString()}</p>
                        <p className="text-xs text-blue-300 mt-1">
                          ROI Credited: ${inv.accruedRoi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", width: `${progress}%` }}
                        />
                      </div>
                      {inv.maturity_date && (
                        <div className="flex items-center justify-between gap-3 mt-1.5">
                          <p className="text-xs text-muted-foreground">
                            Matures: {new Date(inv.maturity_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-blue-300">
                            Wallet value now: ${inv.accruedPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                    {inv.plan !== "Foundation" && (
                      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          {inv.rollover_opt_out ? <Unlock size={14} className="text-purple-300" /> : <RefreshCw size={14} className="text-muted-foreground" />}
                          <p className="text-xs text-muted-foreground">
                            {inv.rollover_opt_out
                              ? "Principal release requested at next maturity (pending admin approval)"
                              : "Auto-renews into a new cycle at maturity"}
                            {" · "}
                            <Link to="/terms" className="text-primary hover:underline">View policy</Link>
                          </p>
                        </div>
                        <button
                          onClick={() => toggleRollover(inv)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
                            inv.rollover_opt_out
                              ? "border-blue-700/40 text-blue-300 hover:bg-blue-900/20"
                              : "border-purple-700/40 text-purple-300 hover:bg-purple-900/20"
                          }`}
                        >
                          {inv.rollover_opt_out ? "Cancel Opt-Out" : "Stop Renewing"}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending */}
        {pendingInvestments.length > 0 && (
          <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-yellow-400" />
              <h2 className="font-semibold text-yellow-300">Pending Approval</h2>
            </div>
            <div className="space-y-2">
              {pendingInvestments.map(inv => (
                <div key={inv.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{inv.plan} Plan — ${inv.amount.toLocaleString()}</span>
                  <span className="text-yellow-400 text-xs">Awaiting admin review</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {investments.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-primary" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">No Investments Yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start growing your wealth by choosing an investment plan</p>
            <Link to="/invest" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
              Explore Plans <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* Recent History Link */}
        {investments.length > 0 && (
          <div className="text-center">
            <Link to="/history" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
              View full transaction history <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}