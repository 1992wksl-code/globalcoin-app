
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Wallet, History, Settings, LogOut, CreditCard, Globe, 
  User as UserIcon, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Plane, 
  Coins, Shield, Smartphone, ChevronRight, AlertCircle, UserPlus, Target, 
  Rocket, Compass, Map, ArrowLeft, Edit, Save, Clock, Banknote, FileText, 
  Check, RefreshCw, Download, Plus, Trash2, Eye, ExternalLink, BarChart3,
  UserCog, Lock, Activity, Layers, Zap, MoreHorizontal, UserCheck, UserX,
  Mail, Phone, Building2, KeyRound, TrendingUp, Database, Network, Globe2,
  ShieldAlert, UserSearch, Search, Info
} from 'lucide-react';
import { User, CoinPackage, Transaction, ViewType, TransactionStatus, BankInfo, StatusHistory, UserRole, AdminLog, UserStatus } from './types';
import { 
  INITIAL_PACKAGES, AUTH_STORAGE_KEY, USERS_STORAGE_KEY,
  TRANSACTIONS_STORAGE_KEY, PACKAGES_STORAGE_KEY,
  DEFAULT_BANK_INFO, BANK_INFO_STORAGE_KEY, DEPOSIT_DEADLINE_HOURS,
  ADMIN_LOGS_STORAGE_KEY
} from './constants';

// --- Utility Functions ---

const formatKrw = (amount: number) => `₩${amount.toLocaleString()}`;

const exportToCsv = (transactions: Transaction[]) => {
  const headers = ['거래ID', '일자', '사용자ID', '사용자명', '패키지', '코인수량', '금액(KRW)', '상태', '메모'];
  const rows = transactions.map(t => [
    t.id,
    new Date(t.timestamp).toLocaleString(),
    t.userId,
    t.userName || '-',
    t.packageName || '-',
    t.amount,
    t.price,
    t.status,
    t.adminNote || ''
  ]);
  
  const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
    + [headers, ...rows].map(e => e.join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `globalcoin_transactions_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Navbar Component ---

const Navbar = ({ activeView, setView, user, logout }: { 
  activeView: ViewType; 
  setView: (v: ViewType) => void; 
  user: User | null; 
  logout: () => void; 
}) => {
  const isSuperAdmin = user?.role === 'super_admin';
  const isRegularUser = user?.role === 'user';
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewType; icon: any; label: string }) => (
    <button 
      onClick={() => setView(view)} 
      className={`flex items-center gap-3 px-6 py-4 w-full transition-all duration-300 group
        ${activeView === view ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
    >
      <Icon size={20} className={`transition-transform duration-300 ${activeView === view ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-72 bg-slate-950 border-r border-slate-900 sticky top-0 h-screen z-40">
        <div className="p-10 flex items-center gap-3 cursor-pointer" onClick={() => setView(ViewType.LANDING)}>
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Globe className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter">GC Net</span>
        </div>

        <div className="flex-1 mt-4">
          {isRegularUser ? (
            <>
              <NavItem view={ViewType.DASHBOARD} icon={LayoutDashboard} label="대시보드" />
              <NavItem view={ViewType.BUY} icon={Coins} label="코인 구매" />
              <NavItem view={ViewType.HISTORY} icon={History} label="거래 내역" />
            </>
          ) : (
            <>
              <NavItem view={ViewType.ADMIN} icon={ShieldCheck} label="운영 및 거래 승인" />
              {isSuperAdmin && <NavItem view={ViewType.ADMIN_ACCOUNTS} icon={UserCog} label="관리자 계정 관리" />}
            </>
          )}
        </div>

        <div className="p-6">
          <div className="glass p-6 rounded-2xl space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                <UserIcon size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-red-950/30 text-slate-500 hover:text-red-400 rounded-xl text-xs font-bold transition-all">
              <LogOut size={14} /> 로그아웃
            </button>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 flex justify-around p-4 z-[90]">
        {isRegularUser ? (
          <>
            <button onClick={() => setView(ViewType.DASHBOARD)} className={`p-3 rounded-2xl ${activeView === ViewType.DASHBOARD ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><LayoutDashboard/></button>
            <button onClick={() => setView(ViewType.BUY)} className={`p-3 rounded-2xl ${activeView === ViewType.BUY ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Coins/></button>
            <button onClick={() => setView(ViewType.HISTORY)} className={`p-3 rounded-2xl ${activeView === ViewType.HISTORY ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><History/></button>
          </>
        ) : (
          <>
            <button onClick={() => setView(ViewType.ADMIN)} className={`p-3 rounded-2xl ${activeView === ViewType.ADMIN ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><ShieldCheck/></button>
            {isSuperAdmin && <button onClick={() => setView(ViewType.ADMIN_ACCOUNTS)} className={`p-3 rounded-2xl ${activeView === ViewType.ADMIN_ACCOUNTS ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><UserCog/></button>}
          </>
        )}
        <button onClick={logout} className="p-3 text-slate-500"><LogOut/></button>
      </nav>
    </>
  );
};

// --- Main App Component ---

export default function App() {
  
  const saveUser = async () => {
    await fetch("/.netlify/functions/saveUser", {
      method: "POST",
      body: JSON.stringify({ name: "홍길동" }),
    });
  };
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>(ViewType.LANDING);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankInfo, setBankInfo] = useState<BankInfo>(DEFAULT_BANK_INFO);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals and Alerts
  const [showCheckout, setShowCheckout] = useState<CoinPackage | null>(null);
  const [showDepositInfo, setShowDepositInfo] = useState<Transaction | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pwChangeData, setPwChangeData] = useState({ old: '', new: '', confirm: '' });
  
  // Admin Editing
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [tempBankInfo, setTempBankInfo] = useState<BankInfo>(DEFAULT_BANK_INFO);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ id: '', name: '', email: '', password: '', role: 'admin' as UserRole });
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [tempPackageData, setTempPackageData] = useState<Partial<CoinPackage>>({});
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [newPackageForm, setNewPackageForm] = useState<Partial<CoinPackage>>({
    name: '', coinAmount: 0, priceKrw: 0, description: '', isActive: true, sortOrder: 0
  });
  
  // Member Approval & Detail Modals
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [adminSelectedUser, setAdminSelectedUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);

  // Auth States
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    id: '', password: '', confirmPassword: '', name: '', email: '', phone: '', bankName: '', accountNumber: ''
  });
  const [isAdminPortal, setIsAdminPortal] = useState(false);

  // Registry Helper
  const getAllUsers = (): User[] => {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  };

  const updateUsersRegistry = (updatedUsers: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  // Initialize Data from Storage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedPackages = localStorage.getItem(PACKAGES_STORAGE_KEY);
    const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const storedBankInfo = localStorage.getItem(BANK_INFO_STORAGE_KEY);
    const storedLogs = localStorage.getItem(ADMIN_LOGS_STORAGE_KEY);

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedPackages) setPackages(JSON.parse(storedPackages));
    else {
      setPackages(INITIAL_PACKAGES);
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(INITIAL_PACKAGES));
    }
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    if (storedBankInfo) {
      setBankInfo(JSON.parse(storedBankInfo));
      setTempBankInfo(JSON.parse(storedBankInfo));
    }
    if (storedLogs) setAdminLogs(JSON.parse(storedLogs));

    // Data Migration & Initial Setup
    const users = getAllUsers();
    
    // Migrate existing users to have a status field if missing
    let needsSync = false;
    const migratedUsers = users.map(u => {
      let migrated = { ...u };
      let changed = false;
      if (!u.status) {
        migrated.status = u.isActive ? 'APPROVED' : 'SUSPENDED';
        changed = true;
      }
      if (u.totalPaidCoins === undefined) {
        migrated.totalPaidCoins = u.role === 'user' ? u.balance : 0;
        migrated.totalUsedCoins = 0;
        changed = true;
      }
      if (changed) needsSync = true;
      return migrated as User;
    });

    if (!migratedUsers.some(u => u.id === 'superadmin')) {
      const superAdmin: User = {
        id: 'superadmin',
        name: '시스템 최고관리자',
        email: 'super@globalcoin.com',
        balance: 0,
        totalPaidCoins: 0,
        totalUsedCoins: 0,
        role: 'super_admin',
        status: 'APPROVED',
        isActive: true,
        isPasswordChanged: false,
        password: 'Temp!Admin1234'
      };
      migratedUsers.push(superAdmin);
      needsSync = true;
    }

    if (needsSync) {
      updateUsersRegistry(migratedUsers);
    }
  }, []);

  // Run auto-expiry check for transactions older than 24h
  useEffect(() => {
    if (user && user.role !== 'user' && transactions.length > 0) {
      const now = Date.now();
      let changed = false;
      const updated = transactions.map(t => {
        if (t.status === 'WAITING_FOR_DEPOSIT' && now > t.expiresAt) {
          changed = true;
          return {
            ...t,
            status: 'CANCELED_EXPIRED' as TransactionStatus,
            history: [...t.history, { status: 'CANCELED_EXPIRED' as TransactionStatus, timestamp: now, actor: 'system' as const }]
          };
        }
        return t;
      });
      if (changed) {
        setTransactions(updated);
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updated));
      }
    }
  }, [user, transactions.length]);
useEffect(() => {
  if (view === ViewType.ADMIN && user?.role !== 'user') {
    fetchPendingMembers();
  }
}, [view, user]);
  // Admin Logging Helper
  const addAdminLog = (action: string, details: string, prev?: any, curr?: any) => {
    if (!user) return;
    const newLog: AdminLog = {
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      adminId: user.id,
      action,
      details,
      previousValue: prev ? JSON.stringify(prev) : undefined,
      newValue: curr ? JSON.stringify(curr) : undefined
    };
    const updated = [newLog, ...adminLogs].slice(0, 500);
    setAdminLogs(updated);
    localStorage.setItem(ADMIN_LOGS_STORAGE_KEY, JSON.stringify(updated));
  };

  // Auth Functions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    const { id, password } = loginForm;
    
    setTimeout(() => {
      const users = getAllUsers();
      const foundUser = users.find(u => u.id === id);
      
      if (foundUser) {
        if (foundUser.password !== password) {
          setAuthError('비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }

        if (foundUser.status === 'PENDING') {
          setAuthError('회원가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.');
          setIsLoading(false);
          return;
        }
        if (foundUser.status === 'REJECTED') {
          setAuthError(`회원가입 신청이 반려되었습니다. ${foundUser.rejectionReason ? `사유: ${foundUser.rejectionReason}` : ''}`);
          setIsLoading(false);
          return;
        }
        if (foundUser.status === 'SUSPENDED') {
          setAuthError('활동이 정지된 계정입니다. 고객센터에 문의하세요.');
          setIsLoading(false);
          return;
        }

        if (isAdminPortal && foundUser.role === 'user') {
          setAuthError('관리자 권한이 없습니다.');
          setIsLoading(false);
          return;
        }

        setUser(foundUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));

        if (foundUser.role !== 'user') {
          addAdminLog('Login', `Administrator logged in via ${isAdminPortal ? 'Admin Portal' : 'Main Portal'}`);
          if (!foundUser.isPasswordChanged) setView(ViewType.FORCE_PW_CHANGE);
          else setView(ViewType.ADMIN);
        } else {
          setView(ViewType.DASHBOARD);
        }
      } else {
        setAuthError('아이디를 찾을 수 없습니다.');
      }
      setIsLoading(false);
    }, 500);
  };
const handleSignupSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setAuthError(null);

  const { id, password, confirmPassword, name, email, phone, bankName, accountNumber } = signupForm;

  if (password !== confirmPassword) {
    setAuthError('비밀번호가 일치하지 않습니다.');
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch("/.netlify/functions/signupUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        password,
        name,
        email,
        phone,
        bankName,
        accountNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAuthError(data.error || "회원가입 중 오류가 발생했습니다.");
      setIsLoading(false);
      return;
    }

    setView(ViewType.SIGNUP_SUCCESS);
  } catch (error) {
    setAuthError("네트워크 오류가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};
const fetchPendingMembers = async () => {
  try {
    const response = await fetch("/.netlify/functions/getPendingMembers");
    const data = await response.json();

    if (!response.ok) {
      console.error("승인대기 회원 불러오기 실패:", data);
      return;
    }

    setPendingMembers(data);
  } catch (error) {
    console.error("승인대기 회원 불러오기 네트워크 오류:", error);
  }
};

  const handleForcePwChange = () => {
    if (!pwChangeData.new || pwChangeData.new !== pwChangeData.confirm) {
      setAuthError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!user) return;
    const users = getAllUsers();
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, password: pwChangeData.new, isPasswordChanged: true } : u);
    updateUsersRegistry(updatedUsers);
    const updatedUser = { ...user, isPasswordChanged: true, password: pwChangeData.new };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    addAdminLog('Security', 'Initial password change completed');
    setView(ViewType.ADMIN);
  };

  function handleLogout() {
    if (user && user.role !== 'user') addAdminLog('Session', 'Administrator logged out');
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setView(ViewType.LANDING);
    setIsAdminPortal(false);
  }

  // Member Approval Actions
 const handleApproveUser = async (targetId: string) => {
  try {
    const response = await fetch("/.netlify/functions/approveMember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: targetId,
        processedBy: user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("회원 승인 실패:", data);
      return;
    }

    await fetchPendingMembers();
  } catch (error) {
    console.error("회원 승인 네트워크 오류:", error);
  }
};

 const handleRejectUser = async () => {
  if (!rejectingUser) return;

  try {
    const response = await fetch("/.netlify/functions/rejectMember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: rejectingUser.user_id,
        rejectionReason: rejectionNote,
        processedBy: user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("회원 반려 실패:", data);
      return;
    }

    setRejectingUser(null);
    setRejectionNote('');
    await fetchPendingMembers();
  } catch (error) {
    console.error("회원 반려 네트워크 오류:", error);
  }
};

  const handleToggleSuspension = (targetId: string) => {
    const users = getAllUsers();
    const target = users.find(u => u.id === targetId);
    if (!target) return;
    const newStatus = target.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    const updated = users.map(u => u.id === targetId ? { ...u, status: newStatus as UserStatus } : u);
    updateUsersRegistry(updated);
    addAdminLog('Member Management', `${newStatus === 'SUSPENDED' ? 'Suspended' : 'Unsuspended'} user: ${targetId}`);
  };

  const handleSaveAdminNote = (userId: string, note: string) => {
    const users = getAllUsers();
    const updated = users.map(u => u.id === userId ? { ...u, adminNote: note } : u);
    updateUsersRegistry(updated);
    if (adminSelectedUser?.id === userId) {
      setAdminSelectedUser({ ...adminSelectedUser, adminNote: note });
    }
    addAdminLog('Member Management', `Updated internal note for user: ${userId}`);
  };

  // Operational Functions
  const handleApproveTransaction = (trxId: string) => {
    const trx = transactions.find(t => t.id === trxId);
    if (!trx || trx.status !== 'WAITING_FOR_DEPOSIT') return;
    const now = Date.now();
    
    // 1. Update User Balance & Stats
    const users = getAllUsers();
    const updatedUsers = users.map(u => u.id === trx.userId ? { 
      ...u, 
      balance: u.balance + trx.amount,
      totalPaidCoins: u.totalPaidCoins + trx.amount 
    } : u);
    updateUsersRegistry(updatedUsers);
    
    // 2. Update Transaction Status (Automatic Delivery as per Requirement)
    const updatedTrxs = transactions.map(t => t.id === trxId ? {
      ...t, 
      status: 'COIN_DELIVERED' as TransactionStatus,
      processedBy: user?.id,
      history: [
        ...t.history, 
        { status: 'PAID' as TransactionStatus, timestamp: now, actor: 'admin' as const, actorId: user?.id },
        { status: 'COIN_DELIVERED' as TransactionStatus, timestamp: now + 1, actor: 'system' as const }
      ]
    } : t);
    setTransactions(updatedTrxs);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTrxs));
    addAdminLog('Transaction', `Verified deposit and delivered ${trx.amount} GC to ${trx.userName} (${trxId})`);
  };

  const handleCancelManual = (trxId: string, note?: string) => {
    const now = Date.now();
    const updatedTrxs = transactions.map(t => t.id === trxId ? {
      ...t, 
      status: 'REJECTED_MANUAL' as TransactionStatus,
      adminNote: note || t.adminNote,
      history: [...t.history, { status: 'REJECTED_MANUAL' as TransactionStatus, timestamp: now, actor: 'admin' as const, actorId: user?.id }]
    } : t);
    setTransactions(updatedTrxs);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTrxs));
    addAdminLog('Transaction', `Denied deposit request ${trxId}`);
  };

  const handleRequestPurchase = (pkg: CoinPackage) => {
    if (!user) return;
    setIsLoading(true);
    setTimeout(() => {
      const now = Date.now();
      const newTrx: Transaction = {
        id: `ORD-${now}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        userId: user.id, userName: user.name, packageId: pkg.id, packageName: pkg.name, amount: pkg.coinAmount, price: pkg.priceKrw,
        timestamp: now, expiresAt: now + (DEPOSIT_DEADLINE_HOURS * 60 * 60 * 1000),
        status: 'WAITING_FOR_DEPOSIT', 
        history: [{ status: 'WAITING_FOR_DEPOSIT', timestamp: now, actor: 'user', actorId: user.id }],
        bankInfoSnapshot: { ...bankInfo }
      };
      const updatedTrxs = [newTrx, ...transactions];
      setTransactions(updatedTrxs);
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTrxs));
      setShowCheckout(null);
      setShowDepositInfo(newTrx);
      setIsLoading(false);
    }, 800);
  };

  const handleSavePackage = () => {
    if (!editingPackage || !tempPackageData) return;
    const oldPkg = packages.find(p => p.id === editingPackage.id);
    const updatedPackages = packages.map(p => p.id === editingPackage.id ? { ...p, ...tempPackageData } : p);
    setPackages(updatedPackages);
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updatedPackages));
    addAdminLog('Config', `Package ${editingPackage.name} updated`, oldPkg, tempPackageData);
    setEditingPackage(null);
    setTempPackageData({});
  };

  const handleCreatePackage = () => {
    if (!newPackageForm.name || !newPackageForm.coinAmount || !newPackageForm.priceKrw) return;
    const pkgId = `pkg_${Date.now()}`;
    const newPkg: CoinPackage = {
      id: pkgId,
      name: newPackageForm.name!,
      coinAmount: Number(newPackageForm.coinAmount),
      priceKrw: Number(newPackageForm.priceKrw),
      description: newPackageForm.description || '',
      isActive: newPackageForm.isActive ?? true,
      sortOrder: Number(newPackageForm.sortOrder || 0)
    };
    const updated = [...packages, newPkg];
    setPackages(updated);
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updated));
    addAdminLog('Config', `Created new package: ${newPkg.name}`, null, newPkg);
    setShowCreatePackage(false);
    setNewPackageForm({ name: '', coinAmount: 0, priceKrw: 0, description: '', isActive: true, sortOrder: 0 });
  };

  const handleUpdateRole = (id: string, newRole: UserRole) => {
    if (user?.role !== 'super_admin') return;
    const users = getAllUsers();
    const oldUser = users.find(u => u.id === id);
    const updated = users.map(u => u.id === id ? { ...u, role: newRole } : u);
    updateUsersRegistry(updated);
    addAdminLog('Account Management', `Changed role of ${id} to ${newRole}`, oldUser?.role, newRole);
  };

  const handleCreateAdmin = () => {
    if (user?.role !== 'super_admin') return;
    const users = getAllUsers();
    if (users.some(u => u.id === newAdminData.id)) {
      setAuthError('이미 사용 중인 아이디입니다.');
      return;
    }
    const newAdmin: User = { 
      ...newAdminData, 
      balance: 0, 
      totalPaidCoins: 0, 
      totalUsedCoins: 0, 
      isActive: true, 
      status: 'APPROVED', 
      isPasswordChanged: false 
    };
    updateUsersRegistry([...users, newAdmin]);
    addAdminLog('Account Management', `Created new ${newAdmin.role}: ${newAdmin.id}`);
    setShowCreateAdmin(false);
    setNewAdminData({ id: '', name: '', email: '', password: '', role: 'admin' });
  };

  const handleSaveBankInfo = () => {
    if (user?.role !== 'super_admin') return;
    const oldInfo = { ...bankInfo };
    setBankInfo(tempBankInfo);
    localStorage.setItem(BANK_INFO_STORAGE_KEY, JSON.stringify(tempBankInfo));
    addAdminLog('Config', 'Bank transfer details updated', oldInfo, tempBankInfo);
    setIsEditingBank(false);
  };

  const adminStats = useMemo(() => ({
    pendingTrxs: transactions.filter(t => t.status === 'WAITING_FOR_DEPOSIT').length,
    pendingUsers: getAllUsers().filter(u => u.status === 'PENDING').length,
    completed: transactions.filter(t => t.status === 'COIN_DELIVERED').length,
    revenue: transactions.filter(t => t.status === 'COIN_DELIVERED').reduce((sum, t) => sum + t.price, 0)
  }), [transactions, getAllUsers()]);

  const filteredMembers = useMemo(() => {
    const query = userSearchQuery.toLowerCase();
    return getAllUsers().filter(u => 
      u.role === 'user' && 
      (u.id.toLowerCase().includes(query) || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
    );
  }, [userSearchQuery, getAllUsers()]);

  // Packages sorted by sortOrder or id
  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [packages]);

  // --- Render Helpers ---

  const StatusBadge = ({ status }: { status: TransactionStatus | UserStatus }) => {
    const config: Record<string, { label: string, class: string }> = {
      WAITING_FOR_DEPOSIT: { label: '입금 대기', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      PAID: { label: '입금 확인', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      COIN_DELIVERED: { label: '지급 완료', class: 'bg-green-500/10 text-green-500 border-green-500/20' },
      CANCELED_EXPIRED: { label: '기한 만료', class: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
      REJECTED_MANUAL: { label: '취소됨', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
      PENDING: { label: '승인 대기', class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      APPROVED: { label: '승인 완료', class: 'bg-green-500/10 text-green-500 border-green-500/20' },
      REJECTED: { label: '반려됨', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
      SUSPENDED: { label: '정지됨', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    };
    const s = config[status] || { label: status, class: 'bg-slate-500/10 text-slate-400' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.class}`}>{s.label}</span>;
  };

  // --- Views ---

  if (view === ViewType.LANDING) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-2">
            <Globe className="text-blue-500" />
            <span className="font-bold text-xl tracking-tighter">GlobalCoin</span>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setView(ViewType.VISION)} className="text-sm font-semibold text-slate-400 hover:text-white px-4">서비스 비전</button>
             <button onClick={() => { setIsAdminPortal(false); setView(ViewType.LOGIN); }} className="text-sm font-semibold text-slate-400 hover:text-white px-4">로그인</button>
             <button onClick={() => setView(ViewType.SIGNUP)} className="gradient-bg px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">회원가입</button>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20">
           <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] -z-10" />
           <div className="space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                <Zap size={14} /> TRAVEL WITHOUT BOUNDARIES
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
                환전 없는 여행,<br /><span className="gradient-text">하나의 통화로</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                GlobalCoin은 국경을 넘나드는 여행자들을 위해 설계되었습니다.<br />복잡한 절차 없이, 전 세계 가맹점에서 즉시 사용하세요.
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setView(ViewType.SIGNUP)} className="px-12 py-5 gradient-bg rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform">
                  1,000 GC 받고 시작하기
                </button>
                <button onClick={() => setView(ViewType.VISION)} className="px-12 py-5 glass rounded-2xl font-bold text-lg hover:bg-white/5 transition-colors">
                  브랜드 비전
                </button>
              </div>
           </div>
        </main>
        <footer className="p-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950">
           <div className="text-slate-500 text-sm font-medium">© 2024 GlobalCoin Network. All rights reserved.</div>
           <div className="flex gap-8">
              <button onClick={() => { setIsAdminPortal(true); setView(ViewType.LOGIN); }} className="text-slate-700 text-xs font-bold hover:text-slate-500 uppercase tracking-widest">Administrator Portal</button>
           </div>
        </footer>
      </div>
    );
  }

  if (view === ViewType.SIGNUP_SUCCESS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-lg glass p-12 rounded-[4rem] shadow-2xl text-center space-y-10 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-green-500/10 rounded-[3rem] flex items-center justify-center text-green-500 mx-auto shadow-inner"><ShieldCheck size={48} /></div>
           <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight">회원가입 신청 완료</h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">신청이 정상적으로 접수되었습니다.<br /><strong className="text-slate-200">관리자 승인 절차</strong> 완료 후 서비스를 이용하실 수 있습니다.</p>
           </div>
           <div className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl text-sm text-slate-500 font-medium">승인 결과는 가입 시 입력하신 이메일로 안내되거나,<br />로그인 시도 시 상태를 확인하실 수 있습니다.</div>
           <button onClick={() => setView(ViewType.LANDING)} className="w-full py-6 gradient-bg rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">메인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (view === ViewType.LOGIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/[0.03] -z-10" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="w-full max-w-md glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <button onClick={() => setView(ViewType.LANDING)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center mb-10">
            <div className={`w-16 h-16 ${isAdminPortal ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'} rounded-[1.5rem] flex items-center justify-center mb-6`}>
              {isAdminPortal ? <Shield size={32} /> : <UserIcon size={32} />}
            </div>
            <h2 className="text-3xl font-black tracking-tighter">{isAdminPortal ? '운영진 로그인' : '멤버 로그인'}</h2>
            <p className="text-slate-500 text-sm mt-2">{isAdminPortal ? 'GlobalCoin 관리 콘솔' : '여행을 위한 코인 관리'}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">아이디</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" required className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-12 py-4 focus:border-blue-500 outline-none transition-all" placeholder="아이디를 입력하세요" value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">비밀번호</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="password" required className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-12 py-4 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                </div>
             </div>
             {authError && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center leading-relaxed">{authError}</div>}
             <button disabled={isLoading} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 mt-6 active:scale-95 transition-all flex items-center justify-center gap-2 ${isAdminPortal ? 'bg-purple-600' : 'gradient-bg'}`}>
               {isLoading ? <RefreshCw className="animate-spin" /> : (isAdminPortal ? '시스템 접속' : '로그인')}
             </button>
          </form>
          {!isAdminPortal && (
            <div className="mt-10 text-center">
              <span className="text-slate-500 text-sm">계정이 없으신가요?</span>
              <button onClick={() => setView(ViewType.SIGNUP)} className="ml-2 text-blue-400 font-bold hover:underline">회원가입</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === ViewType.SIGNUP) {
    return (
      <div className="min-h-screen bg-slate-950 py-20 px-4 flex justify-center items-center">
        <div className="w-full max-w-2xl glass p-12 rounded-[4rem] shadow-2xl relative">
          <button onClick={() => setView(ViewType.LANDING)} className="absolute top-10 left-10 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UserPlus size={32} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter">새로운 멤버가 되어보세요</h2>
            <p className="text-slate-500 mt-2">지금 가입하고 1,000 GC 가입 축하 혜택을 받으세요.</p>
          </div>
          <form onSubmit={handleSignupSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">아이디</label>
              <input required type="text" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="사용할 아이디" value={signupForm.id} onChange={e => setSignupForm({...signupForm, id: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">이름</label>
              <input required type="text" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="실명 입력" value={signupForm.name} onChange={e => setSignupForm({...signupForm, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">비밀번호</label>
              <input required type="password" title="비밀번호" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">비밀번호 확인</label>
              <input required type="password" title="비밀번호 확인" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" value={signupForm.confirmPassword} onChange={e => setSignupForm({...signupForm, confirmPassword: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">이메일</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input required type="email" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 focus:border-blue-500 outline-none transition-all" placeholder="example@mail.com" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">연락처</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input required type="tel" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 focus:border-blue-500 outline-none transition-all" placeholder="010-0000-0000" value={signupForm.phone} onChange={e => setSignupForm({...signupForm, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">은행명</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input required type="text" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 focus:border-blue-500 outline-none transition-all" placeholder="입금 받을 은행" value={signupForm.bankName} onChange={e => setSignupForm({...signupForm, bankName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">계좌번호</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input required type="text" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 focus:border-blue-500 outline-none transition-all" placeholder="123-456-7890" value={signupForm.accountNumber} onChange={e => setSignupForm({...signupForm, accountNumber: e.target.value})} />
              </div>
            </div>
            <div className="md:col-span-2 pt-6 text-center space-y-4">
              {authError && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">{authError}</div>}
              <button disabled={isLoading} className="w-full py-5 gradient-bg rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isLoading ? <RefreshCw className="animate-spin" /> : '회원가입 신청'}
              </button>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">관리자 승인 후 로그인이 가능합니다.</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === ViewType.FORCE_PW_CHANGE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 gradient-bg" />
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-8"><Lock size={32}/></div>
          <h2 className="text-3xl font-black text-center mb-2">보안 강화</h2>
          <p className="text-slate-400 text-sm text-center mb-10 leading-relaxed">신규 관리자 계정 활성화를 위해<br />비밀번호 변경이 필요합니다.</p>
          <div className="space-y-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">새 비밀번호</label>
               <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" value={pwChangeData.new} onChange={e => setPwChangeData({...pwChangeData, new: e.target.value})} />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">새 비밀번호 확인</label>
               <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" value={pwChangeData.confirm} onChange={e => setPwChangeData({...pwChangeData, confirm: e.target.value})} />
            </div>
            {authError && <div className="text-red-400 text-xs font-bold text-center px-2">{authError}</div>}
            <button onClick={handleForcePwChange} className="w-full gradient-bg py-5 rounded-2xl font-black text-lg mt-6 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">비밀번호 변경 및 접속</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === ViewType.VISION) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-32 animate-in fade-in duration-700 pb-32">
           <button onClick={() => setView(ViewType.LANDING)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 돌아가기
           </button>
           <section className="text-center space-y-10 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10" />
              <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-500 mx-auto mb-10 shadow-inner"><Target size={48} /></div>
              <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter">여행 결제의<br /><span className="gradient-text">본질에 집중합니다</span></h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                "이 코인을 왜 구매해야 하는가?" 라는 질문에 우리는 '실용성'으로 답합니다. GlobalCoin은 복잡한 디지털 자산이 아닌, 여행지에서의 소중한 시간을 환전 고민에 낭비하지 않게 돕는 실무적인 도구입니다.
              </p>
           </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200">
      <Navbar activeView={view} setView={setView} user={user} logout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* DASHBOARD (USER) */}
        {view === ViewType.DASHBOARD && user?.role === 'user' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black">내 지갑</h1>
                <p className="text-slate-500">안녕하세요, {user?.name}님.</p>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 glass p-12 rounded-[3.5rem] flex flex-col justify-between min-h-[320px] relative overflow-hidden group border-white/5">
                <div className="absolute -top-20 -right-20 text-blue-500/5 group-hover:text-blue-500/10 transition-all duration-700 pointer-events-none"><Coins size={420} /></div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-4"><Wallet size={16} className="text-blue-500" /> 가용 잔액</div>
                  <h3 className="text-7xl font-black gradient-text tracking-tighter">{user?.balance.toLocaleString()} <span className="text-3xl text-slate-500 ml-2">GC</span></h3>
                </div>
                <div className="flex gap-4 mt-12">
                  <button onClick={() => setView(ViewType.BUY)} className="px-10 py-4 gradient-bg rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">
                    코인 충전
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN ACCOUNT MANAGEMENT (SUPER ADMIN ONLY) */}
        {view === ViewType.ADMIN_ACCOUNTS && user?.role === 'super_admin' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-black">관리자 계정 마스터</h1>
              </div>
              <button onClick={() => setShowCreateAdmin(true)} className="px-8 py-4 gradient-bg rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">
                <UserPlus size={20}/> 신규 관리자 추가
              </button>
            </header>
            <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <tr><th className="px-10 py-6">관리자</th><th className="px-10 py-6">권한</th><th className="px-10 py-6">상태</th><th className="px-10 py-6 text-right">제어</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {getAllUsers().filter(u => u.role !== 'user').map(admin => (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8"><p className="font-black text-slate-200">{admin.name}</p><p className="text-xs text-slate-500 font-mono">ID: {admin.id}</p></td>
                      <td className="px-10 py-8">
                        <select disabled={admin.id === 'superadmin'} value={admin.role} onChange={(e) => handleUpdateRole(admin.id, e.target.value as UserRole)} className="bg-slate-900 border border-white/5 text-[10px] font-black uppercase px-4 py-2 rounded-xl">
                           <option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-10 py-8">
                        <StatusBadge status={admin.status} />
                      </td>
                      <td className="px-10 py-8 text-right">
                        {admin.id !== 'superadmin' && <button onClick={() => handleToggleSuspension(admin.id)} className={`p-3 rounded-xl transition-all ${admin.status === 'SUSPENDED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{admin.status === 'SUSPENDED' ? <UserCheck size={18}/> : <UserX size={18}/>}</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OPERATIONS DASHBOARD */}
        {view === ViewType.ADMIN && user?.role !== 'user' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black">운영 관제 센터</h1>
                <p className="text-slate-500">실시간 입금 요청 및 패키지 판매 현황입니다.</p>
              </div>
              <button onClick={() => exportToCsv(transactions)} className="glass px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl active:scale-95 transition-all"><Download size={18}/> 운영 통계 추출</button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: '입금 확인 대기', val: adminStats.pendingTrxs, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: '회원 승인 대기', val: adminStats.pendingUsers, icon: UserSearch, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: '누적 승인 완료', val: adminStats.completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: '누적 매출 (KRW)', val: formatKrw(adminStats.revenue), icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' }
              ].map((s, i) => (
                <div key={i} className="glass p-10 rounded-[3rem] flex flex-col gap-6 shadow-sm border-white/5 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${s.color}`}><s.icon size={100} /></div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}><s.icon size={28}/></div>
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{s.label}</p><p className="text-3xl font-black">{s.val}</p></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                {/* Member Approval List */}
                <section className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black flex items-center gap-3"><ShieldAlert size={28} className="text-blue-400"/> 신규 회원 승인 요청</h3>
                  </div>
                  <div className="glass rounded-[3.5rem] overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                          <tr><th className="px-10 py-6">신청 유저</th><th className="px-10 py-6">연락처/이메일</th><th className="px-10 py-6 text-right">승인 제어</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {pendingMembers.map((pendingUser) => (
                            <tr key={pendingUser.user_id} className="hover:bg-white/[0.02] transition-colors bg-blue-400/[0.01]">
                              <td className="px-10 py-8">
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-200">{pendingUser.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono mt-1">ID: {pendingUser.user_id}</span>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <div className="flex flex-col text-xs space-y-1">
                                  <span className="text-slate-400 font-bold">{pendingUser.phone}</span>
                                  <span className="text-slate-500">{pendingUser.email}</span>
                                </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => handleApproveUser(pendingUser.user_id)} className="p-4 bg-green-600/20 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-lg active:scale-95" title="승인">
                                    <Check size={20}/>
                                  </button>
                                  <button onClick={() => setRejectingUser(pendingUser)} className="p-4 bg-red-600/20 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95" title="반려">
                                    <XCircle size={20}/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {pendingMembers.length === 0 && (
                            <tr><td colSpan={3} className="px-10 py-24 text-center text-slate-500 font-black uppercase tracking-widest">대기 중인 회원가입 요청이 없습니다.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <h3 className="text-2xl font-black flex items-center gap-3"><CreditCard size={28} className="text-blue-500"/> 입금 확인 워크플로우</h3>
                  <div className="glass rounded-[3.5rem] overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest"><tr><th className="px-10 py-6">신청 유저</th><th className="px-10 py-6">결제액 / GC</th><th className="px-10 py-6 text-right">상태 제어</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                          {transactions.filter(t => t.status === 'WAITING_FOR_DEPOSIT').map(trx => (
                            <tr key={trx.id} className="hover:bg-white/[0.02] transition-colors bg-blue-600/[0.01]">
                              <td className="px-10 py-8"><span className="font-black text-slate-200">{trx.userName}</span><p className="text-[10px] text-slate-500 font-mono mt-1">{trx.id}</p></td>
                              <td className="px-10 py-8"><span className="font-black text-blue-400">{formatKrw(trx.price)}</span><p className="text-[10px] text-green-500 font-bold uppercase">+{trx.amount.toLocaleString()} GC</p></td>
                              <td className="px-10 py-8 text-right"><div className="flex gap-2 justify-end">
                                <button onClick={() => handleApproveTransaction(trx.id)} className="p-4 bg-green-600/20 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white" title="입금 확인 및 코인 지급"><Check size={20}/></button>
                                <button onClick={() => handleCancelManual(trx.id)} className="p-4 bg-slate-900 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white" title="취소 처리"><XCircle size={20}/></button>
                              </div></td>
                            </tr>
                          ))}
                          {transactions.filter(t => t.status === 'WAITING_FOR_DEPOSIT').length === 0 && (
                            <tr><td colSpan={3} className="px-10 py-16 text-center text-slate-500 font-black uppercase tracking-widest">처리 대기 중인 주문이 없습니다.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Member Management Search & Table */}
                <section className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-2xl font-black flex items-center gap-3"><UserIcon size={28} className="text-purple-400"/> 전체 회원 관리</h3>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="이름, 아이디, 이메일 검색" 
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-blue-500 outline-none"
                        value={userSearchQuery}
                        onChange={e => setUserSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                          <tr><th className="px-10 py-6">회원 정보</th><th className="px-10 py-6">코인 잔액</th><th className="px-10 py-6">상태</th><th className="px-10 py-6 text-right">상세보기</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-10 py-8">
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-200">{member.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">@{member.id}</span>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <span className="font-black text-blue-400">{member.balance.toLocaleString()} GC</span>
                              </td>
                              <td className="px-10 py-8">
                                <StatusBadge status={member.status} />
                              </td>
                              <td className="px-10 py-8 text-right">
                                <button 
                                  onClick={() => setAdminSelectedUser(member)}
                                  className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                                >
                                  <Eye size={18}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-12">
                 <section className="space-y-6">
                    <div className="flex justify-between items-center"><h3 className="text-xl font-black">수납 계좌 관리</h3>
                      {user?.role === 'super_admin' && <button onClick={() => setIsEditingBank(true)} className="text-blue-500 text-xs font-black uppercase hover:underline">Edit</button>}
                    </div>
                    <div className="glass p-10 rounded-[3.5rem] space-y-6 border-white/5">
                       <div className="flex justify-between items-center text-xs"><span className="text-slate-500 font-bold">은행</span><span className="font-black">{bankInfo.bankName}</span></div>
                       <div className="flex justify-between items-center text-xs"><span className="text-slate-500 font-bold">예금주</span><span className="font-black">{bankInfo.accountHolder}</span></div>
                       <div className="flex flex-col gap-2 border-t border-white/5 pt-6 mt-2"><span className="text-slate-500 text-[10px] font-black uppercase">Account Number</span><span className="font-black text-2xl tracking-tighter text-blue-400 select-all">{bankInfo.accountNumber}</span></div>
                    </div>
                 </section>
                 
                 <section className="space-y-6">
                    <div className="flex justify-between items-center"><h3 className="text-xl font-black">패키지 상품 관리</h3>
                      {user?.role === 'super_admin' && <button onClick={() => setShowCreatePackage(true)} className="text-blue-400 font-bold flex items-center gap-1 text-sm hover:underline"><Plus size={16}/> 추가</button>}
                    </div>
                    <div className="grid gap-4">
                       {sortedPackages.map(pkg => (
                          <div key={pkg.id} className="glass p-6 rounded-3xl flex justify-between items-center group border-white/5">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${pkg.isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900 text-slate-700'}`}>{pkg.coinAmount}</div>
                                <div><span className="font-bold text-sm block">{pkg.name}</span><span className="text-[10px] text-slate-500 font-black">{formatKrw(pkg.priceKrw)}</span></div>
                             </div>
                             <div className="flex items-center gap-2">
                                {user?.role === 'super_admin' && <button onClick={() => { setEditingPackage(pkg); setTempPackageData(pkg); }} className="p-2 text-slate-500 hover:text-white transition-colors"><Edit size={16}/></button>}
                                <button 
                                  disabled={user?.role !== 'super_admin'}
                                  onClick={() => {
                                    const oldPkg = { ...pkg };
                                    const updated = packages.map(p => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p);
                                    setPackages(updated);
                                    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updated));
                                    addAdminLog('Config', `Package ${pkg.name} visibility changed`, oldPkg.isActive, !pkg.isActive);
                                  }} className={`text-[10px] font-black px-4 py-2 rounded-xl ${pkg.isActive ? 'bg-blue-600' : 'bg-slate-900 text-slate-500'}`}>
                                   {pkg.isActive ? '노출' : '숨김'}
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>
            </div>
          </div>
        )}

        {/* REGULAR USER BUY */}
        {view === ViewType.BUY && user?.role === 'user' && (
           <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-500">
             <div className="text-center max-w-2xl mx-auto space-y-4">
               <h2 className="text-5xl font-black tracking-tighter">패키지 선택</h2>
               <p className="text-slate-500 text-lg">여행 일정에 필요한 GC 수량을 선택하세요. 입금 확인 후 즉시 지급됩니다.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {sortedPackages.filter(p => p.isActive).map(pkg => (
                 <div key={pkg.id} className={`glass p-12 rounded-[4rem] flex flex-col border-2 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group ${pkg.isPopular ? 'border-blue-500 bg-blue-500/5' : 'border-white/5'}`}>
                   {pkg.isPopular && <div className="absolute top-8 right-8 bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Best Value</div>}
                   <h3 className="text-3xl font-black mb-2">{pkg.name}</h3>
                   <div className="flex items-baseline gap-2 mb-6"><span className="text-6xl font-black gradient-text tracking-tighter">{pkg.coinAmount.toLocaleString()}</span><span className="text-xl font-black text-slate-500">GC</span></div>
                   <p className="text-slate-500 text-sm mb-12 flex-1 leading-relaxed">{pkg.description}</p>
                   <div className="pt-10 border-t border-white/5 flex flex-col gap-6">
                      <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">결제 금액</span><span className="text-3xl font-black">{formatKrw(pkg.priceKrw)}</span></div>
                      <button onClick={() => setShowCheckout(pkg)} className="w-full py-5 gradient-bg rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">구매하기</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {view === ViewType.HISTORY && user?.role === 'user' && (
           <div className="space-y-12 animate-in fade-in duration-500">
             <div className="flex justify-between items-end"><h2 className="text-4xl font-black">내 거래 기록</h2><div className="text-slate-500 text-xs font-black uppercase tracking-widest">All time activity</div></div>
             <div className="glass rounded-[3.5rem] overflow-hidden border-white/5 shadow-2xl">
                <table className="w-full text-left">
                   <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black tracking-widest uppercase"><tr className="px-10 py-6"><th className="px-10 py-6">신청 일시 / ID</th><th className="px-10 py-6">진행 상태</th><th className="px-10 py-6 text-right">금액</th></tr></thead>
                   <tbody className="divide-y divide-white/5">
                      {transactions.filter(t => t.userId === user?.id).map(trx => (
                         <tr key={trx.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-10 py-8"><p className="text-sm font-black">{new Date(trx.timestamp).toLocaleString()}</p><p className="text-[10px] text-slate-500 font-mono mt-1">{trx.id}</p></td>
                            <td className="px-10 py-8"><StatusBadge status={trx.status} /></td>
                            <td className="px-10 py-8 text-right"><span className="font-black text-xl">{formatKrw(trx.price)}</span><p className="text-[10px] font-black text-blue-500">+{trx.amount.toLocaleString()} GC</p></td>
                         </tr>
                      ))}
                      {transactions.filter(t => t.userId === user?.id).length === 0 && (
                         <tr><td colSpan={3} className="px-10 py-32 text-center text-slate-500 font-black uppercase tracking-widest">거래 기록이 존재하지 않습니다.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
           </div>
        )}
      </main>

      {/* MODALS */}

      {/* MEMBER DETAIL VIEW MODAL (ADMIN ONLY) */}
      {adminSelectedUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setAdminSelectedUser(null)} />
          <div className="glass w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[4rem] z-10 animate-in zoom-in-95 shadow-2xl relative border-white/5 flex flex-col">
            <header className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-[2rem] gradient-bg flex items-center justify-center text-white shadow-xl">
                   <UserIcon size={40} />
                 </div>
                 <div>
                   <h3 className="text-3xl font-black tracking-tight">{adminSelectedUser.name}</h3>
                   <div className="flex items-center gap-3 mt-1">
                     <span className="text-sm text-slate-500 font-mono">ID: {adminSelectedUser.id}</span>
                     <StatusBadge status={adminSelectedUser.status} />
                   </div>
                 </div>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => handleToggleSuspension(adminSelectedUser.id)} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${adminSelectedUser.status === 'SUSPENDED' ? 'bg-green-600 text-white' : 'bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white'}`}>
                   {adminSelectedUser.status === 'SUSPENDED' ? '계정 정지 해제' : '계정 활동 정지'}
                 </button>
                 <button onClick={() => setAdminSelectedUser(null)} className="p-4 bg-slate-900 rounded-2xl text-slate-500 hover:text-white"><XCircle/></button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass p-8 rounded-[2.5rem] border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">현재 보유 잔액</p>
                    <p className="text-3xl font-black text-blue-400">{adminSelectedUser.balance.toLocaleString()} <span className="text-sm text-slate-500">GC</span></p>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">누적 지급량</p>
                    <p className="text-3xl font-black text-green-500">{adminSelectedUser.totalPaidCoins?.toLocaleString() || 0} <span className="text-sm text-slate-500">GC</span></p>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">누적 사용량</p>
                    <p className="text-3xl font-black text-red-400">{adminSelectedUser.totalUsedCoins?.toLocaleString() || 0} <span className="text-sm text-slate-500">GC</span></p>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">가입 일자</p>
                    <p className="text-sm font-black text-slate-200 mt-2">{adminSelectedUser.processedAt ? new Date(adminSelectedUser.processedAt).toLocaleDateString() : '관리자 강제 생성'}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <section className="space-y-6">
                    <h4 className="text-xl font-black flex items-center gap-3"><Mail size={20} className="text-slate-500"/> 기본 통신 정보</h4>
                    <div className="glass p-8 rounded-[3rem] border-white/5 space-y-4 text-sm font-medium">
                       <div className="flex justify-between"><span className="text-slate-500">이메일 주소</span><span className="text-slate-200">{adminSelectedUser.email}</span></div>
                       <div className="flex justify-between"><span className="text-slate-500">연락처</span><span className="text-slate-200">{adminSelectedUser.phone}</span></div>
                       <div className="flex justify-between"><span className="text-slate-500">환불 은행</span><span className="text-slate-200">{adminSelectedUser.bankName}</span></div>
                       <div className="flex justify-between"><span className="text-slate-500">계좌 번호</span><span className="text-slate-200">{adminSelectedUser.accountNumber}</span></div>
                    </div>
                    
                    <h4 className="text-xl font-black flex items-center gap-3 mt-10"><Info size={20} className="text-slate-500"/> 관리자 내부 메모</h4>
                    <div className="glass p-4 rounded-[2rem] border-white/5 space-y-4">
                       <textarea 
                          className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 h-32 resize-none outline-none focus:border-blue-500 transition-all text-sm font-medium" 
                          placeholder="회원에 대한 비공개 특이사항을 기록하세요."
                          value={adminSelectedUser.adminNote || ''}
                          onChange={e => setAdminSelectedUser({...adminSelectedUser, adminNote: e.target.value})}
                       />
                       <button 
                        onClick={() => handleSaveAdminNote(adminSelectedUser.id, adminSelectedUser.adminNote || '')}
                        className="w-full py-3 bg-blue-600 rounded-xl font-black text-sm active:scale-95 transition-all"
                       >
                         메모 업데이트
                       </button>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-black flex items-center gap-3"><History size={20} className="text-slate-500"/> 개별 코인 구매 이력</h4>
                      <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white" onClick={() => exportToCsv(transactions.filter(t => t.userId === adminSelectedUser.id))}>이력 추출</button>
                    </div>
                    <div className="glass rounded-[3rem] overflow-hidden border-white/5">
                       <div className="overflow-x-auto max-h-[400px]">
                          <table className="w-full text-left text-xs">
                             <thead className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest sticky top-0 z-10">
                                <tr><th className="px-6 py-4">일시</th><th className="px-6 py-4">상품/금액</th><th className="px-6 py-4">상태</th></tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {transactions.filter(t => t.userId === adminSelectedUser.id).map(t => (
                                  <tr key={t.id} className="hover:bg-white/[0.02]">
                                     <td className="px-6 py-5">
                                       <p className="font-bold">{new Date(t.timestamp).toLocaleDateString()}</p>
                                       <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t.id.split('-')[2]}</p>
                                     </td>
                                     <td className="px-6 py-5">
                                       <p className="font-black text-blue-400">+{t.amount.toLocaleString()} GC</p>
                                       <p className="text-[10px] text-slate-500">{formatKrw(t.price)}</p>
                                     </td>
                                     <td className="px-6 py-5"><StatusBadge status={t.status}/></td>
                                  </tr>
                                ))}
                                {transactions.filter(t => t.userId === adminSelectedUser.id).length === 0 && (
                                  <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-500 font-bold">기록된 이력이 없습니다.</td></tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  </section>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT USER MODAL */}
      {rejectingUser && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setRejectingUser(null)} />
          <div className="glass w-full max-w-md p-10 rounded-[3.5rem] z-10 animate-in zoom-in-95 shadow-2xl relative">
            <h3 className="text-2xl font-black mb-6 text-center text-red-400">가입 반려 처리</h3>
            <p className="text-slate-400 text-sm mb-6 text-center font-medium">사용자 <strong className="text-slate-200">{rejectingUser.name}</strong>의 신청을 반려합니다.<br />반려 사유를 입력해주세요.</p>
            <div className="space-y-6">
              <textarea 
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 h-32 resize-none outline-none focus:border-red-500 transition-all text-sm" 
                placeholder="반려 사유 입력 (사용자에게 노출됩니다)"
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={handleRejectUser} className="flex-1 bg-red-600 py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">반려 실행</button>
                <button onClick={() => setRejectingUser(null)} className="flex-1 glass py-5 rounded-2xl font-black text-slate-500 hover:text-white transition-colors">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PACKAGE MODAL */}
      {showCreatePackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowCreatePackage(false)} />
          <div className="glass w-full max-w-md p-10 rounded-[3.5rem] z-10 animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-2xl font-black mb-8 text-center">신규 코인 패키지 생성</h3>
            <div className="space-y-4">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">패키지 명칭</label><input className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="예: 50개 특별 구매" value={newPackageForm.name} onChange={e => setNewPackageForm({...newPackageForm, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">코인 수량 (GC)</label><input type="number" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="50" value={newPackageForm.coinAmount} onChange={e => setNewPackageForm({...newPackageForm, coinAmount: Number(e.target.value)})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">가격 (KRW)</label><input type="number" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="6500" value={newPackageForm.priceKrw} onChange={e => setNewPackageForm({...newPackageForm, priceKrw: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">정렬 순서 (낮을수록 위)</label><input type="number" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" value={newPackageForm.sortOrder} onChange={e => setNewPackageForm({...newPackageForm, sortOrder: Number(e.target.value)})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">설명 문구</label><textarea className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 h-24 resize-none outline-none focus:border-blue-500 transition-all" placeholder="단기 여행자를 위한 추천 패키지" value={newPackageForm.description} onChange={e => setNewPackageForm({...newPackageForm, description: e.target.value})} /></div>
              <div className="flex items-center gap-2 px-1 py-2">
                 <input type="checkbox" id="is_active_chk" checked={newPackageForm.isActive} onChange={e => setNewPackageForm({...newPackageForm, isActive: e.target.checked})} className="w-4 h-4 rounded" />
                 <label htmlFor="is_active_chk" className="text-sm font-bold text-slate-400">활성화 (고객 노출)</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleCreatePackage} className="flex-1 gradient-bg py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">패키지 등록</button>
                <button onClick={() => setShowCreatePackage(false)} className="flex-1 glass py-5 rounded-2xl font-black text-slate-500 hover:text-white transition-colors">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowCreateAdmin(false)} />
          <div className="glass w-full max-w-md p-10 rounded-[3.5rem] z-10 animate-in zoom-in-95 shadow-2xl relative">
            <h3 className="text-3xl font-black mb-10 text-center">운영진 신규 등록</h3>
            <div className="space-y-4">
              <input type="text" placeholder="아이디" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none" value={newAdminData.id} onChange={e => setNewAdminData({...newAdminData, id: e.target.value})} />
              <input type="text" placeholder="성함" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none" value={newAdminData.name} onChange={e => setNewAdminData({...newAdminData, name: e.target.value})} />
              <input type="email" placeholder="이메일" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none" value={newAdminData.email} onChange={e => setNewAdminData({...newAdminData, email: e.target.value})} />
              <input type="password" placeholder="임시 비밀번호" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none" value={newAdminData.password} onChange={e => setNewAdminData({...newAdminData, password: e.target.value})} />
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-2">권한 지정</label>
                 <select className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={newAdminData.role} onChange={e => setNewAdminData({...newAdminData, role: e.target.value as UserRole})}>
                   <option value="admin">일반 운영자 (ADMIN)</option>
                   <option value="super_admin">마스터 운영자 (SUPER ADMIN)</option>
                 </select>
              </div>
              {authError && <div className="text-red-400 text-xs font-bold text-center">{authError}</div>}
              <div className="flex gap-4 pt-6">
                <button onClick={handleCreateAdmin} className="flex-1 gradient-bg py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all">등록 실행</button>
                <button onClick={() => setShowCreateAdmin(false)} className="flex-1 glass py-5 rounded-2xl font-black text-lg text-slate-500 hover:text-white transition-colors">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PACKAGE MODAL */}
      {editingPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setEditingPackage(null)} />
          <div className="glass w-full max-w-md p-10 rounded-[3.5rem] z-10 animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-2xl font-black mb-8 text-center">패키지 정보 수정</h3>
            <div className="space-y-5">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">상품 명칭</label><input value={tempPackageData.name} onChange={e => setTempPackageData({...tempPackageData, name: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" placeholder="상품명" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">코인량 (GC)</label><input type="number" value={tempPackageData.coinAmount} onChange={e => setTempPackageData({...tempPackageData, coinAmount: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" placeholder="코인 수량" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">가격 (KRW)</label><input type="number" value={tempPackageData.priceKrw} onChange={e => setTempPackageData({...tempPackageData, priceKrw: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" placeholder="금액" /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">정렬 순서</label><input type="number" value={tempPackageData.sortOrder} onChange={e => setTempPackageData({...tempPackageData, sortOrder: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 ml-1">설명 문구</label><textarea value={tempPackageData.description} onChange={e => setTempPackageData({...tempPackageData, description: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 h-24 resize-none outline-none focus:border-blue-500 transition-all" placeholder="설명" /></div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleSavePackage} className="flex-1 bg-blue-600 py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">변경사항 저장</button>
                <button onClick={() => setEditingPackage(null)} className="flex-1 glass py-5 rounded-2xl font-black text-slate-500 hover:text-white transition-colors">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANK EDIT MODAL */}
      {isEditingBank && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsEditingBank(false)} />
          <div className="glass w-full max-w-md p-10 rounded-[3.5rem] z-10 animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-2xl font-black mb-10 text-center">수납 계좌 동기화</h3>
            <div className="space-y-4">
              <input value={tempBankInfo.bankName} onChange={e => setTempBankInfo({...tempBankInfo, bankName: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4" placeholder="은행명" />
              <input value={tempBankInfo.accountNumber} onChange={e => setTempBankInfo({...tempBankInfo, accountNumber: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4" placeholder="계좌번호" />
              <input value={tempBankInfo.accountHolder} onChange={e => setTempBankInfo({...tempBankInfo, accountHolder: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4" placeholder="예금주" />
              <div className="flex gap-4 pt-6">
                <button onClick={handleSaveBankInfo} className="flex-1 bg-blue-600 py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">설정 적용</button>
                <button onClick={() => setIsEditingBank(false)} className="flex-1 glass py-5 rounded-2xl font-black text-slate-500 hover:text-white transition-colors">닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (USER) */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => !isLoading && setShowCheckout(null)} />
          <div className="glass w-full max-w-md p-10 rounded-[4rem] z-10 animate-in zoom-in-95 duration-200 shadow-2xl border-white/5">
            <h3 className="text-3xl font-black mb-10 text-center">구매 확정</h3>
            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 mb-10 space-y-6">
              <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">선택 패키지</span><span className="text-slate-200">{showCheckout.name}</span></div>
              <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">충전 수량</span><span className="text-blue-400">+{showCheckout.coinAmount.toLocaleString()} GC</span></div>
              <div className="flex justify-between items-center pt-8 border-t border-white/5"><span className="font-black text-slate-400">최종 입금액</span><span className="text-4xl font-black text-slate-200">{formatKrw(showCheckout.priceKrw)}</span></div>
            </div>
            <button onClick={() => handleRequestPurchase(showCheckout)} disabled={isLoading} className="w-full py-6 gradient-bg rounded-[2rem] font-black text-2xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">
               {isLoading ? <RefreshCw className="animate-spin" /> : '구매 요청'}
            </button>
            <button onClick={() => setShowCheckout(null)} className="w-full py-4 text-slate-500 font-bold text-sm mt-4 hover:text-white transition-colors">취소</button>
          </div>
        </div>
      )}

            {/* DEPOSIT INFO MODAL (USER) */}
      {showDepositInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setShowDepositInfo(null)}
          />
          <div className="glass w-full max-w-md p-12 rounded-[4rem] z-10 animate-in zoom-in-95 duration-200 text-center shadow-2xl border-white/5">
            <div className="w-24 h-24 bg-blue-500/10 rounded-[3rem] flex items-center justify-center text-blue-400 mx-auto mb-10 shadow-inner">
              <Banknote size={48} />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tighter">입금 안내</h3>
            <p className="text-slate-500 mb-12 font-medium">관리자 확인 후 즉시 지급됩니다.</p>
            <div className="space-y-4 mb-12 text-left">
              <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">은행</span>
                <span className="text-slate-200">{showDepositInfo.bankInfoSnapshot.bankName}</span>
              </div>
              <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 flex flex-col gap-2">
                <span className="text-slate-500 text-[10px] font-black uppercase">Account Number</span>
                <span className="font-black text-2xl tracking-tighter select-all text-blue-400">
                  {showDepositInfo.bankInfoSnapshot.accountNumber}
                </span>
              </div>
              <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">예금주</span>
                <span className="text-slate-200">{showDepositInfo.bankInfoSnapshot.accountHolder}</span>
              </div>
              <div className="p-8 bg-blue-600/10 rounded-[2.5rem] border-2 border-blue-600/20 flex justify-between items-center mt-4">
                <span className="text-blue-400 font-black text-lg">입금 금액</span>
                <span className="font-black text-3xl text-blue-400">{formatKrw(showDepositInfo.price)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDepositInfo(null)}
              className="w-full py-6 gradient-bg rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}

      <button onClick={saveUser}>
        DB 저장 테스트
      </button>
    </div>
  );
}