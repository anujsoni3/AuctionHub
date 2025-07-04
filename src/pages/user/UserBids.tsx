import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Bid } from '../../services/auctionService';
import { walletService } from '../../services/walletService';
import { 
  Gavel, 
  Clock, 
  TrendingUp,
  Home,
  Search,
  History,
  Wallet,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-5 w-5" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
];

export const UserBids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadUserBids();
  }, []);

  const loadUserBids = async () => {
    try {
      const data = await auctionService.getUserBids();
      setBids(data);
    } catch (error) {
      showError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackBid = async (bidId: string, username: string) => {
    if (!confirm('Are you sure you want to cancel this bid? The amount will be refunded to your wallet.')) {
      return;
    }

    setRollbackLoading(bidId);
    try {
      await walletService.rollbackBid({ bid_id: bidId, username });
      showSuccess('Bid cancelled and amount refunded successfully!');
      loadUserBids(); // Refresh the bids list
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to cancel bid');
    } finally {
      setRollbackLoading(null);
    }
  };

  const bidColumns = [
    {
      key: 'product_name',
      label: 'Product',
      render: (value: string, row: Bid) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">ID: {row.product_id}</div>
        </div>
      )
    },
    {
      key: 'auction_id',
      label: 'Auction',
      render: (value: string) => (
        <span className="text-sm text-slate-600 font-mono">{value}</span>
      )
    },
    {
      key: 'amount',
      label: 'Bid Amount',
      render: (value: number) => (
        <span className="font-semibold text-green-600">₹{value?.toLocaleString()}</span>
      )
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value: string) => (
        <div className="text-sm text-slate-600">
          {value ? (
            <>
              <div>{new Date(value).toLocaleDateString()}</div>
              <div className="text-xs text-slate-500">{new Date(value).toLocaleTimeString()}</div>
            </>
          ) : '-'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'success' 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'success' ? 'Active' : 'Failed'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Bid) => (
        <div className="flex space-x-2">
          {row.status === 'success' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleRollbackBid(row.bid_id!, row.user_id!)}
              loading={rollbackLoading === row.bid_id}
              disabled={rollbackLoading !== null}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const totalBidAmount = bids.reduce((sum, bid) => sum + (bid.amount || 0), 0);
  const activeBids = bids.filter(bid => bid.status === 'success').length;
  const failedBids = bids.filter(bid => bid.status !== 'success').length;

  return (
    <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        {/* Bid Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <Gavel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Bids</h3>
            <p className="text-2xl font-bold text-blue-600">{bids.length}</p>
          </Card>
          
          <Card className="text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Active Bids</h3>
            <p className="text-2xl font-bold text-green-600">{activeBids}</p>
          </Card>
          
          <Card className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Failed Bids</h3>
            <p className="text-2xl font-bold text-red-600">{failedBids}</p>
          </Card>
          
          <Card className="text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Amount</h3>
            <p className="text-2xl font-bold text-purple-600">₹{totalBidAmount.toLocaleString()}</p>
          </Card>
        </div>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Bid Management</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can cancel active bids before the auction ends. The bid amount will be refunded to your wallet immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Bids Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Bid History</h3>
            <Button variant="secondary" onClick={loadUserBids}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <Table
            columns={bidColumns}
            data={bids}
            emptyMessage="You haven't placed any bids yet. Browse auctions to start bidding!"
          />
        </Card>
      </div>
    </Layout>
  );
};