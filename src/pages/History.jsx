import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { History as HistoryIcon, TrendingUp, ArrowDownCircle, CheckCircle, Clock, XCircle } from "lucide-react";

const statusColors = {
  pending: "text-yellow-400",
  active: "text-blue-400",
  completed: "text-green-400",
  rejected: "text-red-400"
};

const statusBg = {
  pending: "bg-yellow-900/30 border-yellow-700/40",
  active: "bg-blue-900/30 border-blue-700/40",
  completed: "bg-green-900/30 border-green-700/40",
  rejected: "bg-red-900/30 border-red-700/40"
};

export default function History() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState("investments");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
    setUserProfile(profiles[0] || null);
    const invs = await base44.entities.Investment.filter({ user_id: u.id }, "-created_date", 50);
    setInvestments(invs);
    const txs = await base44.entities.Transaction.filter({ user_id: u.id }, "-created_date", 50);
    setTransactions(txs);
    setLoading(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Transaction History</h1>
          <p className="text-muted-foreground text-sm">Complete record of your investments and transactions</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary rounded-xl p-1 gap-1 w-fit">
          {["investments", "transactions"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "gold-gradient text-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "investments" && (
          <div className="space-y-3">
            {investments.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <TrendingUp size={28} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No investments yet</p>
              </div>
            ) : investments.map(inv => (
              <div key={inv.id} className={`bg-card border rounded-xl p-5 ${statusBg[inv.status]}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold">{inv.plan} Plan</span>
                      <span className={`text-xs font-medium ${statusColors[inv.status]}`}>
                        · {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${inv.amount.toLocaleString()} · {inv.roi_percentage}% ROI · {inv.duration_days} days
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(inv.created_date).toLocaleDateString()}
                      {inv.approved_date && ` · Approved: ${new Date(inv.approved_date).toLocaleDateString()}`}
                      {inv.maturity_date && ` · Matures: ${new Date(inv.maturity_date).toLocaleDateString()}`}
                    </p>
                    {inv.admin_note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">Admin: "{inv.admin_note}"</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">Expected Return</p>
                    <p className="font-bold text-green-400">${(inv.expected_return || 0).toLocaleString()}</p>
                    {inv.roi_credited && (
                      <p className="text-xs text-green-300 mt-1">✓ ROI Credited</p>
                    )}
                    {inv.payout_status === "paid" && (
                      <p className="text-xs text-blue-300 mt-0.5">✓ Paid Out</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "transactions" && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <HistoryIcon size={28} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No transactions yet</p>
              </div>
            ) : transactions.map(tx => (
              <div key={tx.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === "deposit" ? "bg-blue-900/40" :
                    tx.type === "roi_credit" ? "bg-green-900/40" :
                    tx.type === "withdrawal" ? "bg-orange-900/40" : "bg-secondary"
                  }`}>
                    {tx.type === "deposit" && <TrendingUp size={16} className="text-blue-400" />}
                    {tx.type === "roi_credit" && <CheckCircle size={16} className="text-green-400" />}
                    {tx.type === "withdrawal" && <ArrowDownCircle size={16} className="text-orange-400" />}
                    {tx.type === "adjustment" && <Clock size={16} className="text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.type.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === "withdrawal" ? "text-orange-400" : "text-green-400"}`}>
                    {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${tx.status === "completed" ? "text-green-400" : tx.status === "pending" ? "text-yellow-400" : "text-red-400"}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}