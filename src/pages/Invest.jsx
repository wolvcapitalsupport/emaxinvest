import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { INVESTMENT_PLANS, calcExpectedReturn } from "@/lib/plans";
import { CheckCircle, Upload, X } from "lucide-react";
import { getActiveDiscountForPlan } from "@/lib/campaigns";

const planBorderColors = {
  Foundation: "border-slate-700/50 data-[selected=true]:border-blue-400/60",
  Growth: "border-slate-700/50 data-[selected=true]:border-blue-400/60",
  Accelerator: "border-slate-700/50 data-[selected=true]:border-blue-400/60",
  Legacy: "border-slate-700/50 data-[selected=true]:border-blue-400/60"
};

export default function Invest() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1); // 1: select plan, 2: payment details
  const [form, setForm] = useState({ payment_method: "", transaction_hash: "", payment_proof: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
    setUserProfile(profiles[0] || null);

    const settings = await base44.entities.PaymentSettings.list();
    setPaymentSettings(settings[0] || null);

    try {
      const allCampaigns = await base44.entities.Campaign.list("-created_date", 50);
      setCampaigns(allCampaigns);
    } catch {
      // Campaign table may not exist in some environments — no discounts shown, not fatal
    }
  };

  const getEffectiveAmount = (plan) => {
    const discount = getActiveDiscountForPlan(campaigns, plan.name);
    return discount ? Number(discount.discounted_amount) : plan.amount;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, payment_proof: file_url }));
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    if (!form.payment_method.trim()) { setError("Please enter your payment method."); return; }
    setError("");
    setSubmitting(true);
    try {
      const plan = INVESTMENT_PLANS.find(p => p.name === selectedPlan);
      const effectiveAmount = getEffectiveAmount(plan);
      const expectedReturn = calcExpectedReturn(effectiveAmount, plan.roi);
      await base44.entities.Investment.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        plan: plan.name,
        amount: effectiveAmount,
        roi_percentage: plan.roi,
        duration_days: plan.duration,
        expected_return: expectedReturn,
        status: "pending",
        payment_method: form.payment_method,
        transaction_hash: form.transaction_hash,
        payment_proof: form.payment_proof
      });
      // Log transaction
      await base44.entities.Transaction.create({
        user_id: user.id,
        user_email: user.email,
        investment_id: "",
        type: "deposit",
        amount: effectiveAmount,
        description: `${plan.name} plan investment submitted — awaiting approval`,
        status: "pending"
      });
      setSuccess(true);
    } catch (err) {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AppLayout user={user} userProfile={userProfile}>
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Investment Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your investment request for the <strong className="text-primary">{selectedPlan}</strong> plan has been submitted and is pending admin approval. You'll be notified once it's approved.
          </p>
          <button
            onClick={() => { setSuccess(false); setStep(1); setSelectedPlan(null); setForm({ payment_method: "", transaction_hash: "", payment_proof: "" }); }}
            className="px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
          >
            Invest Again
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} userProfile={userProfile}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Choose Your Plan</h1>
          <p className="text-muted-foreground text-sm">Select an investment plan and submit your payment details for admin approval</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div               className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "text-slate-900" : "bg-secondary text-muted-foreground"}`} style={step >= s ? { background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" } : {}}>
                {s}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Select Plan" : "Payment Details"}
              </span>
              {s < 2 && <div className={`w-8 h-px mx-2 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {INVESTMENT_PLANS.map(plan => {
                const discount = getActiveDiscountForPlan(campaigns, plan.name);
                const effectiveAmount = discount ? Number(discount.discounted_amount) : plan.amount;
                const expectedReturn = calcExpectedReturn(effectiveAmount, plan.roi);
                const selected = selectedPlan === plan.name;
                return (
                  <button
                    key={plan.name}
                    data-selected={selected}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:scale-102 ${planBorderColors[plan.name]}`} style={selected ? { background: "rgba(147,197,253,0.08)", boxShadow: "0 0 20px rgba(147,197,253,0.1)" } : { background: "rgba(12,15,24,0.85)" }}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
                        <CheckCircle size={14} className="text-slate-900" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground font-medium">{plan.badge}</p>
                      {discount && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-300 border border-orange-700/50">
                          Discounted
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-display font-bold mb-2">{plan.name}</h3>
                    {discount ? (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground line-through">${plan.amount.toLocaleString()}</p>
                        <p className="text-2xl font-display font-bold" style={{ color: "#93C5FD" }}>${effectiveAmount.toLocaleString()}</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-display font-bold mb-3" style={{ color: "#93C5FD" }}>${plan.amount.toLocaleString()}</p>
                    )}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{plan.duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI</span>
                        <span className="font-bold text-primary">{plan.roi}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Returns</span>
                        <span className="font-semibold text-green-400">${expectedReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                disabled={!selectedPlan}
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
              >
                Continue to Payment →
              </button>
            </div>
          </>
        )}

        {step === 2 && selectedPlan && (
          <div className="max-w-xl">
            {/* Plan Summary */}
            {(() => {
              const plan = INVESTMENT_PLANS.find(p => p.name === selectedPlan);
              const discount = getActiveDiscountForPlan(campaigns, plan.name);
              const effectiveAmount = discount ? Number(discount.discounted_amount) : plan.amount;
              return (
                <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(147,197,253,0.07)", border: "1px solid rgba(147,197,253,0.18)" }}>
                  <p className="text-xs text-muted-foreground mb-1">Selected Plan</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold text-xl">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.duration} days · {plan.roi}% ROI</p>
                    </div>
                    <div className="text-right">
                      {discount && (
                        <p className="text-sm text-muted-foreground line-through">${plan.amount.toLocaleString()}</p>
                      )}
                      <p className="font-display font-bold text-2xl" style={{ color: "#93C5FD" }}>${effectiveAmount.toLocaleString()}</p>
                      <p className="text-xs text-green-400">Returns: ${calcExpectedReturn(effectiveAmount, plan.roi).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold">Payment Details</h3>
{paymentSettings && (
<div className="rounded-xl border border-border p-4 space-y-2 text-sm">
<div><strong>BTC:</strong> {paymentSettings.btc_address}</div>
<div><strong>USDT (TRC20):</strong> {paymentSettings.usdt_trc20_address}</div>
<div><strong>ETH:</strong> {paymentSettings.eth_address}</div>
<div><strong>Bank:</strong> {paymentSettings.bank_name}</div>
<div><strong>Account Name:</strong> {paymentSettings.account_name}</div>
<div><strong>Account Number:</strong> {paymentSettings.account_number}</div>
</div>
)}

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Payment Method *</label>
                <input
                  value={form.payment_method}
                  onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                  placeholder="e.g. Bitcoin, Bank Transfer, USDT"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

<div>
  <label className="text-sm text-muted-foreground block mb-2">
    Transaction Hash (optional)
  </label>

  <input
    value={form.transaction_hash}
    onChange={e => setForm(f => ({ ...f, transaction_hash: e.target.value }))}
    placeholder="Paste blockchain transaction hash"
    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
  />
</div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Payment Proof (optional)</label>
                {form.payment_proof ? (
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-xl">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm text-green-300 flex-1 truncate">File uploaded</span>
                    <button onClick={() => setForm(f => ({ ...f, payment_proof: "" }))} className="text-muted-foreground hover:text-destructive">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors ${uploading ? "opacity-50" : ""}`}>
                    <Upload size={20} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload screenshot or receipt"}</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={uploading} />
                  </label>
                )}
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
                >
                  {submitting ? "Submitting..." : "Submit Investment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
