import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { apiService, Product } from '../services/api';
import { Search, Filter, TrendingUp, Clock, Activity, BarChart3 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Auction Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Browse and manage auction items
              </p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">{activeCount} Active</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{expiredCount} Completed</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="font-medium">Live Bidding</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Market Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Search & Filter</h3>
              <p className="text-gray-600 text-sm">Find specific auction items</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                  filterStatus === 'active'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Active</span>
              </button>
              <button
                onClick={() => setFilterStatus('expired')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                  filterStatus === 'expired'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Ended</span>
              </button>
            </div>
          </div>

          {/* Filter Results Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  {filteredProducts.length} auction{filteredProducts.length !== 1 ? 's' : ''} found
                </span>
                
                {filterStatus !== 'all' && (
                  <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                    <Filter className="h-4 w-4" />
                    <span className="capitalize">{filterStatus} only</span>
                  </div>
                )}
              </div>
              
              {searchTerm && (
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Search className="h-4 w-4" />
                  <span>Searching: "{searchTerm}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="hover:shadow-md transition-shadow duration-300">
                  <ProductCard
                    product={product}
                    showStatus={filterStatus === 'active'}
                    showExpired={filterStatus === 'expired'}
                  />
                </div>
              ))}
            </div>
            
            {/* Results Footer */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-4 bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600 font-medium">
                    Showing all {filteredProducts.length} results
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Live updates</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-3">No auctions found</h3>
              <p className="text-gray-500 mb-8">
                {searchTerm 
                  ? `No auctions match "${searchTerm}". Try adjusting your search terms or filters.`
                  : `No auctions match your current filter criteria.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {filterStatus !== 'all' && (
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Show All Auctions
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};