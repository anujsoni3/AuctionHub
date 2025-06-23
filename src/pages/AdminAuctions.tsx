// New file: src/pages/AdminAuctions.tsx
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { apiService } from '../services/api';
import { Eye, Clock, Package, Calendar, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Auction {
  id: string;
  name: string;
  valid_until: string;
  product_ids: string[];
}

export const AdminAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    apiService.getAllAuctions()
      .then((res) => setAuctions(res.auctions || []))
      .catch(console.error);
  }, []);

  const isAuctionActive = (validUntil: string) => {
    return new Date(validUntil) > new Date();
  };

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const endTime = new Date(validUntil);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background decorative elements */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <Header />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-2xl">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-indigo-100 bg-clip-text text-transparent mb-4">
            Auction Management
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Monitor and manage all active auctions with real-time insights and comprehensive analytics
          </p>
          
          {/* Stats Bar */}
          <div className="mt-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{auctions.length}</div>
                  <div className="text-sm text-purple-200">Total Auctions</div>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {auctions.filter(a => isAuctionActive(a.valid_until)).length}
                  </div>
                  <div className="text-sm text-purple-200">Active</div>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {auctions.reduce((sum, a) => sum + a.product_ids.length, 0)}
                  </div>
                  <div className="text-sm text-purple-200">Total Products</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        {auctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="h-12 w-12 text-purple-300" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Auctions Found</h3>
            <p className="text-purple-200">Start by creating your first auction to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((auction) => {
              const isActive = isAuctionActive(auction.valid_until);
              const timeRemaining = getTimeRemaining(auction.valid_until);
              
              return (
                <div 
                  key={auction.id} 
                  className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  {/* Auction Title */}
                  <div className="mb-6 pt-4">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
                      {auction.name}
                    </h3>
                  </div>

                  {/* Auction Details */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="h-5 w-5 mr-3 text-indigo-500" />
                      <div>
                        <div className="text-sm font-medium">Valid Until</div>
                        <div className="text-xs text-slate-500">
                          {new Date(auction.valid_until).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-600">
                      <Clock className="h-5 w-5 mr-3 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Time Remaining</div>
                        <div className={`text-xs font-medium ${
                          isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {timeRemaining}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-600">
                      <Package className="h-5 w-5 mr-3 text-amber-500" />
                      <div>
                        <div className="text-sm font-medium">Products</div>
                        <div className="text-xs text-slate-500">
                          {auction.product_ids.length} item{auction.product_ids.length !== 1 ? 's' : ''} listed
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/admin/auction/${auction.id}`}
                    className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Eye className="h-5 w-5 mr-2 transition-transform group-hover/btn:rotate-12" />
                    <span>View Auction Details</span>
                  </Link>

                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};