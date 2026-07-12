import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useApp();
  const t = translations[language];

  return (
    <footer className="bg-slate-950 border-t border-emerald-500/20 py-8 px-4 mt-auto font-mono text-emerald-500/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Core links and brand */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-emerald-500/10 pb-6 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <img 
              src="https://iili.io/C1qgH3x.jpg" 
              alt="DODDOGE Logo" 
              className="w-6 h-6 rounded-full border border-emerald-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans font-bold text-white tracking-widest text-xs uppercase">
              DODDOGE<span className="text-emerald-500">_SYS</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase">
            <a href="#terms" className="hover:text-emerald-400 transition-colors">[Terms]</a>
            <a href="#privacy" className="hover:text-emerald-400 transition-colors">[Privacy]</a>
            <a href="#disclaimer" className="hover:text-emerald-400 transition-colors">[Risk]</a>
            <a href="#help" className="hover:text-emerald-400 transition-colors">[System Status]</a>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="space-y-2 max-w-4xl text-[9px] uppercase leading-relaxed text-emerald-500/40">
          <p>
            <strong className="text-emerald-500/60 font-bold">Risk Warning:</strong> Trading stock equities and digital cryptographic assets carries high systemic volatility and potential severe loss. Indicators and simulated portfolios on DODDOGE are for research presentation only. This terminal is not a registered broker or investment advisor.
          </p>
          <p>
            Operating 100% locally on Client-Side Local Storage Vault. Fully compliant with static zero-overhead hosting systems such as sitechai.com without external SQL database requirements.
          </p>
        </div>

        {/* Small copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] gap-2 pt-2 uppercase">
          <span>&copy; {new Date().getFullYear()} DODDOGE Corp. UNIX Terminal TTY Node. All rights reserved.</span>
          <div className="flex items-center space-x-3 text-[9px]">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500/40" />
              <span>SSL SECURE MODULE</span>
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500/40" />
              <span>AES-256 SESSION</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
