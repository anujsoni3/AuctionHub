import React, { useEffect, useState } from 'react';
import { Product } from '../services/api';
import { apiService } from '../services/api';
import { Clock, Search, Filter, TrendingUp, Tag } from 'lucide-react';
import { Header } from '../components/Header';
import { Trash2 } from 'lucide-react'; // Add this at the top with other icons

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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  Manage Products
                </h2>
                <p className="text-slate-600 text-lg font-medium">
                  Search, filter and view all auction products with ease
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-72 pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="w-full sm:w-44 pl-10 pr-8 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="all">All Products</option>
                    <option value="active">Active Only</option>
                    <option value="expired">Expired Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No products found</h3>
              <p className="text-slate-500">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const isExpired = new Date(product.time) <= new Date();
                const highestBid = highestBids[product.name] ?? '—';

                return (
                  <div
                    key={product.id}
                    className="group bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col justify-between hover:scale-[1.02] hover:bg-white"
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
    className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
    title="Delete Product"
  >
    <Trash2 className="h-5 w-5" />
  </button>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Highest Bid</span>
                        </div>
                        <span className="text-slate-800 font-semibold">${highestBid}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Time Left</span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {isExpired ? 'Expired' : timeRemaining(product.time)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Tag className="h-4 w-4" />
                        <span>Auction ID: {product.auction_id || '—'}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                          isExpired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Time remaining helper
function timeRemaining(endTime: string): string {
  const now = new Date();
  const end = new Date(endTime);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
}
