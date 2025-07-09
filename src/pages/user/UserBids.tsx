import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Bid } from '../../services/auctionService';
import { walletService } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/UserBids.css'; // Custom styles for UserBids page
import {
  Gavel,
  Clock,
  TrendingUp,
  Home,
  Search,
  Wallet,
  RefreshCw,
  AlertCircle,
  Ban,
  Target,
  CheckCircle,
  XCircle,
  Activity,
  TrendingDown,
} from 'lucide-react';

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

const EmptyState = () => (
  <div className="py-16 text-center space-y-4 animate-fade-in">
    <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6">
      <Gavel className="h-16 w-16 text-gray-400 mx-auto" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-gray-900">No Bids Yet</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        You haven't placed any bids yet. Browse our exciting auctions to get started!
      </p>
    </div>
    <Button 
      onClick={() => window.location.href = '/user/auctions'}
      className="bg-blue-600 hover:bg-blue-700 text-white mt-6 transform hover:scale-105 transition-all duration-200"
    >
      <Search className="h-4 w-4 mr-2" />
      Browse Auctions
    </Button>
  </div>
);

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-5 w-5" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
];

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: LucideIcon }
> = {
  success: { 
    label: 'Active', 
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
    icon: CheckCircle 
  },
  failed: { 
    label: 'Failed', 
    badgeClass: 'bg-red-100 text-red-800 border border-red-200', 
    icon: XCircle 
  },
  rolledback: { 
    label: 'Cancelled', 
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200', 
    icon: Ban 
  },
};

export const UserBids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);

  const { showError, showSuccess } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadUserBids();
  }, []);

  const loadUserBids = async () => {
    setLoading(true);
    try {
      const data = await auctionService.getUserBids();
      setBids(data);
    } catch (err) {
      showError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackBid = async (bidId?: string) => {
    if (!bidId || !user?.username) return;

    const ok = window.confirm(
      'Are you sure you want to cancel this bid? The amount will be refunded to your wallet.'
    );
    if (!ok) return;

    setRollbackLoading(bidId);
    try {
      await walletService.rollbackBid({ bid_id: bidId, username: user.username });
      showSuccess('Bid cancelled and amount refunded successfully!');
      loadUserBids();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to cancel bid');
    } finally {
      setRollbackLoading(null);
    }
  };

  const bidColumns = [
    {
      key: 'product_name',
      label: 'Product',
      render: (value: string, row: Bid) => (
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.product_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'auction_id',
      label: 'Auction',
      render: (value: string) => (
        <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Bid Amount',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 rounded-full p-1">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          </div>
          <span className="font-bold text-emerald-600 text-lg">₹{value?.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value: string) =>
        value ? (
          <div className="text-sm text-gray-600">
            <div className="font-medium">{new Date(value).toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const cfg = statusConfig[value] ?? statusConfig.failed;
        const IconComponent = cfg.icon;
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.badgeClass}`}>
            <IconComponent className="h-3 w-3 mr-1" />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Bid) =>
        row.status === 'success' ? (
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleRollbackBid(row.bid_id)}
            loading={rollbackLoading === row.bid_id}
            disabled={rollbackLoading !== null}
            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${rollbackLoading === row.bid_id ? 'animate-spin' : ''}`} />
            Cancel
          </Button>
        ) : (
          <span className="inline-flex items-center text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            <Ban className="h-3 w-3 mr-1" />
            N/A
          </span>
        ),
    },
  ];

  const { totalBidAmount, activeBids, failedBids } = useMemo(() => {
    const total = bids.reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const active = bids.filter((b) => b.status === 'success').length;
    const failed = bids.length - active;
    return { totalBidAmount: total, activeBids: active, failedBids: failed };
  }, [bids]);

  if (loading) {
    return (
      <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
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
    <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <Gavel className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Bids</h1>
              <p className="text-blue-100 mt-1">Track and manage all your auction bids</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="Total Bids" 
            value={bids.length} 
            Icon={Gavel} 
            color="text-blue-600" 
            bgColor="bg-blue-50"
            hoverColor="hover:bg-blue-100"
          />
          <StatCard 
            label="Active Bids" 
            value={activeBids} 
            Icon={TrendingUp} 
            color="text-emerald-600" 
            bgColor="bg-emerald-50"
            hoverColor="hover:bg-emerald-100"
          />
          <StatCard 
            label="Failed / Cancelled" 
            value={failedBids} 
            Icon={TrendingDown} 
            color="text-red-600" 
            bgColor="bg-red-50"
            hoverColor="hover:bg-red-100"
          />
          <StatCard
            label="Total Amount"
            value={`₹${totalBidAmount.toLocaleString()}`}
            Icon={Clock}
            color="text-purple-600"
            bgColor="bg-purple-50"
            hoverColor="hover:bg-purple-100"
          />
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 rounded-full p-2">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Bid Management</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can cancel active bids before the auction ends. The bid amount will be refunded to your wallet immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Bids Table */}
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Bid History</h3>
            </div>
            <Button 
              variant="secondary" 
              onClick={loadUserBids}
              className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {bids.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table
                columns={bidColumns}
                data={bids}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Custom CSS for animations */}
      
    </Layout>
  );
};