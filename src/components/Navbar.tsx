import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Globe, LogOut, Wallet, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (view: 'login' | 'register') => void;
  currentTab: 'home' | 'markets' | 'earn' | 'wallet' | 'profile';
  setCurrentTab: (tab: 'home' | 'markets' | 'earn' | 'wallet' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, currentTab, setCurrentTab }) => {
  const { user, logout, language, setLanguage } = useApp();
  const t = translations[language];

  return (
    <header className="border-b border-emerald-500/30 bg-slate-950 font-mono text-emerald-400">
      
      {/* Top Telemetry Header Rail */}
      <div className="bg-slate-950 border-b border-emerald-500/10 px-4 py-1 flex flex-col sm:flex-row sm:justify-between items-center text-[10px] uppercase text-emerald-500/50 gap-2">
        <div className="flex items-center space-x-4">
          <span>HOST: SITECHAI_V11</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">NODE_ID: ABC79FEE</span>
          <span className="hidden md:inline">•</span>
          <span>SPEED: 200 ms (SECURE)</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>UTC: {new Date().toISOString().slice(11, 19)}</span>
          <span>•</span>
          <span>SECURE PROTOCOL ACTIVE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          <div 
            onClick={() => { if (user) setCurrentTab('home'); }}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <img 
              src="https://iili.io/C1qgH3x.jpg" 
              alt="DODDOGE Logo" 
              className="w-11 h-11 rounded-full border border-emerald-500/40 object-cover shadow-[0_0_8px_rgba(16,185,129,0.2)]"
              referrerPolicy="no-referrer"
            />
            <span className="font-display font-bold text-white tracking-wider xs:tracking-widest text-sm xs:text-base group-hover:text-emerald-400 transition-colors uppercase crt-flicker">
              DODDOGE<span className="hidden xs:inline text-emerald-500">_CLI</span>
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-1 text-emerald-500/70 hover:text-emerald-400 px-2 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-emerald-500/30 rounded shadow-xl py-1 hidden group-hover:block w-28 z-50">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-950 hover:text-emerald-400 transition-colors uppercase cursor-pointer ${language === 'en' ? 'text-emerald-400 font-bold' : 'text-emerald-500/60'}`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-950 hover:text-emerald-400 transition-colors uppercase cursor-pointer ${language === 'es' ? 'text-emerald-400 font-bold' : 'text-emerald-500/60'}`}
              >
                ESPAÑOL
              </button>
            </div>
          </div>

          {user && user.isVerified ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Wallet Button */}
              <button
                onClick={() => setCurrentTab('wallet')}
                className={`px-2 py-1.5 xs:px-3 rounded text-[10px] xs:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
                  currentTab === 'wallet'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:bg-slate-850'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>${user.balance.toFixed(2)} USDT</span>
              </button>

              {/* Profile button - Hidden on mobile as it's in the bottom bar */}
              <button
                onClick={() => setCurrentTab('profile')}
                className={`hidden sm:inline-block p-1.5 rounded hover:bg-slate-900/40 text-emerald-500/70 hover:text-emerald-400 transition-colors cursor-pointer ${
                  currentTab === 'profile' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/20' : ''
                }`}
                title={t.profile}
              >
                <UserIcon className="w-4 h-4" />
              </button>

              {/* Logout - Hidden on mobile as it is added in the profile view */}
              <button
                onClick={logout}
                className="hidden sm:inline-block p-1.5 bg-slate-900 hover:bg-red-950/30 text-emerald-500/50 hover:text-red-400 rounded border border-emerald-500/15 hover:border-red-500/30 transition-all cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 xs:space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-emerald-500/80 hover:text-emerald-400 font-bold text-[10px] xs:text-xs py-2 px-1.5 xs:px-3 transition-colors cursor-pointer uppercase"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] xs:text-xs py-2 px-2.5 xs:px-4 rounded transition-all cursor-pointer uppercase border border-emerald-400"
              >
                {t.createAccountFree}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
