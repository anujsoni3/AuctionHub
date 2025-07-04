import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { auctionService } from '../../services/auctionService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home,
  Gavel,
  Package,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Settings,
  BarChart3,
  FileText
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions', label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products', label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  { path: '/admin/users', label: 'User Management', icon: <Users className="h-5 w-5" /> },
  { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    totalProducts: 0,
    unassignedProducts: 0,
    totalBids: 0,
    totalRevenue: 0
  });
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load my auctions and unassigned products
      const [auctionsData, unassignedData] = await Promise.all([
        auctionService.getMyAuctions().catch(() => []),
        auctionService.getUnassignedProducts().catch(() => [])
      ]);
      
      const now = new Date();
      const activeAuctions = auctionsData.filter(a => new Date(a.valid_until) > now);
      
      setStats({
        totalAuctions: auctionsData.length,
        activeAuctions: activeAuctions.length,
        totalProducts: 0, // Would need additional API call
        unassignedProducts: unassignedData.length,
        totalBids: 0, // Would need additional API call
        totalRevenue: 0 // Would need additional API call
      });
      
      setRecentAuctions(auctionsData.slice(0, 5));
    } catch (error) {
      console.warn('Failed to load some dashboard data:', error);
      // Don't show error for partial failures
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Welcome back, {admin?.name}!</h2>
              <p className="text-slate-600 mt-1">Manage your auctions and monitor system performance</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Admin Level</p>
              <p className="text-lg font-semibold text-amber-600">System Administrator</p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <Gavel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Auctions</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalAuctions}</p>
          </Card>
          
          <Card className="text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Active Auctions</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeAuctions}</p>
          </Card>
          
          <Card className="text-center">
            <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Unassigned Products</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.unassignedProducts}</p>
          </Card>
          
          <Card className="text-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Bids</h3>
            <p className="text-2xl font-bold text-amber-600">{stats.totalBids}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/auctions')}>
            <Gavel className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Create Auction</h3>
            <p className="text-sm text-slate-600 mb-4">Start a new auction with selected products</p>
            <Button className="w-full">Create New</Button>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/products')}>
            <Package className="h-10 w-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Add Product</h3>
            <p className="text-sm text-slate-600 mb-4">Add new products to the inventory</p>
            <Button variant="secondary" className="w-full">Add Product</Button>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/reports')}>
            <BarChart3 className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">View Reports</h3>
            <p className="text-sm text-slate-600 mb-4">Monitor auction performance and user activity</p>
            <Button variant="secondary" className="w-full">View Reports</Button>
          </Card>
        </div>

        {/* Recent Auctions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Recent Auctions</h3>
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/auctions')}>
              View All
            </Button>
          </div>
          
          {recentAuctions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No auctions created yet</p>
          ) : (
            <div className="space-y-4">
              {recentAuctions.map((auction: any) => (
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
      </div>
    </Layout>
  );
};