import { Link } from "react-router-dom";
import { Shield, TrendingUp, Clock, Award, ChevronRight, Star, Lock, Zap } from "lucide-react";
import { INVESTMENT_PLANS } from "@/lib/plans";

const planBadgeColors = {
  Starter: "bg-slate-800/80 text-slate-300 border-slate-600/50",
  Popular: "bg-blue-950/80 text-blue-300 border-blue-700/50",
  Premium: "bg-sky-950/80 text-sky-300 border-sky-700/50",
  Elite: "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
};

const planBorderColors = {
  Foundation: "border-slate-700/60 hover:border-slate-500/80",
  Growth: "border-blue-800/50 hover:border-blue-600/70",
  Accelerator: "border-sky-800/50 hover:border-sky-500/70",
  Legacy: "border-blue-600/60 hover:border-blue-400/80"
};

export default function Landing() {
  return (
    <div className="min-h-screen text-foreground" style={{ background: "hsl(230, 25%, 4%)" }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ background: "rgba(8, 9, 14, 0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
              <span className="text-sm font-bold text-blue-200">E</span>
            </div>
            <span className="text-xl font-bold tracking-wide text-white font-body">EMAX</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-4 py-2 font-body">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold px-5 py-2.5 rounded-lg text-slate-900 transition-all hover:opacity-90 hover:scale-105 active:scale-95 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(147, 197, 253, 0.05) 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-8 font-body" style={{ background: "rgba(147, 197, 253, 0.08)", border: "1px solid rgba(147, 197, 253, 0.18)", color: "#93C5FD" }}>
            <Zap size={11} />
            Secure · Transparent · High Yield
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 text-white">
            Grow Your Wealth<br />With Precision
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-body">
            EMAX delivers premium investment plans with guaranteed returns. Choose your tier, fund your account, and watch your capital grow — all managed by our expert team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-slate-900 font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
              Start Investing <ChevronRight size={16} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 font-body" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}>
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 mx-4 sm:mx-6 lg:mx-auto max-w-5xl rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-8">
          {[
            { label: "Total Plans", value: "4" },
            { label: "Max ROI", value: "48%" },
            { label: "Max Duration", value: "120 Days" },
            { label: "Min Investment", value: "$1,000" }
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold text-white mb-1">{s.value}</p>
              <p className="text-sm text-slate-500 font-body">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.04))" }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 pointer-events-none" style={{ background: "linear-gradient(270deg, transparent, rgba(147,197,253,0.04))" }} />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-white">Investment Plans</h2>
            <p className="text-slate-400 text-base font-body">Choose the plan that aligns with your wealth goals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INVESTMENT_PLANS.map((plan) => {
              const expectedReturn = plan.amount + (plan.amount * plan.roi / 100);
              const isLegacy = plan.name === "Legacy";
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border ${planBorderColors[plan.name]} p-6 transition-all duration-300 hover:scale-105`}
                  style={{ background: "rgba(12, 15, 24, 0.85)", backdropFilter: "blur(12px)" }}
                >
                  {isLegacy && (
                    <div className="absolute -top-3 right-4 px-3 py-1 text-xs font-semibold rounded-full font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
                      ✦ Best Returns
                    </div>
                  )}
                  <div className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border mb-4 font-body ${planBadgeColors[plan.badge]}`}>
                    {plan.badge}
                  </div>
                  <h3 className="text-lg font-display font-bold mb-1 text-white">{plan.name}</h3>
                  <p className="text-3xl font-display font-bold mb-0.5" style={{ color: "#93C5FD" }}>${plan.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mb-5 font-body">Minimum Investment</p>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium text-slate-200">{plan.duration} Days</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-slate-500">ROI</span>
                      <span className="font-semibold" style={{ color: "#93C5FD" }}>{plan.roi}%</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-slate-500">Return</span>
                      <span className="font-semibold text-slate-200">${expectedReturn.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="block w-full text-center py-2.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 font-body"
                    style={{ background: "rgba(147, 197, 253, 0.1)", border: "1px solid rgba(147, 197, 253, 0.25)", color: "#93C5FD" }}
                  >
                    Invest Now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-white">Why Choose EMAX</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Secure & Transparent", desc: "All investments are manually reviewed and approved by our admin team for maximum security." },
              { icon: TrendingUp, title: "High Yield Returns", desc: "Earn up to 48% ROI with our Legacy plan, designed for serious wealth returns." },
              { icon: Clock, title: "Flexible Durations", desc: "Plans ranging from 7 to 120 days, fitting every investment horizon." },
              { icon: Lock, title: "Manual Approval", desc: "Every transaction is personally verified by our team — no automated risks." },
              { icon: Award, title: "Tiered Plans", desc: "From Foundation to Legacy, we have a plan for every level of capital." },
              { icon: Star, title: "Dedicated Support", desc: "Our expert team is available to assist you every step of the way." }
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl transition-all" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147, 197, 253, 0.1)", border: "1px solid rgba(147, 197, 253, 0.2)" }}>
                  <f.icon size={16} style={{ color: "#93C5FD" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm text-white font-body">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-body">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-white">
            Ready to Build Your <span style={{ color: "#93C5FD" }}>Legacy?</span>
          </h2>
          <p className="text-slate-400 text-base mb-10 font-body">Join EMAX today and start earning premium returns on your capital.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
            Create Your Account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
              <span className="text-xs font-bold text-blue-200">E</span>
            </div>
            <span className="font-bold text-white font-body">EMAX</span>
          </div>
          <p className="text-xs text-slate-600 font-body">© 2024 EMAX Investment Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}