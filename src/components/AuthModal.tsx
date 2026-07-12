import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Mail, Key, HelpCircle, ArrowRight, User, Phone } from 'lucide-react';

interface AuthModalProps {
  view: 'login' | 'register' | null;
  onClose: () => void;
  onSetView: (view: 'login' | 'register' | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ view, onClose, onSetView }) => {
  const { register, login, language } = useApp();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [refCode, setRefCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  // Auto-fill referral code on mount or when view changes to register
  useEffect(() => {
    if (view === 'register') {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref');
      const savedRef = urlRef || localStorage.getItem('projectx_pending_referral') || '';
      if (savedRef) {
        setRefCode(savedRef);
      }
    }
  }, [view]);

  if (!view) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please provide both email and password.');
      setLoading(false);
      return;
    }

    if (view === 'register') {
      const emailLower = email.trim().toLowerCase();
      if (!emailLower.endsWith('@gmail.com')) {
        setError('Only @gmail.com email addresses are permitted. Temporary and other email domains are strictly prohibited.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (!firstName.trim()) {
        setError('First name is required.');
        setLoading(false);
        return;
      }
      if (!lastName.trim()) {
        setError('Last name is required.');
        setLoading(false);
        return;
      }
      if (!username.trim()) {
        setError('Username is required.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      const res = await register(
        email, 
        password, 
        refCode || undefined, 
        firstName, 
        lastName, 
        username, 
        phone
      );
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-mono hover:scale-110 transition-transform cursor-pointer"
        >
          [ESC]
        </button>

        <div className="p-8">
          <div className="flex items-center space-x-2 mb-6">
            <img 
              src="https://iili.io/C1qgH3x.jpg" 
              alt="DODDOGE Logo" 
              className="w-8 h-8 rounded-full border border-amber-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="font-mono text-xs text-amber-500 font-bold uppercase tracking-widest">
              DODDOGE TERMINAL
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            {view === 'register' ? t.signUpTitle : t.login}
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            {view === 'register' ? t.signUpSubtitle : 'Access your secure quant indicators, active miners, and premium telemetry charts.'}
          </p>

          {error && (
            error.includes('authorized domains list') || error.includes('unauthorized-domain') ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-4 text-xs mb-5 space-y-3 font-sans">
                <div className="font-bold font-mono text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
                  ⚠️ Domain Authorization Required
                </div>
                <p className="text-slate-300 leading-relaxed">
                  To enable Google Sign-In, please add this domain to your Authorized Domains list inside the Firebase Console.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-white flex justify-between items-center gap-2">
                  <span className="break-all select-all">{window.location.hostname}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setDomainCopied(true);
                      setTimeout(() => setDomainCopied(false), 2000);
                    }}
                    className="px-2 py-1 bg-amber-500 text-slate-950 rounded font-bold hover:bg-amber-400 transition-colors text-[10px] whitespace-nowrap cursor-pointer"
                  >
                    {domainCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-slate-400 text-[11px] space-y-1.5 pl-4 list-decimal list-outside">
                  <div>1. Go to the <b>Firebase Console</b>.</div>
                  <div>2. Navigate to <b>Authentication</b> &gt; <b>Settings</b> tab.</div>
                  <div>3. Under <b>Authorized domains</b>, click <b>Add domain</b>.</div>
                  <div>4. Paste the copied domain name and click <b>Add</b>.</div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs mb-4 font-mono">
                {error}
              </div>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        disabled={loading}
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        disabled={loading}
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        disabled={loading}
                        placeholder="johndoe12"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="tel"
                        disabled={loading}
                        placeholder="+123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Password (Secured Session Pin)
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {view === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.refLabel}
                  </label>
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="PX-XXXXXX"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{loading ? 'Processing...' : (view === 'register' ? t.submitSignUp : t.login)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onSetView(view === 'register' ? 'login' : 'register')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {view === 'register' ? t.alreadyHaveAccount : t.dontHaveAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
