import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Bid } from '../../services/auctionService';
import { walletService } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';

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
} from 'lucide-react';

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

const EmptyState = () => (
  <div className="py-12 text-center space-y-2">
    <Gavel className="h-10 w-10 text-slate-300 mx-auto" />
    <p className="text-slate-500">
      You haven’t placed any bids yet.
      <br />
      Browse auctions to get started!
    </p>
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
  { label: string; badgeClass: string }
> = {
  success: { label: 'Active', badgeClass: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', badgeClass: 'bg-red-100 text-red-800' },
  rolledback: { label: 'Cancelled', badgeClass: 'bg-amber-100 text-amber-800' },
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
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">ID: {row.product_id}</div>
        </div>
      ),
    },
    {
      key: 'auction_id',
      label: 'Auction',
      render: (value: string) => (
        <span className="text-sm text-slate-600 font-mono">{value}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Bid Amount',
      render: (value: number) => (
        <span className="font-semibold text-green-600">₹{value?.toLocaleString()}</span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value: string) =>
        value ? (
          <div className="text-sm text-slate-600">
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-xs text-slate-500">{new Date(value).toLocaleTimeString()}</div>
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
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.badgeClass}`}>
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
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        ) : (
          <span className="inline-flex items-center text-xs text-slate-400">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Bids" value={bids.length} Icon={Gavel} color="text-blue-600" />
          <StatCard label="Active Bids" value={activeBids} Icon={TrendingUp} color="text-green-600" />
          <StatCard label="Failed / Cancelled" value={failedBids} Icon={AlertCircle} color="text-red-600" />
          <StatCard
            label="Total Amount"
            value={`₹${totalBidAmount.toLocaleString()}`}
            Icon={Clock}
            color="text-purple-600"
          />
        </div>

        {/* Info Banner */}
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

          {bids.length === 0 ? (
            <EmptyState />
          ) : (
            <Table
              columns={bidColumns}
              data={bids}
              
            />
          )}

        </Card>
      </div>
    </Layout>
  );
};
