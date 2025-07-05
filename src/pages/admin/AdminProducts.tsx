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
  Plus, Edit, Trash2,
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
      refresh();
    } catch (e: any) {
      showError(e.response?.data?.error || 'Delete failed');
    }
  };

  /* ------------- table cols ------------- */
  const cols = [
    { key: 'id',   label: 'ID',   render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'name', label: 'Name', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'description', label: 'Description' },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
          ${v === 'sold' ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'}`}>
          {v === 'sold' ? 'Sold' : 'Available'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Product) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteProduct(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  /* ------------- loading ------------- */
  if (loading) {
    return (
      <Layout title="Products" sidebarItems={adminSidebar} sidebarTitle="Admin Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      </Layout>
    );
  }

  /* ------------- render ------------- */
  return (
    <Layout title="Products" sidebarItems={adminSidebar} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Product Management</h2>
              <p className="text-slate-600">Unassigned &amp; auction‑bound products</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </Card>

        {/* tab selector */}
        <Card>
          <div className="flex gap-4">
            <Button
              variant={activeTab === 'unassigned' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('unassigned')}
            >
              Unassigned&nbsp;
              <span className="font-semibold">({unassigned.length})</span>
            </Button>

            <Button
              variant={activeTab === 'auction' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('auction')}
            >
              By Auction&nbsp;
              <span className="font-semibold">
                ({auctions.reduce((s, a) => s + (byAuction[a.id]?.length || 0), 0)})
              </span>
            </Button>
          </div>
        </Card>

        {/* table view */}
        {activeTab === 'unassigned' ? (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Unassigned Products</h3>
              <Button variant="secondary" onClick={refresh}>Refresh</Button>
            </div>

            <Table
              columns={cols}
              data={unassigned}
              emptyMessage="No unassigned products"
            />
          </Card>
        ) : (
          <Card>
            {/* auction selector */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Products by Auction</h3>

              <select
                value={selectedAuction}
                onChange={(e) => setSelectedAuction(e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none"
              >
                {auctions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>

            <Table
              columns={cols}
              data={byAuction[selectedAuction] || []}
              emptyMessage="No products for this auction"
            />
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
    <div className="space-y-4">
      {!title.startsWith('Edit') && ( /* ID only for create */
        <Input
          label="Product ID"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="Unique ID"
        />
      )}

      <Input
        label="Product Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Enter product name"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
