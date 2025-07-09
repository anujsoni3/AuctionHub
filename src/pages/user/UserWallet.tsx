/* ------------------------------------------------------------------
 *  UserWallet  –  Enhanced Professional Auction Site Version
 * ----------------------------------------------------------------- */
import React, { useEffect, useMemo, useState } from 'react';

import { Layout }   from '../../components/layout/Layout';
import { Card }     from '../../components/ui/Card';
import { Button }   from '../../components/ui/Button';
import { Input }    from '../../components/ui/Input';
import { Modal }    from '../../components/ui/Modal';
import { Table }    from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';

import { walletService, Transaction } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';

import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Home,
  Search,
  Gavel,
  History,
  CreditCard,
  RefreshCw,
  Download,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Sidebar (unchanged)                                               */
/* ------------------------------------------------------------------ */
const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard',      icon: <Home   className="h-5 w-5" /> },
  { path: '/user/auctions',  label: 'Browse Auctions',icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids',      label: 'My Bids',        icon: <Gavel  className="h-5 w-5" /> },
  { path: '/user/wallet',    label: 'Wallet',         icon: <Wallet className="h-5 w-5" /> },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export const UserWallet: React.FC = () => {
  /* base state */
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [balanceFromAPI, setBalanceFromAPI] = useState<number | null>(null);
  const [transactions,   setTransactions]   = useState<Transaction[]>([]);
  const [loading,        setLoading]        = useState(true);

  /* refresh + top‑up state */
  const [refreshing,   setRefreshing]   = useState(false);
  const [topupModal,   setTopupModal]   = useState(false);
  const [topupBusy,    setTopupBusy]    = useState(false);
  const [topupAmount,  setTopupAmount]  = useState('');

  /* Success animation states */
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  /* quick‑top‑up presets */
  const QUICK   = [500, 1000, 2000, 5000];

  /* ---------------------------------------------------------------- */
  /*  Derived totals & balance                                        */
  /* ---------------------------------------------------------------- */
  const { totalAdded, totalSpent, derivedBalance } = useMemo(() => {
    const added = transactions.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0);
    const spent = transactions.filter(t => t.type === 'bid'  ).reduce((s, t) => s + t.amount, 0);
    return { totalAdded: added, totalSpent: spent, derivedBalance: added - spent };
  }, [transactions]);

  const currentBalance = balanceFromAPI ?? derivedBalance;

  /* ---------------------------------------------------------------- */
  /*  Data loader                                                     */
  /* ---------------------------------------------------------------- */
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      /* balance */
      try {
        const res = await walletService.getWalletBalance(user.username);
        setBalanceFromAPI(res?.wallet_balance ?? null);
      } catch {
        setBalanceFromAPI(null);            // fall back to derived balance
      }

      /* transactions */
      try {
        const tx = await walletService.getTransactions();
        setTransactions(tx);
      } catch {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Top‑up handler with success animation                           */
  /* ---------------------------------------------------------------- */
  const doTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt < 10 || amt > 100_000) {
      showError('Enter an amount between ₹10 and ₹1,00,000');
      return;
    }

    setTopupBusy(true);
    try {
      await walletService.topupWallet(amt);
      showSuccess(`Added ₹${amt.toLocaleString()} to your wallet`);
      setTopupModal(false);
      setTopupAmount('');
      
      // Trigger success animation
      setShowSuccessAnimation(true);
      setRecentlyAdded(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
      setTimeout(() => setRecentlyAdded(false), 5000);
      
      await loadData();
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Top‑up failed');
    } finally {
      setTopupBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  CSV download                                                    */
  /* ---------------------------------------------------------------- */
  const downloadCSV = () => {
    if (transactions.length === 0) {
      showError('No transactions to export');
      return;
    }
    /* create CSV rows */
    const header = Object.keys(transactions[0]).join(',');
    const rows   = transactions.map(t =>
      Object.values(t).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('CSV downloaded');
  };

  /* ---------------------------------------------------------------- */
  /*  Table columns with professional styling                         */
  /* ---------------------------------------------------------------- */
  const columns = [
    {
      key: 'type',
      label: 'Transaction Type',
      render: (v: string) => (
        <div className="flex items-center">
          {v === 'bid'
            ? <ArrowDownLeft className="h-4 w-4 text-red-500 mr-3" />
            : <ArrowUpRight  className="h-4 w-4 text-emerald-500 mr-3" />}
          <span className="capitalize font-semibold text-slate-700">{v === 'bid' ? 'Bid Placed' : 'Funds Added'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v: number, row: Transaction) => (
        <span className={`font-bold text-lg ${row.type === 'bid' ? 'text-red-600' : 'text-emerald-600'}`}>
          {row.type === 'bid' ? '-' : '+'}₹{v.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (v: string) => (
        <div className="text-sm text-slate-600">
          <div className="font-medium">{new Date(v).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">{new Date(v).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'meta',
      label: 'Description',
      render: (v: any, row: Transaction) => (
        <div className="text-sm text-slate-600">
          <div className="font-medium">{v?.notes || (row.type === 'bid' ? 'Bid placed on auction' : 'Wallet top‑up')}</div>
          {v?.product_id && (
            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block mt-1">
              Product: {v.product_id}
            </div>
          )}
        </div>
      ),
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Loading screen                                                  */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-8 bg-gray-50 min-h-screen p-6">

        {/* --------------- Balance banner with animations ---------------- */}
        <Card className={`relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl transition-all duration-500 ${
          recentlyAdded ? 'ring-4 ring-emerald-400 ring-opacity-50' : ''
        }`}>
          {/* Success animation overlay */}
          {showSuccessAnimation && (
            <div className="absolute inset-0 bg-emerald-400 opacity-20 animate-pulse" />
          )}
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6 backdrop-blur-sm">
                  <Wallet className="h-10 w-10 text-white" />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <h2 className="text-2xl font-bold text-white mr-3">Wallet Balance</h2>
                    <Shield className="h-5 w-5 text-emerald-300" />
                  </div>
                  <p className={`text-5xl font-bold transition-all duration-500 ${
                    recentlyAdded ? 'text-emerald-300 animate-pulse' : 'text-white'
                  }`}>
                    ₹{currentBalance.toLocaleString()}
                  </p>
                  <p className="text-blue-100 mt-2 font-medium">Available for bidding</p>
                </div>
              </div>

              <Button 
                onClick={() => setTopupModal(true)} 
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Funds
              </Button>
            </div>
          </div>
        </Card>

        {/* ------------- Enhanced Stat cards -------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={TrendingUp}
            label="Total Added"
            value={`₹${totalAdded.toLocaleString()}`}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-200"
          />
          <StatCard
            icon={Gavel}
            label="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            color="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
          />
          <StatCard
            icon={History}
            label="Total Transactions"
            value={transactions.length}
            color="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
        </div>

        {/* ------------- Enhanced Quick add cards --------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Zap className="h-6 w-6 text-amber-500 mr-3" />
            <h3 className="text-xl font-bold text-slate-800">Quick Add Funds</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {QUICK.map((amt) => (
              <Card
                key={amt}
                className="text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-100 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100"
                onClick={() => { setTopupAmount(String(amt)); setTopupModal(true); }}
              >
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-xl text-slate-900">₹{amt.toLocaleString()}</h4>
                <p className="text-sm text-blue-600 font-medium">Quick Add</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ------------- Enhanced Transactions table ------------ */}
        <Card className="shadow-xl">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <History className="h-6 w-6 text-slate-700 mr-3" />
                <h3 className="text-2xl font-bold text-slate-900">Transaction History</h3>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={loadData}
                  disabled={refreshing}
                  className="bg-white border-slate-200 hover:bg-slate-50"
                >
                  {refreshing
                    ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full" />
                    : <RefreshCw className="h-4 w-4 mr-2" />}
                  Refresh
                </Button>

                <Button 
                  variant="secondary" 
                  onClick={downloadCSV}
                  className="bg-white border-slate-200 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Table
              columns={columns}
              data={transactions}
              emptyMessage="No transactions found. Add funds to start bidding!"
            />
          </div>
        </Card>
      </div>

      {/* ---------------- Enhanced Top‑up Modal ---------------- */}
      <Modal
        isOpen={topupModal}
        onClose={() => { setTopupModal(false); setTopupAmount(''); }}
        title="Add Funds to Wallet"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <Wallet className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-bold text-blue-900">Current Balance</h4>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              ₹{currentBalance.toLocaleString()}
            </p>
          </div>

          <Input
            label="Amount to Add (₹)"
            type="number"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            placeholder="Enter amount (min ₹10, max ₹1,00,000)"
            min="10"
            max="100000"
            className="text-lg"
          />

          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">Quick Select:</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK.map((amt) => (
                <Button
                  key={amt}
                  variant="secondary"
                  size="sm"
                  onClick={() => setTopupAmount(String(amt))}
                  className="text-sm font-medium bg-slate-100 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => { setTopupModal(false); setTopupAmount(''); }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={doTopup}
              loading={topupBusy}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {topupBusy ? 'Processing...' : `Add ₹${topupAmount ? parseFloat(topupAmount).toLocaleString() : '0'}`}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

/* ------------------------------------------------------------------ */
/*  Enhanced StatCard component                                       */
/* ------------------------------------------------------------------ */
interface StatProps {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
}
const StatCard: React.FC<StatProps> = ({ icon: Icon, label, value, color, bgColor, borderColor }) => (
  <Card className={`text-center ${bgColor} ${borderColor} border-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
    <div className="p-6">
      <Icon className={`h-10 w-10 ${color} mx-auto mb-3`} />
      <h3 className="font-bold text-slate-900 text-lg mb-2">{label}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  </Card>
);