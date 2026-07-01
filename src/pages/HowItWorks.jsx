import { Link } from "react-router-dom";
import { UserPlus, Wallet, CheckCircle, TrendingUp, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { INVESTMENT_PLANS } from "@/lib/plans";

const NavLinks = () => (
  <div className="flex items-center gap-6">
    <div className="hidden md:flex items-center gap-1">
      <Link to="/about" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">About</Link>
      <Link to="/how-it-works" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">How It Works</Link>
      <Link to="/faq" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">FAQ</Link>
      <Link to="/contact" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">Contact</Link>
    </div>
    <div className="flex items-center gap-3">
      <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-4 py-2 font-body">Sign In</Link>
      <Link to="/register" className="text-sm font-semibold px-5 py-2.5 rounded-lg text-slate-900 transition-all hover:opacity-90 hover:scale-105 active:scale-95 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>Get Started</Link>
    </div>
  </div>
);

const Footer = () => (
  <footer className="py-10 px-4 sm:px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
            <span className="text-xs font-bold text-blue-200">E</span>
          </div>
          <span className="font-bold text-white font-body">EMAX</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/about" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">About</Link>
          <Link to="/how-it-works" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">How It Works</Link>
          <Link to="/faq" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">FAQ</Link>
          <Link to="/contact" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">Contact</Link>
        </div>
      </div>
      <p className="text-xs text-slate-600 font-body text-center sm:text-left">© 2024 EMAX Investment Platform. All rights reserved.</p>
    </div>
  </footer>
);

const steps = [
  { number: "01", icon: UserPlus, title: "Create Your Account", desc: "Sign up in minutes with your email. Our onboarding is streamlined so you can start investing without delay." },
  { number: "02", icon: Wallet, title: "Fund Your Wallet", desc: "Deposit funds into your EMAX wallet. We support multiple payment methods including crypto and bank transfer." },
  { number: "03", icon: TrendingUp, title: "Choose a Plan", desc: "Select the investment plan that matches your goals. Each plan has a defined ROI and duration." },
  { number: "04", icon: CheckCircle, title: "Admin Approval", desc: "Our team manually reviews and approves your investment, ensuring every transaction is legitimate and secure." },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen text-foreground" style={{ background: "hsl(230, 25%, 4%)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ background: "rgba(8, 9, 14, 0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
              <span className="text-sm font-bold text-blue-200">E</span>
            </div>
            <span className="text-xl font-bold tracking-wide text-white font-body">EMAX</span>
          </Link>
          <NavLinks />
        </div>
      </nav>

      <section className="pt-36 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(147, 197, 253, 0.05) 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-8 font-body" style={{ background: "rgba(147, 197, 253, 0.08)", border: "1px solid rgba(147, 197, 253, 0.18)", color: "#93C5FD" }}>
            <Zap size={11} /> Simple Process
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold leading-tight mb-6 text-white">
            How EMAX<br /><span style={{ color: "#93C5FD" }}>Works</span>
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-body">
            From signup to earning returns — simple, secure, and transparent.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step, i) => (
            <div key={step.number} className="flex gap-6 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.1)", border: "1px solid rgba(147, 197, 253, 0.2)" }}>
                  <step.icon size={20} style={{ color: "#93C5FD" }} />
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 min-h-[24px]" style={{ background: "rgba(147, 197, 253, 0.15)" }} />}
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold" style={{ color: "#93C5FD" }}>{step.number}</span>
                  <h3 className="text-lg font-display font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-body">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-white">Available Plans</h2>
            <p className="text-slate-400 text-sm font-body">Choose the plan that fits your capital and goals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INVESTMENT_PLANS.map(plan => (
              <div key={plan.name} className="p-5 rounded-2xl" style={{ background: "rgba(12, 15, 24, 0.85)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs text-slate-500 font-body mb-1">{plan.badge}</p>
                <h3 className="text-lg font-display font-bold text-white mb-3">{plan.name}</h3>
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between"><span className="text-slate-500">Min</span><span className="text-slate-200">${plan.amount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="text-slate-200">{plan.duration} days</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ROI</span><span className="font-semibold" style={{ color: "#93C5FD" }}>{plan.roi}%</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold font-body" style={{ color: "#93C5FD" }}>
              Start with any plan <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-slate-400 text-base mb-10 font-body">Create your account and make your first investment in under 5 minutes.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
            Create Your Account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
