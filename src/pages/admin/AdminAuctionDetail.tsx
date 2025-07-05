import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { auctionService } from '../../services/auctionService';
import { DollarSign, Gavel, Package } from 'lucide-react';

export const AdminAuctionDetail: React.FC = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [auction, setAuction] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  };

  if (loading) {
    return (
      <Layout title="Auction Details" sidebarItems={[]} sidebarTitle="Admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Auction Details" sidebarItems={[]} sidebarTitle="Admin">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{auction.name}</h2>
              <p className="text-slate-600 mt-1">Auction ID: {auction.id}</p>
              <p className="text-slate-600 mt-1">
                Valid Until: {new Date(auction.valid_until).toLocaleString()}
              </p>
            </div>
            <Button onClick={openEditModal}>Edit Auction</Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Products in Auction</h3>
          {products.length === 0 ? (
            <p className="text-slate-500">No products assigned to this auction.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {products.map((p) => (
                <li key={p.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-slate-900">{p.name}</h4>
                      <p className="text-sm text-slate-600">{p.description}</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Auction">
        <div className="space-y-4">
          <Input
            label="Auction Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Valid Until"
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />
          {/* Optional: Multi-select product_ids if you want to enable it here */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAuction}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
