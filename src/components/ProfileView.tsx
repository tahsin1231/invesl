import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ShieldCheck, Share2, Copy, Check, Users, HelpCircle, Award, Terminal, LogOut } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, referrals, language, logout } = useApp();
  const t = translations[language];

  const [copiedLink, setCopiedLink] = useState(false);

  if (!user) return null;

  // Derive referral link
  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-emerald-400">
      
      {/* Profile Info Details (4 cols) */}
      <div className="lg:col-span-4 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-5 shadow-lg shadow-emerald-950/10">
        <div>
          <span className="text-[9px] text-emerald-500/50 uppercase tracking-widest block mb-1">ACCOUNT_IDENTITY</span>
          <h3 className="font-bold text-white text-xs truncate">{user.email}</h3>
          <p className="text-[9px] text-emerald-500/40 mt-1 uppercase">Node UUID: {user.id}</p>
        </div>

        <div className="border-t border-emerald-500/10 pt-4 space-y-3 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-500/55 uppercase">FIRST NAME</span>
            <span className="text-white font-semibold">{user.firstName || 'NOT PROVIDED'}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-500/55 uppercase">LAST NAME</span>
            <span className="text-white font-semibold">{user.lastName || 'NOT PROVIDED'}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-500/55 uppercase">USERNAME</span>
            <span className="text-emerald-300 font-bold font-mono">@{user.username || 'NOT_SET'}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-500/55 uppercase">PHONE</span>
            <span className="text-white font-mono">{user.phone || 'NOT PROVIDED'}</span>
          </div>
        </div>

        <div className="border-t border-emerald-500/10 pt-4 space-y-3.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-emerald-500/55 uppercase">STATUS</span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[9px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>VERIFIED</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-500/55 uppercase">PROTOCOL</span>
            <span className="text-emerald-300">Simulated Email PIN</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-500/55 uppercase">ESTABLISHED</span>
            <span className="text-emerald-500/50">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          <button
            onClick={logout}
            className="w-full mt-4 bg-slate-900 hover:bg-red-950/20 text-emerald-500/60 hover:text-red-400 border border-emerald-500/10 hover:border-red-500/30 rounded py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Referral Affiliate Terminal (8 cols) */}
      <div className="lg:col-span-8 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-5 shadow-lg shadow-emerald-950/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">AFFILIATE_ROUTING_NODE</span>
          </div>
          <h2 className="text-md font-bold text-white uppercase tracking-tight">{t.referralTitle}</h2>
          <p className="text-emerald-500/80 text-xs mt-1.5 leading-relaxed uppercase">
            {t.referralDesc}
          </p>
        </div>

        {/* Copy Referral Link Panel */}
        <div className="bg-slate-900 border border-emerald-500/20 rounded-lg p-4 space-y-2">
          <label className="block text-[9px] text-emerald-500/40 uppercase tracking-widest font-bold">{t.referralLink}</label>
          <div className="flex items-center space-x-2 bg-slate-950 border border-emerald-500/20 rounded px-3 py-2 justify-between">
            <span className="text-[10px] text-emerald-400 truncate pr-2 select-all font-mono">
              {referralLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="bg-slate-900 hover:bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-400 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invited peers */}
        <div>
          <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.referredCount} ({referrals.length})</span>
          </h3>

          {referrals.length === 0 ? (
            <div className="border border-emerald-500/10 rounded-lg p-6 text-center text-emerald-500/40 text-xs uppercase">
              No registered referral peers identified. Share link to route 20% instant dividends.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse uppercase">
                <thead>
                  <tr className="text-emerald-500/40 border-b border-emerald-500/10 pb-1.5 text-[9px] tracking-wider font-bold">
                    <th className="py-2">PEER_IDENTITY</th>
                    <th className="py-2">TIMESTAMP</th>
                    <th className="py-2 text-right">COMMISSION_TIER</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref, idx) => (
                    <tr key={idx} className="border-b border-emerald-500/10 text-emerald-400/80">
                      <td className="py-2.5 text-emerald-300 font-semibold">{ref.email}</td>
                      <td className="py-2.5 text-emerald-500/50">{ref.date}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">20% INSTANT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commission info notes */}
        <div className="bg-slate-900 border border-emerald-500/10 rounded p-3 flex items-start space-x-2 text-[9px] leading-relaxed text-emerald-500/60 uppercase">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500/40 shrink-0 mt-0.5" />
          <span>
            COMMISSION REVENUES ARE INSTANTLY ROUTED AT THE EXACT BLOCK MOMENT YOUR DELEGATE DEPLOYS ACTIVE CAPITAL INSIDE THE EARN MAIN TERMINAL. OUTBOUND SETTLEMENTS BEAR NO CAP LIMIT.
          </span>
        </div>

      </div>

    </div>
  );
};
