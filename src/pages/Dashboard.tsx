import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { apiService, Product } from '../services/api';
import { Search, Filter, TrendingUp, Clock, Grid3X3, Activity, Zap, Target, ArrowUpRight, Sparkles, BarChart3 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiService.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(product => {
        const endTime = new Date(product.time);
        const isExpired = now >= endTime;
        return filterStatus === 'expired' ? isExpired : !isExpired;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterStatus]);

  const activeCount = products.filter(p => new Date(p.time) > new Date()).length;
  const expiredCount = products.filter(p => new Date(p.time) <= new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Dashboard Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 mb-12 shadow-2xl border border-white/30 relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                  Smart Auction
                </h1>
                <p className="text-slate-600 text-xl font-semibold">
                  Discover, bid, and win premium items in real-time
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-bold">{activeCount} Live</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{expiredCount} Completed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-xl">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-lg">Live Bidding Active</span>
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-slate-700 font-semibold text-sm">Market Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/30 mb-12 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Search & Filter</h3>
                  <p className="text-slate-600 font-medium">Find the perfect product for you</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-semibold text-sm">Advanced Search</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg text-slate-700 placeholder-slate-400 transition-all duration-300 text-lg font-medium hover:border-slate-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white border-2 border-slate-200 rounded-2xl p-2 shadow-lg">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      filterStatus === 'all'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                      filterStatus === 'active'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>Active</span>
                  </button>
                  <button
                    onClick={() => setFilterStatus('expired')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                      filterStatus === 'expired'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Ended</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Filter Results Info */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-xl">
                    <Grid3X3 className="h-5 w-5 text-slate-600" />
                    <span className="text-slate-700 font-bold">
                      {filteredProducts.length} auction{filteredProducts.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                  
                  {filterStatus !== 'all' && (
                    <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-xl border border-blue-200">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-semibold capitalize">
                        {filterStatus} only
                      </span>
                    </div>
                  )}
                </div>
                
                {searchTerm && (
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-xl border border-blue-200 shadow-lg">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-700 font-bold">
                      Searching: "{searchTerm}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl animate-pulse border border-white/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-blue-100/50"></div>
                <div className="relative z-10">
                  <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl mb-6"></div>
                  <div className="h-5 bg-slate-200 rounded-xl mb-3"></div>
                  <div className="h-5 bg-slate-200 rounded-xl mb-3"></div>
                  <div className="h-5 bg-slate-200 rounded-xl mb-8"></div>
                  <div className="h-14 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
  <div key={product.id} className="transform hover:scale-105 transition-all duration-300 hover:z-10 relative">
    <ProductCard
      product={product}
      showStatus={filterStatus === 'active'}
      showExpired={filterStatus === 'expired'}
    />
  </div>
))}

            </div>
            
            {/* Enhanced Results Footer */}
            <div className="mt-20 text-center">
              <div className="inline-flex items-center space-x-4 bg-white/70 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-2xl border border-white/30">
                <div className="flex items-center space-x-2">
                  <Clock className="h-6 w-6 text-slate-500" />
                  <span className="text-slate-600 font-bold text-lg">
                    Showing all {filteredProducts.length} results
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="flex items-center space-x-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Live updates enabled</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-20 shadow-2xl border border-white/30 max-w-3xl mx-auto relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/50"></div>
              
              <div className="relative z-10">
                <div className="w-32 h-32 mx-auto mb-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-2xl">
                  <Search className="h-16 w-16 text-slate-400" />
                </div>
                <h3 className="text-3xl font-bold text-slate-600 mb-6">No auctions found</h3>
                <p className="text-slate-500 text-xl mb-10 leading-relaxed max-w-lg mx-auto">
                  {searchTerm 
                    ? `No auctions match "${searchTerm}". Try adjusting your search terms or filters.`
                    : `No auctions match your current filter criteria. Try changing your filters.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Clear Search
                    </button>
                  )}
                  {filterStatus !== 'all' && (
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="px-8 py-4 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Show All Auctions
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};