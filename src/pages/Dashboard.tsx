import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { apiService, Product } from '../services/api';
import { Search, Filter, TrendingUp, Clock, Grid3X3,} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Dashboard Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 mb-12 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Auction Dashboard
                  </h1>
                  <p className="text-slate-600 text-lg font-medium mt-1">
                    Monitor and participate in live auctions
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">Live Auctions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Search & Filter</h3>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search auctions by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-slate-700 placeholder-slate-400 transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              
              
            </div>
          </div>

          {/* Filter Results Info */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Grid3X3 className="h-5 w-5 text-slate-500" />
                <span className="text-slate-600 font-medium">
                  {filteredProducts.length} auction{filteredProducts.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
              {searchTerm && (
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    Searching for: "{searchTerm}"
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl animate-pulse border border-white/20">
                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg mb-6"></div>
                <div className="h-4 bg-slate-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-slate-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-slate-200 rounded-lg mb-6"></div>
                <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="transform hover:scale-105 transition-all duration-300">
                  <ProductCard product={product} showStatus={true} />
                </div>
              ))}
            </div>
            
            {/* Pagination or Load More could go here */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
                <Clock className="h-5 w-5 text-slate-500" />
                <span className="text-slate-600 font-medium">
                  Showing all {filteredProducts.length} results
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-600 mb-4">No auctions found</h3>
              <p className="text-slate-500 text-lg mb-8">
                {searchTerm 
                  ? `No auctions match "${searchTerm}". Try adjusting your search terms.`
                  : "No auctions match your current filter criteria."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};