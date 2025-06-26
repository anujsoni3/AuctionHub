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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Auction Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage all auctions with comprehensive analytics
          </p>
          
          {/* Summary Stats */}
          <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{auctions.length}</div>
                <div className="text-sm text-gray-600">Total Auctions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {auctions.filter(a => isAuctionActive(a.valid_until)).length}
                </div>
                <div className="text-sm text-gray-600">Active Auctions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {auctions.reduce((sum, a) => sum + a.product_ids.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* Auctions List */}
        {auctions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Auctions Found</h3>
            <p className="text-gray-600">Start by creating your first auction to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => {
              const isActive = isAuctionActive(auction.valid_until);
              const timeRemaining = getTimeRemaining(auction.valid_until);
              
              return (
                <div 
                  key={auction.id} 
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {auction.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Valid Until</div>
                        <div className="text-xs text-gray-500">
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

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Time Remaining</div>
                        <div className={`text-xs font-medium ${
                          isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {timeRemaining}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Products</div>
                        <div className="text-xs text-gray-500">
                          {auction.product_ids.length} item{auction.product_ids.length !== 1 ? 's' : ''} listed
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/admin/auction/${auction.id}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};