import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction, Product } from '../../services/auctionService';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

import {
  Gavel,
  Clock,
  Search,
  Home,
  Wallet,
  Eye,
  Timer,
  TrendingUp,
} from 'lucide-react';

/* Sidebar config */
const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-5 w-5" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
];

export const UserAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [productBids, setProductBids] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  const [registeredAuctions, setRegisteredAuctions] = useState<Set<string>>(new Set());

  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const myId = String(user?.id || '');

  // 📦 Load all auctions + my registered ones
  useEffect(() => {
    (async () => {
      try {
        const [allAuctions, myAuctionRes] = await Promise.all([
          auctionService.getAuctions(),
          authService.getMyAuctions(),
        ]);

        setAuctions(allAuctions);

        const myAuctionIds = new Set<string>(
          (myAuctionRes?.user_details?.auctions || []).map(String)
        );
        setRegisteredAuctions(myAuctionIds);

        setTimeLeft(
          allAuctions.reduce<Record<string, number>>((acc, a) => {
            acc[a.id] = getSecondsLeft(a.valid_until);
            return acc;
          }, {})
        );
      } catch (err) {
        showError('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    })();
  }, [showError]);

  useEffect(() => {
    if (!auctions.length) return;
    const id = setInterval(() => {
      const now = Date.now();
      setTimeLeft(prev =>
        auctions.reduce<Record<string, number>>((acc, a) => {
          acc[a.id] = Math.max(0, Math.floor((new Date(a.valid_until).getTime() - now) / 1000));
          return acc;
        }, {})
      );
    }, 1000);
    return () => clearInterval(id);
  }, [auctions]);

  const handleViewProducts = async (auction: Auction) => {
    setSelectedAuction(auction);
    await loadAuctionProducts(auction.id);
  };

  const loadAuctionProducts = async (auctionId: string) => {
    setProductsLoading(true);
    try {
      const data = await auctionService.getAuctionProducts(auctionId);
      setProducts(data);

      const bids = await Promise.all(
        data.map(async p => {
          try {
            const b = await auctionService.getHighestBid(p.id);
            return [p.id, b] as const;
          } catch {
            return [p.id, { highest_bid: 0 }] as const;
          }
        })
      );
      setProductBids(Object.fromEntries(bids));
    } catch {
      showError('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleRegisterForAuction = async (auctionId: string) => {
    try {
      await auctionService.registerForAuction(auctionId);
      showSuccess('Successfully registered for auction!');
      setRegisteredAuctions(prev => new Set(prev).add(auctionId));
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to register');
    }
  };

  const openBidModal = (product: Product) => {
    setSelectedProduct(product);
    setShowBidModal(true);
  };

  const handlePlaceBid = async () => {
    if (!selectedProduct || !bidAmount || !user) {
      showError('Please enter a valid bid amount');
      return;
    }
    const amount = parseFloat(bidAmount);
    const currentHighest = productBids[selectedProduct.id]?.highest_bid ?? 0;
    if (amount <= currentHighest) {
      showError(`Bid must be higher than ₹${currentHighest}`);
      return;
    }

    setBidLoading(true);
    try {
      await auctionService.placeBid({
        product_name: selectedProduct.name,
        bid_amount: amount,
        user_id: user.username,
      });
      showSuccess('Bid placed successfully!');
      setShowBidModal(false);
      setBidAmount('');
      setSelectedProduct(null);
      if (selectedAuction) await loadAuctionProducts(selectedAuction.id);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  const getSecondsLeft = (iso: string) =>
    Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));

  const formatTimeLeft = (sec: number) => {
    if (sec <= 0) return 'Ended';
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (d) return `${d}d ${h}h ${m}m`;
    if (h) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const filteredAuctions = auctions.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search auctions by name or ID…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Active Auctions</h3>

            {filteredAuctions.length === 0 ? (
              <Card>
                <p className="text-center text-slate-500 py-8">No auctions found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAuctions.map(a => {
                  const secs = timeLeft[a.id] ?? getSecondsLeft(a.valid_until);
                  const ended = secs <= 0;
                  const registered = registeredAuctions.has(a.id);

                  return (
                    <Card key={a.id} className="hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 text-lg">{a.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">ID: {a.id}</p>
                          <div className="flex items-center text-sm text-slate-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Ends: {new Date(a.valid_until).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <Timer className="h-4 w-4 mr-1 text-amber-600" />
                            <span className={`font-medium ${ended ? 'text-red-600' : 'text-amber-600'}`}>
                              {formatTimeLeft(secs)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ended
                                ? 'bg-red-100 text-red-800'
                                : secs < 3600
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {ended ? 'Ended' : 'Active'}
                            </span>
                          </div>

                          <div className="space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleViewProducts(a)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Products
                            </Button>

                            {registered ? (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs inline-block">
                                Registered
                              </span>
                            ) : (
                              <Button size="sm" onClick={() => handleRegisterForAuction(a.id)} disabled={ended}>
                                Register
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {selectedAuction ? `${selectedAuction.name} Products` : 'Select an Auction'}
            </h3>

            <Card>
              {!selectedAuction ? (
                <EmptyState />
              ) : productsLoading ? (
                <Loader />
              ) : products.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No products in this auction</p>
              ) : (
                <div className="space-y-4">
                  {products.map(p => {
                    const registered = registeredAuctions.has(selectedAuction!.id);
                    const isEnded = timeLeft[selectedAuction!.id] <= 0;

                    return (
                      <div key={p.id} className="p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-slate-900">{p.name}</h5>
                            <p className="text-sm text-slate-600">ID: {p.id}</p>
                            {p.description && (
                              <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                            )}
                          </div>

                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'sold'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {p.status === 'sold' ? 'Sold' : 'Available'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>Highest: ₹{productBids[p.id]?.highest_bid || 0}</span>
                          </div>

                          {registered ? (
                            <Button size="sm" onClick={() => openBidModal(p)} disabled={p.status === 'sold' || isEnded}>
                              <Gavel className="h-4 w-4 mr-1" />
                              Place Bid
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Register to bid</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showBidModal}
        onClose={() => {
          setShowBidModal(false);
          setBidAmount('');
          setSelectedProduct(null);
        }}
        title={`Place Bid on ${selectedProduct?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-900">{selectedProduct?.name}</h4>
            <p className="text-sm text-slate-600">ID: {selectedProduct?.id}</p>
            <p className="text-sm text-slate-600 mt-2">
              Current Highest Bid: ₹
              {selectedProduct ? productBids[selectedProduct.id]?.highest_bid ?? 0 : 0}
            </p>
          </div>

          <Input
            label="Your Bid Amount (₹)"
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            placeholder="Enter your bid amount"
            min={selectedProduct ? (productBids[selectedProduct.id]?.highest_bid ?? 0) + 1 : 1}
          />

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBidModal(false);
                setBidAmount('');
                setSelectedProduct(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handlePlaceBid} loading={bidLoading} className="flex-1">
              Place Bid
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

const EmptyState = () => (
  <div className="text-center py-8">
    <Gavel className="h-12 w-12 text-slate-300 mx-auto mb-3" />
    <p className="text-slate-500">Click “View Products” on an auction to see its items</p>
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
  </div>
);
