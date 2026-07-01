import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EmaxInteractiveCalculator() {
  const [depositAmount, setDepositAmount] = useState(1000);
  const [selectedTier, setSelectedTier] = useState('Foundation');

  // Exact plan configurations from your live page
  const tierRules = {
    Foundation: { name: 'Foundation', min: 1000, duration: 7, roi: 0.10 },
    Growth: { name: 'Growth', min: 5000, duration: 30, roi: 0.15 },
    Accelerator: { name: 'Accelerator', min: 20000, duration: 60, roi: 0.20 },
    Legacy: { name: 'Legacy', min: 50000, duration: 120, roi: 0.48 },
  };

  const currentRule = tierRules[selectedTier];

  // Enforce minimum values when user changes tiers
  useEffect(() => {
    if (depositAmount < currentRule.min) {
      setDepositAmount(currentRule.min);
    }
  }, [selectedTier]);

  const totalInterest = depositAmount * currentRule.roi;
  const netPayout = depositAmount + totalInterest;

  return (
    <section className="bg-[#06090E] py-24 border-t border-slate-900/60 relative">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Widget Typography Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            <Calculator className="h-3 w-3" /> Profit Projections
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Simulate Your Strategy Earnings</h3>
          <p className="text-sm text-slate-400">Enter your target deposit capital below to forecast precise yield accruals.</p>
        </div>

        {/* Main Interface Module */}
        <div className="bg-[#0B0F16] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl grid md:grid-cols-12 gap-8 items-center">
          
          {/* Left Controls Split */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Amount input controller node */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Investment Principal ($ USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">$</span>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#111622] border border-slate-800 rounded-xl pl-8 pr-16 py-3.5 text-lg font-black text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">USD</span>
              </div>
              {depositAmount < currentRule.min && (
                <p className="text-[10px] font-medium text-amber-500 font-mono">⚠️ Below tier requirement minimum of ${currentRule.min.toLocaleString()}</p>
              )}
            </div>

            {/* Plan Tier selection cluster */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target Tier Strategy</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.keys(tierRules).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTier(key)}
                    className={`py-3 px-1.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedTier === key
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md'
                        : 'bg-[#111622] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tierRules[key].name}
                    <span className="block text-[10px] font-mono text-slate-500 font-medium mt-0.5">{(tierRules[key].roi * 100)}% ROI</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Calculations Split Terminal Layout */}
          <div className="md:col-span-5 bg-[#111622] border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between h-full min-h-[220px]">
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Duration Period:</span>
                <span className="font-bold text-white font-sans">{currentRule.duration} Days</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-400">
                <span>Net Profit Accrual:</span>
                <span className="font-bold text-emerald-400">+{depositAmount < currentRule.min ? '0.00' : totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>

              <div className="border-t border-slate-800/80 my-2" />
            </div>

            {/* Outlining absolute total yield payout resolution */}
            <div className="space-y-5">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">Maturity Return Payout</span>
                <p className="text-3xl font-black text-white tracking-tight font-mono">
                  <span className="text-xl font-normal text-slate-500 mr-px">$</span>
                  {depositAmount < currentRule.min ? '0.00' : netPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <button 
                type="button"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/5 group"
              >
                Lock In Plan <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Global Compliance Note underlay */}
        <div className="mt-6 text-center">
          <p className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 bg-[#0B0F16] border border-slate-900 px-4 py-2 rounded-xl">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Computations match verified contract algorithms. Your principal distribution retains automated custody security.
          </p>
        </div>

      </div>
    </section>
  );
}
