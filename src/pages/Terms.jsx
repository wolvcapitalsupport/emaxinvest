import { Link } from "react-router-dom";
import { Shield, ArrowLeft, TrendingUp, RefreshCw, Unlock, DollarSign, AlertTriangle } from "lucide-react";
import { INVESTMENT_PLANS } from "@/lib/plans";
import { WITHDRAWAL_RULES } from "@/lib/platformRules";

const Section = ({ icon: Icon, title, children }) => (
  <section className="mb-10">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className="text-primary" />
      <h2 className="text-lg font-display font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-3 text-sm text-slate-400 leading-relaxed">{children}</div>
  </section>
);

export default function Terms() {
  return (
    <div className="min-h-screen text-slate-100 font-sans antialiased" style={{ background: "hsl(230, 25%, 4%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-4 font-body" style={{ background: "rgba(147, 197, 253, 0.08)", border: "1px solid rgba(147, 197, 253, 0.18)", color: "#93C5FD" }}>
            <Shield size={12} /> Platform Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">Terms &amp; Investment Policy</h1>
          <p className="text-slate-400 text-sm">
            This page documents exactly how EMAXINVEST plans, daily returns, plan renewal, and withdrawals work.
            These rules are operational procedures enforced by the platform, not informal guidance.
          </p>
        </div>

        <Section icon={TrendingUp} title="1. Investment Plans">
          <p>EMAXINVEST currently offers the following fixed-term plans:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {INVESTMENT_PLANS.map(plan => (
              <div key={plan.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="font-semibold text-white mb-1">{plan.name}</p>
                <p className="text-xs">${plan.amount.toLocaleString()} · {plan.duration} days · {plan.roi}% ROI</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={DollarSign} title="2. Daily ROI Accrual">
          <p>
            ROI is <strong className="text-slate-200">not</strong> paid out in a single lump sum at maturity. Instead, profit accrues
            daily, in whole-day increments, from the investment&apos;s approval date. Each day&apos;s share of profit is credited
            directly to your wallet balance and is available for withdrawal immediately, subject to the withdrawal rules below.
          </p>
          <p>
            Only the <strong className="text-slate-200">profit</strong> portion accrues to your wallet during the term. The original
            principal is never included in daily accrual — its handling at maturity is governed by the rollover policy below.
          </p>
        </Section>

        <Section icon={RefreshCw} title="3. Foundation Plan — One-Time Onboarding Cycle">
          <p>
            The <strong className="text-slate-200">Foundation</strong> plan is a single-use onboarding cycle. It runs exactly once per
            investor and does <strong className="text-slate-200">not</strong> automatically renew.
          </p>
          <p>
            When a Foundation cycle matures and finishes accruing daily profit, the investment is marked complete. The investor is
            then invited to choose their next plan (Growth, Accelerator, or Legacy). Migrating to a new plan is a fresh investment
            through the normal deposit and admin-approval process — it requires funding at that plan&apos;s minimum amount.
          </p>
        </Section>

        <Section icon={RefreshCw} title="4. Auto-Rollover Policy (Growth / Accelerator / Legacy)">
          <p>
            For all plans other than Foundation, the platform&apos;s default behavior is automatic rollover: once a cycle matures and
            finishes accruing its full daily profit, the original principal automatically renews into a brand-new cycle of the same
            plan. Capital compounds forward rather than being paid out — this is the default, steady-growth path.
          </p>
        </Section>

        <Section icon={Unlock} title="5. Opting Out &amp; Principal Release">
          <p>
            Investors may opt out of auto-rollover on any active non-Foundation investment at any time before its maturity date, via
            the &quot;Stop Renewing&quot; control on the Dashboard.
          </p>
          <p>
            Opting out does <strong className="text-slate-200">not</strong> release principal immediately. At maturity, the
            investment enters a pending <em>Principal Release Request</em> state. An administrator must review and approve the
            request before the principal is credited to the investor&apos;s wallet balance. If a release request is rejected, the
            principal automatically rolls over into a new cycle instead.
          </p>
        </Section>

        <Section icon={DollarSign} title="6. Withdrawal Rules">
          <ul className="list-disc list-inside space-y-1">
            <li>Minimum withdrawal per request: <strong className="text-slate-200">${WITHDRAWAL_RULES.minAmount.toLocaleString()}</strong></li>
            <li>Maximum withdrawal per request: <strong className="text-slate-200">${WITHDRAWAL_RULES.maxAmount.toLocaleString()}</strong></li>
            <li>Withdrawal requests are reviewed and processed manually by the admin team.</li>
            <li>Only funds already credited to your wallet balance (accrued profit or admin-released principal) are eligible for withdrawal.</li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="7. General Risk Disclosure">
          <p>
            All investments carry risk. Past or projected returns are not guaranteed. Review these terms carefully before investing,
            and only invest funds you can afford to have locked for the plan duration.
          </p>
        </Section>

        <div className="pt-6 border-t border-white/5">
          <Link to="/dashboard" className="text-sm text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
