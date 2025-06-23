import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Clock, TrendingUp, User, Calendar, Gavel, Trophy, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiService, Product, Bid } from '../services/api';

export const AuctionDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
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

  const getTimeLeftColor = (seconds: number): string => {
    if (seconds <= 0) return 'text-red-600';
    if (seconds <= 3600) return 'text-red-500'; // Less than 1 hour
    if (seconds <= 7200) return 'text-orange-500'; // Less than 2 hours
    return 'text-green-500';
  };

  const getTimeLeftBg = (seconds: number): string => {
    if (seconds <= 0) return 'from-red-500 to-red-600';
    if (seconds <= 3600) return 'from-red-400 to-red-500'; // Less than 1 hour
    if (seconds <= 7200) return 'from-orange-400 to-orange-500'; // Less than 2 hours
    return 'from-green-400 to-green-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl shadow-lg"></div>
              </div>
              <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Auction Not Found</h1>
            <p className="text-gray-600 mb-8">The auction you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft <= 3600 && timeLeft > 0; // Less than 1 hour remaining

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-blue-700 mb-8 transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200 mr-3 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Urgent Notice Banner */}
        {isUrgent && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800">Urgent: Less than 1 hour remaining!</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Product Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Info Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mr-4 shadow-lg">
                      <Gavel className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {product.name}
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                </div>
                <div className="ml-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                    isExpired 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse'
                  }`}>
                    {isExpired ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Ended
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Live Auction
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-200/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-blue-700 mb-2">Current Highest Bid</p>
                    <p className="text-3xl font-bold text-blue-600">${highestBid.toLocaleString()}</p>
                    <div className="mt-2 h-1 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className={`text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border ${
                    isExpired 
                      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200/50' 
                      : isUrgent
                      ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50'
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200/50'
                  }`}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${getTimeLeftBg(timeLeft)} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg ${
                      !isExpired ? 'animate-pulse' : ''
                    } group-hover:rotate-6 transition-transform duration-300`}>
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <p className={`text-sm font-medium mb-2 ${
                      isExpired ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-green-700'
                    }`}>Time Remaining</p>
                    <p className={`text-3xl font-bold ${getTimeLeftColor(timeLeft)} ${
                      !isExpired && isUrgent ? 'animate-pulse' : ''
                    }`}>
                      {formatTimeLeft(timeLeft)}
                    </p>
                    {!isExpired && (
                      <div className={`mt-2 h-1 rounded-full overflow-hidden ${
                        isUrgent ? 'bg-orange-200' : 'bg-green-200'
                      }`}>
                        <div className={`h-full rounded-full ${
                          isUrgent 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse' 
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="group">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-200/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-purple-700 mb-2">Total Participants</p>
                    <p className="text-3xl font-bold text-purple-600">{bids.length}</p>
                    <div className="mt-2 h-1 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bidding Form or Auction Ended Notice */}
            {!isExpired ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 shadow-lg">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Place Your Winning Bid</h3>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200/50">
                  <p className="text-blue-800 font-medium">
                    💡 <strong>Pro Tip:</strong> Your bid must exceed ${highestBid.toLocaleString()} to be valid
                  </p>
                </div>

                <form onSubmit={handlePlaceBid} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="userId" className="block text-sm font-semibold text-gray-700">
                        Bidder ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          id="userId"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80"
                          placeholder="Enter your unique ID"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="newBid" className="block text-sm font-semibold text-gray-700">
                        Your Bid Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                        <input
                          type="number"
                          id="newBid"
                          value={newBid}
                          onChange={(e) => setNewBid(e.target.value)}
                          required
                          min={highestBid + 1}
                          step="0.01"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80"
                          placeholder={`Minimum: ${(highestBid + 1).toLocaleString()}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isBidding}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                    {isBidding ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Processing Your Bid...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Gavel className="h-5 w-5 mr-2" />
                        Submit Winning Bid
                      </div>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-xl border border-red-200/50 p-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-800 mb-4">Auction Has Ended</h3>
                  <p className="text-red-700 text-lg mb-6">
                    This auction has concluded. No more bids can be placed.
                  </p>
                  
                  {/* Final Results */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Final Auction Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200/50">
                        <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm text-yellow-700 font-medium">Winning Bid</p>
                        <p className="text-2xl font-bold text-yellow-800">${highestBid.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200/50">
                        <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-purple-700 font-medium">Total Participants</p>
                        <p className="text-2xl font-bold text-purple-800">{bids.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link 
                      to="/dashboard"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Bid History */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3 shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Live Bid Activity</h3>
                    <p className="text-gray-600 text-sm">{bids.length} competitive bids placed</p>
                  </div>
                </div>
                {bids.length > 0 && (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {bids.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {bids.map((bid, index) => (
                    <div key={index} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200/50 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                            index === 0 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' 
                              : 'bg-gradient-to-br from-blue-400 to-blue-500'
                          }`}>
                            {index === 0 ? (
                              <Trophy className="h-6 w-6 text-white" />
                            ) : (
                              <User className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-bold text-gray-900 text-lg">${bid.amount.toLocaleString()}</p>
                              {index === 0 && (
                                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-full">
                                  LEADING
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">by {bid.user_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatTimestamp(bid.timestamp)}
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            bid.status === 'success' 
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                              : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                          }`}>
                            {bid.status === 'success' ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Confirmed
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Gavel className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No bids yet</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first to place a bid!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};