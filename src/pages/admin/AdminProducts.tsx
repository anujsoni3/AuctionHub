/* ------------------------------------------------------------------
 *  src/pages/admin/AdminProducts.tsx   (enhanced)
 * ----------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { Layout }               from '../../components/layout/Layout';
import { Card }                 from '../../components/ui/Card';
import { Button }               from '../../components/ui/Button';
import { Input }                from '../../components/ui/Input';
import { Modal }                from '../../components/ui/Modal';
import { Table }                from '../../components/ui/Table';
import { useToast }             from '../../components/ui/Toast';
import {
  auctionService,
  Product,
  Auction,
} from '../../services/auctionService';

import {
  Home, Gavel, Package, Settings,
  Plus, Edit, Trash2, CheckCircle, 
  Award, ShoppingCart, Archive, 
  AlertCircle, RefreshCw, Filter
} from 'lucide-react';

/* ------------------------------------------------------------------
 *  Sidebar
 * ----------------------------------------------------------------- */
const adminSidebar = [
  { path: '/admin/dashboard', label: 'Dashboard',       icon: <Home   className="h-5 w-5" /> },
  { path: '/admin/auctions',  label: 'Manage Auctions', icon: <Gavel  className="h-5 w-5" /> },
  { path: '/admin/products',  label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  { path: '/admin/settings',  label: 'Settings',        icon: <Settings className="h-5 w-5" /> },
];

/* ------------------------------------------------------------------
 *  Component
 * ----------------------------------------------------------------- */
export const AdminProducts: React.FC = () => {
  /* ------------- state ------------- */
  const [unassigned, setUnassigned] = useState<Product[]>([]);
  const [auctions,   setAuctions]   = useState<Auction[]>([]);
  const [byAuction,  setByAuction]  = useState<Record<string, Product[]>>({});
  const [activeTab,  setActiveTab]  = useState<'unassigned' | 'auction'>('unassigned');
  const [selectedAuction, setSelectedAuction] = useState<string>('');

  /* modal + form */
  const [showCreate,   setShowCreate]   = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [editingProd,  setEditingProd]  = useState<Product | null>(null);
  const [form, setForm] = useState({ id: '', name: '', description: '' });

  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  /* ------------- Success effects ------------- */
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [actionType, setActionType] = useState<'create' | 'update' | 'delete'>('create');

  /* ------------- Success effect trigger ------------- */
  const triggerSuccessEffect = (message: string, type: 'create' | 'update' | 'delete') => {
    setSuccessMessage(message);
    setActionType(type);
    setShowSuccessEffect(true);
    setTimeout(() => setShowSuccessEffect(false), 3000);
  };

  /* ------------- load products ------------- */
  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      /* unassigned products */
      const un: Product[] = await auctionService.getUnassignedProducts().catch(() => []);
      setUnassigned(un);

      /* my auctions + products per auction */
      const myAucs: Auction[] = await auctionService.getMyAuctions().catch(() => []);
      setAuctions(myAucs);

      const prodMap: Record<string, Product[]> = {};
      await Promise.all(
        myAucs.map(async (a: Auction) => {
          const prods: Product[] =
            await auctionService.getAuctionProductsAdmin(a.id).catch(() => []);
          prodMap[a.id] = prods;
        })
      );
      setByAuction(prodMap);

      /* select first auction by default in drop‑down */
      if (myAucs.length && !selectedAuction) {
        setSelectedAuction(myAucs[0].id);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  /* ------------- CRUD handlers ------------- */
  const resetForm = () => {
    setForm({ id: '', name: '', description: '' });
    setEditingProd(null);
  };

  const createProduct = async () => {
    if (!form.id || !form.name || !form.description) {
      showError('Please fill all fields');
      return;
    }

    try {
      await auctionService.addProduct(form);
      showSuccess('Product created');
      triggerSuccessEffect('Product Created Successfully!', 'create');
      setShowCreate(false);
      resetForm();
      refresh();
    } catch (e: any) {
      showError(e.response?.data?.error || 'Create failed');
    }
  };

  const openEdit = (p: Product) => {
    setEditingProd(p);
    setForm({ id: p.id, name: p.name, description: p.description ?? '' });
    setShowEdit(true);
  };

  const updateProduct = async () => {
    if (!editingProd) return;
    if (!form.name || !form.description) {
      showError('Fill required fields');
      return;
    }

    try {
      await auctionService.updateProduct(editingProd.id, {
        name: form.name,
        description: form.description,
      });
      showSuccess('Product updated');
      triggerSuccessEffect('Product Updated Successfully!', 'update');
      setShowEdit(false);
      resetForm();
      refresh();
    } catch (e: any) {
      showError(e.response?.data?.error || 'Update failed');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete product?')) return;
    try {
      await auctionService.deleteProduct(id);
      showSuccess('Deleted');
      triggerSuccessEffect('Product Deleted Successfully!', 'delete');
      refresh();
    } catch (e: any) {
      showError(e.response?.data?.error || 'Delete failed');
    }
  };

  /* ------------- table cols ------------- */
  const cols = [
    { 
      key: 'id',   
      label: 'ID',   
      render: (v: string) => (
        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-sm">
          {v}
        </span>
      )
    },
    { 
      key: 'name', 
      label: 'Name', 
      render: (v: string) => (
        <span className="font-semibold text-slate-800">{v}</span>
      )
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (v: string) => (
        <span className="text-slate-600 text-sm">{v}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1
          ${v === 'sold' 
            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' 
            : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300'}`}>
          {v === 'sold' ? (
            <>
              <Archive className="h-3 w-3" />
              Sold
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3" />
              Available
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Product) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => openEdit(row)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 hover:border-teal-300"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="danger" 
            onClick={() => deleteProduct(row.id)}
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  /* ------------- loading ------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <Layout title="Products" sidebarItems={adminSidebar} sidebarTitle="Admin Portal">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent shadow-lg" />
          </div>
        </Layout>
      </div>
    );
  }

  /* ------------- render ------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Layout title="Products" sidebarItems={adminSidebar} sidebarTitle="Admin Portal">
        <div className="space-y-8">
          {/* Success Effect Overlay */}
          {showSuccessEffect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-pulse flex items-center gap-3">
                <CheckCircle className="h-8 w-8 animate-bounce" />
                <span className="text-xl font-semibold">{successMessage}</span>
                {actionType === 'create' && <Plus className="h-8 w-8 animate-spin" />}
                {actionType === 'update' && <Edit className="h-8 w-8 animate-spin" />}
                {actionType === 'delete' && <Trash2 className="h-8 w-8 animate-spin" />}
              </div>
            </div>
          )}

          {/* header */}
          <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-teal-700 text-white border-none shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">Product Management</h2>
                  <p className="text-slate-200 text-lg">Manage unassigned & auction‑bound products</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreate(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </Button>
            </div>
          </Card>

          {/* tab selector */}
          <Card className="bg-white shadow-xl border-2 border-slate-200">
            <div className="flex gap-6">
              <Button
                variant={activeTab === 'unassigned' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('unassigned')}
                className={`font-semibold transition-all duration-300 ${
                  activeTab === 'unassigned' 
                    ? 'bg-gradient-to-r from-slate-700 to-teal-600 text-white shadow-lg' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Unassigned&nbsp;
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'unassigned' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'
                }`}>
                  {unassigned.length}
                </span>
              </Button>

              <Button
                variant={activeTab === 'auction' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('auction')}
                className={`font-semibold transition-all duration-300 ${
                  activeTab === 'auction' 
                    ? 'bg-gradient-to-r from-slate-700 to-teal-600 text-white shadow-lg' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Gavel className="h-5 w-5 mr-2" />
                By Auction&nbsp;
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'auction' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'
                }`}>
                  {auctions.reduce((s, a) => s + (byAuction[a.id]?.length || 0), 0)}
                </span>
              </Button>
            </div>
          </Card>

          {/* table view */}
          {activeTab === 'unassigned' ? (
            <Card className="bg-white shadow-xl border-2 border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Unassigned Products</h3>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={refresh}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl p-6 border-2 border-slate-200">
                <Table
                  columns={cols}
                  data={unassigned}
                  emptyMessage="No unassigned products"
                />
              </div>
            </Card>
          ) : (
            <Card className="bg-white shadow-xl border-2 border-slate-200">
              {/* auction selector */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-full">
                    <Filter className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Products by Auction</h3>
                </div>

                <select
                  value={selectedAuction}
                  onChange={(e) => setSelectedAuction(e.target.value)}
                  className="border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {auctions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-xl p-6 border-2 border-slate-200">
                <Table
                  columns={cols}
                  data={byAuction[selectedAuction] || []}
                  emptyMessage="No products for this auction"
                />
              </div>
            </Card>
          )}
        </div>

        {/* ---------------- Modals ---------------- */}
        <ProductModal
          open={showCreate}
          title="Add Product"
          form={form}
          setForm={setForm}
          onClose={() => { setShowCreate(false); resetForm(); }}
          onSubmit={createProduct}
          submitLabel="Add Product"
        />

        <ProductModal
          open={showEdit}
          title="Edit Product"
          form={form}
          setForm={setForm}
          onClose={() => { setShowEdit(false); resetForm(); }}
          onSubmit={updateProduct}
          submitLabel="Update Product"
        />
      </Layout>
    </div>
  );
};

/* ------------------------------------------------------------------
 *  Re‑usable modal component
 * ----------------------------------------------------------------- */
interface ProdModalProps {
  open: boolean;
  title: string;
  form: { id: string; name: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ id: string; name: string; description: string }>>;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
}

const ProductModal: React.FC<ProdModalProps> = ({
  open, title, form, setForm, onClose, onSubmit, submitLabel,
}) => (
  <Modal isOpen={open} onClose={onClose} title={title}>
    <div className="space-y-6">
      {!title.startsWith('Edit') && ( /* ID only for create */
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Product ID</label>
          <Input
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder="Enter unique product ID"
            className="border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg font-mono"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter product name"
          className="border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          placeholder="Enter detailed product description"
          className="w-full px-4 py-3 border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg shadow-sm transition-all duration-200 resize-none"
        />
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-200">
        <Button 
          variant="secondary" 
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 font-semibold" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white shadow-lg font-semibold" 
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  </Modal>
);