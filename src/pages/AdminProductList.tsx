import React, { useEffect, useState } from 'react';
import { Product } from '../services/api';
import { apiService } from '../services/api';
import { Clock, Search, Filter, TrendingUp, Tag, Trash2, Package, Activity, DollarSign, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import { Header } from '../components/Header';

export const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProductsAndBids = async () => {
      try {
        const data = await apiService.getAdminOverview();
        const prods = data.products || [];
        setProducts(prods);

        const bids: Record<string, number> = {};
        await Promise.all(
          prods.map(async (product) => {
            try {
              const res = await apiService.getHighestBid(product.name); // Using name as product_key
              bids[product.name] = res.highest_bid;
            } catch {
              bids[product.name] = 0;
            }
          })
        );
        setHighestBids(bids);
      } catch (err) {
        console.error('Failed to fetch products/bids:', err);
      }
    };

    fetchProductsAndBids();
  }, []);

  const filteredProducts = products.filter((product) => {
    const isMatch = product.name.toLowerCase().includes(search.toLowerCase());
    const isExpired = new Date(product.time) <= new Date();
    if (filter === 'active') return isMatch && !isExpired;
    if (filter === 'expired') return isMatch && isExpired;
    return isMatch;
  });

  const activeProducts = products.filter(p => new Date(p.time) > new Date());
  const expiredProducts = products.filter(p => new Date(p.time) <= new Date());
  const totalBidValue = Object.values(highestBids).reduce((sum, bid) => sum + bid, 0);

  const getTimeRemaining = (endTime: string): string => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = Math.max(0, end.getTime() - now.getTime());
    
    if (diff === 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hrs}h`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div
        className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.06'%3E%3Cpolygon points='30,0 60,30 30,60 0,30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
      />

      <Header />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-2xl">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-indigo-100 bg-clip-text text-transparent mb-4">
            Product Management
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Comprehensive dashboard to search, filter, and manage all auction products with real-time bidding insights
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Active Products</p>
                <p className="text-3xl font-bold text-green-400">{activeProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Expired Products</p>
                <p className="text-3xl font-bold text-red-400">{expiredProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm font-medium">Total Bid Value</p>
                <p className="text-3xl font-bold text-amber-400">${totalBidValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-12 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                Search & Filter Products
              </h2>
              <p className="text-purple-200 text-lg">
                Find and manage products with advanced filtering options
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-purple-100 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-200 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
              
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-purple-100 transition-colors" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full sm:w-52 pl-12 pr-8 py-4 bg-white/20 border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white transition-all duration-200 appearance-none cursor-pointer backdrop-blur-sm"
                >
                  <option value="all" className="bg-slate-800 text-white">All Products</option>
                  <option value="active" className="bg-slate-800 text-white">Active Only</option>
                  <option value="expired" className="bg-slate-800 text-white">Expired Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 inline-block">
            <p className="text-purple-100 font-medium">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> of{' '}
              <span className="text-white font-bold">{products.length}</span> products
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Activity className="h-16 w-16 text-purple-300" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">No Products Found</h3>
            <p className="text-xl text-purple-200 max-w-md mx-auto">
              {search ? 'Try adjusting your search criteria or filters' : 'No products have been added yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const isExpired = new Date(product.time) <= new Date();
              const highestBid = highestBids[product.name] ?? 0;
              const timeLeft = getTimeRemaining(product.time);

              return (
                <div
                  key={product.id}
                  className="group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 hover:-translate-y-2 border border-white/20"
                >
                  {/* Delete Button */}
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                        try {
                          await apiService.deleteProduct(product.id);
                          setProducts((prev) => prev.filter((p) => p.id !== product.id));
                        } catch (err) {
                          alert('Failed to delete product. Check console for details.');
                          console.error('Delete error:', err);
                        }
                      }
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 group/delete"
                    title="Delete Product"
                  >
                    <Trash2 className="h-5 w-5 group-hover/delete:scale-110 transition-transform" />
                  </button>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      isExpired 
                        ? 'bg-red-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        isExpired ? 'bg-red-200' : 'bg-green-200'
                      } animate-pulse`}></div>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  {/* Product Header */}
                  <div className="mt-8 mb-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Product Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-green-800">Highest Bid</span>
                      </div>
                      <span className="text-lg font-bold text-green-700">
                        ${highestBid.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-blue-800">Time Remaining</span>
                      </div>
                      <span className={`text-lg font-bold ${
                        isExpired ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {timeLeft}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-purple-800">Auction ID</span>
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        {product.auction_id || 'Not assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-slate-600">Auction Progress</span>
                      <span className="text-xs font-medium text-slate-600">
                        {isExpired ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isExpired 
                            ? 'bg-gradient-to-r from-red-400 to-red-500 w-full' 
                            : 'bg-gradient-to-r from-green-400 to-green-500 w-3/4'
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Decorative gradient overlay */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    isExpired 
                      ? 'bg-gradient-to-r from-red-500/5 to-red-600/5' 
                      : 'bg-gradient-to-r from-green-500/5 to-emerald-500/5'
                  }`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};