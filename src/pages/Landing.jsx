import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  ChevronRight, 
  Menu, 
  X, 
  Layers, 
  Zap, 
  Trophy, 
  Flame, 
  HelpCircle, 
  Mail, 
  Globe, 
  ShieldCheck 
} from "lucide-react";
import { INVESTMENT_PLANS } from "@/lib/plans";
import EmaxCalculator from "@/components/EmaxCalculator";
import EmaxLiveTx from "@/components/EmaxLiveTx";
import EmaxTestimonials from "@/components/EmaxTestimonials";

const planBadgeColors = {
  Starter: "bg-slate-800/80 text-slate-300 border-slate-600/50",
  Popular: "bg-blue-950/80 text-blue-300 border-blue-700/50",
  Premium: "bg-sky-950/80 text-sky-300 border-sky-700/50",
  Elite: "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
};

const planBorderColors = {
  Foundation: "border-slate-800/80 hover:border-slate-700",
  Growth: "border-blue-500/50 shadow-xl shadow-blue-500/5",
  Accelerator: "border-sky-800/80 hover:border-sky-500/50",
  Legacy: "border-purple-500/60 hover:border-purple-400/80 shadow-xl shadow-purple-500/5"
};

const planIcons = {
  Foundation: <Layers className="h-4 w-4 text-slate-400" />,
  Growth: <Zap className="h-4 w-4 text-blue-400" />,
  Accelerator: <Trophy className="h-4 w-4 text-sky-400" />,
  Legacy: <Flame className="h-4 w-4 text-purple-400" />
};

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const scrollToId = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { window.history.pushState(null, '', `#${id}`); } catch {};
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400" style={{ background: "hsl(230, 25%, 4%)" }}>
      
      {/* ==================== UPGRADED NAVBAR MODULE ==================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md transition-all duration-200" style={{ background: "rgba(8, 9, 14, 0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand Anchors */}
          <div className="flex items-center gap-2.5 select-none font-display font-bold tracking-wider text-white">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-400/20 to-blue-500/10 border border-blue-400/30 shadow-lg shadow-blue-500/5">
              <span className="text-sm font-bold text-blue-200">E</span>
            </div>
            <span className="text-xl font-bold tracking-wide">EMAX<span className="text-blue-400">INVEST</span></span>
          </div>

          {/* Scrolling Links Panel Context */}
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-slate-400">
            <a href="#plans" onClick={(e) => scrollToId(e, 'plans')} className="hover:text-blue-400 transition-colors">Investment Plans</a>
            <a href="#calculator" onClick={(e) => scrollToId(e, 'calculator')} className="hover:text-blue-400 transition-colors">Yield Estimator</a>
            <a href="#benefits" onClick={(e) => scrollToId(e, 'benefits')} className="hover:text-blue-400 transition-colors">Why EMAX</a>
            <a href="#testimonials" onClick={(e) => scrollToId(e, 'testimonials')} className="hover:text-blue-400 transition-colors">Proof Matrix</a>
          </div>
          
          {/* Authenticated Links Switch Panel */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-xs uppercase tracking-wider font-bold text-slate-300 hover:text-white transition-colors px-4 py-2 font-body">
              Sign In
            </Link>
            <Link to="/register" className="text-xs uppercase tracking-wider font-black px-5 py-3 rounded-xl text-slate-900 transition-all hover:opacity-95 hover:scale-102 active:scale-98 font-body shadow-lg shadow-blue-400/10 flex items-center gap-1" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
              Get Started <ChevronRight size={14} />
            </Link>
          </div>

          {/* Mobile Drawer trigger Button */}
          <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-400 hover:text-white focus:outline-none">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Expanded Drawer Context Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200" style={{ background: "rgba(8, 9, 14, 0.98)" }}>
            <div className="flex flex-col gap-4 text-sm font-semibold text-slate-400">
              <a href="#plans" onClick={(e) => scrollToId(e, 'plans')} className="hover:text-white transition">Investment Plans</a>
              <a href="#calculator" onClick={(e) => scrollToId(e, 'calculator')} className="hover:text-white transition">Yield Estimator</a>
              <a href="#benefits" onClick={(e) => scrollToId(e, 'benefits')} className="hover:text-white transition">Why EMAX</a>
              <a href="#testimonials" onClick={(e) => scrollToId(e, 'testimonials')} className="hover:text-white transition">Proof Matrix</a>
            </div>
            <div className="h-px bg-slate-900 my-4" />
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-[#111622] text-slate-200 font-bold py-3 rounded-xl text-xs uppercase tracking-wider border border-slate-800">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-24 px-4 sm:px-6 relative overflow-hidden">
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

      {/* Stats Bar Component Block */}
      <section className="py-10 mx-4 sm:mx-6 lg:mx-auto max-w-5xl rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-8 font-mono">
          {[
            { label: "Total Plans", value: "4" },
            { label: "Max ROI", value: "48%" },
            { label: "Max Duration", value: "120 Days" },
            { label: "Min Investment", value: "$1,000" }
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs uppercase tracking-wider font-sans font-semibold text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upgraded Plans Array Execution Grid Layer */}
      <section id="plans" className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.02))" }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 pointer-events-none" style={{ background: "linear-gradient(270deg, transparent, rgba(147,197,253,0.02))" }} />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-white">Investment Plans</h2>
            <p className="text-slate-400 text-base font-body">Choose the plan that aligns with your wealth goals</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {INVESTMENT_PLANS.map((plan) => {
              const expectedReturn = plan.amount + (plan.amount * plan.roi / 100);
              const isLegacy = plan.name === "Legacy";
              const isGrowth = plan.name === "Growth";
              
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border flex flex-col justify-between p-6 transition-all duration-300 ${planBorderColors[plan.name] || ""} ${isGrowth || isLegacy ? "lg:-translate-y-1" : ""}`}
                  style={{ background: "rgba(12, 15, 24, 0.85)", backdropFilter: "blur(12px)" }}
                >
                  {isLegacy && (
                    <div className="absolute -top-3 right-4 px-3 py-1 text-[10px] tracking-widest font-black uppercase rounded-full font-body shadow-md" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
                      ✦ Best Returns
                    </div>
                  )}

                  {/* Header Details row */}
                  <div>
                    <div className={`inline-flex text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full border mb-3 font-body ${planBadgeColors[plan.badge] || ""}`}>
                      {plan.badge}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      {planIcons[plan.name]}
                    </div>

                    {/* Numeric Yield Box Accent Container */}
                    <div className="space-y-2 text-sm text-slate-400 mb-6">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Investment Core:</span>
                        <span className="font-mono font-bold text-white">${plan.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Duration Period:</span>
                        <span className="font-mono font-bold text-white">{plan.duration} Days</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Fixed ROI Level:</span>
                        <span className="font-mono font-bold text-emerald-400">{plan.roi}%</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>Total Return:</span>
                        <span className="font-mono font-bold text-blue-400">${expectedReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/register" className="w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs uppercase tracking-wider font-bold transition-colors border border-slate-700/50">
                    Invest Now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== CORE FUNCTIONAL MIDDLEWARE SEGMENTS ==================== */}
      <section id="calculator" className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <EmaxCalculator />
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <EmaxLiveTx />
      </section>

      {/* Why Choose EMAX Grid Section */}
      <section id="benefits" className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4 text-white">Why Choose EMAX</h2>
          <p className="text-slate-400 font-body">Institutional grade infrastructure built for reliable asset growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <ShieldCheck className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Secure Infrastructure</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Multi-tier encryption protocols safeguarding digital assets and transactional operations with zero exposure risk.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <Globe className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Global Access</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Manage your asset distribution structures natively from any destination globally with real-time liquidity processing.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <HelpCircle className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">24/7 Dedicated Support</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Direct lines to institutional portfolio consultants assisting deployment routines at any point of the execution lifecycle.</p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <EmaxTestimonials />
      </section>

      {/* Action CTA Block section */}
      <section className="py-20 my-12 rounded-3xl bg-gradient-to-br from-blue-950/40 to-slate-950/40 border border-blue-500/10 max-w-5xl mx-auto px-6 text-center relative overflow-hidden">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Optimize Your Capital Allocation?</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm">Join institutional and retail operators globally deploying strategies through EMAX systems.</p>
        <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-slate-900 font-black text-xs uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
          Create Account Now <ChevronRight size={14} />
        </Link>
      </section>

      {/* ==================== UPGRADED FOOTER MODULE ==================== */}
      <footer className="border-t border-white/5 pt-16 pb-12 relative overflow-hidden" style={{ background: "rgba(4, 5, 8, 0.6)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Bio Details Node */}
          <div className="flex flex-col items-start space-y-4">
            <div className="flex items-center gap-2 select-none font-display font-bold tracking-wider text-white">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black text-slate-950" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>
                E
              </div>
              <span className="text-lg font-bold">EMAXINVEST</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delivering premium, institutional-grade fixed asset structures and strategic wealth optimization with zero hidden management costs.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
              <Shield size={10} /> Administrative Verification Protocol Active
            </div>
          </div>

          {/* Links Directories Column Array Layout */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-300 mb-4">Navigation</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <a href="#plans" onClick={(e) => scrollToId(e, 'plans')} className="hover:text-white transition-colors">Tiers Packages</a>
              <a href="#calculator" onClick={(e) => scrollToId(e, 'calculator')} className="hover:text-white transition-colors">Simulator Engine</a>
              <a href="#benefits" onClick={(e) => scrollToId(e, 'benefits')} className="hover:text-white transition-colors">Core Benefits</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-300 mb-4">Identity Info</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <span className="hover:text-white transition-colors cursor-pointer">Corporate Strategy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Security Protocol</span>
              <span className="hover:text-white transition-colors cursor-pointer">Verification Ledger</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-300 mb-4">System Channels</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><Mail size={12} /> support@emaxinvest.com</span>
              <span className="flex items-center gap-1.5"><Globe size={12} /> emaxinvest.com</span>
            </div>
          </div>
        </div>

        {/* Global Copyright Bottom Row Panel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {currentYear} EMAXINVEST. All structural protocols reserved globally.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Risk Parameters</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">User Covenant Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}