import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction, Product } from '../../services/auctionService';
import { 
  Home,
  Gavel,
  Package,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions', label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products', label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export const AdminAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    valid_until: ''
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [auctionsData, productsData] = await Promise.all([
        auctionService.getMyAuctions(),
        auctionService.getUnassignedProducts()
      ]);
      setAuctions(auctionsData);
      setProducts(productsData);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    if (!formData.id || !formData.name || !formData.valid_until || selectedProducts.length === 0) {
      showError('Please fill all fields and select at least one product');
      return;
    }

    try {
      await auctionService.createAuction({
        ...formData,
        product_ids: selectedProducts
      });
      showSuccess('Auction created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to create auction');
    }
  };

  const handleEditAuction = async () => {
    if (!editingAuction || !formData.name || !formData.valid_until) {
      showError('Please fill all required fields');
      return;
    }

    try {
      await auctionService.updateAuction(editingAuction.id, {
        name: formData.name,
        valid_until: formData.valid_until,
        product_ids: selectedProducts
      });
      showSuccess('Auction updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to update auction');
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      await auctionService.deleteAuction(auctionId);
      showSuccess('Auction deleted successfully!');
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to delete auction');
    }
  };

  const handleSettleAuction = async (auctionId: string) => {
    if (!confirm('Are you sure you want to settle this auction? This action cannot be undone.')) return;

    try {
      await auctionService.settleAuction(auctionId);
      showSuccess('Auction settled successfully!');
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to settle auction');
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', valid_until: '' });
    setSelectedProducts([]);
    setEditingAuction(null);
  };

  const openEditModal = (auction: Auction) => {
    setEditingAuction(auction);
    setFormData({
      id: auction.id,
      name: auction.name,
      valid_until: auction.valid_until
    });
    setSelectedProducts(auction.product_ids || []);
    setShowEditModal(true);
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
      key: 'product_ids',
      label: 'Products',
      render: (value: string[]) => (
        <span className="text-sm text-slate-600">
          {value?.length || 0} products
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Auction) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() => handleSettleAuction(row.id)}
          >
            Settle
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteAuction(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Manage Auctions" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Auctions" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Auction Management</h2>
              <p className="text-slate-600">Create, edit, and manage your auctions</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Auction
            </Button>
          </div>
        </Card>

        {/* Auctions Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Your Auctions</h3>
            <Button variant="secondary" onClick={loadData}>
              Refresh
            </Button>
          </div>
          
          <Table
            columns={auctionColumns}
            data={auctions}
            emptyMessage="No auctions found. Create your first auction!"
          />
        </Card>
      </div>

      {/* Create Auction Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Create New Auction"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Auction ID"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="Enter unique auction ID"
          />
          
          <Input
            label="Auction Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter auction name"
          />
          
          <Input
            label="End Date & Time"
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Products
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3">
              {products.length === 0 ? (
                <p className="text-slate-500 text-sm">No unassigned products available</p>
              ) : (
                products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{product.name} (ID: {product.id})</span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAuction} className="flex-1">
              Create Auction
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Auction Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Auction"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Auction Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter auction name"
          />
          
          <Input
            label="End Date & Time"
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Products
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3">
              {products.length === 0 ? (
                <p className="text-slate-500 text-sm">No unassigned products available</p>
              ) : (
                products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{product.name} (ID: {product.id})</span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleEditAuction} className="flex-1">
              Update Auction
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};