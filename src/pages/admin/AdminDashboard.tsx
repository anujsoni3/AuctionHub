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
  DollarSign, Settings, BarChart3,
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

  /* ------------- utils ------------------------- */
  const { admin } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      </Layout>
    );
  }

  /* ----------------------------------------------------------------
   *  Render
   * ---------------------------------------------------------------- */
  return (
    <Layout title="Admin Dashboard" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Welcome */}
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900">
            Welcome back, {admin?.name || 'Admin'}!
          </h2>
          <p className="text-slate-600 mt-1">Manage auctions and monitor performance.</p>
        </Card>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="space-y-4">
          <Input label="Auction ID"  value={auctionForm.id}
                 onChange={e => setAuctionForm({ ...auctionForm, id: e.target.value })}/>
          <Input label="Auction Name" value={auctionForm.name}
                 onChange={e => setAuctionForm({ ...auctionForm, name: e.target.value })}/>
          <Input label="Valid Until"  type="datetime-local" value={auctionForm.valid_until}
                 onChange={e => setAuctionForm({ ...auctionForm, valid_until: e.target.value })}/>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Select Products</label>
            <select
              multiple
              className="w-full border rounded p-2 h-32"
              value={selectedProducts}
              onChange={e =>
                setSelectedProducts(Array.from(e.target.selectedOptions, o => o.value))
              }
            >
              {productOptions.map(p => (
                <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary"
                    onClick={() => { setShowCreate(false); resetAuctionForm(); }}>
              Cancel
            </Button>
            <Button loading={auctionSaving} onClick={handleCreateAuction}>
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
        <div className="space-y-4">
          <Input label="Product ID" value={productForm.id}
                 onChange={e => setProductForm({ ...productForm, id: e.target.value })}/>
          <Input label="Product Name" value={productForm.name}
                 onChange={e => setProductForm({ ...productForm, name: e.target.value })}/>
          <Input label="Description" value={productForm.description}
                 onChange={e => setProductForm({ ...productForm, description: e.target.value })}/>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary"
                    onClick={() => { setShowAddProduct(false); resetProductForm(); }}>
              Cancel
            </Button>
            <Button loading={productSaving} onClick={handleAddProduct}>
              Add Product
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

/* ------------------------------------------------------------------
 * Helper UI Parts
 * ------------------------------------------------------------------ */
const StatGrid: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard label="Total Auctions"       value={stats.totalAuctions}       Icon={Gavel}      color="text-blue-600"   />
    <StatCard label="Active Auctions"      value={stats.activeAuctions}      Icon={Clock}      color="text-green-600"  />
    <StatCard label="Total Products"       value={stats.totalProducts}       Icon={Package}    color="text-purple-600" />
    <StatCard label="Unassigned Products"  value={stats.unassignedProducts}  Icon={Package}    color="text-indigo-600" />
    <StatCard label="Total Bids"           value={stats.totalBids}           Icon={TrendingUp} color="text-amber-600"  />
    <StatCard label="Revenue (₹)"          value={stats.totalRevenue.toLocaleString()} Icon={DollarSign} color="text-rose-600" />
  </div>
);

interface StatCardProps { label: string; value: number | string; Icon: LucideIcon; color: string; }
const StatCard: React.FC<StatCardProps> = ({ label, value, Icon, color }) => (
  <Card className="text-center">
    <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
    <h3 className="font-semibold text-slate-900">{label}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </Card>
);

interface ActionCardProps { icon: LucideIcon; title: string; desc: string; onClick: () => void; primary?: boolean; }
const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, desc, onClick, primary }) => (
  <Card
    onClick={onClick}
    className={`text-center cursor-pointer hover:shadow-md transition-shadow ${
      primary ? 'border-blue-300' : ''
    }`}
  >
    <Icon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
    <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 mb-4">{desc}</p>

    {/* onClick added to button so button itself is clickable */}
    <Button
      variant={primary ? 'primary' : 'secondary'}
      className="w-full"
      onClick={onClick}
    >
      {title}
    </Button>
  </Card>
);

const RecentAuctions: React.FC<{ auctions: any[] }> = ({ auctions }) => {
  const navigate = useNavigate();
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Recent Auctions</h3>
        <Button variant="secondary" size="sm" onClick={() => navigate('/admin/auctions')}>
          View All
        </Button>
      </div>

      {auctions.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No auctions created yet</p>
      ) : (
        <div className="space-y-4">
          {auctions.map(a => (
            <div
              key={a.id}
              onClick={() => navigate(`/admin/auctions/${a.id}`)}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
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
  );
};
