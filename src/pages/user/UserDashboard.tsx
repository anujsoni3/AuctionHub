import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction } from '../../services/auctionService';
import { walletService } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Gavel, 
  Clock, 
  TrendingUp, 
  Wallet,
  Home,
  Search,
  History,
  CreditCard,
  Timer,
  DollarSign
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-5 w-5" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
];

export const UserDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [walletBalance, setWalletBalance] = useState(500); // Default fallback
  const [userBids, setUserBids] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load auctions first (most reliable)
      try {
        const auctionsData = await auctionService.getAuctions();
        setAuctions(auctionsData.slice(0, 5));
      } catch (auctionError) {
        console.warn('Failed to load auctions:', auctionError);
        setAuctions([]);
      }

      // Try to load wallet data
      try {
        const walletData = await walletService.getWalletBalance(user.username);
        setWalletBalance(walletData.wallet_balance || 500);
      } catch (walletError) {
        console.warn('Failed to load wallet data:', walletError);
        setWalletBalance(500); // Keep default
      }

      // Try to load bids
      try {
        const bidsData = await auctionService.getUserBids();
        setUserBids(bidsData);
      } catch (bidsError) {
        console.warn('Failed to load bids:', bidsError);
        setUserBids([]);
      }

      // Try to load transactions
      try {
        const transactionsData = await walletService.getTransactions();
        setTransactions(transactionsData);
      } catch (transError) {
        console.warn('Failed to load transactions:', transError);
        setTransactions([]);
      }

    } catch (error: any) {
      console.error('Dashboard load error:', error);
      // Don't show error for partial failures
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const activeAuctions = auctions.filter(a => {
    const endTime = new Date(a.valid_until);
    return endTime > new Date();
  });

  const endingSoon = auctions.filter(a => {
    const endTime = new Date(a.valid_until);
    const now = new Date();
    const timeDiff = endTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000;
  });

  const totalSpent = transactions
    .filter(t => t.type === 'bid')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Welcome back, {user?.name}!</h2>
              <p className="text-slate-600 mt-1">Discover exciting auctions and place your bids</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-green-600">₹{walletBalance.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <Gavel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Active Auctions</h3>
            <p className="text-2xl font-bold text-blue-600">{activeAuctions.length}</p>
          </Card>
          
          <Card className="text-center">
            <Timer className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Ending Soon</h3>
            <p className="text-2xl font-bold text-amber-600">{endingSoon.length}</p>
          </Card>
          
          <Card className="text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">My Bids</h3>
            <p className="text-2xl font-bold text-green-600">{userBids.length}</p>
          </Card>
          
          <Card className="text-center">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Spent</h3>
            <p className="text-2xl font-bold text-purple-600">₹{totalSpent.toLocaleString()}</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Auctions */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Recent Auctions</h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            
            {auctions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No active auctions available</p>
            ) : (
              <div className="space-y-4">
                {auctions.map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{auction.name}</h4>
                      <p className="text-sm text-slate-600">ID: {auction.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Ends</p>
                      <p className="font-medium text-slate-900">
                        {new Date(auction.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Recent Transactions</h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      {transaction.type === 'bid' ? (
                        <TrendingUp className="h-5 w-5 text-red-500 mr-3" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-green-500 mr-3" />
                      )}
                      <div>
                        <h4 className="font-medium text-slate-900 capitalize">{transaction.type}</h4>
                        <p className="text-sm text-slate-600">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'bid' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'bid' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
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