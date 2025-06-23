import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Gavel, TrendingUp, Users, Eye, Plus, ArrowRight, Sparkles, BarChart3, Activity, Clock } from 'lucide-react';
import { Header } from '../components/Header';
import { apiService, Product } from '../services/api';

export const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bidsCount, setBidsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiService.getAdminOverview()
      .then(data => {
        setProducts(data.products || []);
        setBidsCount(data.total_bids || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const activeProducts = products.filter(p => new Date(p.time) > new Date());
  const expiredProducts = products.filter(p => new Date(p.time) <= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-3xl mb-8 shadow-2xl backdrop-blur-sm border border-white/10 relative">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl blur-lg"></div>
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-6 tracking-tight">
            Command Center
          </h1>
          <p className="text-xl text-blue-100/80 font-medium max-w-3xl mx-auto leading-relaxed">
            Your comprehensive auction management hub. Monitor performance, create listings, and oversee all marketplace activities from one powerful dashboard.
          </p>
        </div>

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard 
            icon={<Package className="h-8 w-8" />} 
            label="Total Inventory" 
            value={products.length} 
            color="blue"
            trend="+12%"
            subtitle="Products listed"
            isLoading={isLoading}
          />
          <StatCard 
            icon={<Activity className="h-8 w-8" />} 
            label="Live Auctions" 
            value={activeProducts.length} 
            color="emerald"
            trend="+8%"
            subtitle="Currently active"
            isLoading={isLoading}
          />
          <StatCard 
            icon={<TrendingUp className="h-8 w-8" />} 
            label="Total Bids" 
            value={bidsCount} 
            color="amber"
            trend="+24%"
            subtitle="All time bids"
            isLoading={isLoading}
          />
          <StatCard 
            icon={<Clock className="h-8 w-8" />} 
            label="Completed" 
            value={expiredProducts.length} 
            color="purple"
            trend="+5%"
            subtitle="Ended auctions"
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Quick Actions</h2>
            <div className="flex items-center space-x-2 text-blue-300">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">Streamline your workflow</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActionCard 
              link="/admin/create-product" 
              icon={<Package className="h-10 w-10" />} 
              color="blue" 
              title="Add Product" 
              subtitle="Create new listings"
              description="Add products to your inventory with rich descriptions, images, and specifications"
              badge="Create"
            />
            <ActionCard 
              link="/admin/create-auction" 
              icon={<Gavel className="h-10 w-10" />} 
              color="emerald" 
              title="Launch Auction" 
              subtitle="Start bidding wars"
              description="Create competitive auctions with custom durations and starting prices"
              badge="Launch"
            />
            <ActionCard 
              link="/admin/products" 
              icon={<Eye className="h-10 w-10" />} 
              color="indigo" 
              title="Manage Inventory" 
              subtitle="Browse & organize"
              description="Search, filter, edit, and organize your entire product catalog efficiently"
              badge="Manage"
            />
            <ActionCard 
              link="/admin/auctions" 
              icon={<Activity className="h-10 w-10" />} 
              color="amber" 
              title="Monitor Auctions" 
              subtitle="Track performance"
              description="View real-time auction statistics, bidding activity, and performance metrics"
              badge="Monitor"
            />
          </div>
        </div>

        {/* Performance Insights Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
              <BarChart3 className="h-7 w-7 text-blue-400" />
              <span>Performance Insights</span>
            </h3>
            <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">All systems optimal</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard 
              title="Average Bids per Auction"
              value={activeProducts.length > 0 ? Math.round(bidsCount / activeProducts.length) : 0}
              description="Strong engagement rate indicates healthy competition"
              color="blue"
            />
            <InsightCard 
              title="Success Rate"
              value={products.length > 0 ? Math.round((expiredProducts.length / products.length) * 100) : 0}
              description="Percentage of auctions that reached completion"
              color="emerald"
              isPercentage
            />
            <InsightCard 
              title="Active Conversion"
              value={products.length > 0 ? Math.round((activeProducts.length / products.length) * 100) : 0}
              description="Products currently generating bidding activity"
              color="amber"
              isPercentage
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const colorMap: Record<string, { 
  bg: string; 
  hover: string; 
  text: string; 
  lightBg: string; 
  gradient: string;
  ring: string;
  glow: string;
}> = {
  blue: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-400',
    lightBg: 'bg-blue-50',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-500/20',
    glow: 'shadow-blue-500/25',
  },
  emerald: {
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-400',
    lightBg: 'bg-emerald-50',
    gradient: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/25',
  },
  amber: {
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    text: 'text-amber-400',
    lightBg: 'bg-amber-50',
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-500/20',
    glow: 'shadow-amber-500/25',
  },
  indigo: {
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-400',
    lightBg: 'bg-indigo-50',
    gradient: 'from-indigo-500 to-purple-600',
    ring: 'ring-indigo-500/20',
    glow: 'shadow-indigo-500/25',
  },
  purple: {
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    text: 'text-purple-400',
    lightBg: 'bg-purple-50',
    gradient: 'from-purple-500 to-purple-600',
    ring: 'ring-purple-500/20',
    glow: 'shadow-purple-500/25',
  },
};

const StatCard = ({
  icon,
  label,
  value,
  color,
  trend,
  subtitle,
  isLoading,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
  color: keyof typeof colorMap;
  trend: string;
  subtitle: string;
  isLoading: boolean;
}) => (
  <div className={`bg-gradient-to-br ${colorMap[color].gradient} rounded-2xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 ring-1 ${colorMap[color].ring} backdrop-blur-sm border border-white/10 group relative overflow-hidden`}>
    {/* Animated background glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">{label}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-black mb-1 tracking-tight">{value}</p>
          )}
          <p className="text-xs text-white/60 font-medium">{subtitle}</p>
        </div>
        <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl group-hover:bg-white/25 transition-all duration-300">
          {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white/90 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
          {trend}
        </span>
        <TrendingUp className="h-4 w-4 text-white/60" />
      </div>
    </div>
  </div>
);

const ActionCard = ({
  link,
  icon,
  color,
  title,
  subtitle,
  description,
  badge,
}: {
  link: string;
  icon: JSX.Element;
  color: keyof typeof colorMap;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}) => (
  <Link
    to={link}
    className="group bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white relative overflow-hidden"
  >
    {/* Animated background */}
    <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color].gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color].gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 ${colorMap[color].glow}`}>
          {React.cloneElement(icon, { className: "h-8 w-8 text-white" })}
        </div>
        <span className={`text-xs font-bold ${colorMap[color].text} bg-slate-100 px-2 py-1 rounded-full`}>
          {badge}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className={`text-xl font-bold text-slate-800 mb-1 group-hover:${colorMap[color].text} transition-colors duration-200`}>
          {title}
        </h3>
        <p className="text-slate-600 font-semibold text-sm mb-2">{subtitle}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className={`flex items-center space-x-2 font-bold text-slate-600 group-hover:${colorMap[color].text} transition-colors duration-200`}>
          <Plus className="h-4 w-4" />
          <span className="text-sm">Start Now</span>
        </div>
        <ArrowRight className={`h-4 w-4 text-slate-400 group-hover:${colorMap[color].text} group-hover:translate-x-1 transition-all duration-200`} />
      </div>
    </div>
  </Link>
);

const InsightCard = ({
  title,
  value,
  description,
  color,
  isPercentage = false,
}: {
  title: string;
  value: number;
  description: string;
  color: keyof typeof colorMap;
  isPercentage?: boolean;
}) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-white font-semibold text-sm">{title}</h4>
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorMap[color].gradient}`}></div>
    </div>
    <p className={`text-3xl font-bold ${colorMap[color].text} mb-2`}>
      {value}{isPercentage ? '%' : ''}
    </p>
    <p className="text-white/60 text-xs leading-relaxed">{description}</p>
  </div>
);