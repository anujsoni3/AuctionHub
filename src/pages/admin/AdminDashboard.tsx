/* ------------------------------------------------------------------
 *  src/pages/admin/AdminDashboard.tsx
 * ----------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout }   from '../../components/layout/Layout';
import { Card }     from '../../components/ui/Card';
import { Button }   from '../../components/ui/Button';
import { Input }    from '../../components/ui/Input';
import { Modal }    from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

import { auctionService } from '../../services/auctionService';
import { useAuth }        from '../../contexts/AuthContext';

import {
  Home, Gavel, Package, TrendingUp, Clock,
  DollarSign, Settings, BarChart3, CheckCircle, 
  ArrowUpRight, Award, Target
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Sidebar items                                                      */
/* ------------------------------------------------------------------ */
const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard',      icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions',  label: 'Manage Auctions',icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products',  label: 'Manage Products',icon: <Package className="h-5 w-5" /> },
  { path: '/admin/reports',   label: 'Reports',        icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/settings',  label: 'Settings',       icon: <Settings className="h-5 w-5" /> },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface BidLite { amount: number; status?: string; }
interface ProductOption { id: string; name: string; }

/* ------------------------------------------------------------------ */
/*  Dashboard component                                                */
/* ------------------------------------------------------------------ */
export const AdminDashboard: React.FC = () => {
  /* ------------- dashboard data ---------------- */
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    totalProducts: 0,
    unassignedProducts: 0,
    totalBids: 0,
    totalRevenue: 0,
  });
  const [recentAuctions, setRecentAuctions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  /* ------------- Create‑auction modal ---------- */
  const [showCreate, setShowCreate] = useState(false);
  const [auctionSaving, setAuctionSaving] = useState(false);
  const [auctionForm, setAuctionForm] = useState({ id: '', name: '', valid_until: '' });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  /* ------------- Add‑product modal ------------- */
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productForm, setProductForm] = useState({ id: '', name: '', description: '' });

  /* ------------- Success effects ------------- */
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /* ------------- utils ------------------------- */
  const { admin } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  /* ----------------------------------------------------------------
   *  Success effect trigger
   * ---------------------------------------------------------------- */
  const triggerSuccessEffect = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessEffect(true);
    setTimeout(() => setShowSuccessEffect(false), 3000);
  };

  /* ----------------------------------------------------------------
   *  Load dashboard
   * ---------------------------------------------------------------- */
  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [auctions, unassigned] = await Promise.all([
        auctionService.getMyAuctions().catch(() => []),
        auctionService.getUnassignedProducts().catch(() => []),
      ]);
      setProductOptions(unassigned);

      const now = new Date();
      const active = auctions.filter(a => new Date(a.valid_until) > now);

      const productsByAuction = await Promise.all(
        auctions.map(a => auctionService.getAuctionProductsAdmin(a.id).catch(() => []))
      );
      const flatProducts = productsByAuction.flat();

      const bidsNested = await Promise.all(
        flatProducts.map(p => auctionService.getAllBids(p.id).catch(() => [] as BidLite[]))
      );
      const flatBids: BidLite[] = bidsNested.flat();

      const revenue = flatBids
        .filter(b => b.status === 'success')
        .reduce((sum, b) => sum + (b.amount ?? 0), 0);

      setStats({
        totalAuctions: auctions.length,
        activeAuctions: active.length,
        totalProducts: flatProducts.length,
        unassignedProducts: unassigned.length,
        totalBids: flatBids.length,
        totalRevenue: revenue,
      });
      setRecentAuctions(auctions.slice(0, 5));
    } catch (err) {
      console.error(err);
      showError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------------
   *  Create Auction handlers
   * ---------------------------------------------------------------- */
  const resetAuctionForm = () => {
    setAuctionForm({ id: '', name: '', valid_until: '' });
    setSelectedProducts([]);
  };

  const handleCreateAuction = async () => {
    const { id, name, valid_until } = auctionForm;
    if (!id || !name || !valid_until || selectedProducts.length === 0) {
      showError('Please fill all fields and select at least one product');
      return;
    }
    setAuctionSaving(true);
    try {
      await auctionService.createAuction({ ...auctionForm, product_ids: selectedProducts });
      showSuccess('Auction created successfully!');
      triggerSuccessEffect('Auction Created Successfully!');
      setShowCreate(false);
      resetAuctionForm();
      loadDashboard();
    } catch (err:any) {
      showError(err.response?.data?.error || 'Failed to create auction');
    } finally {
      setAuctionSaving(false);
    }
  };

  /* ----------------------------------------------------------------
   *  Add Product handlers
   * ---------------------------------------------------------------- */
  const resetProductForm = () => setProductForm({ id: '', name: '', description: '' });

  const handleAddProduct = async () => {
    const { id, name, description } = productForm;
    if (!id || !name || !description) {
      showError('Please fill all fields');
      return;
    }
    setProductSaving(true);
    try {
      await auctionService.addProduct(productForm);
      showSuccess('Product added successfully!');
      triggerSuccessEffect('Product Added Successfully!');
      setShowAddProduct(false);
      resetProductForm();
      loadDashboard();
    } catch (err:any) {
      showError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setProductSaving(false);
    }
  };

  /* ----------------------------------------------------------------
   *  Loading spinner
   * ---------------------------------------------------------------- */
  if (loading) {
    return (
      <Layout title="Admin Dashboard" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent shadow-lg" />
        </div>
      </Layout>
    );
  }

  /* ----------------------------------------------------------------
   *  Render
   * ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Layout title="Admin Dashboard" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="space-y-8">
          {/* Success Effect Overlay */}
          {showSuccessEffect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-pulse flex items-center gap-3">
                <CheckCircle className="h-8 w-8 animate-bounce" />
                <span className="text-xl font-semibold">{successMessage}</span>
                <Award className="h-8 w-8 animate-spin" />
              </div>
            </div>
          )}

          {/* Welcome */}
          <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-teal-700 text-white border-none shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {admin?.name || 'Admin'}!
                </h2>
                <p className="text-slate-200 text-lg">Manage auctions and monitor performance with precision.</p>
              </div>
              <div className="hidden md:block">
                <Target className="h-16 w-16 text-teal-300 animate-pulse" />
              </div>
            </div>
          </Card>

          {/* Stats */}
          <StatGrid stats={stats} />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ActionCard
              icon={Gavel}
              title="Create Auction"
              desc="Start a new auction with selected products"
              primary
              onClick={() => setShowCreate(true)}
            />
            <ActionCard
              icon={Package}
              title="Add Product"
              desc="Add new products to the inventory"
              onClick={() => setShowAddProduct(true)}
            />
            <ActionCard
              icon={BarChart3}
              title="View Reports"
              desc="Monitor auction performance and user activity"
              onClick={() => navigate('/admin/reports')}
            />
          </div>

          {/* Recent Auctions */}
          <RecentAuctions auctions={recentAuctions} />
        </div>

        {/* ---------------- Create Auction Modal ---------------- */}
        <Modal
          isOpen={showCreate}
          onClose={() => { setShowCreate(false); resetAuctionForm(); }}
          title="Create New Auction"
        >
          <div className="space-y-6">
            <Input 
              label="Auction ID" 
              value={auctionForm.id}
              onChange={e => setAuctionForm({ ...auctionForm, id: e.target.value })}
              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />
            <Input 
              label="Auction Name" 
              value={auctionForm.name}
              onChange={e => setAuctionForm({ ...auctionForm, name: e.target.value })}
              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />
            <Input 
              label="Valid Until" 
              type="datetime-local" 
              value={auctionForm.valid_until}
              onChange={e => setAuctionForm({ ...auctionForm, valid_until: e.target.value })}
              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">Select Products</label>
              <select
                multiple
                className="w-full border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg p-3 h-40 bg-white"
                value={selectedProducts}
                onChange={e =>
                  setSelectedProducts(Array.from(e.target.selectedOptions, o => o.value))
                }
              >
                {productOptions.map(p => (
                  <option key={p.id} value={p.id} className="py-2">
                    {p.id} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <Button 
                variant="secondary"
                onClick={() => { setShowCreate(false); resetAuctionForm(); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              >
                Cancel
              </Button>
              <Button 
                loading={auctionSaving} 
                onClick={handleCreateAuction}
                className="bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white shadow-lg"
              >
                Create Auction
              </Button>
            </div>
          </div>
        </Modal>

        {/* ---------------- Add Product Modal ------------------- */}
        <Modal
          isOpen={showAddProduct}
          onClose={() => { setShowAddProduct(false); resetProductForm(); }}
          title="Add New Product"
        >
          <div className="space-y-6">
            <Input 
              label="Product ID" 
              value={productForm.id}
              onChange={e => setProductForm({ ...productForm, id: e.target.value })}
              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />
            <Input 
              label="Product Name" 
              value={productForm.name}
              onChange={e => setProductForm({ ...productForm, name: e.target.value })}
              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />
            <Input 
              label="Description" 
              value={productForm.description}
              onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <Button 
                variant="secondary"
                onClick={() => { setShowAddProduct(false); resetProductForm(); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              >
                Cancel
              </Button>
              <Button 
                loading={productSaving} 
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white shadow-lg"
              >
                Add Product
              </Button>
            </div>
          </div>
        </Modal>
      </Layout>
    </div>
  );
};

/* ------------------------------------------------------------------
 * Helper UI Parts
 * ------------------------------------------------------------------ */
const StatGrid: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard 
      label="Total Auctions" 
      value={stats.totalAuctions} 
      Icon={Gavel} 
      color="text-slate-700" 
      bgColor="bg-gradient-to-br from-slate-50 to-slate-100"
      borderColor="border-slate-200"
    />
    <StatCard 
      label="Active Auctions" 
      value={stats.activeAuctions} 
      Icon={Clock} 
      color="text-emerald-700" 
      bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
      borderColor="border-emerald-200"
    />
    <StatCard 
      label="Total Products" 
      value={stats.totalProducts} 
      Icon={Package} 
      color="text-teal-700" 
      bgColor="bg-gradient-to-br from-teal-50 to-teal-100"
      borderColor="border-teal-200"
    />
    <StatCard 
      label="Unassigned Products" 
      value={stats.unassignedProducts} 
      Icon={Package} 
      color="text-amber-700" 
      bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
      borderColor="border-amber-200"
    />
    <StatCard 
      label="Total Bids" 
      value={stats.totalBids} 
      Icon={TrendingUp} 
      color="text-slate-700" 
      bgColor="bg-gradient-to-br from-slate-50 to-slate-100"
      borderColor="border-slate-200"
    />
    <StatCard 
      label="Revenue (₹)" 
      value={stats.totalRevenue.toLocaleString()} 
      Icon={DollarSign} 
      color="text-emerald-700" 
      bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
      borderColor="border-emerald-200"
    />
  </div>
);

interface StatCardProps { 
  label: string; 
  value: number | string; 
  Icon: LucideIcon; 
  color: string; 
  bgColor: string;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, Icon, color, bgColor, borderColor }) => (
  <Card className={`text-center ${bgColor} ${borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
    <div className="flex items-center justify-center mb-4">
      <div className={`p-3 rounded-full ${color.includes('emerald') ? 'bg-emerald-200' : color.includes('teal') ? 'bg-teal-200' : color.includes('amber') ? 'bg-amber-200' : 'bg-slate-200'}`}>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
    <h3 className="font-semibold text-slate-800 mb-2">{label}</h3>
    <p className={`text-3xl font-bold ${color} flex items-center justify-center gap-2`}>
      {value}
      <ArrowUpRight className="h-5 w-5 opacity-60" />
    </p>
  </Card>
);

interface ActionCardProps { 
  icon: LucideIcon; 
  title: string; 
  desc: string; 
  onClick: () => void; 
  primary?: boolean; 
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, desc, onClick, primary }) => (
  <Card
    onClick={onClick}
    className={`text-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      primary 
        ? 'bg-gradient-to-br from-slate-700 to-teal-600 text-white border-none shadow-xl' 
        : 'bg-white border-2 border-slate-200 hover:border-teal-300 shadow-lg'
    }`}
  >
    <div className="flex items-center justify-center mb-4">
      <div className={`p-4 rounded-full ${primary ? 'bg-white/20' : 'bg-teal-100'}`}>
        <Icon className={`h-10 w-10 ${primary ? 'text-white' : 'text-teal-600'}`} />
      </div>
    </div>
    <h3 className={`font-bold text-xl mb-3 ${primary ? 'text-white' : 'text-slate-800'}`}>
      {title}
    </h3>
    <p className={`text-sm mb-6 ${primary ? 'text-slate-200' : 'text-slate-600'}`}>
      {desc}
    </p>

    <Button
      variant={primary ? 'primary' : 'secondary'}
      className={`w-full font-semibold ${
        primary 
          ? 'bg-white/20 hover:bg-white/30 text-white border-white/30' 
          : 'bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white border-none'
      }`}
      onClick={onClick}
    >
      {title}
    </Button>
  </Card>
);

const RecentAuctions: React.FC<{ auctions: any[] }> = ({ auctions }) => {
  const navigate = useNavigate();
  return (
    <Card className="bg-white shadow-xl border-2 border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Gavel className="h-8 w-8 text-teal-600" />
          Recent Auctions
        </h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate('/admin/auctions')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 font-semibold"
        >
          View All
        </Button>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No auctions created yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map(a => (
            <div
              key={a.id}
              onClick={() => navigate(`/admin/auctions/${a.id}`)}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-teal-50 rounded-xl hover:from-slate-100 hover:to-teal-100 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-teal-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-full">
                  <Gavel className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-lg">{a.name}</h4>
                  <p className="text-sm text-slate-600 font-medium">ID: {a.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium mb-1">Ends</p>
                <p className="font-bold text-slate-800 text-lg">
                  {new Date(a.valid_until).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};