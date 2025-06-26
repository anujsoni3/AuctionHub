import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Gavel, TrendingUp, Users, Eye, Plus, ArrowRight, BarChart3, Activity, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your auction platform with comprehensive tools and analytics.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Package className="h-6 w-6" />} 
            label="Total Products" 
            value={products.length} 
            color="blue"
            isLoading={isLoading}
          />
          <StatCard 
            icon={<Activity className="h-6 w-6" />} 
            label="Active Auctions" 
            value={activeProducts.length} 
            color="green"
            isLoading={isLoading}
          />
          <StatCard 
            icon={<TrendingUp className="h-6 w-6" />} 
            label="Total Bids" 
            value={bidsCount} 
            color="orange"
            isLoading={isLoading}
          />
          <StatCard 
            icon={<Clock className="h-6 w-6" />} 
            label="Completed" 
            value={expiredProducts.length} 
            color="purple"
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              link="/admin/create-product" 
              icon={<Package className="h-6 w-6" />} 
              title="Add Product" 
              description="Create new product listings"
            />
            <ActionCard 
              link="/admin/create-auction" 
              icon={<Gavel className="h-6 w-6" />} 
              title="Create Auction" 
              description="Launch new auctions"
            />
            <ActionCard 
              link="/admin/products" 
              icon={<Eye className="h-6 w-6" />} 
              title="Manage Products" 
              description="View and edit inventory"
            />
            <ActionCard 
              link="/admin/auctions" 
              icon={<Activity className="h-6 w-6" />} 
              title="View Auctions" 
              description="Monitor auction performance"
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
              Analytics Overview
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard 
              title="Average Bids per Auction"
              value={activeProducts.length > 0 ? Math.round(bidsCount / activeProducts.length) : 0}
              description="Engagement rate per auction"
            />
            <AnalyticsCard 
              title="Completion Rate"
              value={products.length > 0 ? Math.round((expiredProducts.length / products.length) * 100) : 0}
              description="Percentage of completed auctions"
              isPercentage
            />
            <AnalyticsCard 
              title="Active Rate"
              value={products.length > 0 ? Math.round((activeProducts.length / products.length) * 100) : 0}
              description="Currently active auctions"
              isPercentage
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
  isLoading,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  isLoading: boolean;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          {isLoading ? (
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {React.cloneElement(icon, { className: "h-6 w-6" })}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({
  link,
  icon,
  title,
  description,
}: {
  link: string;
  icon: JSX.Element;
  title: string;
  description: string;
}) => (
  <Link
    to={link}
    className="group bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        {React.cloneElement(icon, { className: "h-6 w-6 text-blue-600" })}
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-600">{description}</p>
  </Link>
);

const AnalyticsCard = ({
  title,
  value,
  description,
  isPercentage = false,
}: {
  title: string;
  value: number;
  description: string;
  isPercentage?: boolean;
}) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-900 mb-2">{title}</h4>
    <p className="text-2xl font-bold text-gray-900 mb-1">
      {value}{isPercentage ? '%' : ''}
    </p>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);