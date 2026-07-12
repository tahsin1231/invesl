export interface User {
  id: string;
  email: string;
  isVerified: boolean;
  balance: number;
  activeInvestments: number;
  totalProfit: number;
  referralCode: string;
  referredBy?: string | null;
  referralsCount: number;
  createdAt: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  isBanned?: boolean;
  banReason?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  minProfit: number;
  maxProfit: number;
  durationDays: number;
}

export interface ActivePlan {
  id: string;
  planId: string;
  name: string;
  price: number;
  dailyProfit: number;
  startDate: string;
  endDate: string;
  lastCollectedAt: string;
  totalEarned: number;
  status: 'active' | 'completed';
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: { time: string; price: number }[];
  type: 'stock' | 'crypto';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'invest' | 'profit' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  txHash?: string;
  trackId?: string;
  paymentUrl?: string;
  payoutTrackId?: string;
  payoutStatus?: string;
  fee?: number;
  netAmount?: number;
  address?: string;
  timestamp?: number;
}
