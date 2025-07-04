import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction, Product } from '../../services/auctionService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Gavel, 
  Clock, 
  Search,
  Home,
  History,
  Wallet,
  Eye,
  Timer,
  TrendingUp
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-5 w-5" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
];

export const UserAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [productBids, setProductBids] = useState<{[key: string]: any}>({});
  const [timeLeft, setTimeLeft] = useState<{[key: string]: number}>({});
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadAuctions();
  }, []);

  useEffect(() => {
    // Update time left every second for active auctions
    const interval = setInterval(() => {
      auctions.forEach(auction => {
        const endTime = new Date(auction.valid_until);
        const now = new Date();
        const timeDiff = endTime.getTime() - now.getTime();
        setTimeLeft(prev => ({
          ...prev,
          [auction.id]: Math.max(0, Math.floor(timeDiff / 1000))
        }));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [auctions]);

  const loadAuctions = async () => {
    try {
      const data = await auctionService.getAuctions();
      setAuctions(data);
      
      // Initialize time left for each auction
      const timeLeftData: {[key: string]: number} = {};
      data.forEach(auction => {
        const endTime = new Date(auction.valid_until);
        const now = new Date();
        const timeDiff = endTime.getTime() - now.getTime();
        timeLeftData[auction.id] = Math.max(0, Math.floor(timeDiff / 1000));
      });
      setTimeLeft(timeLeftData);
    } catch (error) {
      showError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const loadAuctionProducts = async (auctionId: string) => {
    setProductsLoading(true);
    try {
      const data = await auctionService.getAuctionProducts(auctionId);
      setProducts(data);
      
      // Load highest bids for each product
      const bidsData: {[key: string]: any} = {};
      for (const product of data) {
        try {
          const highestBid = await auctionService.getHighestBid(product.id);
          bidsData[product.id] = highestBid;
        } catch (error) {
          bidsData[product.id] = { highest_bid: 0 };
        }
      }
      setProductBids(bidsData);
    } catch (error) {
      showError('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleRegisterForAuction = async (auctionId: string) => {
    try {
      await auctionService.registerForAuction(auctionId);
      showSuccess('Successfully registered for auction!');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to register');
    }
  };

  const handleViewProducts = async (auction: Auction) => {
    setSelectedAuction(auction);
    await loadAuctionProducts(auction.id);
  };

  const handlePlaceBid = async () => {
    if (!selectedProduct || !bidAmount || !user) {
      showError('Please enter a valid bid amount');
      return;
    }

    const amount = parseFloat(bidAmount);
    const currentHighest = productBids[selectedProduct.id]?.highest_bid || 0;
    
    if (amount <= currentHighest) {
      showError(`Bid must be higher than current highest bid of ₹${currentHighest}`);
      return;
    }

    setBidLoading(true);
    try {
      await auctionService.placeBid({
        product_name: selectedProduct.name,
        bid_amount: amount,
        user_id: user.username
      });
      
      showSuccess('Bid placed successfully!');
      setShowBidModal(false);
      setBidAmount('');
      setSelectedProduct(null);
      
      // Refresh product bids
      if (selectedAuction) {
        await loadAuctionProducts(selectedAuction.id);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  const openBidModal = (product: Product) => {
    setSelectedProduct(product);
    setShowBidModal(true);
  };

  const filteredAuctions = auctions.filter(auction =>
    auction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search auctions by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auctions List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Active Auctions</h3>
            
            {filteredAuctions.length === 0 ? (
              <Card>
                <p className="text-center text-slate-500 py-8">No auctions found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAuctions.map((auction) => (
                  <Card key={auction.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-lg">{auction.name}</h4>
                        <p className="text-sm text-slate-600 mb-2">ID: {auction.id}</p>
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Ends: {new Date(auction.valid_until).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm">
                          <Timer className="h-4 w-4 mr-1 text-amber-600" />
                          <span className={`font-medium ${
                            timeLeft[auction.id] <= 0 ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {formatTimeLeft(timeLeft[auction.id] || 0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            timeLeft[auction.id] <= 0
                              ? 'bg-red-100 text-red-800'
                              : timeLeft[auction.id] < 3600
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {timeLeft[auction.id] <= 0 ? 'Ended' : 'Active'}
                          </span>
                        </div>
                        
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewProducts(auction)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Products
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleRegisterForAuction(auction.id)}
                            disabled={timeLeft[auction.id] <= 0}
                          >
                            Register
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Auction Products */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {selectedAuction ? `${selectedAuction.name} Products` : 'Select an Auction'}
            </h3>
            
            <Card>
              {!selectedAuction ? (
                <div className="text-center py-8">
                  <Gavel className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    Click "View Products" on an auction to see its items
                  </p>
                </div>
              ) : productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No products in this auction</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-slate-900">{product.name}</h5>
                          <p className="text-sm text-slate-600">ID: {product.id}</p>
                          {product.description && (
                            <p className="text-sm text-slate-500 mt-1">{product.description}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'sold' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.status === 'sold' ? 'Sold' : 'Available'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>Highest: ₹{productBids[product.id]?.highest_bid || 0}</span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => openBidModal(product)}
                          disabled={product.status === 'sold' || timeLeft[selectedAuction.id] <= 0}
                        >
                          <Gavel className="h-4 w-4 mr-1" />
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
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
              Current Highest Bid: ₹{selectedProduct ? (productBids[selectedProduct.id]?.highest_bid || 0) : 0}
            </p>
          </div>
          
          <Input
            label="Your Bid Amount (₹)"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter your bid amount"
            min={selectedProduct ? (productBids[selectedProduct.id]?.highest_bid || 0) + 1 : 1}
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
            <Button
              onClick={handlePlaceBid}
              loading={bidLoading}
              className="flex-1"
            >
              Place Bid
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};