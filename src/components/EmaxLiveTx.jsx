import { useState, useEffect } from 'react';
import { Radio, ExternalLink, Check, Copy, ArrowDownRight, Globe } from 'lucide-react';

export default function EmaxLiveTx() {
  const [copiedId, setCopiedId] = useState(null);
  const [transactions, setTransactions] = useState([
    { id: '1', time: 'Just now', asset: 'USDT', address: '0x71a5c...392b', amount: '2,500.00', usdValue: '2,500.00', txHash: '0x82fa1...7e1b', block: '19,482,012', speed: '2.4s' },
    { id: '2', time: '1m ago', asset: 'BTC', address: 'bc1qx9...95a8', amount: '0.0420', usdValue: '2,874.90', txHash: '0x39dc8...b912', block: '842,109', speed: '42s' },
    { id: '3', time: '3m ago', asset: 'ETH', address: '0xf39e...e81c', amount: '0.8500', usdValue: '3,071.02', txHash: '0x72ad1...2f4e', block: '19,482,001', speed: '1.8s' },
    { id: '4', time: '6m ago', asset: 'USDC', address: '0x14dc...c60e', amount: '500.00', usdValue: '500.00', txHash: '0x19bf3...8a1c', block: '19,481,995', speed: '3.1s' },
    { id: '5', time: '12m ago', asset: 'USDT', address: '0x8214...4b11', amount: '14,250.00', usdValue: '14,250.00', txHash: '0x55ee9...c21a', block: '19,481,950', speed: '2.9s' },
  ]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const assets = ['USDT', 'BTC', 'ETH', 'USDC'];
    const addresses = ['0x31b9...91a2', 'bc1q44...77x2', '0x92ce...e12a', '0x51db...b881', '0x74f2...99a1'];
    
    const interval = setInterval(() => {
      const selectedAsset = assets[Math.floor(Math.random() * assets.length)];
      
      // Clean numeric generator loops to completely safeguard against formatting crashes
      let numericAmount = 0;
      let numericUsd = 0;

      if (selectedAsset === 'BTC') {
        numericAmount = Math.random() * 0.1 + 0.005;
        numericUsd = numericAmount * 68450;
      } else if (selectedAsset === 'ETH') {
        numericAmount = Math.random() * 1.5 + 0.1;
        numericUsd = numericAmount * 3612;
      } else {
        numericAmount = Math.floor(Math.random() * 4500) + 100;
        numericUsd = numericAmount;
      }

      const displayAmount = selectedAsset === 'BTC' || selectedAsset === 'ETH'
        ? numericAmount.toFixed(4)
        : numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const displayUsd = numericUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const currentEthBlock = Math.floor(19482012 + Math.random() * 10);

      const newTx = {
        id: Math.random().toString(),
        time: 'Just now',
        asset: selectedAsset,
        address: addresses[Math.floor(Math.random() * addresses.length)],
        amount: displayAmount,
        usdValue: displayUsd,
        txHash: '0x' + Math.random().toString(16).substring(2, 7) + '...' + Math.random().toString(16).substring(2, 6),
        block: selectedAsset === 'BTC' ? Math.floor(842109 + Math.random() * 2).toLocaleString() : currentEthBlock.toLocaleString(),
        speed: (Math.random() * 3 + 1).toFixed(1) + 's'
      };

      setTransactions(prev => {
        const updatedPrevious = prev.map((tx, idx) => ({
          ...tx,
          time: idx === 0 ? '45s ago' : idx === 1 ? '2m ago' : idx === 2 ? '5m ago' : `${(idx + 1) * 3}m ago`
        }));
        return [newTx, ...updatedPrevious.slice(0, 4)];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#04060A] py-24 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Upper Identity Row Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
              <Radio className="h-3 w-3 text-blue-400 animate-pulse" /> Explorer Sync Active
            </div>
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">Proof-Of-Deposit Ledger</h3>
            <p className="text-sm text-slate-400 max-w-xl">Cryptographic tracking matrix displaying real-time decentralized node injections across active plans.</p>
          </div>
          
          {/* Telemetry Status Modules */}
          <div className="flex flex-wrap gap-4 font-mono text-[11px]">
            <div className="bg-[#0B111E]/40 border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-500">API Streams:</span>
                <span className="text-slate-200 font-bold">Live Socket Connected</span>
              </div>
            </div>
            <div className="bg-[#0B111E]/40 border border-white/5 px-4 py-3 rounded-xl hidden sm:flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">Global Average Ping:</span>
              <span className="text-blue-400 font-bold">14ms</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Explorer Table Element Layout */}
        <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-[#080B11]/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/40 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                <th className="py-4 px-5">Age Timeline</th>
                <th className="py-4 px-5">Index Block</th>
                <th className="py-4 px-5">Currency Pool</th>
                <th className="py-4 px-5">Masked User Node Address</th>
                <th className="py-4 px-5 text-right">Injected Capital</th>
                <th className="py-4 px-5 text-right">Value (USD)</th>
                <th className="py-4 px-5 text-center">Tx Network Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] font-mono text-xs text-slate-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-500/[0.02] transition duration-150 group">
                  
                  {/* Timestamp parameter node */}
                  <td className="py-4 px-5 text-slate-500 font-sans">{tx.time}</td>
                  
                  {/* Ledger block index tracking parameter node */}
                  <td className="py-4 px-5 text-slate-400 font-medium">#{tx.block}</td>
                  
                  {/* High design stylized asset badge context elements */}
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                      tx.asset === 'BTC' 
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
                        : tx.asset === 'ETH'
                        ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'
                        : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <ArrowDownRight className="h-3 w-3 stroke-[3]" />
                      {tx.asset}
                    </span>
                  </td>
                  
                  {/* Copy setup user address column element row block */}
                  <td className="py-4 px-5 text-slate-400 select-all tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <span>{tx.address}</span>
                      <button 
                        type="button"
                        onClick={() => handleCopy(tx.address, `${tx.id}-addr`)}
                        className="text-slate-600 hover:text-slate-300 transition opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === `${tx.id}-addr` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                  
                  {/* Right aligned quantities metrics rows columns underlays */}
                  <td className="py-4 px-5 text-right font-bold text-slate-100">{tx.amount}</td>
                  <td className="py-4 px-5 text-right font-bold text-emerald-400/90">
                    <span className="font-sans font-normal text-slate-600 mr-0.5">$</span>{tx.usdValue}
                  </td>
                  
                  {/* Link short hash tracking parameter component cell element */}
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(tx.txHash, `${tx.id}-hash`)}
                        className="inline-flex items-center gap-1.5 bg-slate-900/60 hover:bg-slate-800 border border-white/5 px-2.5 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-200 transition-colors tracking-wide"
                      >
                        {copiedId === `${tx.id}-hash` ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[10px]">
                            <Check className="h-2.5 w-2.5" /> Copied
                          </span>
                        ) : (
                          <>
                            <span>{tx.txHash}</span>
                            <Copy className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </button>
                      <span className="text-slate-600 hover:text-blue-400 transition cursor-pointer">
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic under-grid metrics description strip */}
        <p className="text-center text-[11px] text-slate-600 mt-6 max-w-2xl mx-auto font-sans">
          * Ledger events simulate network transaction processing metrics asynchronously. Security nodes block explicit source identification loops.
        </p>
      </div>
    </section>
  );
}