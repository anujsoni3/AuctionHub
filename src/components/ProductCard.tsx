import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, TrendingUp, Tag, Zap, Target, Crown, Star,
  Award, Activity, Eye, Heart, Share2
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
    <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm hover:scale-105 transform">

      {/* Glow hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Status Badge */}
      {showStatus && !isExpired && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl px-4 py-2 shadow-lg">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-bold">Live Auction</span>
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {highestBid > 10000 && !isExpired && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl px-3 py-1.5 shadow-lg">
            <Crown className="h-4 w-4" />
            <span className="text-xs font-bold">Premium</span>
          </div>
        </div>
      )}

      {/* Expired Badge */}
      {isExpired && showExpired && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center space-x-2 bg-red-600 text-white rounded-2xl px-4 py-2 shadow-lg">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-bold">Expired</span>
          </div>
        </div>
      )}

      {/* Urgency Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent">
        <div className={`h-full transition-all duration-1000 ${
          urgencyLevel === 'critical' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
          urgencyLevel === 'urgent' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
          urgencyLevel === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
          'bg-gradient-to-r from-blue-500 to-indigo-500'
        }`}></div>
      </div>

      {/* Content */}
      <div className="relative p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300 leading-tight mb-2">
              {product.name}
            </h3>
            <p className="text-slate-600 text-base leading-relaxed line-clamp-2">
              {product.description}
            </p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Highest Bid */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Current Highest Bid</p>
                  <p className="text-xs text-slate-500">Leading the auction</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-800">
                  ${highestBid.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          <div className={`rounded-2xl p-6 border shadow-inner ${
            urgencyLevel === 'critical' ? 'bg-red-50 border-red-200' :
            urgencyLevel === 'urgent' ? 'bg-orange-50 border-orange-200' :
            urgencyLevel === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
            'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
  className={`p-2 rounded-xl shadow-lg transition-all duration-300 ${
    urgencyLevel === 'critical'
      ? 'bg-gradient-to-br from-red-500 to-pink-600'
      : urgencyLevel === 'urgent'
      ? 'bg-gradient-to-br from-orange-500 to-amber-600'
      : urgencyLevel === 'moderate'
      ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
      : 'bg-gradient-to-br from-emerald-500 to-green-600'
  }`}
>
  <Clock className="h-5 w-5 text-white" />
</div>

                <div>
                  <p className="text-sm font-medium text-slate-600">Time Remaining</p>
                  <p className="text-xs text-slate-500">
                    {isExpired ? 'Auction has ended' :
                      urgencyLevel === 'critical' ? 'Ending very soon!' :
                      urgencyLevel === 'urgent' ? 'Hurry up!' :
                      urgencyLevel === 'moderate' ? 'Don\'t wait too long' :
                      'Plenty of time left'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${
                  urgencyLevel === 'critical' ? 'text-red-600' :
                  urgencyLevel === 'urgent' ? 'text-orange-600' :
                  urgencyLevel === 'moderate' ? 'text-yellow-600' :
                  'text-emerald-600'
                }`}>
                  {formatTimeLeft(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auction ID */}
        {product.auction_id && (
          <div className="flex items-center space-x-3 mb-8 p-4 bg-slate-50/80 rounded-2xl border">
            <div className="p-2 rounded-xl shadow-md bg-gradient-to-br from-slate-500 to-slate-700">
  <Tag className="h-4 w-4 text-white" />
</div>

            <div>
              <p className="text-sm font-medium text-slate-600">Auction Reference</p>
              <p className="text-xs text-slate-500 font-mono">ID: {product.auction_id}</p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Link
  to={isExpired ? "#" : `/auction/${product.id}`}
  onClick={(e) => {
    if (isExpired) e.preventDefault();
  }}
  className={`relative w-full inline-flex justify-center items-center px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300
    ${isExpired
      ? "bg-gray-400 text-white cursor-not-allowed opacity-60"
      : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-2xl hover:scale-105"
    }`}
  aria-disabled={isExpired}
>
  <Target className="h-6 w-6 mr-2" />
  {isExpired ? "Bidding Closed" : "Place Your Bid"}
</Link>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};
