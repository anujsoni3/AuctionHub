import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Gavel, TrendingUp, Users, Eye, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { apiService, Product } from '../services/api';

export const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bidsCount, setBidsCount] = useState<number>(0);

  useEffect(() => {
    apiService.getAdminOverview()
      .then(data => {
        setProducts(data.products || []);
        setBidsCount(data.total_bids || 0);
      })
      .catch(console.error);
  }, []);

  const activeProducts = products.filter(p => new Date(p.time) > new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl mb-6 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            Manage your auctions, products and users with powerful admin tools
          </p>
        </div>

        {/* Enhanced Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <StatCard 
            icon={<Package className="h-8 w-8" />} 
            label="Total Products" 
            value={products.length} 
            color="blue"
            trend="+12%"
          />
          <StatCard 
            icon={<Gavel className="h-8 w-8" />} 
            label="Active Auctions" 
            value={activeProducts.length} 
            color="emerald"
            trend="+8%"
          />
          <StatCard 
            icon={<TrendingUp className="h-8 w-8" />} 
            label="Total Bids" 
            value={bidsCount} 
            color="amber"
            trend="+24%"
          />
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard 
            link="/admin/create-product" 
            icon={<Package className="h-10 w-10" />} 
            color="blue" 
            title="Create Product" 
            subtitle="Add new products to your inventory"
            description="Set up new auction items with detailed descriptions"
          />
          <ActionCard 
            link="/admin/create-auction" 
            icon={<Gavel className="h-10 w-10" />} 
            color="emerald" 
            title="Create Auction" 
            subtitle="Start new bidding experiences"
            description="Launch exciting auctions for your products"
          />
          <ActionCard 
            link="/admin/products" 
            icon={<Eye className="h-10 w-10" />} 
            color="indigo" 
            title="View Products" 
            subtitle="Search and manage all products"
            description="Browse, filter and manage your entire inventory"
          />
          <ActionCard 
            link="/admin/auctions" 
            icon={<Gavel className="h-10 w-10" />} 
            color="amber" 
            title="View Auctions" 
            subtitle="Explore all active auctions"
            description="Browse details of all auctions and their products"
          />

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
}> = {
  blue: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-500/20',
  },
  emerald: {
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    gradient: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    text: 'text-amber-600',
    lightBg: 'bg-amber-50',
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-500/20',
  },
  indigo: {
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-600',
    lightBg: 'bg-indigo-50',
    gradient: 'from-indigo-500 to-purple-600',
    ring: 'ring-indigo-500/20',
  },
};

const StatCard = ({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
  color: keyof typeof colorMap;
  trend: string;
}) => (
  <div className={`bg-gradient-to-br ${colorMap[color].gradient} rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 ring-1 ${colorMap[color].ring}`}>
    <div className="flex justify-between items-start mb-6">
      <div className="flex-1">
        <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">{label}</p>
        <p className="text-4xl font-bold mb-1">{value}</p>
        <div className="flex items-center">
          <span className="text-sm font-medium text-white/90 bg-white/20 px-2 py-1 rounded-full">
            {trend}
          </span>
        </div>
      </div>
      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
        {React.cloneElement(icon, { className: "h-8 w-8 text-white" })}
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
}: {
  link: string;
  icon: JSX.Element;
  color: keyof typeof colorMap;
  title: string;
  subtitle: string;
  description: string;
}) => (
  <Link
    to={link}
    className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white"
  >
    <div className="flex items-start space-x-6 mb-6">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorMap[color].gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
        {React.cloneElement(icon, { className: "h-10 w-10 text-white" })}
      </div>
      <div className="flex-1">
        <h3 className={`text-2xl font-bold text-slate-800 mb-2 group-hover:${colorMap[color].text} transition-colors duration-200`}>
          {title}
        </h3>
        <p className="text-slate-600 font-medium mb-2">{subtitle}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
    
    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
      <div className={`flex items-center space-x-2 font-bold ${colorMap[color].text} group-hover:text-slate-800 transition-colors duration-200`}>
        <Plus className="h-5 w-5" />
        <span>Get Started</span>
      </div>
      <ArrowRight className={`h-5 w-5 ${colorMap[color].text} group-hover:translate-x-1 transition-all duration-200`} />
    </div>
  </Link>
);