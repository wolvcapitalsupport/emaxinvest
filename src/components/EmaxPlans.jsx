import React from 'react';
import { ShieldCheck, Zap, Layers, Trophy, Cpu, Flame, UserCheck, Headphones, ArrowRight } from 'lucide-react';

export default function EmaxUpgradedLanding() {
  // Your exact platform data mapped out beautifully
  const currentPlans = [
    {
      badge: 'Starter',
      title: 'Foundation',
      minDeposit: '$1,000',
      duration: '7 Days',
      roi: '10%',
      totalReturn: '$1,100',
      badgeIcon: <Layers className="h-4 w-4 text-slate-400" />
    },
    {
      badge: 'Popular',
      title: 'Growth',
      minDeposit: '$5,000',
      duration: '30 Days',
      roi: '15%',
      totalReturn: '$5,750',
      isPopular: true,
      badgeIcon: <Zap className="h-4 w-4 text-blue-400" />
    },
    {
      badge: 'Premium',
      title: 'Accelerator',
      minDeposit: '$20,000',
      duration: '60 Days',
      roi: '20%',
      totalReturn: '$24,000',
      badgeIcon: <Trophy className="h-4 w-4 text-amber-400" />
    },
    {
      badge: 'Elite',
      title: 'Legacy',
      minDeposit: '$50,000',
      duration: '120 Days',
      roi: '48%',
      totalReturn: '$74,000',
      isBestReturn: true,
      badgeIcon: <Flame className="h-4 w-4 text-purple-400" />
    }
  ];

  return (
    <div className="bg-[#06090E] text-slate-100 min-h-screen font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* Dynamic Global Header Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-900/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400 tracking-wide uppercase">
            Secure · Transparent · High Yield
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
            Grow Your Wealth <br />With <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Precision.</span>
          </h1>

          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            EMAX delivers premium investment plans with guaranteed returns. Choose your tier, fund your account, and watch your capital grow — all managed by our expert team.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 transition-all active:scale-98">
              Start Investing
            </button>
            <button className="bg-[#0F141C] hover:bg-[#151C27] border border-slate-800 text-slate-300 font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition">
              Sign In to Dashboard
            </button>
          </div>

          {/* Upgraded Platform Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-16 font-mono">
            {[
              { label: 'Total Plans', val: '4' },
              { label: 'Max ROI', val: '48%', highlight: true },
              { label: 'Max Duration', val: '120 Days' },
              { label: 'Min Investment', val: '$1,000' }
            ].map((stat, sIdx) => (
              <div key={sIdx} className="bg-[#0B0F16] border border-slate-900 p-5 rounded-xl text-center">
                <p className={`text-2xl font-black tracking-tight ${stat.highlight ? 'text-emerald-400' : 'text-white'}`}>{stat.val}</p>
                <p className="text-[11px] font-sans text-slate-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgraded Investment Plans Section */}
      <section id="plans" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Investment Plans</h2>
          <p className="text-sm text-slate-400">Choose the plan that aligns with your wealth goals.</p>
        </div>

        {/* 4-Tier Strategy Column Matrix */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {currentPlans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative rounded-2xl p-6 flex flex-col justify-between bg-[#0B0F16] border transition-all duration-300 ${
                plan.isPopular 
                  ? 'border-blue-500 shadow-xl shadow-blue-500/5 lg:-translate-y-1' 
                  : plan.isBestReturn 
                  ? 'border-purple-500/80 shadow-xl shadow-purple-500/5'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Dynamic Absolute Header Badges */}
              {(plan.isPopular || plan.isBestReturn) && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 font-bold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-md text-white ${
                  plan.isPopular ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  {plan.isPopular ? 'Popular' : 'Best Returns'}
                </span>
              )}

              <div>
                {/* Header Row */}
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-0.5">{plan.badge}</span>
                    <h3 className="font-extrabold text-md text-white tracking-tight">{plan.title}</h3>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {plan.badgeIcon}
                  </div>
                </div>

                {/* Big Yield Metric Box */}
                <div className="bg-[#121824]/40 border border-slate-900 rounded-xl p-4 mb-5 font-mono flex justify-between items-baseline">
                  <span className="text-[11px] text-slate-500 font-sans">Guaranteed ROI:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {plan.roi} <span className="text-xs text-white font-normal font-sans">ROI</span>
                  </span>
                </div>

                {/* Specific Parameter Stack */}
                <div className="space-y-2.5 text-xs text-slate-400 border-b border-slate-900 pb-5 mb-5 font-sans">
                  <div className="flex justify-between">
                    <span>Minimum Entry:</span>
                    <span className="font-bold text-slate-200 font-mono">{plan.minDeposit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lock Duration:</span>
                    <span className="font-bold text-slate-200 font-mono">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900/50 pt-2.5 mt-2">
                    <span className="text-slate-500">Maturity Payout:</span>
                    <span className="font-black text-white font-mono">{plan.totalReturn}</span>
                  </div>
                </div>
              </div>

              {/* Action Trigger Block */}
              <button 
                type="button" 
                className={`w-full font-bold text-[11px] uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1 transition ${
                  plan.isPopular 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : plan.isBestReturn 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-[#141B26] hover:bg-[#1A2333] border border-slate-800/80 text-slate-200'
                }`}
              >
                Invest Now <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Upgraded Why Choose EMAX Section */}
      <section id="benefits" className="bg-[#090D14] border-t border-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Why Choose EMAX</h2>
          </div>

          {/* High Density Modern Grid Ecosystem */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { t: 'Secure & Transparent', d: 'All investments are manually reviewed and approved by our admin team for maximum security.', icon: <ShieldCheck className="text-emerald-400" /> },
              { t: 'High Yield Returns', d: 'Earn up to 48% ROI with our Legacy plan, designed for serious wealth returns.', icon: <Cpu className="text-blue-400" /> },
              { t: 'Flexible Durations', d: 'Plans ranging from 7 to 120 days, fitting every investment horizon.', icon: <Zap className="text-amber-400" /> },
              { t: 'Manual Approval', d: 'Every transaction is personally verified by our team — no automated risks.', icon: <UserCheck className="text-green-400" /> },
              { t: 'Tiered Plans', d: 'From Foundation to Legacy, we have a plan for every level of capital.', icon: <Layers className="text-purple-400" /> },
              { t: 'Dedicated Support', d: 'Our expert team is available to assist you every step of the way.', icon: <Headphones className="text-cyan-400" /> },
            ].map((feature, fIdx) => (
              <div key={fIdx} className="space-y-4">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <h3 className="text-lg font-bold text-white">{feature.t}</h3>
                </div>
                <p className="text-slate-400">{feature.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
