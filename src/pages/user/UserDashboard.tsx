/* src/pages/user/UserDashboard.tsx */
import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction, Bid } from '../../services/auctionService';
import { walletService, Transaction } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/UserDashboard.css';
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
  ChevronRight,
  Award,
  Activity,
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
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gavel className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl border-0 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-blue-100 mt-1">
                  Discover exciting auctions and place your bids.
                </p>
              </div>
            </div>
            <div className="text-right bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Wallet Balance</p>
              <p className="text-3xl font-bold text-white flex items-center">
                <Wallet className="h-6 w-6 mr-2" />
                {walletBalance === null ? '—' : `₹${walletBalance.toLocaleString()}`}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard 
            label="Active Auctions" 
            value={activeAuctions.length} 
            Icon={Gavel} 
            color="text-blue-600" 
            bgColor="bg-blue-50"
            hoverColor="hover:bg-blue-100"
          />
          <StatCard 
            label="Ending Soon" 
            value={endingSoon.length} 
            Icon={Timer} 
            color="text-amber-600" 
            bgColor="bg-amber-50"
            hoverColor="hover:bg-amber-100"
          />
          <StatCard 
            label="My Bids" 
            value={userBids.length} 
            Icon={TrendingUp} 
            color="text-emerald-600" 
            bgColor="bg-emerald-50"
            hoverColor="hover:bg-emerald-100"
          />
          <StatCard 
            label="Total Spent" 
            value={`₹${totalSpent.toLocaleString()}`} 
            Icon={DollarSign} 
            color="text-purple-600" 
            bgColor="bg-purple-50"
            hoverColor="hover:bg-purple-100"
          />
          <StatCard 
            label="Registered Auctions" 
            value={new Set(userBids.map(b => b.auction_id)).size} 
            Icon={Eye} 
            color="text-rose-600" 
            bgColor="bg-rose-50"
            hoverColor="hover:bg-rose-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex justify-end">
          <Button 
            variant="secondary" 
            onClick={() => (window.location.href = '/user/auctions?registered=1')}
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            My Registered Auctions
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Auctions */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Recent Auctions</h3>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => (window.location.href = '/user/auctions')}
                className="text-blue-600 hover:text-white hover:bg-blue-600 transition-colors duration-200"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {auctions.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                  <Gavel className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No active auctions available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auctions.map((a, index) => (
                  <div 
                    key={a.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 transform hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Gavel className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{a.name}</h4>
                        <p className="text-sm text-gray-600">ID: {a.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Ends
                      </p>
                      <p className="font-semibold text-gray-900">
                        {new Date(a.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 rounded-full p-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => (window.location.href = '/user/wallet')}
                className="text-emerald-600 hover:text-white hover:bg-emerald-600 transition-colors duration-200"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t, index) => (
                  <div 
                    key={t._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 transform hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full p-2 ${t.type === 'bid' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                        {t.type === 'bid' ? (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 capitalize">{t.type}</h4>
                        <p className="text-sm text-gray-600">{new Date(t.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${t.type === 'bid' ? 'text-red-600' : 'text-emerald-600'}`}>
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

      {/* Add custom CSS for animations */}
      
    </Layout>
  );
};

/* Enhanced Reusable Card Stat */
import type { LucideIcon } from 'lucide-react';
interface StatCardProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, Icon, color, bgColor, hoverColor }) => (
  <Card className={`text-center ${bgColor} ${hoverColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group`}>
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <Icon className={`h-10 w-10 ${color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
      <h3 className="font-semibold text-gray-700 mb-1">{label}</h3>
      <p className={`text-2xl font-bold ${color} group-hover:scale-105 transition-transform duration-300`}>
        {value}
      </p>
    </div>
  </Card>
);