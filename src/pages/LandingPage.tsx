import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Users, Sparkles, Star, Zap, Target, Activity, Shield, Award, Flame, Crown } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { apiService, Product } from '../services/api';

// FeatureCard component for the features section
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  badge: string;
  stats: string;
}> = ({ icon, title, description, color, badge, stats }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-orange-600'
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
      {/* Badge */}
      <div className="absolute -top-3 left-6">
        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-white to-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-lg border border-white/50">
          {badge}
        </span>
      </div>
      
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-3xl mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110`}>
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 text-lg leading-relaxed mb-6">
        {description}
      </p>
      
      {/* Stats */}
      <div className="flex items-center space-x-2 text-slate-500">
        <Activity className="h-4 w-4" />
        <span className="text-sm font-medium">{stats}</span>
      </div>
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
    <div className="min-h-screen">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-10 right-1/4 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-36">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4 mb-12 shadow-2xl">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-bold text-white">Premium Auction Experience</span>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-10 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                Elite Auction
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-blue-100 mb-16 max-w-5xl mx-auto leading-relaxed font-light">
              Experience the thrill of competitive bidding in our 
              <span className="font-bold text-white"> premium auction environment</span>
              <br className="hidden md:block" />
              where extraordinary items meet passionate collectors.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-white to-blue-50 text-blue-900 font-black text-xl rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Target className="relative mr-4 h-7 w-7 text-blue-600" />
                <span className="relative">Explore Auctions</span>
                <ArrowRight className="relative ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link
                to="/admin"
                className="group relative inline-flex items-center px-12 py-6 border-3 border-white/30 bg-white/5 backdrop-blur-xl text-white font-black text-xl rounded-3xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Shield className="relative mr-4 h-7 w-7" />
                <span className="relative">Admin Center</span>
                <ArrowRight className="relative ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>

            {/* Live Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-2xl px-6 py-3">
                <Activity className="h-6 w-6 text-emerald-400" />
                <span className="text-emerald-100 font-bold text-lg">{activeAuctions} Live Auctions</span>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl px-6 py-3">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="text-blue-100 font-bold text-lg">{totalProducts} Total Items</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-28 bg-gradient-to-b from-white via-slate-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-6 py-3 mb-8 shadow-xl">
              <Flame className="h-5 w-5" />
              <span className="font-bold">Why Choose Our Platform</span>
            </div>
            <h2 className="text-5xl font-black text-slate-800 mb-6 leading-tight">
              Revolutionary Auction Experience
            </h2>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Powered by cutting-edge technology and designed for serious collectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<TrendingUp className="h-14 w-14 text-white" />}
              title="Real-Time Bidding"
              description="Lightning-fast bid processing with instant updates and zero-lag competitive bidding experience"
              color="blue"
              badge="Live"
              stats="< 50ms response"
            />
            
            <FeatureCard 
              icon={<Clock className="h-14 w-14 text-white" />}
              title="Smart Timing"
              description="Intelligent auction management with automated scheduling and precision countdown timers"
              color="emerald"
              badge="Automated"
              stats="99.9% uptime"
            />
            
            <FeatureCard 
              icon={<Users className="h-14 w-14 text-white" />}
              title="Voice Assistant"
              description="AI-powered voice commands for hands-free bidding and seamless auction navigation"
              color="purple"
              badge="AI-Powered"
              stats="Voice enabled"
            />
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Secure Transactions</h3>
                  <p className="text-slate-600 font-medium">Bank-grade security</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                Advanced encryption and secure payment processing ensure your transactions are protected with military-grade security protocols.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Premium Quality</h3>
                  <p className="text-slate-600 font-medium">Curated selections</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                Every item is carefully vetted and authenticated by our expert team to ensure you're bidding on genuine, high-quality products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Auctions */}
      <section className="py-28 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl px-6 py-3 mb-8 shadow-xl">
              <Clock className="h-5 w-5" />
              <span className="font-bold">Ending Soon</span>
            </div>
            <h2 className="text-5xl font-black text-slate-800 mb-6 leading-tight">Featured Auctions</h2>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Don't miss out on these exciting auctions with competitive bidding and premium items
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl animate-pulse border border-white/20">
                  <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg mb-6"></div>
                  <div className="h-4 bg-slate-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded-lg mb-6"></div>
                  <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProducts.map((product) => (
                <div key={product.id} className="transform hover:scale-105 transition-all duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
                <Clock className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-3xl font-bold text-slate-600 mb-4">No Active Auctions</h3>
              <p className="text-slate-500 text-xl max-w-md mx-auto leading-relaxed">
                Check back soon for exciting new auction opportunities and premium items
              </p>
            </div>
          )}

          <div className="text-center mt-20">
            <Link
              to="/dashboard"
              className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <TrendingUp className="mr-4 h-7 w-7" />
              View All Auctions
              <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl px-6 py-3 mb-8 shadow-xl">
            <Zap className="h-5 w-5" />
            <span className="font-bold">Start Bidding Today</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Ready to Join the
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Elite Auction Experience?
            </span>
          </h2>
          
          <p className="text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of satisfied bidders in the most advanced auction platform available today
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-white to-blue-50 text-blue-900 font-black text-xl rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Target className="mr-4 h-7 w-7 text-blue-600" />
              Start Bidding Now
              <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link
              to="/admin"
              className="group inline-flex items-center px-12 py-6 border-3 border-white/30 bg-white/5 backdrop-blur-xl text-white font-black text-xl rounded-3xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Crown className="mr-4 h-7 w-7" />
              Admin Access
              <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};