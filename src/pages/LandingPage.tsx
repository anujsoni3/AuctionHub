import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Users, Sparkles, Star, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { apiService, Product } from '../services/api';

export const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await apiService.getProducts();
        setFeaturedProducts(products.slice(0, 3)); // Show first 3 products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-semibold text-white">Premium Auction Experience</span>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
              Premium Auction
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Discover extraordinary items, place competitive bids, and win amazing products in our 
              <span className="font-semibold text-white"> live auction environment</span> powered by cutting-edge technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/dashboard"
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-white to-blue-50 text-blue-900 font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <Zap className="mr-3 h-6 w-6 text-blue-600" />
                Browse Auctions
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link
                to="/admin"
                className="group inline-flex items-center px-10 py-5 border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
              >
                Admin Panel
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of online auctions with our advanced features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110">
                <TrendingUp className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                Live Bidding
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Real-time auction experience with instant bid updates and lightning-fast response times
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110">
                <Clock className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors">
                Time-Based
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Automated auction management with precise timing and smart countdown features
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110">
                <Users className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors">
                Voice Agent
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                AI-powered voice assistance for seamless bidding and hands-free auction participation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Auctions */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full px-6 py-2 mb-6 shadow-lg">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Ending Soon</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Featured Auctions</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
                  <ProductCard key={product.id} product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <Clock className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-600 mb-2">No Active Auctions</h3>
              <p className="text-slate-500 text-lg">Check back soon for exciting new auction opportunities</p>
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              to="/dashboard"
              className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <TrendingUp className="mr-3 h-6 w-6" />
              View All Auctions
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};