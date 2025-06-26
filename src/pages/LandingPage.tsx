import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Users, Shield, Award, Activity } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { apiService, Product } from '../services/api';

// FeatureCard component for the features section
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: string;
}> = ({ icon, title, description, stats }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{stats}</p>
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await apiService.getProducts();
        setFeaturedProducts(products.slice(0, 3)); // Show first 3 products
        setTotalProducts(products.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const activeAuctions = featuredProducts.filter(p => new Date(p.time) > new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Auction Platform
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              A reliable and secure platform for conducting professional auctions 
              with real-time bidding and comprehensive management tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-sm"
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                Browse Auctions
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                <Shield className="mr-3 h-5 w-5" />
                Admin Panel
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2 text-green-600">
                <Activity className="h-5 w-5" />
                <span className="font-medium">{activeAuctions} Active Auctions</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">{totalProducts} Total Items</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with modern technology to provide a seamless auction experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <FeatureCard 
              icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
              title="Real-Time Bidding"
              description="Instant bid processing with live updates and reliable performance for all users."
              stats="< 100ms response"
            />
            
            <FeatureCard 
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              title="Automated Management"
              description="Smart scheduling and countdown timers with reliable automation systems."
              stats="99.9% uptime"
            />
            
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-blue-600" />}
              title="Voice Commands"
              description="AI-powered voice assistance for hands-free bidding and navigation."
              stats="Voice enabled"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Secure Transactions</h3>
                  <p className="text-sm text-gray-500">Bank-grade security</p>
                </div>
              </div>
              <p className="text-gray-600">
                Advanced encryption and secure payment processing ensure all transactions are protected with industry-standard security protocols.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Quality Assurance</h3>
                  <p className="text-sm text-gray-500">Verified items</p>
                </div>
              </div>
              <p className="text-gray-600">
                All items are carefully reviewed and verified by our team to ensure authenticity and quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Auctions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Current auctions available for bidding with competitive pricing
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Auctions</h3>
              <p className="text-gray-500">
                Please check back later for new auction opportunities
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-sm"
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              View All Auctions
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Bidding?
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join our professional auction platform and participate in live bidding events
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Browse Auctions
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center px-8 py-4 border border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              <Shield className="mr-3 h-5 w-5" />
              Admin Access
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};