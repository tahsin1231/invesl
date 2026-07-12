import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Cpu, X, Battery, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export const MiningBot: React.FC = () => {
  const { 
    activePlans, 
    miningActive, 
    setMiningActive, 
    miningBalance, 
    triggerMiningPayout,
    language 
  } = useApp();
  
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [dots, setDots] = useState('');
  const [claimedNotice, setClaimedNotice] = useState(false);

  // Simple animation indicator dots
  useEffect(() => {
    if (!miningActive) return;
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 800);
    return () => clearInterval(interval);
  }, [miningActive]);

  // If there are no active plans, don't render the bot icon at all
  if (activePlans.length === 0) return null;

  const handleCollect = () => {
    if (miningBalance <= 0) return;
    triggerMiningPayout();
    setClaimedNotice(true);
    setTimeout(() => setClaimedNotice(false), 3000);
  };

  return (
    <>
      {/* Floating Bot Icon Trigger */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 font-mono">
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-3 sm:p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-2xl shadow-emerald-500/30 border border-emerald-300 hover:scale-110 active:scale-95 transition-all cursor-pointer animate-bounce"
        >
          {/* Pulse notification dot */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>

          <Cpu className={`w-6 h-6 ${miningActive ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mining Holographic Console Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono text-emerald-400 crt">
          <div className="bg-slate-950 border border-emerald-500/30 rounded-lg w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Visual scanlines overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_95%,rgba(16,185,129,0.05)_95%)] bg-[length:100%_4px] pointer-events-none" />

            {/* Modal Header */}
            <div className="p-4 flex justify-between items-start border-b border-emerald-500/20 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">
                  <Cpu className={`w-5 h-5 ${miningActive ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs uppercase">QUANTUM_MINING_TTY</h3>
                  <p className="text-[9px] text-emerald-500/60 font-mono uppercase">CORE: {miningActive ? `ACTIVE_COMPUTE${dots}` : 'STANDBY'}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="text-emerald-500/60 hover:text-white p-1 hover:bg-slate-900 rounded font-bold text-xs cursor-pointer"
              >
                [X]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              
              {/* Virtual Monitor Screen */}
              <div className="bg-slate-950 border border-emerald-500/20 rounded p-5 text-center relative overflow-hidden flex flex-col items-center justify-center">
                
                <span className="text-[9px] text-emerald-500/50 uppercase tracking-widest block mb-1">
                  {t.miningBalanceLabel}
                </span>

                {/* Simulated Ticking Balance */}
                <div className="text-2xl font-bold text-emerald-400 mb-2">
                  ${miningBalance.toFixed(6)} USDT
                </div>

                <div className="flex items-center space-x-2 mb-4 text-[9px] uppercase">
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-slate-900 border border-emerald-500/10 px-2 py-0.5 rounded">
                    <Battery className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>SYS_HASH: 48.2 TH/s</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-slate-900 border border-emerald-500/10 px-2 py-0.5 rounded">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>CORES: {activePlans.length} INSTRUCTIONS</span>
                  </span>
                </div>

                {/* Animated Rotating Grid */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className={`absolute inset-0 border border-dashed border-emerald-500/20 rounded-full ${miningActive ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
                  <div className={`absolute w-14 h-14 border border-emerald-500/40 rounded-full flex items-center justify-center ${miningActive ? 'animate-spin' : ''}`} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                  <Cpu className="w-7 h-7 text-emerald-400" />
                </div>
              </div>

              {/* Action Toggles */}
              <div className="w-full">
                <button
                  onClick={handleCollect}
                  disabled={miningBalance <= 0}
                  className={`w-full py-2.5 px-4 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase ${
                    miningBalance > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 border border-emerald-500/10 text-emerald-500/40 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HARVEST MINING BALANCE</span>
                </button>
              </div>

              {/* Micro instructions */}
              <div className="bg-slate-900/50 border border-emerald-500/10 rounded p-3 flex items-start space-x-2 text-[9px] text-emerald-500/60 uppercase leading-relaxed">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The mining compiler calculates real-time block yields based on active subscription channels. Collected yields can be securely routed to your master wallet instantly.
                </span>
              </div>

              {/* Claimed success alert */}
              {claimedNotice && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded p-2 text-center text-[10px] uppercase">
                  TRANSACTION_COMPLETE: Assets deposited to primary ledger.
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};
