import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { StockData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Terminal, Shield, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';

export const MarketsView: React.FC = () => {
  const { stocks, selectedStock, setSelectedStock, language } = useApp();
  const t = translations[language];

  const handleSelectAsset = (asset: StockData) => {
    setSelectedStock(asset);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-emerald-400">
      
      {/* Left side list */}
      <div className="lg:col-span-5 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 shadow-lg shadow-emerald-950/10">
        <div className="flex items-center justify-between mb-4 border-b border-emerald-500/20 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>SYS_TICKER_STREAM</span>
            </div>
            <p className="text-[10px] text-emerald-500/60 mt-1 uppercase">
              {t.stockStreamDesc}
            </p>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold tracking-widest">
            LIVE_FEED
          </span>
        </div>

        {/* Assets list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {stocks.map((asset) => {
            const isSelected = selectedStock.symbol === asset.symbol;
            const isPositive = asset.changePercent >= 0;

            return (
              <div
                key={asset.symbol}
                onClick={() => handleSelectAsset(asset)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-400 text-white shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950 border-emerald-500/10 text-emerald-500/80 hover:border-emerald-500/30 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-emerald-500/50'
                  }`}>
                    {asset.symbol}
                  </div>
                  <div>
                    <span className="font-semibold text-xs block truncate max-w-[120px]">{asset.name}</span>
                    <span className="text-[9px] text-emerald-500/40 uppercase tracking-wider">{asset.type} / USD</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-semibold block">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold mt-0.5 ${
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side live chart view */}
      <div className="lg:col-span-7 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 shadow-lg shadow-emerald-950/10 flex flex-col justify-between">
        
        {/* Active Asset Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/20 pb-4 mb-4">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded uppercase">
              {selectedStock.symbol}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-md font-bold text-white uppercase">{selectedStock.name}</h2>
                <span className="px-1.5 py-0.5 bg-slate-900 border border-emerald-500/10 text-emerald-500/60 rounded text-[9px] font-bold uppercase tracking-wider">
                  {selectedStock.type}
                </span>
              </div>
              <p className="text-[9px] text-emerald-500/40 mt-0.5 uppercase">Contract node: {selectedStock.symbol}/USD • REAL-TIME TELEMETRY</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold text-white tracking-tight block">
              ${selectedStock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <div className={`text-[10px] font-bold mt-0.5 ${
              selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Unix Warning box */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-start space-x-3 text-amber-500">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-relaxed">
            <span className="font-bold uppercase block mb-0.5">{t.noTradeWarning}</span>
            <span>
              This mainframe interface acts as a static quantitative telemetry terminal. Direct trading operations on live tickers are locked. Capital delegation is processed via autonomous prediction scripts inside the <span className="underline font-bold uppercase">Earn</span> node.
            </span>
          </div>
        </div>

        {/* Dynamic terminal stock chart with scanlines */}
        <div className="h-64 w-full mb-4 relative bg-slate-950 border border-emerald-500/10 rounded-lg p-2 overflow-hidden">
          <div className="absolute top-2 right-2 z-10 flex items-center space-x-1.5 bg-slate-900/90 border border-emerald-500/20 rounded px-2 py-0.5 text-[9px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-emerald-400 font-bold uppercase">SOCKET_ONLINE</span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedStock.history}>
              <XAxis 
                dataKey="time" 
                stroke="#10b981" 
                strokeOpacity={0.3}
                fontSize={9} 
                tickLine={false}
              />
              <YAxis 
                stroke="#10b981" 
                strokeOpacity={0.3}
                fontSize={9} 
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${Number(val).toFixed(1)}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#10b98130', borderRadius: '4px' }}
                labelStyle={{ color: '#10b981', fontSize: '9px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff', fontSize: '10px' }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'PRICE']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={1.5}
                fillOpacity={0.08} 
                fill="#10b981" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* UNIX Ledger table */}
        <div className="bg-slate-950 border border-emerald-500/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2 text-[9px] text-emerald-500/40 uppercase tracking-wider font-bold border-b border-emerald-500/10 pb-1.5">
            <span>VOL_BID_TTY</span>
            <span>INDEX_LIMIT</span>
            <span>VOL_ASK_TTY</span>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between text-red-400">
              <span>1.04 TTY</span>
              <span>${(selectedStock.price * 1.0003).toFixed(2)}</span>
              <span>8,838.40</span>
            </div>
            <div className="flex justify-between text-red-500/80">
              <span>0.42 TTY</span>
              <span>${(selectedStock.price * 1.0001).toFixed(2)}</span>
              <span>53,031.62</span>
            </div>
            <div className="flex justify-between text-emerald-500/80">
              <span>2.11 TTY</span>
              <span>${(selectedStock.price * 0.9999).toFixed(2)}</span>
              <span>77,022.18</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>0.95 TTY</span>
              <span>${(selectedStock.price * 0.9997).toFixed(2)}</span>
              <span>32,197.80</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
