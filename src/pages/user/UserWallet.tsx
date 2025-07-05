import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
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
  RefreshCw
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-5 w-5" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
];

export const UserWallet: React.FC = () => {
  const [balance, setBalance] = useState(0); // ✅ Initial fallback set to 0
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      // Load wallet balance
      try {
        const walletData = await walletService.getWalletBalance(user.username);
        const balanceVal = walletData?.wallet_balance ?? 0;
        setBalance(balanceVal);
      } catch (walletError) {
        console.warn('Failed to load wallet balance:', walletError);
        setBalance(0); // ✅ Fallback to 0 instead of 500
      }

      // Load transactions
      try {
        const transactionsData = await walletService.getTransactions();
        setTransactions(transactionsData);
      } catch (transError) {
        console.warn('Failed to load transactions:', transError);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Wallet data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);

    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (amount < 10) {
      showError('Minimum top-up amount is ₹10');
      return;
    }

    if (amount > 100000) {
      showError('Maximum top-up amount is ₹1,00,000');
      return;
    }

    setTopupLoading(true);
    try {
      await walletService.topupWallet(amount);
      showSuccess(`Successfully added ₹${amount.toLocaleString()} to your wallet!`);
      setShowTopupModal(false);
      setTopupAmount('');
      loadWalletData();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to top up wallet');
    } finally {
      setTopupLoading(false);
    }
  };

  const quickTopupAmounts = [500, 1000, 2000, 5000];

  const transactionColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <div className="flex items-center">
          {value === 'bid' ? (
            <ArrowDownLeft className="h-4 w-4 text-red-500 mr-2" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
          )}
          <span className="capitalize font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number, row: Transaction) => (
        <span className={`font-semibold ${row.type === 'bid' ? 'text-red-600' : 'text-green-600'}`}>
          {row.type === 'bid' ? '-' : '+'}₹{value?.toLocaleString()}
        </span>
      )
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value: string) => (
        <div className="text-sm text-slate-600">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: 'meta',
      label: 'Description',
      render: (value: any, row: Transaction) => (
        <div className="text-sm text-slate-600">
          {value?.notes || (row.type === 'bid' ? 'Bid placed' : 'Wallet top-up')}
          {value?.product_id && (
            <div className="text-xs text-slate-500">Product: {value.product_id}</div>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const totalSpent = transactions.filter(t => t.type === 'bid').reduce((sum, t) => sum + t.amount, 0);
  const totalAdded = transactions.filter(t => t.type === 'topup').reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        {/* Wallet Balance */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Current Balance</h2>
                <p className="text-4xl font-bold text-green-600">₹{balance.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mt-1">Available for bidding</p>
              </div>
            </div>

            <Button onClick={() => setShowTopupModal(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Funds
            </Button>
          </div>
        </Card>

        {/* Wallet Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <ArrowUpRight className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Added</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalAdded.toLocaleString()}</p>
          </Card>

          <Card className="text-center">
            <ArrowDownLeft className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Spent</h3>
            <p className="text-2xl font-bold text-red-600">₹{totalSpent.toLocaleString()}</p>
          </Card>

          <Card className="text-center">
            <History className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Transactions</h3>
            <p className="text-2xl font-bold text-purple-600">{transactions.length}</p>
          </Card>
        </div>

        {/* Quick Top-Up Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickTopupAmounts.map((amount) => (
            <Card
              key={amount}
              className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
              onClick={() => {
                setTopupAmount(amount.toString());
                setShowTopupModal(true);
              }}
            >
              <CreditCard className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900">₹{amount.toLocaleString()}</h4>
              <p className="text-sm text-slate-600">Quick Add</p>
            </Card>
          ))}
        </div>

        {/* Transactions Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Transaction History</h3>
            <Button variant="secondary" onClick={loadWalletData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Table
            columns={transactionColumns}
            data={transactions}
            emptyMessage="No transactions yet. Add funds to your wallet to start bidding!"
          />
        </Card>
      </div>

      {/* Top-Up Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => {
          setShowTopupModal(false);
          setTopupAmount('');
        }}
        title="Add Funds to Wallet"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Balance</h4>
            <p className="text-2xl font-bold text-blue-600">₹{balance.toLocaleString()}</p>
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
              {quickTopupAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="secondary"
                  size="sm"
                  onClick={() => setTopupAmount(amount.toString())}
                  className="text-xs"
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowTopupModal(false);
                setTopupAmount('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopup}
              loading={topupLoading}
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
