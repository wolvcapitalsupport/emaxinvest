import React, { useState } from 'react';
import { Shield, Cpu, Zap, ChevronRight } from 'lucide-react';

export default function EmaxPublicLanding() {
  const [amount, setAmount] = useState(1000);
  const [cycle, setCycle] = useState(90); // default to 90 days

  // Centralized ROI tiers matching backend structures
  const getRoi = (days) => {
    if (days === 30) return 0.05;   // 5%
    if (days === 90) return 0.18;   // 18%
    return 0.42;                    // 42%
  };

  const netProfit = amount * getRoi(cycle);
  const totalPayout = amount + netProfit;

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 font-sans antialiased">
      
      {/* 1. Global Public Navigation Bar */}
      <nav className="border-b border-slate-900 bg-[#070A0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-wider text-white">
            <span className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-slate-950">E</span>
            EMAX<span className="text-emerald-400">INVEST</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#strategies" className="hover:text-white transition">Trading Strategies</a>
            <a href="#security" className="hover:text-white transition">Security Proof</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition">Login</button>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Primary Public Hero Container */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Left Aspect: High-converting marketing copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
            <Shield className="h-3.5 w-3.5" /> SECURE DEPOSIT GUARANTEE ACTIVE
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Automated Crypto Yields. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Zero Management Fees.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Put your idle capital to work. Emaxinvest routes your deposits into institutional crypto and forex algorithmic market cycles with completely transparent, fixed terms.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all group">
              Start Your First Cycle <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Right Aspect: Interactive Yield Simulator Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#0F141C] border border-slate-800/70 p-6 sm:p-8 rounded-2xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-md tracking-wide uppercase">Yield Simulator</h3>
              <Cpu className="h-4 w-4 text-emerald-400" />
            </div>

            {/* Input Element */}
            <div className="space-y-2 mb-6">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deposit Amount (USDT)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#151C27] border border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">USDT</span>
              </div>
            </div>

            {/* Cycle Selector Buttons */}
            <div className="space-y-2 mb-6">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Lock Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 90, 180].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setCycle(days)}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all ${
                      cycle === days
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-[#151C27] border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {days} Days
                    <span className="block text-[10px] font-medium text-slate-500 mt-0.5">{(getRoi(days) * 100)}% ROI</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Yield Calculation Screen */}
            <div className="bg-[#151C27] border border-slate-800/50 rounded-xl p-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Net Cycle Profit:</span>
                <span className="text-emerald-400 font-bold">+{netProfit.toFixed(2)} USDT</span>
              </div>
              <div className="border-t border-slate-800/80 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-sans">Total Return Payout:</span>
                <span className="text-xl font-black text-white">{totalPayout.toFixed(2)} <span className="text-xs font-normal text-slate-500">USDT</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Global Value Proposition Row */}
      <section className="bg-[#0B0F15] border-y border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Algorithmic Automation</h4>
            <p className="text-sm text-slate-400 leading-relaxed">Our advanced AI/ML algorithms continuous trade across optimal crypto-asset frameworks to secure yields.</p>
          </div>

          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Absolute Zero Fees</h4>
            <p className="text-sm text-slate-400 leading-relaxed">No setup charges, no administrative expenses, and no hidden management cuts. Your capital works entirely for you.</p>
          </div>

          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Asset Protection Layers</h4>
            <p className="text-sm text-slate-400 leading-relaxed">Principal allocations are protected inside multisig cold-storage setups to safeguard funds against system failures.</p>
          </div>
        </div>
      </section>
    </div>
  );
}