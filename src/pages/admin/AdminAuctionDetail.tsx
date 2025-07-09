import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { auctionService } from '../../services/auctionService';
import { DollarSign, Gavel, Package, Calendar, Clock, Save, X } from 'lucide-react';

export const AdminAuctionDetail: React.FC = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [auction, setAuction] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', valid_until: '' });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    loadAuction();
  }, [auctionId]);

  const loadAuction = async () => {
    if (!auctionId) return;
    try {
      setLoading(true);
      const allAuctions = await auctionService.getAllAuctions();
      const found = allAuctions.find((a: any) => a.id === auctionId);
      if (!found) return showError('Auction not found');
      setAuction(found);

      const auctionProducts = await auctionService.getAuctionProductsAdmin(auctionId);
      setProducts(auctionProducts);
    } catch (error) {
      console.error(error);
      showError('Failed to load auction data');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (!auction) return;
    setFormData({
      name: auction.name || '',
      valid_until: auction.valid_until?.slice(0, 16) || '',
    });
    setSelectedProducts(auction.product_ids || []);
    setShowEditModal(true);
  };

  const handleEditAuction = async () => {
    if (!formData.name || !formData.valid_until || !auction) {
      showError('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      await auctionService.updateAuction(auction.id, {
        name: formData.name,
        valid_until: formData.valid_until,
        product_ids: selectedProducts,
      });
      showSuccess('Auction updated successfully');
      setShowEditModal(false);
      loadAuction();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to update auction');
    } finally {
      setSaving(false);
    }
  };

  const isExpired = auction && new Date(auction.valid_until) < new Date();
  const timeRemaining = auction ? new Date(auction.valid_until).getTime() - new Date().getTime() : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Layout title="Auction Details" sidebarItems={[]} sidebarTitle="Admin">
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
      <Layout title="Auction Details" sidebarItems={[]} sidebarTitle="Admin">
        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{auction.name}</h2>
                    <p className="text-slate-300 text-sm">ID: {auction.id}</p>
                  </div>
                </div>
                <button
                  onClick={openEditModal}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Edit Auction
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">End Date</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(auction.valid_until).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Clock className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Products in Auction</h3>
                  <p className="text-slate-300 text-sm">{products.length} items</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-slate-500 text-lg">No products assigned to this auction</p>
                  <p className="text-slate-400 text-sm mt-2">Add products to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((p, index) => (
                    <div 
                      key={p.id} 
                      className="group bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 transition-all duration-300 hover:shadow-md hover:from-blue-50 hover:to-teal-50 hover:border-blue-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-800 transition-colors">
                            {p.name}
                          </h4>
                          <p className="text-slate-600 text-sm mt-1 group-hover:text-slate-700">
                            {p.description}
                          </p>
                        </div>
                        <div className="ml-4 p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Auction">
          <div className="space-y-6">
            <div className="space-y-4">
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
                  Valid Until
                </label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowEditModal(false)}
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
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 inline mr-2" />
                    Save Changes
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