/* src/pages/user/UserDashboard.tsx */
import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction, Bid } from '../../services/auctionService';
import { walletService, Transaction } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';

import {
  Gavel,
  Clock,
  TrendingUp,
  Wallet,
  Home,
  Search,
  CreditCard,
  Timer,
  DollarSign,
  Eye,
} from 'lucide-react';

/* Types */
type BidLite = Pick<Bid, 'amount' | 'status' | 'timestamp' | 'auction_id'>;
type Txn = Transaction;

/* Sidebar config */
const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard',       icon: <Home   className="h-5 w-5" /> },
  { path: '/user/auctions',  label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids',      label: 'My Bids',         icon: <Gavel  className="h-5 w-5" /> },
  { path: '/user/wallet',    label: 'Wallet',          icon: <Wallet className="h-5 w-5" /> },
];

export const UserDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userBids, setUserBids] = useState<BidLite[]>([]);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    if (user?.username) loadDashboardData();
  }, [user?.username]);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      const auctionsData = await auctionService.getAuctions();
      setAuctions(auctionsData.slice(0, 5));
    } catch (e) {
      setAuctions([]);
    }

    let transactionsData: Txn[] = [];
    try {
      transactionsData = await walletService.getTransactions();
      setTransactions(transactionsData);
    } catch (e) {
      setTransactions([]);
    }

    try {
      const w = await walletService.getWalletBalance(user!.username);
      const balance = w?.wallet_balance ?? null;
      setWalletBalance(balance);
    } catch (e) {
      // fallback to total added - total spent
      const totalAdded = transactionsData.filter(t => t.type === 'topup').reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const totalSpent = transactionsData.filter(t => t.type === 'bid').reduce((sum, t) => sum + (t.amount ?? 0), 0);
      setWalletBalance(totalAdded - totalSpent);
    }

    try {
      const bids = await auctionService.getUserBids();
      setUserBids(bids);
    } catch (e) {
      setUserBids([]);
    }

    setLoading(false);
  };

  /* Derived stats */
  const now = new Date();
  const activeAuctions = auctions.filter(a => new Date(a.valid_until) > now);
  const endingSoon = auctions.filter(a => {
    const diff = new Date(a.valid_until).getTime() - now.getTime();
    return diff > 0 && diff < 86_400_000; // 24h
  });
  const totalSpent = transactions.filter(t => t.type === 'bid').reduce((sum, t) => sum + (t.amount ?? 0), 0);

  if (loading) {
    return (
      <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-slate-600 mt-1">
                Discover exciting auctions and place your bids.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {walletBalance === null ? '—' : `₹${walletBalance.toLocaleString()}`}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard label="Active Auctions" value={activeAuctions.length} Icon={Gavel} color="text-blue-600" />
          <StatCard label="Ending Soon" value={endingSoon.length} Icon={Timer} color="text-amber-600" />
          <StatCard label="My Bids" value={userBids.length} Icon={TrendingUp} color="text-green-600" />
          <StatCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} Icon={DollarSign} color="text-purple-600" />
          <StatCard label="Registered Auctions" value={new Set(userBids.map(b => b.auction_id)).size} Icon={Eye} color="text-rose-600" />
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => (window.location.href = '/user/auctions?registered=1')}>
            <Eye className="h-4 w-4 mr-2" />
            My Registered Auctions
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Recent Auctions</h3>
              <Button variant="secondary" size="sm" onClick={() => (window.location.href = '/user/auctions')}>
                View All
              </Button>
            </div>
            {auctions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No active auctions available</p>
            ) : (
              <div className="space-y-4">
                {auctions.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{a.name}</h4>
                      <p className="text-sm text-slate-600">ID: {a.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Ends</p>
                      <p className="font-medium text-slate-900">
                        {new Date(a.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Recent Transactions</h3>
              <Button variant="secondary" size="sm" onClick={() => (window.location.href = '/user/wallet')}>
                View All
              </Button>
            </div>
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map(t => (
                  <div key={t._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      {t.type === 'bid' ? (
                        <TrendingUp className="h-5 w-5 text-red-500 mr-3" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-green-500 mr-3" />
                      )}
                      <div>
                        <h4 className="font-medium text-slate-900 capitalize">{t.type}</h4>
                        <p className="text-sm text-slate-600">{new Date(t.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${t.type === 'bid' ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === 'bid' ? '-' : '+'}₹{t.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

/* Reusable Card Stat */
import type { LucideIcon } from 'lucide-react';
interface StatCardProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  color: string;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, Icon, color }) => (
  <Card className="text-center">
    <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
    <h3 className="font-semibold text-slate-900">{label}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </Card>
);
