import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Cpu, Terminal, Shield, Play, HelpCircle, Activity, AlertCircle } from 'lucide-react';

export const EarnView: React.FC = () => {
  const { user, activePlans, buyPlan, language, plans } = useApp();
  const t = translations[language];

  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);
    
    try {
      const result = await buyPlan(planId);
      if (result.success) {
        setPurchaseSuccess(`CONTRACT DEPLOYMENT SUCCESSFUL: AI Quantum node initialized successfully.`);
        setTimeout(() => setPurchaseSuccess(null), 5000);
      } else {
        setPurchaseError(result.error || 'Subscription failed');
        setTimeout(() => setPurchaseError(null), 7000);
      }
    } catch (err: any) {
      setPurchaseError(err.message || 'Subscription failed');
      setTimeout(() => setPurchaseError(null), 7000);
    }
  };

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      
      {/* Earn Header Block */}
      <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden shadow-lg shadow-emerald-950/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">QUANTUM AI COMPUTE NODE</span>
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
              {t.autoAiTrading}
            </h2>
            <p className="text-emerald-500/80 text-xs max-w-xl mt-1.5 leading-relaxed uppercase">
              Deploy USDT capital to autonomous network prediction scripts. Our algorithms execute high-frequency mathematical hedging, with 100% daily yield settled in real-time.
            </p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/20 rounded-lg p-4 min-w-[200px] text-center">
            <span className="text-[10px] text-emerald-500/50 block mb-1 uppercase">TOTAL DEPLOYED ASSETS</span>
            <span className="text-xl font-bold text-white">
              ${user?.activeInvestments.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {purchaseSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-400 text-emerald-400 rounded-lg p-3 text-xs flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{purchaseSuccess}</span>
        </div>
      )}

      {purchaseError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg p-3 text-xs flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>ERROR: {purchaseError}</span>
        </div>
      )}

      {/* Active Subscriptions */}
      {activePlans.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>{t.activePlansHeader} ({activePlans.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlans.map((active) => {
              const startDate = new Date(active.startDate);
              const endDate = new Date(active.endDate);
              const elapsedDays = Math.min(30, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
              const progressPercent = (elapsedDays / 30) * 100;

              return (
                <div 
                  key={active.id}
                  className="bg-slate-950 border border-emerald-400 rounded-lg p-4 relative overflow-hidden group shadow-md"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-400" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] text-emerald-500/50 block">CONTRACT_ADDR: 0x{active.id.slice(0, 8)}...</span>
                      <h4 className="font-bold text-white text-xs uppercase">{active.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">
                      ACTIVE_RUN
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between border-b border-emerald-500/10 pb-1 text-[11px]">
                      <span className="text-emerald-500/60">DEPLOYED CAPITAL</span>
                      <span className="font-bold text-white">${active.price.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/10 pb-1 text-[11px]">
                      <span className="text-emerald-500/60">ESTIMATED YIELD</span>
                      <span className="font-bold text-emerald-400">+${active.dailyProfit.toFixed(2)} / DAY</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/10 pb-1 text-[11px]">
                      <span className="text-emerald-500/60">TOTAL HARVESTED</span>
                      <span className="font-bold text-emerald-300">+${active.totalEarned.toFixed(4)} USDT</span>
                    </div>
                  </div>

                  {/* Contract progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-emerald-500/50 uppercase font-bold">
                      <span>LOCK_TIME: {elapsedDays}/30 DAYS</span>
                      <span>30-DAY COLD LOCK</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-1 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Plans Subscription Grid */}
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
          {t.buyPlanHeader} (USDT INVESTMENT CHANNELS)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isPlanActive = activePlans.some(p => p.planId === plan.id && p.status === 'active' && new Date(p.endDate) > new Date());
            const hasSufficient = (user?.balance || 0) >= plan.price;

            return (
              <div 
                key={plan.id}
                className={`bg-slate-950 border rounded-lg p-4 flex flex-col justify-between transition-all relative group ${
                  isPlanActive
                    ? 'border-emerald-500/10 opacity-60'
                    : hasSufficient 
                      ? 'border-emerald-500/30 hover:border-emerald-400' 
                      : 'border-emerald-500/10 opacity-75'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="px-2 py-0.5 bg-slate-900 border border-emerald-500/20 rounded text-[9px] text-emerald-400 font-bold tracking-widest uppercase">
                      LEVEL_0{plan.id}
                    </div>
                    {isPlanActive ? (
                      <span className="text-[9px] text-emerald-400 font-bold uppercase animate-pulse">RUNNING</span>
                    ) : (
                      <span className="text-[9px] text-emerald-500/60 font-bold uppercase">TERM: {plan.durationDays} DAYS</span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">{plan.name}</h4>

                  <div className="space-y-2 mb-5 text-[11px]">
                    <div className="flex justify-between border-b border-emerald-500/10 pb-1">
                      <span className="text-emerald-500/50 uppercase">CAPITAL REQUIRED</span>
                      <span className="font-bold text-white">${plan.price.toLocaleString()} USDT</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/10 pb-1">
                      <span className="text-emerald-500/50 uppercase">DAILY PROFIT YIELD</span>
                      <span className="font-bold text-emerald-400">${plan.minProfit}-${plan.maxProfit} USDT</span>
                    </div>
                    <div className="flex text-[9px] text-emerald-500/40 leading-relaxed pt-1 gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>CAPITAL COLD LOCKED FOR {plan.durationDays} DAYS. YIELD DISTRIBUTED SECURELY DAILY.</span>
                    </div>
                  </div>
                </div>

                {isPlanActive ? (
                  <button
                    disabled
                    className="w-full font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-500/10 text-emerald-500/30 bg-slate-900/40 uppercase tracking-wider cursor-not-allowed"
                  >
                    <Shield className="w-3 h-3" />
                    <span>ALREADY ACTIVE</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider ${
                      hasSufficient
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900 border border-emerald-500/20 text-emerald-500/60 hover:text-emerald-400 hover:border-emerald-500/40'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t.buyNowBtn}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
