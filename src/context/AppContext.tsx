import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ActivePlan, Transaction, StockData, Plan } from '../types';
import { INITIAL_STOCKS, updateStockPrices, PLANS } from '../utils/data';
import { createOxaPayInvoice, checkOxaPayPayment } from '../utils/oxapay';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';

interface AppContextType {
  user: User | null;
  activePlans: ActivePlan[];
  transactions: Transaction[];
  stocks: StockData[];
  selectedStock: StockData;
  setSelectedStock: (stock: StockData) => void;
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  register: (
    email: string, 
    password?: string, 
    referralCode?: string,
    firstName?: string,
    lastName?: string,
    username?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deposit: (amount: number, method: string) => Promise<{ success: boolean; trackId?: string; paymentUrl?: string; error?: string }>;
  withdraw: (amount: number, address: string) => Promise<{ success: boolean; error?: string }>;
  buyPlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  miningActive: boolean;
  setMiningActive: (active: boolean) => void;
  miningBalance: number;
  triggerMiningPayout: () => Promise<void>;
  referrals: { email: string; date: string; bonus: number }[];
  maintenanceMode: boolean;
  plans: Plan[];
  oxapayApiKey: string;
  oxapayPayoutApiKey: string;
  updateOxapayApiKey: (newKey: string) => Promise<void>;
  updateOxapayPayoutApiKey: (newKey: string) => Promise<void>;
  verifyDeposit: (trackId: string) => Promise<{ success: boolean; message: string; amount?: number }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockData>(INITIAL_STOCKS[0]);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [referrals, setReferrals] = useState<{ email: string; date: string; bonus: number }[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [oxapayApiKey, setOxapayApiKey] = useState<string>('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
  const [oxapayPayoutApiKey, setOxapayPayoutApiKey] = useState<string>('HLSOHL-M4XCBM-MXMW4B-0BD5YD');

  // Mining simulation states
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningBalance, setMiningBalance] = useState<number>(0);
  const [hasInitializedMining, setHasInitializedMining] = useState<boolean>(false);

  // Helper to retrieve live plan daily profit (averaging min/max or using admin value if equal)
  const getLiveDailyProfit = (ap: ActivePlan, masterPlans: Plan[]) => {
    const master = masterPlans.find(mp => mp.id === ap.planId);
    if (master) {
      return master.minProfit === master.maxProfit 
        ? master.minProfit 
        : (master.minProfit + master.maxProfit) / 2;
    }
    return ap.dailyProfit;
  };

  // Calculate offline accumulated profit down to the exact second
  const calculateInitialMiningBalance = (plansList: ActivePlan[], masterPlans: Plan[]) => {
    let accumulated = 0;
    const now = new Date();
    plansList.forEach(p => {
      if (p.status === 'active') {
        const lastCollected = p.lastCollectedAt ? new Date(p.lastCollectedAt) : new Date(p.startDate);
        const elapsedMs = now.getTime() - lastCollected.getTime();
        const elapsedSeconds = Math.max(0, elapsedMs / 1000);
        if (elapsedSeconds > 0) {
          const liveDaily = getLiveDailyProfit(p, masterPlans);
          accumulated += (liveDaily / 86400) * elapsedSeconds;
        }
      }
    });
    return accumulated;
  };

  // Sync Global Settings
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(settingsRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMaintenanceMode(!!data.maintenanceMode);
        
        // Sync Merchant Key
        if (data.oxapayApiKey) {
          if (data.oxapayApiKey === '9RXYOI-HCC0E7-MIMCXS-XKUCYW' || !data.oxapayApiKey) {
            try {
              await setDoc(settingsRef, { oxapayApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD' }, { merge: true });
            } catch (e) {
              console.error('Failed to auto-upgrade OxaPay key in firestore', e);
            }
            setOxapayApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
          } else {
            setOxapayApiKey(data.oxapayApiKey);
          }
        } else {
          try {
            await setDoc(settingsRef, { oxapayApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD' }, { merge: true });
          } catch (e) {
            console.error('Failed to seed OxaPay key', e);
          }
          setOxapayApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        }

        // Sync Payout Key
        if (data.oxapayPayoutApiKey) {
          setOxapayPayoutApiKey(data.oxapayPayoutApiKey);
        } else {
          try {
            await setDoc(settingsRef, { oxapayPayoutApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD' }, { merge: true });
          } catch (e) {
            console.error('Failed to seed OxaPay payout key', e);
          }
          setOxapayPayoutApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        }
      } else {
        // Create settings doc if it does not exist
        try {
          await setDoc(settingsRef, { 
            oxapayApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD', 
            oxapayPayoutApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD', 
            maintenanceMode: false 
          });
        } catch (e) {
          console.error('Failed to create global settings doc', e);
        }
        setOxapayApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        setOxapayPayoutApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
      }
    }, (err) => {
      console.error('Error listening to global config:', err);
    });
    return () => unsubscribe();
  }, []);

  // Sync Investment Plans with seeding on empty
  useEffect(() => {
    const plansRef = collection(db, 'plans');
    const unsubscribe = onSnapshot(plansRef, async (snap) => {
      if (snap.empty) {
        // Seed default plans if collection is empty
        try {
          for (const p of PLANS) {
            await setDoc(doc(db, 'plans', p.id), p);
          }
        } catch (err) {
          console.error('Error seeding plans:', err);
        }
      } else {
        const list = snap.docs.map(d => d.data() as Plan);
        // Sort by ID or price
        list.sort((a, b) => Number(a.id) - Number(b.id) || a.price - b.price);
        setPlans(list);
      }
    }, (err) => {
      console.error('Error listening to plans:', err);
    });
    return () => unsubscribe();
  }, []);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (userData.isBanned) {
              await signOut(auth);
              setUser(null);
              setActivePlans([]);
              setTransactions([]);
              setHasInitializedMining(false);
              alert("Your account has been banned by the Administrator.");
              return;
            }
            // Synchronize verification in Firestore if it was false
            if (!userData.isVerified) {
              await updateDoc(userDocRef, { isVerified: true });
              userData.isVerified = true;
            }
            setUser(userData);

            // Load plans and transactions from user's subcollections
            const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
            const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
            setActivePlans(plansList);

            const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
            const txsList = txsSnap.docs.map(d => d.data() as Transaction);
            setTransactions(txsList);
          } else {
            // If Auth user exists but Firestore user is missing, initialize profile
            const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const newUser: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              isVerified: true,
              balance: 0,
              activeInvestments: 0,
              totalProfit: 0,
              referralCode: refCode,
              referredBy: localStorage.getItem('doddoge_pending_referral') || null,
              referralsCount: 0,
              createdAt: new Date().toISOString(),
              firstName: fbUser.displayName ? fbUser.displayName.split(' ')[0] : '',
              lastName: fbUser.displayName ? fbUser.displayName.split(' ').slice(1).join(' ') : '',
              username: (fbUser.email || '').split('@')[0] + Math.floor(Math.random() * 1000),
              phone: ''
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            setActivePlans([]);
            setTransactions([]);
            setHasInitializedMining(false);
          }
        } catch (error) {
          console.error("Error fetching verified profile:", error);
        }
      } else {
        setUser(null);
        setActivePlans([]);
        setTransactions([]);
        setHasInitializedMining(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch referrals
  useEffect(() => {
    if (user) {
      const fetchReferrals = async () => {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referredBy', '==', user.referralCode));
          const querySnap = await getDocs(q);
          const refs = querySnap.docs.map(doc => {
            const d = doc.data();
            return {
              email: d.email,
              date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
              bonus: 2.0
            };
          });
          setReferrals(refs);
        } catch (error) {
          console.error("Error fetching referrals:", error);
        }
      };
      fetchReferrals();
    } else {
      setReferrals([]);
    }
  }, [user]);

  // Load and sync stocks update
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => {
        const next = updateStockPrices(prev);
        const found = next.find(s => s.symbol === selectedStock.symbol);
        if (found) setSelectedStock(found);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Synchronize offline mining balance when activePlans and master plans load
  useEffect(() => {
    if (user && activePlans.length > 0 && plans.length > 0 && !hasInitializedMining) {
      const offlineProfit = calculateInitialMiningBalance(activePlans, plans);
      setMiningBalance(offlineProfit);
      setHasInitializedMining(true);
    }
  }, [activePlans, plans, user, hasInitializedMining]);

  // Automatically activate mining if there is any active plan
  useEffect(() => {
    const hasActive = activePlans.some(p => p.status === 'active' && new Date(p.endDate) > new Date());
    if (hasActive) {
      setMiningActive(true);
    } else {
      setMiningActive(false);
    }
  }, [activePlans]);

  // Run auto accumulation of plan profits
  useEffect(() => {
    if (!user || activePlans.length === 0) return;

    const interval = setInterval(() => {
      if (miningActive) {
        const totalDailyProfit = activePlans.reduce((sum, p) => sum + getLiveDailyProfit(p, plans), 0);
        // Make the simulation run at exact 24-hour speed rate as requested
        const tickProfit = totalDailyProfit / 86400; 
        setMiningBalance(prev => prev + tickProfit);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, activePlans, miningActive, plans]);

  const register = async (
    email: string, 
    password?: string, 
    referralCode?: string,
    firstName?: string,
    lastName?: string,
    username?: string,
    phone?: string
  ) => {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (!firstName || !firstName.trim()) {
        return { success: false, error: 'First name is required.' };
      }
      if (!lastName || !lastName.trim()) {
        return { success: false, error: 'Last name is required.' };
      }
      if (!username || !username.trim()) {
        return { success: false, error: 'Username is required.' };
      }
      
      const cleanUsername = username.trim().toLowerCase();
      // Check username uniqueness in Firestore
      const usersRef = collection(db, 'users');
      const qUsername = query(usersRef, where('username', '==', cleanUsername));
      const usernameSnap = await getDocs(qUsername);
      if (!usernameSnap.empty) {
        return { success: false, error: 'Username already exists. Please choose a different unique username.' };
      }

      const emailLower = email.trim().toLowerCase();
      if (!emailLower.endsWith('@gmail.com')) {
        return { success: false, error: 'Only @gmail.com email addresses are permitted. Temporary and other email domains are strictly prohibited.' };
      }
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;

      const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Check if referral code is valid
      let referredBy: string | null = null;
      const finalReferralCode = referralCode || localStorage.getItem('doddoge_pending_referral') || null;

      if (finalReferralCode) {
        const q = query(usersRef, where('referralCode', '==', finalReferralCode));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          referredBy = finalReferralCode;
          const referrerDoc = querySnap.docs[0];
          const referrerData = referrerDoc.data();
          const newCount = (referrerData.referralsCount || 0) + 1;
          await updateDoc(referrerDoc.ref, { referralsCount: newCount });
        }
      }

      const newUser: User = {
        id: fbUser.uid,
        email: email.toLowerCase(),
        isVerified: true,
        balance: 0,
        activeInvestments: 0,
        totalProfit: 0,
        referralCode: refCode,
        referredBy,
        referralsCount: 0,
        createdAt: new Date().toISOString(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: cleanUsername,
        phone: phone ? phone.trim() : ''
      };

      // Set user profile in Firestore
      await setDoc(doc(db, 'users', fbUser.uid), newUser);
      setUser(newUser);

      // Clean pending referral
      localStorage.removeItem('doddoge_pending_referral');

      return { success: true };
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email address is already in use.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password is too weak. Please use at least 6 characters.';
      }
      return { success: false, error: friendlyError };
    }
  };

  const verifyEmail = () => {
    if (user) {
      setUser(prev => prev ? { ...prev, isVerified: true } : null);
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;

      // Load profile
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        if (userData.isBanned) {
          await signOut(auth);
          setUser(null);
          return { success: false, error: 'Your account has been banned by the Administrator.' };
        }
        if (!userData.isVerified) {
          await updateDoc(userDocRef, { isVerified: true });
          userData.isVerified = true;
        }
        setUser(userData);

        const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
        const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
        setActivePlans(plansList);

        const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
        const txsList = txsSnap.docs.map(d => d.data() as Transaction);
        setTransactions(txsList);
      }
      return { success: true };
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid email or password credentials.';
      }
      return { success: false, error: friendlyError };
    }
  };

  const loginWithGoogle = async (referralCode?: string) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const fbUser = userCred.user;

      const emailLower = (fbUser.email || '').toLowerCase();
      if (!emailLower.endsWith('@gmail.com')) {
        await auth.signOut();
        return { success: false, error: 'Only @gmail.com email addresses are permitted. Temporary and other email domains are strictly prohibited.' };
      }

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Check if referral code is valid
        let referredBy: string | null = null;
        const finalReferralCode = referralCode || localStorage.getItem('doddoge_pending_referral') || null;

        if (finalReferralCode) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referralCode', '==', finalReferralCode));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            referredBy = finalReferralCode;
            const referrerDoc = querySnap.docs[0];
            const referrerData = referrerDoc.data();
            const newCount = (referrerData.referralsCount || 0) + 1;
            await updateDoc(referrerDoc.ref, { referralsCount: newCount });
          }
        }

        const newUser: User = {
          id: fbUser.uid,
          email: (fbUser.email || '').toLowerCase(),
          isVerified: true,
          balance: 0,
          activeInvestments: 0,
          totalProfit: 0,
          referralCode: refCode,
          referredBy,
          referralsCount: 0,
          createdAt: new Date().toISOString(),
          firstName: fbUser.displayName ? fbUser.displayName.split(' ')[0] : '',
          lastName: fbUser.displayName ? fbUser.displayName.split(' ').slice(1).join(' ') : '',
          username: (fbUser.email || '').split('@')[0] + Math.floor(Math.random() * 1000),
          phone: ''
        };

        // Set user profile in Firestore
        await setDoc(userDocRef, newUser);
        setUser(newUser);
        setActivePlans([]);
        setTransactions([]);
      } else {
        const userData = userSnap.data() as User;
        if (userData.isBanned) {
          await signOut(auth);
          setUser(null);
          return { success: false, error: 'Your account has been banned by the Administrator.' };
        }
        if (!userData.isVerified) {
          await updateDoc(userDocRef, { isVerified: true });
          userData.isVerified = true;
        }
        setUser(userData);

        const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
        const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
        setActivePlans(plansList);

        const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
        const txsList = txsSnap.docs.map(d => d.data() as Transaction);
        setTransactions(txsList);
      }

      // Clean pending referral
      localStorage.removeItem('doddoge_pending_referral');

      return { success: true };
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      let friendlyError = err.message;
      if (err.code === 'auth/popup-blocked') {
        friendlyError = 'Pop-up blocked. Please enable pop-ups for this site to sign in with Google.';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyError = 'This domain is not authorized in your Firebase console. Please add it to the authorized domains list.';
      }
      return { success: false, error: friendlyError };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActivePlans([]);
      setTransactions([]);
      setMiningActive(false);
      setMiningBalance(0);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const deposit = async (amount: number, method: string): Promise<{ success: boolean; trackId?: string; paymentUrl?: string; error?: string }> => {
    if (!user) return { success: false, error: 'User session not found' };

    try {
      const res = await createOxaPayInvoice(oxapayApiKey, amount, user.id);
      if (!res.success) {
        return { success: false, error: res.error };
      }

      const newTx: Transaction = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'deposit',
        amount,
        status: 'pending',
        date: new Date().toLocaleString(),
        trackId: res.trackId,
        paymentUrl: res.paymentUrl
      };

      // Save pending transaction to user's transactions subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      // Sync state
      setTransactions(prev => [newTx, ...prev]);

      return {
        success: true,
        trackId: res.trackId,
        paymentUrl: res.paymentUrl
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during deposit initialization' };
    }
  };

  const verifyDeposit = async (trackId: string): Promise<{ success: boolean; message: string; amount?: number }> => {
    if (!user) return { success: false, message: 'User session not found' };

    try {
      const checkRes = await checkOxaPayPayment(oxapayApiKey, trackId);
      if (checkRes.success && (checkRes.status.toLowerCase() === 'paid' || checkRes.status.toLowerCase() === 'confirming' || checkRes.status.toLowerCase() === 'completed' || checkRes.status.toLowerCase() === 'success')) {
        // Find the transaction with this trackId
        const pendingTx = transactions.find(t => t.trackId === trackId && t.type === 'deposit');
        if (!pendingTx) {
          return { success: false, message: 'Transaction record not found in history' };
        }

        if (pendingTx.status === 'completed') {
          return { success: true, message: 'This deposit has already been verified and credited!', amount: pendingTx.amount };
        }

        const depositAmount = pendingTx.amount;

        // 1. Update the transaction status in Firestore
        const txDocRef = doc(db, 'users', user.id, 'transactions', pendingTx.id);
        await updateDoc(txDocRef, { status: 'completed' });

        // 2. Update the user balance in Firestore
        const newBalance = Number((user.balance + depositAmount).toFixed(2));
        await updateDoc(doc(db, 'users', user.id), { balance: newBalance });

        // 3. Update local state
        setTransactions(prev => prev.map(t => t.id === pendingTx.id ? { ...t, status: 'completed' as const } : t));
        setUser(prev => prev ? { ...prev, balance: newBalance } : null);

        return { success: true, message: `Deposit of $${depositAmount} USDT successfully verified and credited!`, amount: depositAmount };
      } else {
        const currentStatus = checkRes.status || 'PENDING';
        return { success: false, message: `Payment status is ${currentStatus.toUpperCase()}. Please complete the payment first.` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to verify transaction' };
    }
  };

  const updateOxapayApiKey = async (newKey: string) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { oxapayApiKey: newKey }, { merge: true });
      setOxapayApiKey(newKey);
    } catch (err) {
      console.error('Error updating OxaPay Key:', err);
      throw err;
    }
  };

  const updateOxapayPayoutApiKey = async (newKey: string) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { oxapayPayoutApiKey: newKey }, { merge: true });
      setOxapayPayoutApiKey(newKey);
    } catch (err) {
      console.error('Error updating OxaPay Payout Key:', err);
      throw err;
    }
  };

  const withdraw = async (amount: number, address: string) => {
    if (!user) return { success: false, error: 'User session not found' };
    if (user.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const fee = 0.25;
    const netAmount = Number((amount - fee).toFixed(2));
    if (netAmount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than the $0.25 USDT fee.' };
    }

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'withdraw',
      amount, // Total gross amount deducted from user balance
      status: 'pending',
      date: new Date().toLocaleString(),
      txHash: address,
      address: address, // Set both so legacy and new structures read it
      fee,
      netAmount
    };

    try {
      // Save transaction to subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      // Update balance
      const newBalance = Number((user.balance - amount).toFixed(2));
      await updateDoc(doc(db, 'users', user.id), { balance: newBalance });

      // Synchronize states
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? { ...prev, balance: newBalance } : null);

      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, error: 'Withdrawal failed. Database connection error.' };
    }
  };

  const buyPlan = async (planId: string) => {
    if (!user) return { success: false, error: 'User not logged in' };
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };

    const hasSamePlanActive = activePlans.some(p => p.planId === planId && p.status === 'active' && new Date(p.endDate) > new Date());
    if (hasSamePlanActive) {
      return { success: false, error: 'You already have an active contract for this plan. You cannot buy the same plan again until it expires.' };
    }

    if (user.balance < plan.price) {
      return { success: false, error: 'Insufficient balance to purchase this plan. Please deposit more funds first.' };
    }

    const dailyProfit = Number((Math.random() * (plan.maxProfit - plan.minProfit) + plan.minProfit).toFixed(2));

    const newActivePlan: ActivePlan = {
      id: 'AP-' + Math.floor(100000 + Math.random() * 900000),
      planId: plan.id,
      name: plan.name,
      price: plan.price,
      dailyProfit,
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
      date: new Date().toLocaleString()
    };

    try {
      const userDocRef = doc(db, 'users', user.id);

      // Save plan to subcollection
      const planDocRef = doc(db, 'users', user.id, 'activePlans', newActivePlan.id);
      await setDoc(planDocRef, newActivePlan);

      // Save transaction to subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      let updatedUserBalance = user.balance - plan.price;
      let activeInvestmentsDelta = plan.price;

      // Handle 20% Instant Referral Commission
      if (user.referredBy) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', user.referredBy));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const referrerDoc = querySnap.docs[0];
          const referrerData = referrerDoc.data();
          const commission = Number((plan.price * 0.20).toFixed(2));

          const newRefBalance = Number((referrerData.balance + commission).toFixed(2));
          const newRefProfit = Number((referrerData.totalProfit + commission).toFixed(2));

          await updateDoc(referrerDoc.ref, {
            balance: newRefBalance,
            totalProfit: newRefProfit
          });

          // Register transaction for referrer
          const refTx: Transaction = {
            id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
            type: 'referral',
            amount: commission,
            status: 'completed',
            date: new Date().toLocaleString(),
            txHash: `Commission from user invite`
          };
          await setDoc(doc(db, 'users', referrerDoc.id, 'transactions', refTx.id), refTx);

          if (referrerDoc.id === user.id) {
            updatedUserBalance += commission;
          }
        }
      }

      const finalBalance = Number(updatedUserBalance.toFixed(2));
      const finalInvestments = Number((user.activeInvestments + activeInvestmentsDelta).toFixed(2));

      await updateDoc(userDocRef, {
        balance: finalBalance,
        activeInvestments: finalInvestments
      });

      // Synchronize state
      setActivePlans(prev => [...prev, newActivePlan]);
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? {
        ...prev,
        balance: finalBalance,
        activeInvestments: finalInvestments
      } : null);

      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, error: 'Subscription failed. Database connection error.' };
    }
  };

  const triggerMiningPayout = async () => {
    if (!user || miningBalance <= 0) return;

    const payoutAmount = Number(miningBalance.toFixed(4));

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'profit',
      amount: payoutAmount,
      status: 'completed',
      date: new Date().toLocaleString()
    };

    try {
      const userDocRef = doc(db, 'users', user.id);

      // Save transaction to Firestore
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      const newBalance = Number((user.balance + payoutAmount).toFixed(2));
      const newProfit = Number((user.totalProfit + payoutAmount).toFixed(2));

      await updateDoc(userDocRef, {
        balance: newBalance,
        totalProfit: newProfit
      });

      // Update earned amount on active plans in database
      const updatedPlans = activePlans.map(p => {
        if (p.status === 'active') {
          return {
            ...p,
            totalEarned: Number((p.totalEarned + (payoutAmount / activePlans.length)).toFixed(4)),
            lastCollectedAt: new Date().toISOString()
          };
        }
        return p;
      });

      for (const p of updatedPlans) {
        const planDocRef = doc(db, 'users', user.id, 'activePlans', p.id);
        await updateDoc(planDocRef, { 
          totalEarned: p.totalEarned,
          lastCollectedAt: p.lastCollectedAt
        });
      }

      // Synchronize states
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? {
        ...prev,
        balance: newBalance,
        totalProfit: newProfit
      } : null);
      setActivePlans(updatedPlans);
      setMiningBalance(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      activePlans,
      transactions,
      stocks,
      selectedStock,
      setSelectedStock,
      language,
      setLanguage,
      register,
      verifyEmail,
      login,
      loginWithGoogle,
      logout,
      deposit,
      withdraw,
      buyPlan,
      miningActive,
      setMiningActive,
      miningBalance,
      triggerMiningPayout,
      referrals,
      maintenanceMode,
      plans,
      oxapayApiKey,
      oxapayPayoutApiKey,
      updateOxapayApiKey,
      updateOxapayPayoutApiKey,
      verifyDeposit
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
