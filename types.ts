
export type UserRole = 'super_admin' | 'admin' | 'user';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string; // User ID (Username)
  password?: string;
  email: string;
  balance: number;
  totalPaidCoins: number; // NEW: Lifetime coin accumulation
  totalUsedCoins: number; // NEW: Lifetime coin consumption
  name: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  role: UserRole;
  status: UserStatus;
  rejectionReason?: string;
  processedAt?: number;
  processedBy?: string;
  isActive: boolean;
  isPasswordChanged: boolean;
  adminNote?: string; // NEW: Internal admin memo
}

export interface AdminLog {
  id: string;
  timestamp: number;
  adminId: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coinAmount: number;
  priceKrw: number;
  description: string;
  isActive: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  visionOverview?: string;
  visionGoals?: string;
  visionUseCases?: string;
  visionRoadmap?: string;
}

export type TransactionStatus = 
  | 'WAITING_FOR_DEPOSIT' 
  | 'PAID' 
  | 'COIN_DELIVERED' 
  | 'CANCELED_EXPIRED' 
  | 'REJECTED_MANUAL';

export interface StatusHistory {
  status: TransactionStatus;
  timestamp: number;
  actor: 'user' | 'system' | 'admin';
  actorId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  packageId: string;
  packageName?: string;
  amount: number;
  price: number;
  timestamp: number;
  expiresAt: number;
  status: TransactionStatus;
  adminNote?: string; // NEW: Admin memo for order
  history: StatusHistory[];
  bankInfoSnapshot: BankInfo;
  processedBy?: string;
}

export enum ViewType {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  BUY = 'buy',
  HISTORY = 'history',
  ADMIN = 'admin',
  ADMIN_ACCOUNTS = 'admin_accounts',
  LOGIN = 'login',
  SIGNUP = 'signup',
  SIGNUP_SUCCESS = 'signup_success',
  VISION = 'vision',
  FORCE_PW_CHANGE = 'force_pw_change'
}
