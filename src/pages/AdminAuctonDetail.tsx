// src/pages/AdminAuctionDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { apiService, Product } from '../services/api';
import { Clock, ArrowLeft, Package, Tag, Calendar, Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminAuctionDetail: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (auctionId) {
      apiService.getAuctionProducts(auctionId)
        .then((res) => setProducts(res.products || []))
        .catch(console.error);
    }
  }, [auctionId]);

  const getTimeRemaining = (timeString: string) => {
    const now = new Date();
    const endTime = new Date(timeString);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const activeProducts = products.filter(p => new Date(p.time) > new Date());
  const expiredProducts = products.filter(p => new Date(p.time) <= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2240%22%20height=%2240%22%20viewBox=%220%200%2040%2040%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.08%22%3E%3Cpath%20d=%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <Header />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link 
            to="/admin/auctions" 
            className="group inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Auctions</span>
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-2xl">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-indigo-100 bg-clip-text text-transparent mb-4">
              Auction Products
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Detailed view of all products in this auction with real-time status tracking
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
                  <p className="text-amber-200 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {products.length > 0 ? Math.round((activeProducts.length / products.length) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Activity className="h-16 w-16 text-purple-300" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">No Products Found</h3>
            <p className="text-xl text-purple-200 max-w-md mx-auto">
              This auction doesn't have any products associated with it yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const isExpired = new Date(product.time) <= new Date();
              const timeRemaining = getTimeRemaining(product.time);
              
              return (
                <div 
                  key={product.id} 
                  className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
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
                  <div className="mb-6 pt-4">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700">End Time</p>
                          <p className="text-xs text-slate-500">
                            {new Date(product.time).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Time Remaining</p>
                          <p className={`text-xs font-bold ${
                            isExpired ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {timeRemaining}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
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