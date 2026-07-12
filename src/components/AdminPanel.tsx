import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { User, ActivePlan, Transaction, Plan } from '../types';
import { PLANS } from '../utils/data';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc,
  query,
  where,
  deleteDoc,
  collectionGroup
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  Users, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Plus, 
  Minus, 
  TrendingUp, 
  Megaphone, 
  Settings, 
  LogOut, 
  Search, 
  RefreshCw, 
  Sliders,
  Gift,
  ShieldCheck,
  Award,
  Terminal,
  Cpu
} from 'lucide-react';

interface PromoCode {
  code: string;
  amount: number;
  maxClaims: number;
  claimsCount: number;
  createdAt: string;
}

interface AuditLog {
  timestamp: string;
  action: string;
  target: string;
}

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Auth states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App core states
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserPlans, setSelectedUserPlans] = useState<ActivePlan[]>([]);
  const [selectedUserTxs, setSelectedUserTxs] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'mining' | 'promos' | 'system' | 'plans' | 'withdrawals'>('users');

  // Dynamic plans states
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanMinProfit, setNewPlanMinProfit] = useState('');
  const [newPlanMaxProfit, setNewPlanMaxProfit] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Actions forms states
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState<'add' | 'remove'>('add');
  const [txType, setTxType] = useState<'deposit' | 'withdraw' | 'invest' | 'profit' | 'referral'>('deposit');
  const [txDescription, setTxDescription] = useState('');
  
  // Deploy mining contract state
  const [deployPlanId, setDeployPlanId] = useState('1');
  const [deployLoading, setDeployLoading] = useState(false);

  // Promo code states
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoAmount, setNewPromoAmount] = useState('');
  const [newPromoLimit, setNewPromoLimit] = useState('50');
  const [promoLoading, setPromoLoading] = useState(false);

  // System Settings state
  const [globalAnnouncement, setGlobalAnnouncement] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [marketPumpTicker, setMarketPumpTicker] = useState('BTC');
  const [marketPumpPercent, setMarketPumpPercent] = useState('5.0');
  const [platformUsersOffset, setPlatformUsersOffset] = useState('14800');
  const [platformPayoutsOffset, setPlatformPayoutsOffset] = useState('249200');
  const [oxapayKeyInput, setOxapayKeyInput] = useState('');
  const [oxapayPayoutKeyInput, setOxapayPayoutKeyInput] = useState('');
  const [systemSaving, setSystemSaving] = useState(false);

  // Withdrawals queue state
  const [pendingWithdrawals, setPendingWithdrawals] = useState<(Transaction & { userId: string; userEmail: string })[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

  // Session audit trail
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Monitor Auth Status on load
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === 'admin@gmail.com') {
        setIsAuthorized(true);
        fetchUsers();
        fetchPromoCodes();
        fetchGlobalSettings();
        fetchPlans();
        fetchPendingWithdrawals();
        addAuditLog('Authorized Session', 'System Mainframe');
      }
    };
    checkAuth();
  }, []);

  // Log audit helper
  const addAuditLog = (action: string, target: string) => {
    const log: AuditLog = {
      timestamp: new Date().toLocaleTimeString(),
      action,
      target
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Authenticate Admin
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    if (adminEmail.trim().toLowerCase() !== 'admin@gmail.com' || adminPassword !== 'Admin23') {
      setAuthError('Unauthorized Administrator credentials.');
      setAuthLoading(false);
      return;
    }

    try {
      // Login with standard firebase sign in
      const res = await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword);
      
      // Auto-create profile in Firestore if it doesn't exist
      const adminDocRef = doc(db, 'users', res.user.uid);
      const adminSnap = await getDoc(adminDocRef);
      if (!adminSnap.exists()) {
        const adminProfile: User = {
          id: res.user.uid,
          email: 'admin@gmail.com',
          isVerified: true,
          balance: 999999.99,
          activeInvestments: 0,
          totalProfit: 0,
          referralCode: 'ADMIN-CORE',
          referralsCount: 0,
          createdAt: new Date().toISOString(),
          firstName: 'System',
          lastName: 'Administrator',
          username: 'admin',
          phone: '+18889990000'
        };
        await setDoc(adminDocRef, adminProfile);
      }

      setIsAuthorized(true);
      setAuthLoading(false);
      fetchUsers();
      fetchPromoCodes();
      fetchGlobalSettings();
      fetchPlans();
      fetchPendingWithdrawals();
      addAuditLog('Successful Mainframe Login', 'admin@gmail.com');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication rejected by security mainframe.');
      setAuthLoading(false);
    }
  };

  // Fetch all users in platform
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      const list = snap.docs.map(d => d.data() as User);
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Promo codes
  const fetchPromoCodes = async () => {
    try {
      const promoRef = collection(db, 'promo_codes');
      const snap = await getDocs(promoRef);
      const list = snap.docs.map(d => d.data() as PromoCode);
      setPromoCodes(list);
    } catch (err) {
      console.error('Error fetching promos:', err);
    }
  };

  // Fetch system global configs
  const fetchGlobalSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        const data = snap.data();
        setGlobalAnnouncement(data.announcement || '');
        setMaintenanceMode(!!data.maintenanceMode);
        if (data.marketOffsets && data.marketOffsets[marketPumpTicker]) {
          setMarketPumpPercent(String(data.marketOffsets[marketPumpTicker]));
        }
        setPlatformUsersOffset(String(data.usersOffset || '14800'));
        setPlatformPayoutsOffset(String(data.payoutsOffset || '249200'));
        setOxapayKeyInput(data.oxapayApiKey || '');
        setOxapayPayoutKeyInput(data.oxapayPayoutApiKey || '');
      }
    } catch (err) {
      console.error('Error fetching global settings:', err);
    }
  };

  // Fetch pending withdrawals group
  const fetchPendingWithdrawals = async () => {
    setLoadingWithdrawals(true);
    try {
      const q = query(
        collectionGroup(db, 'transactions'),
        where('type', '==', 'withdraw'),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => {
        const tx = d.data() as Transaction;
        const userId = d.ref.parent.parent?.id || '';
        return {
          ...tx,
          userId,
          userEmail: 'User ID: ' + userId.slice(0, 8)
        };
      });

      // Match real user emails if users list loaded
      const enriched = list.map(tx => {
        const found = users.find(u => u.id === tx.userId);
        return {
          ...tx,
          userEmail: found ? found.email : tx.userEmail
        };
      });

      setPendingWithdrawals(enriched);
    } catch (err) {
      console.error('Error fetching pending withdrawals:', err);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleApproveWithdrawal = async (tx: any, userId: string) => {
    const netAmount = tx.netAmount || Number((tx.amount - 0.25).toFixed(2));
    const address = tx.address || tx.txHash;

    const confirmApprove = window.confirm(`Are you sure you want to approve this withdrawal request?\n\nUser: ${tx.userEmail}\nAmount: $${tx.amount.toFixed(2)} USDT\nFee: $0.25 USDT\nNet Payout Amount: $${netAmount.toFixed(2)} USDT\nDestination Wallet Address: ${address}\n\nClick OK to initiate a real OxaPay cryptocurrency payout. This action is irreversible.`);
    if (!confirmApprove) return;

    try {
      // Add a status indicator or show alert
      addAuditLog(`Initiating Payout for Tx ${tx.id}`, userId);

      const response = await fetch('/api/oxapay/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: oxapayPayoutKeyInput,
          address: address,
          amount: netAmount
        })
      });

      const resData = await response.json();

      if (resData.status === 200 || resData.status === '200' || resData.status === 'success') {
        const txRef = doc(db, 'users', userId, 'transactions', tx.id);
        const trackId = resData.trackId || resData.track_id || (resData.data && (resData.data.trackId || resData.data.track_id)) || '';
        const payoutStatus = resData.payoutStatus || resData.status || (resData.data && resData.data.status) || 'success';
        
        await updateDoc(txRef, { 
          status: 'completed',
          payoutTrackId: String(trackId),
          payoutStatus: String(payoutStatus)
        });

        addAuditLog(`Approved Withdrawal ${tx.id} - Payout successful. Track ID: ${trackId}`, userId);
        alert(`Withdrawal approved and OxaPay Payout processed successfully!\nTrack ID: ${trackId}`);
      } else {
        const errorMsg = resData.message || (resData.error && resData.error.message) || 'Unknown OxaPay error';
        alert(`OxaPay Payout Failed: ${errorMsg}\n\nThe transaction has been kept as pending. Please verify your Payout API key and OxaPay balance before trying again.`);
        addAuditLog(`OxaPay Payout Failed for Tx ${tx.id}: ${errorMsg}`, userId);
      }
      
      fetchPendingWithdrawals();
      fetchUsers();
    } catch (err: any) {
      alert('Failed to execute payout: ' + err.message);
    }
  };

  const handleRejectWithdrawal = async (tx: Transaction, userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        alert('User profile does not exist.');
        return;
      }
      const userData = userSnap.data() as User;
      const newBalance = Number((userData.balance + tx.amount).toFixed(2));
      
      await updateDoc(userRef, { balance: newBalance });
      const txRef = doc(db, 'users', userId, 'transactions', tx.id);
      await updateDoc(txRef, { status: 'rejected' });
      
      addAuditLog(`Rejected Withdrawal ${tx.id} ($${tx.amount} refunded)`, userId);
      alert('Withdrawal disapproved and funds refunded to user.');
      fetchPendingWithdrawals();
      fetchUsers();
    } catch (err: any) {
      alert('Failed to reject withdrawal: ' + err.message);
    }
  };

  // Fetch all investment plans
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const snap = await getDocs(collection(db, 'plans'));
      const list = snap.docs.map(d => d.data() as Plan);
      list.sort((a, b) => Number(a.id) - Number(b.id) || a.price - b.price);
      setPlans(list);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Create Investment Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanId || !newPlanName || !newPlanPrice || !newPlanMinProfit || !newPlanMaxProfit || !newPlanDuration) {
      alert('All plan configuration parameters must be specified.');
      return;
    }
    try {
      const plan: Plan = {
        id: newPlanId.trim(),
        name: newPlanName.trim(),
        price: parseFloat(newPlanPrice),
        minProfit: parseFloat(newPlanMinProfit),
        maxProfit: parseFloat(newPlanMaxProfit),
        durationDays: parseInt(newPlanDuration)
      };
      
      await setDoc(doc(db, 'plans', plan.id), plan);
      addAuditLog(`Created Investment Plan ${plan.name}`, plan.id);
      alert(`Plan ${plan.name} initialized successfully!`);
      
      // Reset inputs
      setNewPlanId('');
      setNewPlanName('');
      setNewPlanPrice('');
      setNewPlanMinProfit('');
      setNewPlanMaxProfit('');
      setNewPlanDuration('');
      
      fetchPlans();
    } catch (err: any) {
      alert('Failed to construct plan: ' + err.message);
    }
  };

  // Update Investment Plan
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await setDoc(doc(db, 'plans', editingPlan.id), editingPlan);
      addAuditLog(`Updated Plan ${editingPlan.name}`, editingPlan.id);
      alert(`Plan ${editingPlan.name} modified successfully!`);
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      alert('Failed to update plan: ' + err.message);
    }
  };

  // Delete/Terminate Investment Plan
  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!window.confirm(`Are you sure you want to terminate plan [${planName}]?`)) return;
    try {
      await deleteDoc(doc(db, 'plans', planId));
      addAuditLog(`Terminated Plan ${planName}`, planId);
      alert(`Plan ${planName} terminated.`);
      fetchPlans();
    } catch (err: any) {
      alert('Failed to delete plan: ' + err.message);
    }
  };

  // Select user and fetch their active plans and transaction history
  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setSelectedUserPlans([]);
    setSelectedUserTxs([]);

    try {
      // Fetch user subcollection - activePlans
      const plansRef = collection(db, 'users', user.id, 'activePlans');
      const plansSnap = await getDocs(plansRef);
      const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
      setSelectedUserPlans(plansList);

      // Fetch user subcollection - transactions
      const txsRef = collection(db, 'users', user.id, 'transactions');
      const txsSnap = await getDocs(txsRef);
      const txsList = txsSnap.docs.map(d => d.data() as Transaction);
      // Sort newest first
      txsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSelectedUserTxs(txsList);
    } catch (err) {
      console.error('Error loading subcollections:', err);
    }
  };

  // Ban/Unban user
  const handleToggleBan = async (user: User) => {
    const currentBanStatus = !!user.isBanned;
    const nextBanStatus = !currentBanStatus;
    const reason = nextBanStatus ? 'Security policy violation / suspicious activity' : '';

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        isBanned: nextBanStatus,
        banReason: reason
      });

      // Update local state list
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBanned: nextBanStatus, banReason: reason } : u));
      // Update selected user
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, isBanned: nextBanStatus, banReason: reason } : null);
      }

      addAuditLog(nextBanStatus ? 'Banned Account' : 'Unbanned Account', user.email);
    } catch (err) {
      alert('Failed to update ban status: ' + err);
    }
  };

  // Manually toggle KYC status
  const handleToggleVerification = async (user: User) => {
    const nextVerifyStatus = !user.isVerified;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { isVerified: nextVerifyStatus });

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isVerified: nextVerifyStatus } : u));
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, isVerified: nextVerifyStatus } : null);
      }

      addAuditLog(nextVerifyStatus ? 'Manually Verified KYC' : 'Revoked KYC Verification', user.email);
    } catch (err) {
      alert('Failed to update KYC status: ' + err);
    }
  };

  // Adjust balance
  const handleAdjustBalance = async () => {
    if (!selectedUser || !balanceAmount || isNaN(parseFloat(balanceAmount))) {
      alert('Please enter a valid numeric USDT balance amount.');
      return;
    }

    const value = parseFloat(balanceAmount);
    const multiplier = balanceAction === 'add' ? 1 : -1;
    const change = value * multiplier;

    const newBalance = Number((selectedUser.balance + change).toFixed(2));
    if (newBalance < 0) {
      alert('Error: Operation would cause user balance to drop below 0 USDT.');
      return;
    }

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, { balance: newBalance });

      // Add a ledger transaction
      const newTx: Transaction = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: txType,
        amount: value,
        status: 'completed',
        date: new Date().toLocaleString(),
        txHash: txDescription.trim() || `Mainframe Ledger Adjustment (${balanceAction.toUpperCase()})`
      };

      const txDocRef = doc(db, 'users', selectedUser.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      // Reload selections
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: newBalance } : u));
      setSelectedUser(prev => prev ? { ...prev, balance: newBalance } : null);
      setSelectedUserTxs(prev => [newTx, ...prev]);
      
      addAuditLog(`Adjusted Balance (${balanceAction.toUpperCase()} $${value} USDT as ${txType.toUpperCase()})`, selectedUser.email);
      setBalanceAmount('');
      setTxDescription('');
    } catch (err) {
      alert('Balance adjustment failed: ' + err);
    }
  };

  // Deploy Manual Subscription Plan (Instant Activation)
  const handleDeployPlan = async () => {
    if (!selectedUser) {
      alert('Please select a target user to deploy the investment plan.');
      return;
    }

    const plan = PLANS.find(p => p.id === deployPlanId);
    if (!plan) return;

    setDeployLoading(true);
    try {
      const randomDailyProfit = Number((Math.random() * (plan.maxProfit - plan.minProfit) + plan.minProfit).toFixed(2));
      
      const newActivePlan: ActivePlan = {
        id: 'AP-' + Math.floor(100000 + Math.random() * 900000),
        planId: plan.id,
        name: plan.name,
        price: plan.price,
        dailyProfit: randomDailyProfit,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        lastCollectedAt: new Date().toISOString(),
        totalEarned: 0,
        status: 'active'
      };

      const newTx: Transaction = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'invest',
        amount: plan.price,
        status: 'completed',
        date: new Date().toLocaleString(),
        txHash: `ADMIN COMPLIMENTARY DEPLOYMENT`
      };

      const planRef = doc(db, 'users', selectedUser.id, 'activePlans', newActivePlan.id);
      await setDoc(planRef, newActivePlan);

      const txDocRef = doc(db, 'users', selectedUser.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      const finalInvestments = Number((selectedUser.activeInvestments + plan.price).toFixed(2));
      await updateDoc(doc(db, 'users', selectedUser.id), {
        activeInvestments: finalInvestments
      });

      // Update state locally
      setSelectedUserPlans(prev => [newActivePlan, ...prev]);
      setSelectedUserTxs(prev => [newTx, ...prev]);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, activeInvestments: finalInvestments } : u));
      setSelectedUser(prev => prev ? { ...prev, activeInvestments: finalInvestments } : null);

      addAuditLog(`Activated Plan Contract [Level ${deployPlanId} - ${plan.name}]`, selectedUser.email);
      alert(`Level ${deployPlanId} plan successfully activated for ${selectedUser.username}!`);
    } catch (err) {
      alert('Deployment failed: ' + err);
    } finally {
      setDeployLoading(false);
    }
  };

  // Cancel / Revoke active user subscription plan
  const handleCancelPlan = async (activePlan: ActivePlan) => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to forcibly deactivate plan ${activePlan.name}?`)) return;

    try {
      const planRef = doc(db, 'users', selectedUser.id, 'activePlans', activePlan.id);
      await updateDoc(planRef, { status: 'completed' });

      const finalInvestments = Math.max(0, Number((selectedUser.activeInvestments - activePlan.price).toFixed(2)));
      await updateDoc(doc(db, 'users', selectedUser.id), {
        activeInvestments: finalInvestments
      });

      setSelectedUserPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, status: 'completed' } : p));
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, activeInvestments: finalInvestments } : u));
      setSelectedUser(prev => prev ? { ...prev, activeInvestments: finalInvestments } : null);

      addAuditLog(`Forced Plan Revocation/Deactivation [${activePlan.name}]`, selectedUser.email);
    } catch (err) {
      alert('Failed to deactivate plan: ' + err);
    }
  };

  // Approve / Complete Pending User Transaction
  const handleUpdateTxStatus = async (tx: Transaction, nextStatus: 'completed' | 'pending') => {
    if (!selectedUser) return;
    try {
      const txRef = doc(db, 'users', selectedUser.id, 'transactions', tx.id);
      await updateDoc(txRef, { status: nextStatus });

      setSelectedUserTxs(prev => prev.map(t => t.id === tx.id ? { ...t, status: nextStatus } : t));
      addAuditLog(`Updated Tx ${tx.id} status to ${nextStatus.toUpperCase()}`, selectedUser.email);
    } catch (err) {
      alert('Failed to update status: ' + err);
    }
  };

  // Create Promo Code
  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoAmount || isNaN(parseFloat(newPromoAmount))) {
      alert('Please fill out code and valid numeric USDT amount.');
      return;
    }

    setPromoLoading(true);
    const finalCode = newPromoCode.trim().toUpperCase();
    const amountVal = parseFloat(newPromoAmount);
    const limitVal = parseInt(newPromoLimit) || 50;

    try {
      const promo: PromoCode = {
        code: finalCode,
        amount: amountVal,
        maxClaims: limitVal,
        claimsCount: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'promo_codes', finalCode), promo);
      setPromoCodes(prev => [promo, ...prev]);
      addAuditLog(`Created Promo Code ${finalCode} ($${amountVal} USDT)`, 'Global');
      setNewPromoCode('');
      setNewPromoAmount('');
      alert(`Promo code ${finalCode} created successfully!`);
    } catch (err) {
      alert('Failed to create promo code: ' + err);
    } finally {
      setPromoLoading(false);
    }
  };

  // Save System risk toggles and announcements
  const handleSaveSystemSettings = async () => {
    setSystemSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'global');
      
      // Load current global settings
      const snap = await getDoc(settingsRef);
      const currentData = snap.exists() ? snap.data() : {};
      
      const updatedOffsets = {
        ...(currentData.marketOffsets || {}),
        [marketPumpTicker]: parseFloat(marketPumpPercent) || 0.0
      };

      await setDoc(settingsRef, {
        announcement: globalAnnouncement,
        maintenanceMode: maintenanceMode,
        marketOffsets: updatedOffsets,
        usersOffset: parseInt(platformUsersOffset) || 14800,
        payoutsOffset: parseInt(platformPayoutsOffset) || 249200,
        oxapayApiKey: oxapayKeyInput,
        oxapayPayoutApiKey: oxapayPayoutKeyInput
      }, { merge: true });

      addAuditLog('Updated Global Settings Matrix', 'Mainframe Config');
      alert('Mainframe configuration parameters saved successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + err);
    } finally {
      setSystemSaving(false);
    }
  };

  // Sign out admin
  const handleLogoutAdmin = async () => {
    await signOut(auth);
    setIsAuthorized(false);
    addAuditLog('Admin Logged Out', 'System Security');
    onClose();
  };

  // Filter users based on query
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.firstName && u.firstName.toLowerCase().includes(q)) ||
      (u.lastName && u.lastName.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center font-mono text-emerald-400 crt p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0,transparent_100%)] pointer-events-none" />
        <div className="w-full max-w-md border border-emerald-500/30 rounded-2xl bg-slate-950/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Scanning line overlay */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-emerald-500/20 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse" />
          
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-3 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-lg font-bold uppercase tracking-widest text-white">Mainframe Access Required</h1>
            <p className="text-[10px] text-emerald-500/50 uppercase mt-1">DODDOGE_CLI Security protocol v3.8</p>
          </div>

          {authError && (
            <div className="p-3 mb-4 bg-red-950/30 border border-red-500/20 rounded-xl text-[11px] text-red-400 leading-relaxed font-mono flex items-start gap-2">
              <span className="text-red-500 text-xs shrink-0">[!]</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald-500/60 mb-1.5">
                Admin Email Secure Port
              </label>
              <input
                type="email"
                required
                disabled={authLoading}
                placeholder="admin@gmail.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-700 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-emerald-500/60 mb-1.5">
                Access Password Key
              </label>
              <input
                type="password"
                required
                disabled={authLoading}
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-700 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>DECRYPTING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>AUTHORIZE ACCESS</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-emerald-500/10 flex items-center justify-between text-[9px] text-emerald-500/35 uppercase">
            <span>PORT_3000_INGRESS</span>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-emerald-400 font-bold transition-colors cursor-pointer uppercase"
            >
              &lt; Return to terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-emerald-400 font-mono flex flex-col crt overflow-y-auto">
      {/* Top Banner Row */}
      <div className="border-b border-emerald-500/20 bg-slate-950/95 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              DODDOGE CENTRAL MAINFRAME
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded font-mono">
                ADMIN V2.5
              </span>
            </h1>
            <p className="text-[9px] text-emerald-500/40 uppercase hidden sm:block">
              Full State Database Manipulation Port & System Telemetry Override
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={fetchUsers}
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded border border-emerald-500/15 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Refresh Central Database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLogoutAdmin}
            className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 rounded text-[10px] text-red-400 font-bold transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">TERMINATE_SESSION</span>
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded border border-emerald-500/15 text-white transition-colors cursor-pointer text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Admin UI Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Rail Tabs */}
        <div className="lg:col-span-3 space-y-3">
          <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest mb-2.5">
              MAINFRAME MODULES
            </p>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'users'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-emerald-500/70 hover:bg-slate-900 hover:text-emerald-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Matrix ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mining')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'mining'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-emerald-500/70 hover:bg-slate-900 hover:text-emerald-400'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Mining Activator</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'promos'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-emerald-500/70 hover:bg-slate-900 hover:text-emerald-400'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Promo Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'system'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-emerald-500/70 hover:bg-slate-900 hover:text-emerald-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System Command</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'plans'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-emerald-500/70 hover:bg-slate-900 hover:text-emerald-400'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Plan Configurator</span>
            </button>

            <button
              onClick={() => { setActiveTab('withdrawals'); fetchPendingWithdrawals(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'withdrawals'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-emerald-500/70 hover:bg-slate-900 hover:text-emerald-400'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Withdrawals Queue</span>
            </button>
          </div>

          {/* Audit Logs Screen Widget */}
          <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">
                SESSION AUDIT TRAIL
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="h-44 overflow-y-auto space-y-1.5 scrollbar text-[10px] font-mono bg-slate-950 p-2.5 border border-emerald-500/10 rounded-lg">
              {auditLogs.length === 0 ? (
                <div className="text-slate-700 italic text-center py-8">No session events logged.</div>
              ) : (
                auditLogs.map((log, i) => (
                  <div key={i} className="border-b border-emerald-500/5 pb-1 leading-relaxed">
                    <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                    <span className="text-emerald-400 font-semibold">{log.action}</span>{' '}
                    <span className="text-slate-400">&gt;&gt; {log.target}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="lg:col-span-9 space-y-6">

          {/* TAB 1: USERS MATRIX AND DETAILS */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Users List Pane */}
              <div className="md:col-span-5 border border-emerald-500/20 bg-slate-950/80 rounded-xl p-4 flex flex-col h-[520px]">
                <div className="mb-3.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                    <input
                      type="text"
                      placeholder="Filter database profiles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/20 focus:border-emerald-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none placeholder-slate-700 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 scrollbar pr-1">
                  {loadingUsers ? (
                    <div className="text-center py-12 text-slate-500 text-xs uppercase animate-pulse">
                      Consulting Firestore registry...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-slate-700 text-xs">
                      No matches located in directory.
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex justify-between items-center cursor-pointer ${
                          selectedUser?.id === u.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : u.isBanned
                            ? 'bg-red-950/10 border-red-950 hover:bg-red-950/15 text-red-400/80'
                            : 'bg-slate-900/50 border-emerald-500/5 hover:border-emerald-500/15 hover:bg-slate-900 text-emerald-400/85'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold font-mono truncate">@{u.username || 'unset'}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold font-mono text-[10px] block text-emerald-400">
                            ${(u.balance || 0).toFixed(2)} USDT
                          </span>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {u.isBanned && (
                              <span className="text-[8px] bg-red-950 text-red-400 px-1 rounded uppercase font-bold border border-red-500/20">
                                BANNED
                              </span>
                            )}
                            {u.isVerified && (
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded uppercase font-bold">
                                KYC
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* User Operations Console */}
              <div className="md:col-span-7 border border-emerald-500/20 bg-slate-950/80 rounded-xl p-4 flex flex-col h-[520px] overflow-y-auto scrollbar">
                {selectedUser ? (
                  <div className="space-y-6">
                    {/* Header profile info */}
                    <div className="border-b border-emerald-500/10 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </h2>
                          <p className="text-[10px] text-slate-500 mt-0.5">UID: {selectedUser.id}</p>
                          <p className="text-[10px] text-slate-500">Email: {selectedUser.email}</p>
                          {selectedUser.phone && <p className="text-[10px] text-slate-500">Phone: {selectedUser.phone}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-emerald-500/40 uppercase block">Affiliate Code</span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 border border-emerald-500/15 px-2 py-0.5 rounded">
                            {selectedUser.referralCode}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="bg-slate-950 p-2 border border-emerald-500/5 rounded-lg">
                          <span className="text-[8px] text-emerald-500/40 uppercase block">Wallet Balance</span>
                          <span className="text-xs font-mono font-bold text-emerald-300">
                            ${(selectedUser.balance || 0).toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2 border border-emerald-500/5 rounded-lg">
                          <span className="text-[8px] text-emerald-500/40 uppercase block">Active Investments</span>
                          <span className="text-xs font-mono font-bold text-amber-500">
                            ${(selectedUser.activeInvestments || 0).toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2 border border-emerald-500/5 rounded-lg">
                          <span className="text-[8px] text-emerald-500/40 uppercase block">Affiliates</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {selectedUser.referralsCount || 0} Nodes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions Grid */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest mb-2">
                          ACCOUNT POLICIES OVERSIGHT
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleToggleBan(selectedUser)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border ${
                              selectedUser.isBanned
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300'
                                : 'bg-red-950/20 hover:bg-red-950/40 text-red-400 border-red-500/20 hover:border-red-500/30'
                            }`}
                          >
                            {selectedUser.isBanned ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>UNBAN USER ACCESS</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>BAN ACCOUNT IMMEDIATELY</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleVerification(selectedUser)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border ${
                              selectedUser.isVerified
                                ? 'bg-amber-950/20 hover:bg-amber-950/40 text-amber-500 border-amber-500/20'
                                : 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{selectedUser.isVerified ? 'REVOKE KYC STAMP' : 'FORCE APPROVE KYC'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Adjust Balance ledger portal */}
                      <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-lg space-y-3">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">
                          USDT FUNDING & TRANSACTION LEDGER OVERRIDE
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase mb-1">Adjust Action</span>
                            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                              <button
                                type="button"
                                onClick={() => setBalanceAction('add')}
                                className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  balanceAction === 'add' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                ADD
                              </button>
                              <button
                                type="button"
                                onClick={() => setBalanceAction('remove')}
                                className={`flex-1 text-center py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  balanceAction === 'remove' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                SUBTRACT
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase mb-1">Adjust Value (USDT)</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={balanceAmount}
                              onChange={(e) => setBalanceAmount(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase mb-1">Transaction Category type</span>
                            <select
                              value={txType}
                              onChange={(e: any) => setTxType(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1.5 px-2 text-[10px] text-white focus:outline-none"
                            >
                              <option value="deposit">Deposit (Inflow)</option>
                              <option value="withdraw">Withdrawal (Outflow)</option>
                              <option value="profit">Investment Yield Profit</option>
                              <option value="referral">Affiliate Referral Payout</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase mb-1">Audit description / hash</span>
                            <input
                              type="text"
                              placeholder="Admin override"
                              value={txDescription}
                              onChange={(e) => setTxDescription(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAdjustBalance}
                          className="w-full bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold py-2 px-3 rounded-lg text-[10px] uppercase border border-emerald-500/20 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {balanceAction === 'add' ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          <span>Execute Balance Override Adjustment</span>
                        </button>
                      </div>

                      {/* Display user transactions log */}
                      <div>
                        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          RECORDS LEDGER LOGS
                        </h4>
                        <div className="max-h-36 overflow-y-auto border border-emerald-500/5 rounded-lg bg-slate-950 p-2 text-[10px] space-y-1.5 scrollbar">
                          {selectedUserTxs.length === 0 ? (
                            <div className="text-slate-800 text-center py-4">No logged transactions found.</div>
                          ) : (
                            selectedUserTxs.map((tx) => (
                              <div key={tx.id} className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                                <div>
                                  <span className={`uppercase font-bold px-1 rounded text-[8px] mr-1.5 ${
                                    tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                                    tx.type === 'withdraw' ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-slate-400'
                                  }`}>
                                    {tx.type}
                                  </span>
                                  <span className="text-slate-400">{tx.id}</span>
                                  <p className="text-[8px] text-slate-600 mt-0.5">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-white font-mono">${tx.amount.toFixed(2)}</span>
                                  <div className="flex items-center gap-1 justify-end mt-0.5">
                                    <span className={`text-[8px] px-1 rounded uppercase font-bold ${
                                      tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                      {tx.status}
                                    </span>
                                    {tx.status === 'pending' && (
                                      <button
                                        onClick={() => handleUpdateTxStatus(tx, 'completed')}
                                        className="text-[8px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-1 rounded font-bold uppercase transition-colors"
                                      >
                                        Approve
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Users className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-500">Central Node Inspector</p>
                    <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                      Select any registered user profile from the database ledger index to load operations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MINING CONTRACTS MANIPULATION */}
          {activeTab === 'mining' && (
            <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-5 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-500/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">COMPLIMENTARY INVESTMENT CONTRACT DEPLOYMENT</h2>
                  <p className="text-[10px] text-emerald-500/40 uppercase mt-0.5">Inject complimentary active trading miners directly</p>
                </div>
                <Award className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select target user */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">
                    STEP 1: SELECT TARGET USER ACCOUNT
                  </h3>
                  
                  {selectedUser ? (
                    <div className="bg-slate-900 border border-emerald-500/25 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded font-mono uppercase">
                          Target Selected
                        </span>
                        <p className="font-bold text-white text-xs mt-1.5">@{selectedUser.username}</p>
                        <p className="text-[10px] text-slate-500">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-xs text-red-400 hover:text-red-300 uppercase font-bold"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 text-center space-y-2">
                      <p className="text-xs text-slate-500 uppercase">No target selected</p>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/10 hover:border-emerald-500/20 rounded text-[10px] uppercase font-bold cursor-pointer"
                      >
                        Open Users matrix to select
                      </button>
                    </div>
                  )}

                  {/* Plans info list selection */}
                  {selectedUser && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest mt-4">
                        STEP 2: SELECT INVESTMENT LEVEL CONTRACT
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {PLANS.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setDeployPlanId(p.id)}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex justify-between items-center cursor-pointer ${
                              deployPlanId === p.id
                                ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                            }`}
                          >
                            <div>
                              <span className="font-bold uppercase text-[10px] block">{p.name} (L{p.id})</span>
                              <span className="text-[9px] text-slate-500">Daily yield yield profit: ${p.minProfit} - ${p.maxProfit}</span>
                            </div>
                            <span className="font-bold font-mono text-emerald-400 text-xs">${p.price} USDT</span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleDeployPlan}
                        disabled={deployLoading}
                        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300"
                      >
                        {deployLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>INJECTING MATRIX CONTRACT...</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-3.5 h-3.5" />
                            <span>DEPLOY INVESTMENT CONTRACT</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected User Active Contracts */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">
                    ACTIVE SUBSCRIPTIONS OVERVIEW
                  </h3>
                  
                  {selectedUser ? (
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto scrollbar pr-1">
                      {selectedUserPlans.length === 0 ? (
                        <div className="text-slate-600 text-center py-12 text-xs italic bg-slate-950 border border-slate-900 rounded-xl">
                          No active mining contracts deployed.
                        </div>
                      ) : (
                        selectedUserPlans.map((ap) => (
                          <div
                            key={ap.id}
                            className={`p-3.5 rounded-xl border bg-slate-950/60 flex flex-col gap-2 ${
                              ap.status === 'active' ? 'border-emerald-500/20' : 'border-slate-900 text-slate-500'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-white text-xs">{ap.name}</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono ml-2">
                                  {ap.id}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-1">Purchased/Injected: {new Date(ap.startDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-emerald-400 text-xs">${ap.price} USDT</span>
                                <span className={`text-[8px] uppercase font-bold block mt-1 px-1 rounded ${
                                  ap.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'
                                }`}>
                                  {ap.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-900">
                              <div>
                                <span className="text-slate-500">Profit rate: </span>
                                <span className="font-bold text-white">${ap.dailyProfit.toFixed(2)}/day</span>
                              </div>
                              {ap.status === 'active' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelPlan(ap)}
                                  className="text-[8px] bg-red-950 hover:bg-red-950/40 text-red-400 border border-red-500/20 hover:border-red-500/30 px-2 py-0.5 rounded font-mono uppercase font-bold"
                                >
                                  FORCED DEACTIVATE
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-12 text-center text-slate-600 text-xs">
                      Select a user to view and manage active plans.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROMO CODE GENERATOR */}
          {activeTab === 'promos' && (
            <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-5 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">PROMO BONUS COUPON DISPATCHER</h2>
                  <p className="text-[10px] text-emerald-500/40 uppercase mt-0.5">Generate promo codes that credit USDT bonuses instantly on claim</p>
                </div>
                <Gift className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Promo Creator */}
                <form onSubmit={handleCreatePromoCode} className="md:col-span-5 bg-slate-950/90 p-4 border border-emerald-500/10 rounded-xl space-y-4">
                  <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">GENERATE NEW PROMO</h3>
                  
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
                      Coupon Code String
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="DOGE50, WELCOME100, etc."
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white uppercase placeholder-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
                      Bonus amount (USDT)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newPromoAmount}
                      onChange={(e) => setNewPromoAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
                      Max Claim Limits
                    </label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newPromoLimit}
                      onChange={(e) => setNewPromoLimit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={promoLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-300 font-mono"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Incept Promo Code</span>
                  </button>
                </form>

                {/* Promo Code list */}
                <div className="md:col-span-7 space-y-3">
                  <h3 className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">
                    ACTIVE PROMO CODES DIRECTORY
                  </h3>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar pr-1">
                    {promoCodes.length === 0 ? (
                      <div className="text-slate-600 text-center py-16 text-xs italic bg-slate-950 border border-slate-900 rounded-xl">
                        No active promo coupons created yet.
                      </div>
                    ) : (
                      promoCodes.map((p) => (
                        <div key={p.code} className="bg-slate-950 p-3.5 border border-emerald-500/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-white tracking-wider bg-slate-900 border border-emerald-500/15 px-2.5 py-1 rounded">
                              {p.code}
                            </span>
                            <div className="flex items-center gap-3 text-[9px] text-slate-500 mt-2.5">
                              <span>Bonus: <strong className="text-emerald-400">${p.amount} USDT</strong></span>
                              <span>•</span>
                              <span>Claims: <strong className="text-white">{p.claimsCount}/{p.maxClaims}</strong></span>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-500/30 uppercase font-mono font-bold">
                            ONLINE
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM COMMAND CONTROL OVERRIDE */}
          {activeTab === 'system' && (
            <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-5 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">SYSTEM CONFIGURATION DEVIANCE</h2>
                  <p className="text-[10px] text-emerald-500/40 uppercase mt-0.5">Override platform configurations and simulate events instantly</p>
                </div>
                <Sliders className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left controls */}
                <div className="space-y-4">
                  {/* Announcement setup */}
                  <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-white">
                      <Megaphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Global Announcements Ticker</span>
                    </div>
                    <textarea
                      placeholder="Type announcement to broadcast to all nodes..."
                      value={globalAnnouncement}
                      onChange={(e) => setGlobalAnnouncement(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none min-h-[80px]"
                    />
                  </div>

                  {/* Maintenance block */}
                  <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white uppercase block">Maintenance mode override</span>
                      <span className="text-[9px] text-slate-500 uppercase block">Lock all non-admin node connections</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>

                  {/* OxaPay Merchant Key Block */}
                  <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-white">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">OxaPay merchant api key (Deposits)</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter OxaPay Merchant API Key..."
                      value={oxapayKeyInput}
                      onChange={(e) => setOxapayKeyInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                    />
                    <p className="text-[8px] text-slate-500 uppercase leading-normal">
                      This key is used on the server side to create real payment invoices and auto-verify deposits.
                    </p>
                  </div>

                  {/* OxaPay Payout Key Block */}
                  <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-white">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">OxaPay Payout api key (Withdrawals)</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter OxaPay Payout API Key..."
                      value={oxapayPayoutKeyInput}
                      onChange={(e) => setOxapayPayoutKeyInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                    />
                    <p className="text-[8px] text-slate-500 uppercase leading-normal">
                      This key is used on the server side to authorize and execute real payouts when you click approve.
                    </p>
                  </div>
                </div>

                {/* Right controls */}
                <div className="space-y-4">
                  {/* Virtual pump dump tool */}
                  <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-white">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Market Telemetry Manipulator</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase mb-1">Target Asset</span>
                        <select
                          value={marketPumpTicker}
                          onChange={(e) => setMarketPumpTicker(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1.5 px-2 text-[10px] text-white focus:outline-none"
                        >
                          <option value="BTC">BTC (Bitcoin)</option>
                          <option value="ETH">ETH (Ethereum)</option>
                          <option value="BNB">BNB Coin</option>
                          <option value="XRP">Ripple XRP</option>
                          <option value="ASTER">Aster</option>
                          <option value="GOOGL">Google Stock</option>
                          <option value="MSFT">Microsoft Stock</option>
                          <option value="NVDA">Nvidia Stock</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase mb-1">Offset Percentage</span>
                        <input
                          type="text"
                          placeholder="e.g. 5.0 or -10.0"
                          value={marketPumpPercent}
                          onChange={(e) => setMarketPumpPercent(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-500 uppercase leading-normal">
                      Specifying a positive percent pumps the price, while a negative percent dumps it artificially for all users.
                    </p>
                  </div>

                  {/* Virtual Stats Offsets */}
                  <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-white">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Platform Stats Boosters</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase mb-1">Users Base Offset</span>
                        <input
                          type="number"
                          value={platformUsersOffset}
                          onChange={(e) => setPlatformUsersOffset(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase mb-1">Payouts Base Offset</span>
                        <input
                          type="number"
                          value={platformPayoutsOffset}
                          onChange={(e) => setPlatformPayoutsOffset(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={handleSaveSystemSettings}
                disabled={systemSaving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300 font-mono"
              >
                {systemSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SYNCHRONISING SYSTEM OVERRIDES...</span>
                  </>
                ) : (
                  <>
                    <Settings className="w-3.5 h-3.5" />
                    <span>COMMIT CONFIGURATION OVERRIDES</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 5: INVESTMENT PLANS CONFIGURATION (CRUD) */}
          {activeTab === 'plans' && (
            <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-5 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">INVESTMENT CHANNELS MANAGEMENT</h2>
                  <p className="text-[10px] text-emerald-500/40 uppercase mt-0.5">Add, edit, or terminate investment plans directly on the live database</p>
                </div>
                <Sliders className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left side: Create/Edit Form */}
                <div className="lg:col-span-5 bg-slate-950/90 p-4 border border-emerald-500/10 rounded-xl space-y-4">
                  <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {editingPlan ? 'EDIT INVESTMENT PLAN' : 'CREATE NEW INVESTMENT PLAN'}
                  </h3>

                  <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="space-y-3 font-mono text-xs text-white">
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">PLAN ID (MUST BE UNIQUE)</label>
                      <input
                        type="text"
                        disabled={!!editingPlan}
                        placeholder="e.g. 5"
                        value={editingPlan ? editingPlan.id : newPlanId}
                        onChange={(e) => setNewPlanId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 disabled:opacity-50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">PLAN NAME</label>
                      <input
                        type="text"
                        placeholder="e.g. AI QUANTUM HIGH"
                        value={editingPlan ? editingPlan.name : newPlanName}
                        onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, name: e.target.value}) : setNewPlanName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">PRICE (USDT)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 100"
                        value={editingPlan ? editingPlan.price : newPlanPrice}
                        onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, price: parseFloat(e.target.value) || 0}) : setNewPlanPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] text-slate-500 uppercase mb-1">MIN DAILY YIELD ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 2.5"
                          value={editingPlan ? editingPlan.minProfit : newPlanMinProfit}
                          onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, minProfit: parseFloat(e.target.value) || 0}) : setNewPlanMinProfit(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 uppercase mb-1">MAX DAILY YIELD ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 5.0"
                          value={editingPlan ? editingPlan.maxProfit : newPlanMaxProfit}
                          onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, maxProfit: parseFloat(e.target.value) || 0}) : setNewPlanMaxProfit(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">DURATION (DAYS)</label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        value={editingPlan ? editingPlan.durationDays : newPlanDuration}
                        onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, durationDays: parseInt(e.target.value) || 0}) : setNewPlanDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      {editingPlan && (
                        <button
                          type="button"
                          onClick={() => setEditingPlan(null)}
                          className="w-1/3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold py-2 px-3 rounded-lg text-xs uppercase"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer flex-1 flex items-center justify-center gap-1.5 ${
                          editingPlan 
                            ? 'bg-amber-500 hover:bg-amber-400 border border-amber-300 text-slate-950'
                            : 'bg-emerald-500 hover:bg-emerald-400 border border-emerald-300 text-slate-950'
                        }`}
                      >
                        {editingPlan ? 'Save Changes' : 'Initialize Plan'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right side: Plans List */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">
                    ACTIVE PLANS REGISTRY
                  </h3>

                  <div className="space-y-2 max-h-[480px] overflow-y-auto scrollbar pr-1">
                    {loadingPlans ? (
                      <div className="text-emerald-500/60 text-center py-16 text-xs uppercase font-mono">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                        QUERYING PLANS LEDGER...
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="text-slate-600 text-center py-16 text-xs italic bg-slate-950 border border-slate-900 rounded-xl">
                        No active investment channels configured yet.
                      </div>
                    ) : (
                      plans.map((p) => (
                        <div key={p.id} className="bg-slate-950 p-4 border border-emerald-500/5 hover:border-emerald-500/10 rounded-xl flex items-center justify-between font-mono">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-white uppercase">{p.name}</span>
                              <span className="text-[8px] bg-slate-900 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">ID: {p.id}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] text-slate-500">
                              <span>Price: <strong className="text-white">${p.price} USDT</strong></span>
                              <span>Duration: <strong className="text-white">{p.durationDays} Days</strong></span>
                              <span className="col-span-2">Daily Yield: <strong className="text-emerald-400">${p.minProfit} - ${p.maxProfit} USDT</strong></span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingPlan(p)}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 rounded text-[9px] font-bold text-amber-400 transition-all uppercase cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePlan(p.id, p.name)}
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 rounded text-[9px] font-bold text-red-400 transition-all uppercase cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WITHDRAWAL REQUESTS QUEUE */}
          {activeTab === 'withdrawals' && (
            <div className="border border-emerald-500/20 bg-slate-950/80 rounded-xl p-5 space-y-6">
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Outbound Withdrawal Queue</h2>
                  <p className="text-[10px] text-emerald-500/40 uppercase mt-0.5">Manage and approve pending manual user withdrawal transfers</p>
                </div>
                <button
                  onClick={fetchPendingWithdrawals}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded border border-emerald-500/15 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-[10px] uppercase font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 animate-pulse" />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {loadingWithdrawals ? (
                <div className="text-center py-12 text-slate-500 text-xs uppercase animate-pulse">
                  Querying withdrawal queue...
                </div>
              ) : pendingWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs uppercase border border-emerald-500/5 bg-slate-900/10 rounded-xl">
                  No pending withdrawal requests found in queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] border-collapse uppercase font-mono">
                    <thead>
                      <tr className="text-emerald-500/50 border-b border-emerald-500/20 pb-2 text-[9px] tracking-wider">
                        <th className="py-2">User Email</th>
                        <th className="py-2">Transaction ID</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Payment Destination</th>
                        <th className="py-2">Date Requested</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingWithdrawals.map((tx) => (
                        <tr key={tx.id} className="border-b border-emerald-500/10 hover:bg-slate-900/40 text-emerald-400/80">
                          <td className="py-2.5 font-bold text-white">{tx.userEmail}</td>
                          <td className="py-2.5 text-slate-400">0x{tx.id.slice(0, 8)}</td>
                          <td className="py-2.5 font-bold text-emerald-300">${tx.amount.toFixed(2)}</td>
                          <td className="py-2.5 text-slate-300 truncate max-w-[150px]" title={tx.address}>
                            {tx.address || 'Not specified'}
                          </td>
                          <td className="py-2.5 text-emerald-500/40">{tx.date}</td>
                          <td className="py-2.5 text-right space-x-2">
                            <button
                              onClick={() => handleApproveWithdrawal(tx, tx.userId)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[9px] transition-all uppercase cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(tx, tx.userId)}
                              className="px-2.5 py-1 bg-red-950 hover:bg-red-950/40 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold rounded text-[9px] transition-all uppercase cursor-pointer"
                            >
                              Disapprove
                            </button>
                          </td>
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

    </div>
  );
};
