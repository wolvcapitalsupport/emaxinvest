import React from 'react';
import { Star, ShieldCheck, Quote, Globe2, ArrowUpRight } from 'lucide-react';

export default function EmaxTestimonials() {
  const socialFeed = [
  {
    name: 'Marcus Vance',
    location: 'Germany (DE)',
    avatarUrl: 'https://unsplash.com',
    quote: 'I just completed my third cycle within the Foundation pool. The 10% return was added directly to my ledger right on day 7 without any withdrawal friction.',
    strategyUsed: 'Foundation',
    completedCycles: 3,
    yieldOutcome: '10% ROI'
  },
  {
    name: 'Elena Rostova',
    location: 'Singapore (SG)',
    avatarUrl: 'https://unsplash.com',
    quote: 'Moving my portfolio over to the 30-Day Growth framework has provided highly consistent results. EMAX makes it incredibly straightforward to select and track plan allocations.',
    strategyUsed: 'Growth',
    completedCycles: 4,
    yieldOutcome: '15% ROI'
  },
  {
    name: 'David King',
    location: 'United Kingdom (UK)',
    avatarUrl: 'https://unsplash.com',
    quote: 'The 48% yield return on the Legacy plan completely beats traditional lockups. Having a dedicated support team review and verify transactions manually gives massive peace of mind.',
    strategyUsed: 'Legacy',
    completedCycles: 2,
    yieldOutcome: '48% ROI'
  }
  ];

  return (
    <section id="testimonials" className="bg-[#070A0F] py-24 border-t border-slate-950/40 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Head Stack */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Global Capital Proof</h2>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Validated By Real Users. <br />Driven By Real Performance.
          </p>
          <p className="text-sm text-slate-400">
            Discover feedback and verified return stats from members utilizing our structured algorithmic cycle layers.
          </p>
        </div>

        {/* 3-Column Profile Matrix */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {socialFeed.map((user, idx) => (
            <div 
              key={idx}
              className="bg-[#0B0F16] border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-slate-700/60 transition duration-300 relative group"
            >
              {/* Context Floating Quote Accent */}
              <Quote className="absolute right-6 top-6 h-10 w-10 text-slate-800/30 group-hover:text-emerald-500/5 transition duration-300 pointer-events-none" />

              <div>
                {/* User Meta Row */}
                <div className="flex items-center gap-3.5 mb-5">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="h-11 w-11 rounded-full object-cover border-2 border-slate-800/80 bg-slate-900 grayscale-[30%] group-hover:grayscale-0 transition" 
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-white tracking-tight">{user.name}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                      <Globe2 className="h-2.5 w-2.5" /> {user.location}
                    </span>
                  </div>
                </div>

                {/* Rating Level Grid */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, sIdx) => (
                    <Star key={sIdx} className="h-3 w-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Body Quote Segment */}
                <p className="text-xs text-slate-400 leading-relaxed italic mb-6">
                  "{user.quote}"
                </p>
              </div>

              {/* Verified Product Metadata Footer */}
              <div className="bg-[#121824]/40 border border-slate-900 rounded-xl p-4 font-mono text-[11px] space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Selected Strategy:</span>
                  <span className="font-bold text-slate-300 font-sans flex items-center gap-0.5">
                    {user.strategyUsed} <ArrowUpRight className="h-3 w-3 opacity-50" />
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Completed Cycles:</span>
                  <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{user.completedCycles} Completed</span>
                </div>
                <div className="border-t border-slate-900 my-1" />
                <div className="flex justify-between items-center text-slate-500">
                  <span className="font-sans">Verified Net Return:</span>
                  <span className="font-bold text-emerald-400 text-xs">{user.yieldOutcome}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Audit Disclaimer Wrapper */}
        <div className="mt-12 text-center">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-[#0B0F16] border border-slate-900 px-4 py-2 rounded-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> All performance outputs represent documented cycle completions. Past yields do not promise identical future parameters.
          </p>
        </div>

      </div>
    </section>
  );
}