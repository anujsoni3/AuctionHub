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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          </div>
          <p className="text-gray-600">
            Manage and monitor all auction products with comprehensive dashboard insights
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{activeProducts.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Products</p>
                <p className="text-2xl font-bold text-red-600">{expiredProducts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bid Value</p>
                <p className="text-2xl font-bold text-blue-600">${totalBidValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Search & Filter Products
              </h2>
              <p className="text-gray-600">
                Find and manage products with advanced filtering options
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full sm:w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 inline-block">
            <p className="text-blue-800 text-sm font-medium">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">
              {search ? 'Try adjusting your search criteria or filters' : 'No products have been added yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isExpired = new Date(product.time) <= new Date();
              const highestBid = highestBids[product.name] ?? 0;
              const timeLeft = getTimeRemaining(product.time);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header with status and delete */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isExpired 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>

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
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="mb-6">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Product Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Highest Bid</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        ${highestBid.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Time Remaining</span>
                      </div>
                      <span className={`text-lg font-semibold ${
                        isExpired ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {timeLeft}
                      </span>
                    </div>

                    {product.auction_id && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Auction ID</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {product.auction_id}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>Auction Status</span>
                      <span>{isExpired ? 'Completed' : 'Active'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isExpired 
                            ? 'bg-red-500 w-full' 
                            : 'bg-green-500 w-3/4'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};