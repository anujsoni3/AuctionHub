import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Tag } from 'lucide-react';
import { Product } from '../services/api';
import { apiService } from '../services/api';

interface ProductCardProps {
  product: Product;
  showStatus?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showStatus = false }) => {
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

    // Fetch bid and set countdown
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
    updateCountdown(); // in case bid API fails

    const interval = setInterval(updateCountdown, 1000); // real-time countdown
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

  // ✅ Skip rendering if expired
  if (isExpired) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
          {showStatus && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Highest Bid</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              ${highestBid.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Time Left</span>
            </div>
            <span className="font-medium text-blue-600">
              {formatTimeLeft(timeLeft)}
            </span>
          </div>

          {product.auction_id && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Tag className="h-4 w-4" />
              <span>Auction ID: {product.auction_id}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to={`/auction/${product.id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Place Bid
          </Link>
        </div>
      </div>
    </div>
  );
};
