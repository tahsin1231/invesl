import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Terminal, Shield, Cpu, Activity, Play, ArrowRight, CornerDownRight, Coins, Wallet, Layers, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (view: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { language, stocks } = useApp();
  const t = translations[language];

  const [bootStep, setBootStep] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Simulation of UNIX boot sequence
  useEffect(() => {
    const logs = [
      "INIT: booting DODDOGE Mainframe...",
      "SYSTEM: loading UNIX v11.8 kernel modules...",
      "NET: handshake with SiteChai Cloud nodes success",
      "SECURE: initializing AES-256 local vault matrix...",
      "QUANT: dynamic stock telemetry sockets connected",
      "INDICATOR: prediction engine online (100% active)",
      "SYSTEMS ONLINE: ready to initiate terminal."
    ];

    if (bootStep < logs.length) {
      const timer = setTimeout(() => {
        setBootLogs(prev => [...prev, logs[bootStep]]);
        setBootStep(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  return (
    <div className="bg-slate-950 text-emerald-400 min-h-screen flex flex-col p-4 md:p-8 font-mono select-none crt relative overflow-hidden">
      
      {/* Aesthetic matrix grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center space-y-8 relative z-10">
        
        {/* Terminal Header */}
        <div className="border border-emerald-500/30 bg-slate-900/60 rounded-xl p-4 md:p-6 shadow-lg shadow-emerald-950/20 animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
              <span className="text-emerald-500/60 font-bold ml-2">DODDOGE://MAINFRAME.SYS</span>
            </div>
            <div className="text-emerald-500/40 text-[10px]">
              TTY: /dev/pts/0 (ONLINE)
            </div>
          </div>

          {/* Simulated boot logs */}
          <div className="space-y-1.5 text-xs md:text-sm text-emerald-400 min-h-[140px] font-mono leading-relaxed">
            {bootLogs.map((log, idx) => (
              <div key={idx} className="flex items-start">
                <span className="text-emerald-500/50 mr-2">root@doddoge:~#</span>
                <span>{log}</span>
              </div>
            ))}
            {bootStep < 7 && (
              <div className="flex items-center">
                <span className="text-emerald-500/50 mr-2">root@doddoge:~#</span>
                <span className="w-2 h-4 bg-emerald-400 blink inline-block" />
              </div>
            )}
          </div>
        </div>

        {/* Brand Main Display */}
        {bootStep >= 7 && (
          <div className="text-center space-y-6 animate-fade-in py-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-emerald-400 uppercase crt-flicker font-display">
              {t.heroTitle}
            </h1>
            <p className="text-emerald-500/85 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed uppercase">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer border border-emerald-400"
              >
                <span>{t.createAccountFree}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto bg-slate-950 hover:bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold px-8 py-3.5 rounded-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>{t.login}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live System Nodes and Real-Time Stock Telemetry Board */}
        {bootStep >= 7 && (
          <div className="space-y-6 animate-fade-in">
            {/* Real-time Ticker tape header */}
            <div className="border border-emerald-500/30 bg-slate-950/90 rounded-xl p-5 md:p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest font-mono">
                      [REAL_TIME_ASSET_TELEMETRY] / [LIVE_ORDER_BOOKS_ACTIVE]
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight font-mono">
                    GLOBAL CRYPTO & CORPORATE ASSET STREAM
                  </h2>
                  <p className="text-emerald-500/60 text-xs mt-1 leading-relaxed uppercase">
                    Live institutional-grade price indices and socket feedback channels. Simulated price feeds update automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">
                    SOCKET: CONNECTED
                  </span>
                </div>
              </div>

              {/* Dynamic Telemetry Table */}
              <div className="overflow-x-auto border border-emerald-500/15 rounded-lg bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse font-mono uppercase">
                  <thead>
                    <tr className="bg-slate-900/80 text-emerald-500/60 border-b border-emerald-500/20 text-[10px] tracking-wider font-bold">
                      <th className="py-3.5 px-4">ASSET_SYMBOL</th>
                      <th className="py-3.5 px-4 hidden sm:table-cell">ASSET_NAME</th>
                      <th className="py-3.5 px-4 text-right">MARKET_PRICE</th>
                      <th className="py-3.5 px-4 text-right hidden md:table-cell">PRICE_CHANGE</th>
                      <th className="py-3.5 px-4 text-right">PERCENT_CHANGE</th>
                      <th className="py-3.5 px-4 text-center hidden sm:table-cell">INDEX_FLOW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock) => {
                      const isPositive = stock.changePercent >= 0;
                      return (
                        <tr 
                          key={stock.symbol} 
                          className="border-b border-emerald-500/10 hover:bg-slate-900/60 transition-colors duration-200"
                        >
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {stock.symbol}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-500/80 font-medium hidden sm:table-cell">
                            {stock.name}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            ${stock.price >= 100 
                              ? stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                              : stock.price.toFixed(4)}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold hidden md:table-cell ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-center hidden sm:table-cell">
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                              <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? 'BULLISH' : 'BEARISH'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Extra Interactive Stocks Panel info */}
              <div className="bg-slate-900/30 border border-emerald-500/15 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="block font-bold text-white uppercase">[INSTITUTIONAL STREAM PRESET]</span>
                  <span className="block text-emerald-500/70 leading-relaxed uppercase">
                    Our platform executes secure algorithmic analytics pipelines across tier-1 liquidity networks. Authenticate your session profile to establish sub-second telemetry dashboards and custom warning parameters.
                  </span>
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[11px] border-b border-emerald-500/10 pb-1.5">
                    <span className="text-emerald-500/50">DATA_REDUNDANCY</span>
                    <span className="font-bold text-emerald-400">99.999% HIGH AVAILABILITY</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-500/50">EXECUTION_LATENCY</span>
                    <span className="font-bold text-emerald-400">&lt; 1.2MS VIA cPANEL MAIN NODE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Core Specs */}
        {bootStep >= 7 && (
          <div className="border border-emerald-500/10 bg-slate-900/20 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-[11px] text-emerald-500/70 uppercase">
            <div className="space-y-1">
              <span className="block text-emerald-500/40">HOST_ING</span>
              <span className="font-bold text-white">SITECHAI cPANEL</span>
            </div>
            <div className="space-y-1 border-l border-emerald-500/10">
              <span className="block text-emerald-500/40">SECURE_LEVEL</span>
              <span className="font-bold text-white">AES-256 VAULT</span>
            </div>
            <div className="space-y-1 border-l border-emerald-500/10">
              <span className="block text-emerald-500/40">YIELD_SYSTEM</span>
              <span className="font-bold text-white">AUTO AI MINING</span>
            </div>
            <div className="space-y-1 border-l border-emerald-500/10">
              <span className="block text-emerald-500/40">SYS_FEE</span>
              <span className="font-bold text-white">0% DEPOSIT</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
