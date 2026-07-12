import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, Newspaper, ArrowRight, Zap, RefreshCw, Radio } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'AI TECH' | 'QUANT' | 'MARKET' | 'SYSTEM';
  timestamp: string;
  readTime: string;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'HIGH VOLATILITY';
}

export const HomeView: React.FC = () => {
  const { user, miningBalance, activePlans } = useApp();
  const [systemLoad, setSystemLoad] = useState(48.2);
  const [aiUptime, setAiUptime] = useState('99.982%');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');

  // Fetch dynamic administrator announcement
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const snap = await getDoc(settingsRef);
        if (snap.exists() && snap.data().announcement) {
          setBroadcastMessage(snap.data().announcement);
        }
      } catch (err) {
        console.error('Error fetching broadcast announcement:', err);
      }
    };
    fetchAnnouncement();
  }, []);

  // Auto fluctuating load and status parameters to look dynamic
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const diff = (Math.random() - 0.5) * 4;
        return Math.max(25, Math.min(95, Number((prev + diff).toFixed(1))));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const newsData: NewsItem[] = [
    {
      id: 'n1',
      title: 'AlphaQuant V5 achieves 91.2% directional trading precision on high-frequency assets',
      summary: 'DeepMind-derived quant reinforcement models successfully completed testing across multi-vector assets, demonstrating high resilience against sudden liquidations.',
      category: 'AI TECH',
      timestamp: '10 mins ago',
      readTime: '3 min read',
      sentiment: 'BULLISH'
    },
    {
      id: 'n2',
      title: 'DODDOGE autonomous mining nodes activate layer-2 network optimization',
      summary: 'DODDOGE core engineers deployed the latest cryptographic hash tuning framework, reducing energy dissipation overhead by 34% while increasing raw reward rates.',
      category: 'SYSTEM',
      timestamp: '42 mins ago',
      readTime: '2 min read',
      sentiment: 'BULLISH'
    },
    {
      id: 'n3',
      title: 'Federal Reserve rate trajectory triggers high volatility in neural net models',
      summary: 'Quantitative machine learning indexes have elevated volatility protective guards as automated trading agents rebalance multi-asset exposures.',
      category: 'MARKET',
      timestamp: '2 hours ago',
      readTime: '4 min read',
      sentiment: 'HIGH VOLATILITY'
    },
    {
      id: 'n4',
      title: 'Generative AI-Agent pools show 40% reduction in maximum drawdown periods',
      summary: 'Sparsely gated mixture-of-experts (MoE) neural networks successfully demonstrated real-time risk minimization during pre-market liquidity gaps.',
      category: 'QUANT',
      timestamp: '5 hours ago',
      readTime: '3 min read',
      sentiment: 'BULLISH'
    },
    {
      id: 'n5',
      title: 'Global institutional funds shift $1.2B to predictive AI arbitrage clusters',
      summary: 'Venture Capital frameworks and sovereign digital ledgers are aggressively subsidizing high-performance computing centers dedicated to algorithmic stock modeling.',
      category: 'MARKET',
      timestamp: '1 day ago',
      readTime: '5 min read',
      sentiment: 'NEUTRAL'
    }
  ];

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert / Announcement ticker */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE FEED:
          </span>
        </div>
        <div className="overflow-hidden relative h-5 flex-1">
          <div className="absolute inset-0 flex items-center">
            <p className="text-xs text-white/95 truncate font-mono">
              {broadcastMessage ? (
                <span>[BROADCAST] {broadcastMessage}</span>
              ) : (
                <span>[SYSTEM_INSIGHT] Active AI nodes running model optimization. Active mining hashes: {(activePlans.length * 8.4 + 4.2).toFixed(2)} MH/s. Fully synchronized with smart contracts.</span>
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="text-emerald-500/60 hover:text-emerald-400 transition-colors p-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Hero Welcome Panel */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
            AI Quantum Terminal v11.8
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
            Welcome to <span className="text-emerald-400">DODDOGE</span> Neural Center
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Monitor and govern your quantitative operations. Our server-side machine learning arrays continuously track macro fluctuations, executing simulated high-yield block arbitrage.
          </p>
          {user && (
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
              <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
                Logged in as: <span className="text-emerald-400 font-bold">{user.email}</span>
              </div>
              <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
                Security ID: <span className="text-emerald-400 font-bold">{user.id.slice(0, 8)}...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live System Diagnostics / Telemetry Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 hover:border-emerald-500/20 rounded-xl p-4 transition-all">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">AI Processor Load</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white font-mono">{systemLoad}%</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">NORMAL</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-3 border border-slate-800">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${systemLoad}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 hover:border-emerald-500/20 rounded-xl p-4 transition-all">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Model Accuracy</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white font-mono">91.84%</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">HIGH</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-3 border border-slate-800">
            <div className="bg-emerald-500 h-full" style={{ width: '91.84%' }} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 hover:border-emerald-500/20 rounded-xl p-4 transition-all">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Active AI Contracts</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white font-mono">{activePlans.length} Nodes</span>
            <span className="text-[10px] text-emerald-500/60 font-bold font-mono">ONLINE</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-3 border border-slate-800">
            <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(10, Math.min(100, activePlans.length * 20))}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 hover:border-emerald-500/20 rounded-xl p-4 transition-all">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Node Heartbeat</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white font-mono">{aiUptime}</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono animate-pulse">●</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-3 border border-slate-800">
            <div className="bg-emerald-500 h-full" style={{ width: '99.9%' }} />
          </div>
        </div>
      </div>

      {/* Main Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* News Stream Column (Takes 2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-4 h-4 text-emerald-500" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                AI &amp; Algorithmic Trading Intelligence
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-500/50 uppercase">ENGLISH DESK</span>
          </div>

          <div className="space-y-4">
            {newsData.map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/20 p-5 rounded-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-950 text-emerald-400 border border-slate-800 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.sentiment === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400' :
                    item.sentiment === 'HIGH VOLATILITY' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-950 text-slate-400'
                  }`}>
                    {item.sentiment}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-950 text-[10px] font-mono">
                  <span className="text-slate-500">Read complexity: <strong className="text-slate-400">{item.readTime}</strong></span>
                  <span className="text-emerald-500/60 group-hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer">
                    Inspect payload <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Info Sidebar (Takes 1 span) */}
        <div className="space-y-6">
          
          {/* AI Trading Tutorial Card */}
          <div className="bg-slate-900/60 border border-emerald-500/20 p-5 rounded-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Core Quant Protocol
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              DODDOGE operates multi-layered Neural Nodes. By selecting Level plans, you scale the computational allocation requested by the reinforcement agents.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Model Base:</span>
                <span className="text-white font-bold">Transformer v4</span>
              </div>
              <div className="flex justify-between">
                <span>Signal Speed:</span>
                <span className="text-white font-bold">&lt; 14ms TTY</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Hedging:</span>
                <span className="text-emerald-400 font-bold">ACTIVE (99%)</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidity Guard:</span>
                <span className="text-emerald-400 font-bold">ENABLED</span>
              </div>
            </div>
          </div>

          {/* User Mining Status Mini Widget */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Mining Node Status
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Node Speed:</span>
                <span className="font-mono text-emerald-400 font-bold">{(activePlans.length * 8.4 + 4.2).toFixed(2)} MH/s</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Unclaimed Yield:</span>
                <span className="font-mono text-white font-bold">${miningBalance.toFixed(5)} USDT</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Active Miners:</span>
                <span className="font-mono text-emerald-400 font-bold">{activePlans.length}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-850 uppercase leading-normal">
              ℹ️ Mining speed scales dynamically based on your deployed AI plan models. Collect yields anytime.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
