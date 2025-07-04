import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Product } from '../../services/auctionService';
import { 
  Home,
  Gavel,
  Package,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const adminSidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/admin/auctions', label: 'Manage Auctions', icon: <Gavel className="h-5 w-5" /> },
  { path: '/admin/products', label: 'Manage Products', icon: <Package className="h-5 w-5" /> },
  { path: '/admin/users', label: 'User Management', icon: <Users className="h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: ''
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await auctionService.getUnassignedProducts();
      setProducts(data);
    } catch (error) {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.id || !formData.name || !formData.description) {
      showError('Please fill all fields');
      return;
    }

    try {
      await auctionService.addProduct(formData);
      showSuccess('Product created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to create product');
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name || !formData.description) {
      showError('Please fill all required fields');
      return;
    }

    try {
      await auctionService.updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description
      });
      showSuccess('Product updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await auctionService.deleteProduct(productId);
      showSuccess('Product deleted successfully!');
      loadProducts();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '' });
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || ''
    });
    setShowEditModal(true);
  };

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
    },
    {
      key: 'auction_id',
      label: 'Auction',
      render: (value: string) => (
        <span className="text-sm text-slate-600">
          {value || 'Unassigned'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Product) => (
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
            variant="danger"
            onClick={() => handleDeleteProduct(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Manage Products" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Products" sidebarItems={adminSidebarItems} sidebarTitle="Admin Portal">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Product Management</h2>
              <p className="text-slate-600">Add, edit, and manage your auction products</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Your Products</h3>
            <Button variant="secondary" onClick={loadProducts}>
              Refresh
            </Button>
          </div>
          
          <Table
            columns={productColumns}
            data={products}
            emptyMessage="No products found. Add your first product!"
          />
        </Card>
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Add New Product"
      >
        <div className="space-y-4">
          <Input
            label="Product ID"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="Enter unique product ID"
          />
          
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} className="flex-1">
              Add Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Product"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleEditProduct} className="flex-1">
              Update Product
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};