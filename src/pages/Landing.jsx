import { Link } from "react-router-dom";
import { Shield, TrendingUp, Clock, Award, ChevronRight, Star, Lock, Zap } from "lucide-react";
import { INVESTMENT_PLANS } from "@/lib/plans";

const planBadgeColors = {
  Starter: "bg-slate-700/60 text-slate-300 border-slate-600",
  Popular: "bg-blue-900/60 text-blue-300 border-blue-700",
  Premium: "bg-amber-900/60 text-amber-300 border-amber-700",
  Elite: "bg-yellow-900/60 text-yellow-300 border-yellow-700"
};

const planBorderColors = {
  Foundation: "border-slate-700 hover:border-slate-500",
  Growth: "border-blue-800 hover:border-blue-600",
  Accelerator: "border-amber-800 hover:border-amber-600",
  Legacy: "border-yellow-700 hover:border-yellow-500"
};

const planGlowColors = {
  Foundation: "",
  Growth: "",
  Accelerator: "shadow-amber-900/20",
  Legacy: "shadow-yellow-900/30"
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-black">E</span>
            </div>
            <span className="text-2xl font-display font-bold gold-text">EMAX</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold px-5 py-2.5 rounded-xl gold-gradient text-black transition-all hover:opacity-90 hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full mb-8">
            <Zap size={12} />
            Secure · Transparent · High Yield
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            <span className="gold-text">Grow Your Wealth</span>
            <br />
            <span className="text-foreground/90">With Precision</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            EMAX delivers premium investment plans with guaranteed returns. Choose your tier, fund your account, and watch your capital grow — all managed by our expert team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Start Investing <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-border text-foreground font-medium text-base hover:border-primary/50 transition-all flex items-center justify-center gap-2">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Total Plans", value: "4" },
            { label: "Max ROI", value: "48%" },
            { label: "Max Duration", value: "120 Days" },
            { label: "Min Investment", value: "$1,000" }
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold gold-text mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">Investment Plans</h2>
            <p className="text-muted-foreground text-lg">Choose the plan that aligns with your wealth goals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INVESTMENT_PLANS.map((plan, i) => {
              const expectedReturn = plan.amount + (plan.amount * plan.roi / 100);
              const isLegacy = plan.name === "Legacy";
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border ${planBorderColors[plan.name]} bg-card p-6 transition-all duration-300 hover:scale-105 card-glow ${isLegacy ? "ring-1 ring-primary/30" : ""}`}
                >
                  {isLegacy && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gold-gradient text-black text-xs font-bold rounded-full whitespace-nowrap">
                      ✦ Best Returns
                    </div>
                  )}
                  <div className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${planBadgeColors[plan.badge]}`}>
                    {plan.badge}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-1">{plan.name}</h3>
                  <p className="text-3xl font-display font-bold gold-text mb-1">${plan.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mb-4">Minimum Investment</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{plan.duration} Days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ROI</span>
                      <span className="font-bold text-primary">{plan.roi}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Return</span>
                      <span className="font-semibold text-green-400">${expectedReturn.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 gold-gradient text-black"
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
      <section className="py-20 px-4 sm:px-6 bg-card/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Why Choose EMAX</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure & Transparent", desc: "All investments are manually reviewed and approved by our admin team for maximum security." },
              { icon: TrendingUp, title: "High Yield Returns", desc: "Earn up to 48% ROI with our Legacy plan, designed for serious wealth builders." },
              { icon: Clock, title: "Flexible Durations", desc: "Plans ranging from 7 to 120 days, fitting every investment horizon." },
              { icon: Lock, title: "Manual Approval", desc: "Every transaction is personally verified by our team — no automated risks." },
              { icon: Award, title: "Tiered Plans", desc: "From Foundation to Legacy, we have a plan for every level of capital." },
              { icon: Star, title: "Dedicated Support", desc: "Our expert team is available to assist you every step of the way." }
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-6 rounded-2xl border border-border bg-card card-glow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Ready to Build Your <span className="gold-text">Legacy?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">Join EMAX today and start earning premium returns on your capital.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 transition-all hover:scale-105">
            Create Your Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gold-gradient rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-black">E</span>
            </div>
            <span className="font-display font-bold gold-text">EMAX</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 EMAX Investment Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}