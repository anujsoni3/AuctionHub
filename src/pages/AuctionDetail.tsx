import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Clock, TrendingUp, User, Calendar } from 'lucide-react';
import { apiService, Product, Bid } from '../services/api';

export const AuctionDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
 // const [timeLeft, setTimeLeft] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [newBid, setNewBid] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);
const [endTime, setEndTime] = useState<Date | null>(null);
const [timeLeft, setTimeLeft] = useState<number>(0);

// Fetch auction details including time
useEffect(() => {
  if (!productId) return;

  const fetchData = async () => {
    try {
      const [products, bidsData, timeData, bidData] = await Promise.all([
        apiService.getProducts(),
        apiService.getBids(productId),
        apiService.getTimeLeft(productId),
        apiService.getHighestBid(productId)
      ]);

      const currentProduct = products.find(p => p.id === productId);
      setProduct(currentProduct || null);
      setBids(bidsData);
      setHighestBid(bidData.highest_bid);

      const calculatedEndTime = new Date(Date.now() + timeData.time_remaining_seconds * 1000);
      setEndTime(calculatedEndTime);
    } catch (error) {
      console.error('Error fetching auction details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();

  // Sync from server every 10s
  const syncInterval = setInterval(fetchData, 10000);

  return () => clearInterval(syncInterval);
}, [productId]);

// Real-time countdown based on endTime
useEffect(() => {
  if (!endTime) return;

  const interval = setInterval(() => {
    const secondsRemaining = Math.floor((endTime.getTime() - Date.now()) / 1000);
    setTimeLeft(Math.max(secondsRemaining, 0));
  }, 1000);

  return () => clearInterval(interval);
}, [endTime]);




  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !newBid || !userId) return;

    const bidAmount = parseFloat(newBid);
    if (bidAmount <= highestBid) {
      alert(`Bid must be higher than current highest bid of $${highestBid}`);
      return;
    }

    setIsBidding(true);
    try {
      await apiService.placeBid(productId, bidAmount, userId);
      setNewBid('');
      // Refresh data
      const [bidsData, bidData] = await Promise.all([
        apiService.getBids(productId),
        apiService.getHighestBid(productId)
      ]);
      setBids(bidsData);
      setHighestBid(bidData.highest_bid);
      alert('Bid placed successfully!');
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid. Please try again.');
    } finally {
      setIsBidding(false);
    }
  };

  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) return 'Auction Ended';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-gray-600 text-lg">{product.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isExpired 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isExpired ? 'Ended' : 'Active'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Highest Bid</p>
                  <p className="text-2xl font-bold text-blue-600">${highestBid.toLocaleString()}</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Time Left</p>
                  <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatTimeLeft(timeLeft)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold text-green-600">{bids.length}</p>
                </div>
              </div>
            </div>

            {/* Bidding Form */}
            {!isExpired && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Place Your Bid</h3>
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                        Your User ID
                      </label>
                      <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your user ID"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newBid" className="block text-sm font-medium text-gray-700 mb-2">
                        Bid Amount
                      </label>
                      <input
                        type="number"
                        id="newBid"
                        value={newBid}
                        onChange={(e) => setNewBid(e.target.value)}
                        required
                        min={highestBid + 1}
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Minimum: $${(highestBid + 1).toLocaleString()}`}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isBidding}
                    className="w-full inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBidding ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Placing Bid...
                      </>
                    ) : (
                      'Place Bid'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bid History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Bid History</h3>
              <p className="text-gray-600 text-sm mt-1">{bids.length} bids placed</p>
            </div>
            
            <div className="p-6">
              {bids.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {bids.map((bid, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">${bid.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">by {bid.user_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatTimestamp(bid.timestamp)}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          bid.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No bids placed yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};