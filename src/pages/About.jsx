import { Link } from "react-router-dom";
import { Shield, TrendingUp, Users, Award, ChevronRight, Zap } from "lucide-react";

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

export default function About() {
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
            <Zap size={11} /> About EMAX
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold leading-tight mb-6 text-white">
            Built for Serious<br /><span style={{ color: "#93C5FD" }}>Wealth Builders</span>
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-body">
            EMAX is a premium investment platform designed to deliver consistent, high-yield returns through professionally managed plans. Every investment is manually reviewed and approved by our expert team.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-5 text-white">Our Mission</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-4 font-body">
              We believe wealth-building should be accessible, transparent, and rewarding. EMAX was founded to bridge the gap between traditional investment limitations and the high-yield opportunities available in today's markets.
            </p>
            <p className="text-slate-400 text-base leading-relaxed font-body">
              Our team of financial experts manually oversees every investment, ensuring your capital is deployed with precision and care — no automation, no black boxes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Client Returns Paid", value: "$4.2M+" },
              { label: "Active Investors", value: "1,200+" },
              { label: "Plans Completed", value: "3,800+" },
              { label: "Years Operating", value: "5+" },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-2xl font-display font-bold mb-1" style={{ color: "#93C5FD" }}>{s.value}</p>
                <p className="text-xs text-slate-500 font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-white">Our Core Values</h2>
            <p className="text-slate-400 text-sm font-body">The principles that guide every decision we make</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "Security First", desc: "Every account and transaction is protected with enterprise-grade security protocols." },
              { icon: TrendingUp, title: "Consistent Returns", desc: "Our plans are structured to deliver reliable, predictable ROI for every investor." },
              { icon: Users, title: "Client-Centric", desc: "Your success is our success. We measure our performance by your portfolio growth." },
              { icon: Award, title: "Proven Excellence", desc: "Years of delivering premium returns has earned us the trust of thousands of investors." },
            ].map(v => (
              <div key={v.title} className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(147, 197, 253, 0.1)", border: "1px solid rgba(147, 197, 253, 0.2)" }}>
                  <v.icon size={18} style={{ color: "#93C5FD" }} />
                </div>
                <h3 className="font-semibold text-sm text-white mb-2 font-body">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-body">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-6 text-white">Join the EMAX Family</h2>
          <p className="text-slate-400 text-base mb-10 font-body">Start your wealth-building journey with a team that's dedicated to your success.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
            Create Your Account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
