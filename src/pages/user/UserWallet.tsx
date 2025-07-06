/* ------------------------------------------------------------------
 *  UserWallet  –  full enhanced version
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
  /*  Top‑up handler                                                  */
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
  /*  Table columns                                                   */
  /* ---------------------------------------------------------------- */
  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (v: string) => (
        <div className="flex items-center">
          {v === 'bid'
            ? <ArrowDownLeft className="h-4 w-4 text-red-500 mr-2" />
            : <ArrowUpRight  className="h-4 w-4 text-green-500 mr-2" />}
          <span className="capitalize font-medium">{v}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v: number, row: Transaction) => (
        <span className={`font-semibold ${row.type === 'bid' ? 'text-red-600' : 'text-green-600'}`}>
          {row.type === 'bid' ? '-' : '+'}₹{v.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (v: string) => (
        <div className="text-sm text-slate-600">
          <div>{new Date(v).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">{new Date(v).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'meta',
      label: 'Description',
      render: (v: any, row: Transaction) => (
        <div className="text-sm text-slate-600">
          {v?.notes || (row.type === 'bid' ? 'Bid placed' : 'Wallet top‑up')}
          {v?.product_id && (
            <div className="text-xs text-slate-500">Product: {v.product_id}</div>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">

        {/* --------------- Balance banner ---------------- */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Current Balance</h2>
                <p className="text-4xl font-bold text-green-600">
                  ₹{currentBalance.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 mt-1">Available for bidding</p>
              </div>
            </div>

            <Button onClick={() => setTopupModal(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Funds
            </Button>
          </div>
        </Card>

        {/* ------------- Stat cards -------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={ArrowUpRight}
            label="Total Added"
            value={`₹${totalAdded.toLocaleString()}`}
            color="text-green-600"
          />
          <StatCard
            icon={ArrowDownLeft}
            label="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            color="text-red-600"
          />
          <StatCard
            icon={History}
            label="Transactions"
            value={transactions.length}
            color="text-purple-600"
          />
        </div>

        {/* ------------- Quick add cards --------------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {QUICK.map((amt) => (
            <Card
              key={amt}
              className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
              onClick={() => { setTopupAmount(String(amt)); setTopupModal(true); }}
            >
              <CreditCard className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900">₹{amt.toLocaleString()}</h4>
              <p className="text-sm text-slate-600">Quick Add</p>
            </Card>
          ))}
        </div>

        {/* ------------- Transactions table ------------ */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Transaction History</h3>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={loadData}
                disabled={refreshing}
              >
                {refreshing
                  ? <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-blue-600 rounded-full" />
                  : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>

              <Button variant="secondary" onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            data={transactions}
            emptyMessage="No transactions found. Add funds to start bidding!"
          />
        </Card>
      </div>

      {/* ---------------- Top‑up Modal ---------------- */}
      <Modal
        isOpen={topupModal}
        onClose={() => { setTopupModal(false); setTopupAmount(''); }}
        title="Add Funds to Wallet"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Balance</h4>
            <p className="text-2xl font-bold text-blue-600">
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
          />

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Quick Select:</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK.map((amt) => (
                <Button
                  key={amt}
                  variant="secondary"
                  size="sm"
                  onClick={() => setTopupAmount(String(amt))}
                  className="text-xs"
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
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={doTopup}
              loading={topupBusy}
              className="flex-1"
            >
              Add ₹{topupAmount ? parseFloat(topupAmount).toLocaleString() : '0'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

/* ------------------------------------------------------------------ */
/*  Tiny helper card                                                  */
/* ------------------------------------------------------------------ */
interface StatProps {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}
const StatCard: React.FC<StatProps> = ({ icon: Icon, label, value, color }) => (
  <Card className="text-center">
    <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
    <h3 className="font-semibold text-slate-900">{label}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </Card>
);
