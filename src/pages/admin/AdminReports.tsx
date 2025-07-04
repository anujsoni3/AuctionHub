import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { auctionService } from '../../services/auctionService';
import { 
  Home,
  Gavel,
  Package,
  Users,
  Settings,
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions', label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products', label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  { path: '/admin/users', label: 'User Management', icon: <Users className="h-5 w-5" /> },
  { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export const AdminReports: React.FC = () => {
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('auctions');
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [auctionsData, productsData] = await Promise.all([
        auctionService.getMyAuctions(),
        auctionService.getUnassignedProducts()
      ]);
      
      setAuctions(auctionsData);
      setProducts(productsData);
    } catch (error) {
      showError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    showSuccess('Report export functionality would be implemented here');
  };

  const auctionColumns = [
    {
      key: 'id',
      label: 'Auction ID',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (value: string) => (
        <span className="font-medium text-slate-900">{value}</span>
      )
    },
    {
      key: 'valid_until',
      label: 'End Date',
      render: (value: string) => (
        <span className="text-sm text-slate-600">
          {new Date(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: any) => {
        const isActive = new Date(row.valid_until) > new Date();
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Ended'}
          </span>
        );
      }
    }
  ];

  const productColumns = [
    {
      key: 'id',
      label: 'Product ID',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (value: string) => (
        <span className="font-medium text-slate-900">{value}</span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="text-sm text-slate-600">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'sold' 
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {value === 'sold' ? 'Sold' : 'Available'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Reports" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </Layout>
    );
  }

  const activeAuctions = auctions.filter((a: any) => new Date(a.valid_until) > new Date());
  const endedAuctions = auctions.filter((a: any) => new Date(a.valid_until) <= new Date());

  return (
    <Layout title="Reports" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">System Reports</h2>
              <p className="text-slate-600">Monitor auction performance and system analytics</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={loadReportData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <Gavel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Auctions</h3>
            <p className="text-2xl font-bold text-blue-600">{auctions.length}</p>
          </Card>
          
          <Card className="text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Active Auctions</h3>
            <p className="text-2xl font-bold text-green-600">{activeAuctions.length}</p>
          </Card>
          
          <Card className="text-center">
            <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Total Products</h3>
            <p className="text-2xl font-bold text-purple-600">{products.length}</p>
          </Card>
          
          <Card className="text-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Ended Auctions</h3>
            <p className="text-2xl font-bold text-amber-600">{endedAuctions.length}</p>
          </Card>
        </div>

        {/* Report Type Selector */}
        <Card>
          <div className="flex space-x-4">
            <Button
              variant={reportType === 'auctions' ? 'primary' : 'secondary'}
              onClick={() => setReportType('auctions')}
            >
              Auction Reports
            </Button>
            <Button
              variant={reportType === 'products' ? 'primary' : 'secondary'}
              onClick={() => setReportType('products')}
            >
              Product Reports
            </Button>
          </div>
        </Card>

        {/* Report Data */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {reportType === 'auctions' ? 'Auction Performance' : 'Product Analytics'}
            </h3>
          </div>
          
          {reportType === 'auctions' ? (
            <Table
              columns={auctionColumns}
              data={auctions}
              emptyMessage="No auction data available"
            />
          ) : (
            <Table
              columns={productColumns}
              data={products}
              emptyMessage="No product data available"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};