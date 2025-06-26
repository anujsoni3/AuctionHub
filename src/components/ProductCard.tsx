import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, TrendingUp, Tag, Target
} from 'lucide-react';
import { Product } from '../services/api';
import { apiService } from '../services/api';

interface ProductCardProps {
  product: Product;
  showStatus?: boolean;
  showExpired?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showStatus = false, showExpired = false }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const endTime = new Date(product.time).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const secondsLeft = Math.floor((endTime - now) / 1000);
      setTimeLeft(Math.max(secondsLeft, 0));
      setIsExpired(secondsLeft <= 0);
    };

    const fetchInitialData = async () => {
      try {
        const bidData = await apiService.getHighestBid(product.id);
        setHighestBid(bidData.highest_bid);
        updateCountdown();
      } catch (error) {
        console.error('Error fetching bid:', error);
      }
    };

    fetchInitialData();
    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [product]);

  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getUrgencyLevel = (seconds: number) => {
    if (seconds <= 300) return 'critical';
    if (seconds <= 3600) return 'urgent';
    if (seconds <= 86400) return 'moderate';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel(timeLeft);

  // ✅ Skip if expired and not asked to show
  if (isExpired && !showExpired) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Status Badges */}
      <div className="p-4 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-2">
            {showStatus && !isExpired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live Auction
              </span>
            )}
            
            {highestBid > 10000 && !isExpired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Premium
              </span>
            )}
            
            {isExpired && showExpired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Product Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Product Stats */}
        <div className="space-y-3 mb-6">
          {/* Highest Bid */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Current Highest Bid</p>
                <p className="text-xs text-blue-700">Leading the auction</p>
              </div>
            </div>
            <span className="text-xl font-bold text-blue-900">
              ${highestBid.toLocaleString()}
            </span>
          </div>

          {/* Time Remaining */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            urgencyLevel === 'critical' 
              ? 'bg-red-50 border-red-200' 
              : urgencyLevel === 'urgent' 
              ? 'bg-orange-50 border-orange-200' 
              : urgencyLevel === 'moderate' 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Clock className={`h-4 w-4 ${
                urgencyLevel === 'critical' 
                  ? 'text-red-600' 
                  : urgencyLevel === 'urgent' 
                  ? 'text-orange-600' 
                  : urgencyLevel === 'moderate' 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  urgencyLevel === 'critical' 
                    ? 'text-red-900' 
                    : urgencyLevel === 'urgent' 
                    ? 'text-orange-900' 
                    : urgencyLevel === 'moderate' 
                    ? 'text-yellow-900' 
                    : 'text-green-900'
                }`}>
                  Time Remaining
                </p>
                <p className={`text-xs ${
                  urgencyLevel === 'critical' 
                    ? 'text-red-700' 
                    : urgencyLevel === 'urgent' 
                    ? 'text-orange-700' 
                    : urgencyLevel === 'moderate' 
                    ? 'text-yellow-700' 
                    : 'text-green-700'
                }`}>
                  {isExpired ? 'Auction has ended' :
                    urgencyLevel === 'critical' ? 'Ending very soon!' :
                    urgencyLevel === 'urgent' ? 'Hurry up!' :
                    urgencyLevel === 'moderate' ? 'Don\'t wait too long' :
                    'Plenty of time left'}
                </p>
              </div>
            </div>
            <span className={`text-xl font-bold ${
              urgencyLevel === 'critical' 
                ? 'text-red-600' 
                : urgencyLevel === 'urgent' 
                ? 'text-orange-600' 
                : urgencyLevel === 'moderate' 
                ? 'text-yellow-600' 
                : 'text-green-600'
            }`}>
              {formatTimeLeft(timeLeft)}
            </span>
          </div>
        </div>

        {/* Auction ID */}
        {product.auction_id && (
          <div className="flex items-center space-x-2 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Tag className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Auction Reference</p>
              <p className="text-xs text-gray-600 font-mono">ID: {product.auction_id}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="p-4 pt-0">
        <Link
          to={isExpired ? "#" : `/auction/${product.id}`}
          onClick={(e) => {
            if (isExpired) e.preventDefault();
          }}
          className={`w-full inline-flex justify-center items-center px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
            isExpired
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          aria-disabled={isExpired}
        >
          <Target className="h-4 w-4 mr-2" />
          {isExpired ? "Bidding Closed" : "Place Your Bid"}
        </Link>
      </div>
    </div>
  );
};