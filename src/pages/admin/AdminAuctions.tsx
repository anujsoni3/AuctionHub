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
  Eye,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Save,
  X,
  RefreshCw
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
  const [saving, setSaving] = useState(false);
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
      setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const handleEditAuction = async () => {
    if (!editingAuction || !formData.name || !formData.valid_until) {
      showError('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
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
    } finally {
      setSaving(false);
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
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-slate-100 rounded">
            <Target className="h-3 w-3 text-slate-600" />
          </div>
          <span className="font-mono text-sm text-slate-700">{value}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (value: string) => (
        <span className="font-semibold text-slate-900">{value}</span>
      )
    },
    {
      key: 'valid_until',
      label: 'End Date',
      render: (value: string) => {
        const isExpired = new Date(value) < new Date();
        return (
          <div className="flex items-center space-x-2">
            <Clock className={`h-4 w-4 ${isExpired ? 'text-red-500' : 'text-green-500'}`} />
            <span className={`text-sm ${isExpired ? 'text-red-600' : 'text-slate-600'}`}>
              {new Date(value).toLocaleString()}
            </span>
          </div>
        );
      }
    },
    {
      key: 'product_ids',
      label: 'Products',
      render: (value: string[]) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-slate-600">
            {value?.length || 0} products
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Auction) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleSettleAuction(row.id)}
            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all duration-200"
            title="Settle"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteAuction(row.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Layout title="Manage Auctions" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-transparent shadow-lg"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-20 animate-pulse"></div>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Layout title="Manage Auctions" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <Gavel className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Auction Management</h2>
                    <p className="text-slate-300">Create, edit, and manage your auctions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Auction</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Auctions</p>
                  <p className="text-2xl font-bold text-slate-900">{auctions.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Gavel className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Auctions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {auctions.filter(a => new Date(a.valid_until) > new Date()).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Products</p>
                  <p className="text-2xl font-bold text-teal-600">{products.length}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Package className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Auctions Table */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Your Auctions</h3>
                </div>
                <button
                  onClick={loadData}
                  className="text-white hover:text-slate-300 transition-colors duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <Table
                columns={auctionColumns}
                data={auctions}
                emptyMessage="No auctions found. Create your first auction!"
              />
            </div>
          </div>
        </div>

        {/* Create Auction Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
          title="Create New Auction"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Auction ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter unique auction ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Auction Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter auction name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Products
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-4 bg-slate-50">
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                      <p className="text-slate-500">No unassigned products available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product) => (
                        <label key={product.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer">
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
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-slate-900">{product.name}</span>
                            <span className="text-sm text-slate-500 ml-2">(ID: {product.id})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                disabled={saving}
              >
                <X className="h-4 w-4 inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleCreateAuction}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 inline mr-2" />
                    Create Auction
                  </>
                )}
              </button>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Auction Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter auction name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Products
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-4 bg-slate-50">
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                      <p className="text-slate-500">No unassigned products available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product) => (
                        <label key={product.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer">
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
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-slate-900">{product.name}</span>
                            <span className="text-sm text-slate-500 ml-2">(ID: {product.id})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                disabled={saving}
              >
                <X className="h-4 w-4 inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleEditAuction}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 inline mr-2" />
                    Update Auction
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </Layout>
    </div>
  );
};