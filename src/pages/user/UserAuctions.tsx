/* ------------------------------------------------------------------ */
/*  UserAuctions.tsx  ––  fully updated                               */
/* ------------------------------------------------------------------ */
import React, { useEffect, useState } from 'react';
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
  Wallet,
  Eye,
  Timer,
  TrendingUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper constants                                                  */
/* ------------------------------------------------------------------ */
const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard',       icon: <Home   className="h-5 w-5" /> },
  { path: '/user/auctions',  label: 'Browse Auctions', icon: <Search className="h-5 w-5" /> },
  { path: '/user/bids',      label: 'My Bids',         icon: <Gavel  className="h-5 w-5" /> },
  { path: '/user/wallet',    label: 'Wallet',          icon: <Wallet className="h-5 w-5" /> },
];


/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export const UserAuctions: React.FC = () => {
  /* ---------------------------- state ----------------------------- */
  const [auctions,       setAuctions]       = useState<Auction[]>([]);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [loading,        setLoading]        = useState(true);

  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [products,         setProducts]       = useState<Product[]>([]);
  const [productsLoading,  setProductsLoading] = useState(false);

  const [productBids,  setProductBids] = useState<Record<string, any>>({});
  const [timeLeft,     setTimeLeft]    = useState<Record<string, number>>({});

  const [showBidModal,   setShowBidModal]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount,       setBidAmount]       = useState('');
  const [bidLoading,      setBidLoading]      = useState(false);

  const { user }                    = useAuth();
  const { showSuccess, showError }  = useToast();

  /* ----------------------------------------------------------------
     1. Load auctions once on mount
  ----------------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await auctionService.getAuctions();
        setAuctions(data);
        /* bootstrap timeLeft so buttons aren't disabled before ticker starts */
        setTimeLeft(
          data.reduce<Record<string, number>>((acc, a) => {
            acc[a.id] = getSecondsLeft(a.valid_until);
            return acc;
          }, {})
        );
      } catch {
        showError('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------------------------------------------------
     2. Global ticker – recompute time left every second
  ----------------------------------------------------------------- */
  useEffect(() => {
    /* No auctions yet? skip */
    if (!auctions.length) return;

    const id = setInterval(() => {
      const now = Date.now();
      setTimeLeft(() =>
        auctions.reduce<Record<string, number>>((acc, a) => {
          acc[a.id] = Math.max(
            0,
            Math.floor(
              (new Date(a.valid_until).getTime() - now) / 1000 // sec
            )
          );
          return acc;
        }, {})
      );
    }, 1_000);

    return () => clearInterval(id);
  }, [auctions]);

  /* ----------------------------------------------------------------
     3. Handlers
  ----------------------------------------------------------------- */
  const handleViewProducts = async (auction: Auction) => {
    setSelectedAuction(auction);
    await loadAuctionProducts(auction.id);
  };

  const loadAuctionProducts = async (auctionId: string) => {
    setProductsLoading(true);
    try {
      const data = await auctionService.getAuctionProducts(auctionId);
      setProducts(data);

      /* fetch highest bid for each product in parallel */
      const bids = await Promise.all(
        data.map(async (p) => {
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

    // —— make sure we actually have a logged‑in user ——
    if (!user?.username) return;

    // —— update that auction’s registrations locally ——
    setAuctions(prev =>
      prev.map(a =>
        a.id === auctionId
          ? ({
              ...a,
              registrations: [
                ...(a.registrations ?? []),
                user.username,            // ← safe: not undefined
              ],
            } as Auction)                 // ← cast keeps the array type
          : a
      )
    );
  } catch (err: any) {
    showError(err.response?.data?.error || 'Failed to register');
  }
};


  const handlePlaceBid = async () => {
    if (!selectedProduct || !bidAmount || !user) {
      showError('Please enter a valid bid amount');
      return;
    }
    const amount          = parseFloat(bidAmount);
    const currentHighest  = productBids[selectedProduct.id]?.highest_bid ?? 0;

    if (amount <= currentHighest) {
      showError(`Bid must be higher than current highest bid of ₹${currentHighest}`);
      return;
    }

    setBidLoading(true);
    try {
      await auctionService.placeBid({
        product_name: selectedProduct.name,
        bid_amount:   amount,
        user_id:      user.username,
      });

      showSuccess('Bid placed successfully!');
      setShowBidModal(false);
      setBidAmount('');
      setSelectedProduct(null);

      /* refresh bids list */
      if (selectedAuction) await loadAuctionProducts(selectedAuction.id);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  /* ----------------------------------------------------------------
     4. Derived helpers
  ----------------------------------------------------------------- */
  const filteredAuctions = auctions.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSecondsLeft = (validUntilISO: string) => {
    return Math.max(
      0,
      Math.floor((new Date(validUntilISO).getTime() - Date.now()) / 1000)
    );
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    const d = Math.floor(seconds / (24 * 60 * 60));
    const h = Math.floor((seconds % (24 * 60 * 60)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d) return `${d}d ${h}h ${m}m`;
    if (h) return `${h}h ${m}m`;
    return `${m}m`;
  };

  /* ----------------------------------------------------------------
     5. Early‑return while loading
  ----------------------------------------------------------------- */
  if (loading) {
    return (
      <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  const openBidModal = (product: Product) => {
  setSelectedProduct(product);
  setShowBidModal(true);
};

  /* ----------------------------------------------------------------
     6. Render
  ----------------------------------------------------------------- */
  return (
    <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        {/* ---------- Search --------- */}
        <Card>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search auctions by name or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================================
                6‑A  Active Auctions List
          ============================================================ */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Active Auctions</h3>

            {filteredAuctions.length === 0 ? (
              <Card>
                <p className="text-center text-slate-500 py-8">No auctions found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAuctions.map((auction) => {
                  const secondsLeft  = timeLeft[auction.id] ?? getSecondsLeft(auction.valid_until);
                  const isOver       = secondsLeft <= 0;
                  const isRegistered = !!user?.username && auction.registrations?.includes(user.username);


                  return (
                    <Card key={auction.id} className="hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        {/* ----------------------------------------- */}
                        {/* left side                               */}
                        {/* ----------------------------------------- */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 text-lg">{auction.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">ID: {auction.id}</p>

                          <div className="flex items-center text-sm text-slate-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Ends: {new Date(auction.valid_until).toLocaleString()}</span>
                          </div>

                          <div className="flex items-center mt-1 text-sm">
                            <Timer className="h-4 w-4 mr-1 text-amber-600" />
                            <span
                              className={`font-medium ${
                                isOver ? 'text-red-600' : 'text-amber-600'
                              }`}
                            >
                              {formatTimeLeft(secondsLeft)}
                            </span>
                          </div>
                        </div>

                        {/* ----------------------------------------- */}
                        {/* right side                               */}
                        {/* ----------------------------------------- */}
                        <div className="text-right space-y-2">
                          {/* status pill */}
                          <div className="text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isOver
                                  ? 'bg-red-100 text-red-800'
                                  : secondsLeft < 3600
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {isOver ? 'Ended' : 'Active'}
                            </span>
                          </div>

                          {/* actions */}
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewProducts(auction)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Products
                            </Button>

                            {isRegistered ? (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs inline-block">
                                Registered
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleRegisterForAuction(auction.id)}
                                disabled={isOver}
                              >
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

          {/* ============================================================
                6‑B  Products for Selected Auction
          ============================================================ */}
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
  {products.map((product) => {
    const isRegistered =
      !!user?.username && selectedAuction?.registrations?.includes(user.username);
    const isEnded = timeLeft[selectedAuction?.id ?? ''] <= 0;

    return (
      <div
        key={product.id}
        className="p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
      >
        {/* Product header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h5 className="font-medium text-slate-900">{product.name}</h5>
            <p className="text-sm text-slate-600">ID: {product.id}</p>
            {product.description && (
              <p className="text-sm text-slate-500 mt-1">{product.description}</p>
            )}
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.status === 'sold'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {product.status === 'sold' ? 'Sold' : 'Available'}
          </span>
        </div>

        {/* Product bidding row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Highest: ₹{productBids[product.id]?.highest_bid || 0}</span>
          </div>

          {isRegistered ? (
            <Button
              size="sm"
              onClick={() => openBidModal(product)}
              disabled={product.status === 'sold' || isEnded}
            >
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

      {/* ============================================================
            6‑C  Bid modal
      ============================================================ */}
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
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter your bid amount"
            min={
              selectedProduct ? (productBids[selectedProduct.id]?.highest_bid ?? 0) + 1 : 1
            }
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

/* ------------------------------------------------------------------ */
/*  Tiny helpers                                                      */
/* ------------------------------------------------------------------ */
const EmptyState = () => (
  <div className="text-center py-8">
    <Gavel className="h-12 w-12 text-slate-300 mx-auto mb-3" />
    <p className="text-slate-500">Click &quot;View Products&quot; on an auction to see its items</p>
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
  </div>
);
