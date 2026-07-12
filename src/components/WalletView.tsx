import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Clock, HelpCircle, Copy, Check, QrCode } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { user, transactions, deposit, verifyDeposit, withdraw, language } = useApp();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState('USDT');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Oxapay specific states
  const [oxapayLoading, setOxapayLoading] = useState(false);
  const [oxapayError, setOxapayError] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<{ trackId: string; paymentUrl: string; amount: number } | null>(null);
  const [verifyingTxId, setVerifyingTxId] = useState<string | null>(null);
  const [verifyingMessage, setVerifyingMessage] = useState<string | null>(null);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOxapayError(null);
    setDepositSuccess(false);
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setOxapayError('Please enter a valid deposit amount');
      return;
    }
    
    setOxapayLoading(true);
    try {
      const result = await deposit(amt, depositMethod);
      if (result.success && result.trackId && result.paymentUrl) {
        setActiveInvoice({
          trackId: result.trackId,
          paymentUrl: result.paymentUrl,
          amount: amt
        });
        setDepositSuccess(true);
      } else {
        setOxapayError(result.error || 'Failed to generate payment invoice.');
      }
    } catch (err: any) {
      setOxapayError(err.message || 'An error occurred during invoice generation.');
    } finally {
      setOxapayLoading(false);
    }
  };

  const handleVerifyInvoice = async (trackId: string, txId?: string) => {
    if (txId) setVerifyingTxId(txId);
    setVerifyingMessage('Checking payment status on blockchain...');
    try {
      const res = await verifyDeposit(trackId);
      alert(res.message);
      if (res.success) {
        if (activeInvoice && activeInvoice.trackId === trackId) {
          setActiveInvoice(null);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifyingMessage(null);
      if (txId) setVerifyingTxId(null);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(false);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Provide a valid withdrawal quantity');
      return;
    }

    if (amt <= 0.25) {
      setWithdrawError('Withdrawal quantity must be greater than the $0.25 USDT fee');
      return;
    }

    if (!withdrawAddress) {
      setWithdrawError('Provide a destination BSC/BEP20 address');
      return;
    }

    // BSC/BEP20 address check: starts with 0x and is 42 hex chars long
    const cleanAddress = withdrawAddress.trim();
    const isBscAddress = /^0x[a-fA-F0-9]{40}$/.test(cleanAddress);
    if (!isBscAddress) {
      setWithdrawError('Invalid USDT BEP20 wallet address. It must be a Binance Smart Chain (BSC) address starting with "0x" followed by 40 hex characters.');
      return;
    }

    try {
      const result = await withdraw(amt, cleanAddress);
      if (result.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        setWithdrawAddress('');
      } else {
        setWithdrawError(result.error || 'Withdrawal failed');
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal request failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-emerald-400">
      
      {/* Balance Summary Header Cards (4 cols on lg) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Total Balance */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <div className="absolute right-4 top-4 text-emerald-500/20">
            <DollarSign className="w-8 h-8" />
          </div>
          <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-1">
            {t.totalBalance}
          </span>
          <div className="text-xl font-bold text-white mb-2">
            ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </div>
          <p className="text-[9px] text-emerald-500/40 uppercase">Includes accumulated yields and manual deposits</p>
        </div>

        {/* Active Capital Allocations */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-1">
            {t.activeInvestments}
          </span>
          <div className="text-lg font-bold text-amber-500 mb-2">
            ${user?.activeInvestments.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
          </div>
          <p className="text-[9px] text-emerald-500/40 uppercase">Capital committed to active 30-day lock levels</p>
        </div>

        {/* Total Profits */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-1">
            {t.totalProfit}
          </span>
          <div className="text-lg font-bold text-emerald-300 mb-2">
            ${user?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT
          </div>
          <p className="text-[9px] text-emerald-500/40 uppercase">Profits harvested from active AI prediction cycles</p>
        </div>

      </div>

      {/* Main Funding Center Terminal (8 cols on lg) */}
      <div className="lg:col-span-8 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 shadow-lg shadow-emerald-950/10">
        
        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-500/20 pb-3 mb-5">
          <button
            onClick={() => { setActiveSubTab('deposit'); setWithdrawSuccess(false); setWithdrawError(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === 'deposit'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-slate-900/50'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => { setActiveSubTab('withdraw'); setDepositSuccess(false); }}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === 'withdraw'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-slate-900/50'
            }`}
          >
            Withdraw
          </button>
          <button
            onClick={() => { setActiveSubTab('history'); setDepositSuccess(false); setWithdrawSuccess(false); }}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-slate-900/50'
            }`}
          >
            Transaction History
          </button>
        </div>

        {/* Deposit Panel */}
        {activeSubTab === 'deposit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeInvoice ? (
              <div className="bg-slate-900 border border-emerald-500/20 rounded-lg p-5 space-y-4 flex flex-col justify-center">
                <div className="text-center">
                  <h3 className="font-bold text-white text-xs uppercase mb-1">OxaPay Crypto Invoice</h3>
                  <p className="text-[9px] text-emerald-500/40 uppercase">A secure invoice has been compiled</p>
                </div>
                
                <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-lg text-center space-y-1">
                  <div className="text-[10px] text-emerald-500/50 uppercase">Transfer Amount</div>
                  <div className="text-xl font-bold text-white">${activeInvoice.amount} USDT</div>
                  <div className="text-[8px] text-emerald-500/30 uppercase font-mono">Invoice Tracker ID: {activeInvoice.trackId}</div>
                </div>

                <div className="space-y-2 font-mono">
                  <a
                    href={activeInvoice.paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-center"
                  >
                    <span>Proceed to Pay</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleVerifyInvoice(activeInvoice.trackId)}
                    disabled={!!verifyingMessage}
                    className="w-full bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    {verifyingMessage ? 'Verifying payment...' : 'Confirm / Verify Payment'}
                  </button>
                  
                  <button
                    onClick={() => setActiveInvoice(null)}
                    className="text-[9px] text-emerald-500/40 hover:text-emerald-500/80 uppercase block mx-auto transition-colors"
                  >
                    Dismiss (You can verify later in History)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <h3 className="font-bold text-white text-xs uppercase mb-2">Automated OxaPay Deposit</h3>
                
                <div>
                  <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">Deposit Amount (USDT)</label>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">Asset Protocol</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="USDT">USDT (Supports TRC20, ERC20 & BEP20 via OxaPay)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={oxapayLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  {oxapayLoading ? (
                    <span>Generating Secure Invoice...</span>
                  ) : (
                    <>
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Generate Payment Invoice</span>
                    </>
                  )}
                </button>

                {oxapayError && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded p-2 text-center text-[10px] uppercase">
                    Error: {oxapayError}
                  </div>
                )}
              </form>
            )}

            {/* OxaPay gateway info */}
            <div className="bg-slate-900 border border-emerald-500/20 rounded-lg p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 p-1 rounded-full flex items-center justify-center text-emerald-400">
                <QrCode className="w-8 h-8" />
              </div>

              <h4 className="text-xs font-bold text-white uppercase">Secured by OxaPay</h4>
              <p className="text-[10px] text-emerald-500/60 uppercase leading-relaxed max-w-[240px]">
                We use OxaPay decentralized processing network for zero-delay payment settlement.
              </p>
              
              <div className="text-[9px] text-left bg-slate-950 p-3 rounded border border-emerald-500/10 space-y-1.5 w-full font-mono text-emerald-500/50">
                <div className="font-bold text-white uppercase mb-1">How it works:</div>
                <div>1. Enter deposit amount & generate invoice.</div>
                <div>2. Choose your preferred crypto protocol at checkout.</div>
                <div>3. After transfer, click "Verify" to credit instantly.</div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Panel */}
        {activeSubTab === 'withdraw' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-4 max-w-lg">
            <h3 className="font-bold text-white text-xs uppercase mb-2">Withdraw Funds</h3>
            
            <div className="bg-amber-500/5 border border-amber-500/20 rounded p-3 flex items-start space-x-2 text-[10px] text-amber-500 uppercase leading-relaxed mb-3">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                NOTICE: Accrued profit and available balances can be withdrawn instantly once approved by the administrator. Withdrawals are restricted to the Binance Smart Chain (USDT BEP20) network.
              </span>
            </div>

            {withdrawError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded p-2 text-[10px] uppercase font-mono">
                ERROR: {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded p-2 text-[10px] uppercase text-center font-mono">
                WITHDRAWAL REQUEST SENT: Your request is queued for administrator review and real OxaPay BSC execution.
              </div>
            )}

            <div>
              <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">Withdrawal Amount ($)</label>
              <input
                type="number"
                min="5"
                step="any"
                placeholder="0.00"
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">Destination USDT BEP20 Wallet Address (BSC)</label>
              <input
                type="text"
                placeholder="0x... (Binance Smart Chain BEP-20 address only)"
                required
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            {/* Real-time Fee and Estimated Payout Breakdown */}
            <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/10 space-y-1.5 text-[10px] font-mono text-emerald-500/70">
              <div className="flex justify-between">
                <span>Requested Gross Amount:</span>
                <span className="text-white">${(parseFloat(withdrawAmount) || 0).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-red-400/80">
                <span>Withdrawal Transaction Fee:</span>
                <span>-$0.25 USDT</span>
              </div>
              <div className="border-t border-emerald-500/10 my-1 pt-1 flex justify-between font-bold text-emerald-400">
                <span>Estimated Net Payout:</span>
                <span className="text-emerald-300">
                  ${Math.max(0, (parseFloat(withdrawAmount) || 0) - 0.25).toFixed(2)} USDT
                </span>
              </div>
              <p className="text-[8px] text-emerald-500/40 uppercase mt-1 leading-normal">
                Payout is processed automatically to your BEP20 wallet once approved in the admin queue.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Confirm Withdrawal</span>
            </button>
          </form>
        )}

        {/* Transaction History Panel */}
        {activeSubTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-xs uppercase mb-2">SYSTEM_TRANSACTION_LOG</h3>
            
            {transactions.length === 0 ? (
              <p className="text-emerald-500/40 text-xs text-center py-6 uppercase">No transactions identified on this account.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse uppercase">
                  <thead>
                    <tr className="text-emerald-500/50 border-b border-emerald-500/20 pb-2 text-[9px] tracking-wider font-mono">
                      <th className="py-2 hidden sm:table-cell">TX_ID</th>
                      <th className="py-2">TYPE</th>
                      <th className="py-2 text-right">VOLUME</th>
                      <th className="py-2">STATUS</th>
                      <th className="py-2 hidden sm:table-cell">DATETIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-emerald-500/10 hover:bg-slate-900/40 text-emerald-400/80 font-mono">
                        <td className="py-2 font-semibold text-emerald-400 hidden sm:table-cell">0x{tx.id.slice(0, 8)}</td>
                        <td className="py-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-300' :
                            tx.type === 'withdraw' ? 'bg-red-500/20 text-red-300' :
                            tx.type === 'invest' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-emerald-500/40'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-2 text-right font-bold ${
                          tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {tx.status}
                            </span>
                            {tx.type === 'deposit' && tx.status === 'pending' && tx.trackId && (
                              <button
                                onClick={() => handleVerifyInvoice(tx.trackId!, tx.id)}
                                disabled={verifyingTxId === tx.id}
                                className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[9px] font-bold cursor-pointer transition-all uppercase font-mono"
                              >
                                {verifyingTxId === tx.id ? '...' : 'Verify'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-emerald-500/40 hidden sm:table-cell">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
