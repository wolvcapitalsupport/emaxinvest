import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { DollarSign, ArrowDownCircle, CheckCircle } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  approved: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  rejected: "bg-red-900/40 text-red-300 border-red-700/50",
  paid: "bg-green-900/40 text-green-300 border-green-700/50"
};

export default function Withdraw() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({ amount: "", wallet_address: "", wallet_type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (!u) {
        throw new Error('No authenticated user found');
      }

      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      setUserProfile(profiles[0] || null);
      const ws = await base44.entities.WithdrawalRequest.filter({ user_id: u.id }, "-created_date", 20);
      setWithdrawals(ws);
    } catch (error) {
      console.error('Withdraw loadData error:', error);
      setError('Unable to load withdrawal data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { setError("Please enter a valid amount."); return; }
    if (!form.wallet_address.trim()) { setError("Please enter your wallet/account address."); return; }
    if (!form.wallet_type.trim()) { setError("Please specify the wallet type."); return; }
    const balance = userProfile?.wallet_balance || 0;
    if (amt > balance) { setError(`Insufficient balance. Available: $${balance.toLocaleString()}`); return; }

    setSubmitting(true);
    try {
      await base44.entities.WithdrawalRequest.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        amount: amt,
        wallet_address: form.wallet_address,
        wallet_type: form.wallet_type,
        status: "pending"
      });
      setSuccess(true);
      setForm({ amount: "", wallet_address: "", wallet_type: "" });
      loadData();
    } catch (err) {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Withdraw Funds</h1>
          <p className="text-muted-foreground text-sm">Submit a withdrawal request — processed manually by our admin team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            {/* Balance */}
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(147,197,253,0.07)", border: "1px solid rgba(147,197,253,0.18)" }}>
              <div>
                <p className="text-xs text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-display font-bold" style={{ color: "#93C5FD" }}>${(userProfile?.wallet_balance || 0).toLocaleString()}</p>
              </div>
              <DollarSign size={28} className="text-primary/60" />
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-xl">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-green-300">Withdrawal request submitted! Pending admin approval.</span>
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Amount ($) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => { setSuccess(false); setForm(f => ({ ...f, amount: e.target.value })); }}
                placeholder="Enter amount"
                min="1"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Wallet Type *</label>
              <input
                value={form.wallet_type}
                onChange={e => setForm(f => ({ ...f, wallet_type: e.target.value }))}
                placeholder="e.g. Bitcoin, USDT TRC20, Bank"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Wallet / Account Address *</label>
              <input
                value={form.wallet_address}
                onChange={e => setForm(f => ({ ...f, wallet_address: e.target.value }))}
                placeholder="Your wallet address or bank details"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            >
              {submitting ? "Submitting..." : "Submit Withdrawal Request"}
            </button>
          </div>

          {/* History */}
          <div>
            <h2 className="text-lg font-display font-semibold mb-4">Withdrawal History</h2>
            {withdrawals.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <ArrowDownCircle size={28} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No withdrawal requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map(w => (
                  <div key={w.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">${w.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.wallet_type} · {w.wallet_address?.slice(0, 20)}...</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(w.created_date).toLocaleDateString()}</p>
                        {w.admin_note && <p className="text-xs text-muted-foreground mt-1 italic">"{w.admin_note}"</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[w.status]} whitespace-nowrap`}>
                        {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}