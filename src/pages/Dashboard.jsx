import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { TrendingUp, DollarSign, Clock, ArrowUpRight, AlertCircle, ChevronRight } from "lucide-react";
import { calcInvestmentProgress, isInvestmentMatured, calcCreditedRoi, calcCreditedPayout } from "@/lib/plans";
import { accrueActiveInvestments } from "@/lib/roiAccrual";

const statusColors = {
  pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  active: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  completed: "bg-green-900/40 text-green-300 border-green-700/50",
  rejected: "bg-red-900/40 text-red-300 border-red-700/50"
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">
            Welcome back,             <span style={{ color: "#93C5FD" }}>{user?.full_name?.split(" ")[0] || "Investor"}</span>
          </h1>
          <p className="text-muted-foreground text-sm">Here's your investment portfolio overview</p>
        </div>

        {activeSnapshots.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 card-glow">
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
                    <p className="text-sm font-medium">{inv.plan}</p>
                    <p className="text-xs text-muted-foreground">{inv.progress}% elapsed</p>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${inv.progress}%`,
                        background: "linear-gradient(135deg, #93C5FD, #BFDBFE)",
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
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 card-glow">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              <p className={`text-2xl font-display font-bold ${s.color} mb-1`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div>
            <h2 className="text-lg font-display font-semibold mb-4">Active Investments</h2>
            <div className="space-y-4">
              {activeSnapshots.map(inv => {
                const progress = inv.progress;
                const matured = isInvestmentMatured(inv);
                return (
                  <div key={inv.id} className="bg-card border border-border rounded-2xl p-5 card-glow">
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
                  </div>
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