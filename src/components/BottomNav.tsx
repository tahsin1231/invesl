import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Home, Terminal, Cpu, Wallet, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'markets' | 'earn' | 'wallet' | 'profile';
  setCurrentTab: (tab: 'home' | 'markets' | 'earn' | 'wallet' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { user, language } = useApp();
  const t = translations[language];

  if (!user || !user.isVerified) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-emerald-500/30 py-2.5 px-4 z-50 shadow-[0_-8px_24px_rgba(16,185,129,0.08)]">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        {/* Home option */}
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1 uppercase font-mono tracking-normal xs:tracking-wider sm:tracking-widest text-[9px] xs:text-[10px] font-bold transition-all duration-200 relative px-1 xs:px-3 py-1 cursor-pointer ${
            currentTab === 'home' ? 'text-emerald-400 scale-105' : 'text-emerald-500/40 hover:text-emerald-500/70'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'home' ? 'stroke-[2.5px] drop-shadow-[0_0_6px_#10b981]' : ''}`} />
          <span>Home</span>
          {currentTab === 'home' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>

        {/* Markets Option */}
        <button
          onClick={() => setCurrentTab('markets')}
          className={`flex flex-col items-center gap-1 uppercase font-mono tracking-normal xs:tracking-wider sm:tracking-widest text-[9px] xs:text-[10px] font-bold transition-all duration-200 relative px-1 xs:px-3 py-1 cursor-pointer ${
            currentTab === 'markets' ? 'text-emerald-400 scale-105' : 'text-emerald-500/40 hover:text-emerald-500/70'
          }`}
        >
          <Terminal className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'markets' ? 'stroke-[2.5px] drop-shadow-[0_0_6px_#10b981]' : ''}`} />
          <span>{t.markets}</span>
          {currentTab === 'markets' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>

        {/* Earn Option */}
        <button
          onClick={() => setCurrentTab('earn')}
          className={`flex flex-col items-center gap-1 uppercase font-mono tracking-normal xs:tracking-wider sm:tracking-widest text-[9px] xs:text-[10px] font-bold transition-all duration-200 relative px-1 xs:px-3 py-1 cursor-pointer ${
            currentTab === 'earn' ? 'text-emerald-400 scale-105' : 'text-emerald-500/40 hover:text-emerald-500/70'
          }`}
        >
          <Cpu className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'earn' ? 'stroke-[2.5px] drop-shadow-[0_0_6px_#10b981]' : ''}`} />
          <span>{t.earn}</span>
          {currentTab === 'earn' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>

        {/* Wallet Option */}
        <button
          onClick={() => setCurrentTab('wallet')}
          className={`flex flex-col items-center gap-1 uppercase font-mono tracking-normal xs:tracking-wider sm:tracking-widest text-[9px] xs:text-[10px] font-bold transition-all duration-200 relative px-1 xs:px-3 py-1 cursor-pointer ${
            currentTab === 'wallet' ? 'text-emerald-400 scale-105' : 'text-emerald-500/40 hover:text-emerald-500/70'
          }`}
        >
          <Wallet className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'wallet' ? 'stroke-[2.5px] drop-shadow-[0_0_6px_#10b981]' : ''}`} />
          <span>{t.wallet.split(' ')[0]}</span>
          {currentTab === 'wallet' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>

        {/* Profile Option */}
        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center gap-1 uppercase font-mono tracking-normal xs:tracking-wider sm:tracking-widest text-[9px] xs:text-[10px] font-bold transition-all duration-200 relative px-1 xs:px-3 py-1 cursor-pointer ${
            currentTab === 'profile' ? 'text-emerald-400 scale-105' : 'text-emerald-500/40 hover:text-emerald-500/70'
          }`}
        >
          <UserIcon className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'profile' ? 'stroke-[2.5px] drop-shadow-[0_0_6px_#10b981]' : ''}`} />
          <span>{t.profile}</span>
          {currentTab === 'profile' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          )}
        </button>
      </div>
    </div>
  );
};
