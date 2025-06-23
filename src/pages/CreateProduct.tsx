import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Save, Package, Clock, FileText, Tag, Sparkles, Package2, Star, Zap, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/CreateProduct.css';

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    time: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.createProduct(formData);
      alert('Product created successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Enhanced Navigation */}
        <div className="mb-16">
          <Link
            to="/admin"
            className="group inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-all duration-300 hover:translate-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="font-medium">Back to Admin Panel</span>
          </Link>
          
          <div className="relative">
            {/* Floating Elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-60 blur-2xl animate-float"></div>
            <div className="absolute top-12 -right-12 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-3xl animate-float-delayed"></div>
            
            <div className="relative flex items-center space-x-6">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                  <Package className="h-12 w-12 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Star className="h-3 w-3 text-yellow-800" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Create Product
                  </h1>
                  <div className="flex space-x-2">
                    <Sparkles className="h-7 w-7 text-blue-500 animate-pulse" />
                    <Zap className="h-7 w-7 text-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <TrendingUp className="h-7 w-7 text-indigo-500 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
                <p className="text-xl text-slate-600 font-medium mb-2">
                  Craft your next auction masterpiece with precision and style
                </p>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Transform ideas into profitable auctions</span>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form Container */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
            {/* Enhanced Form Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-10 py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50 animate-pulse"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Package2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                        <span>Product Information</span>
                        <Sparkles className="h-6 w-6 animate-spin" style={{ animationDuration: '3s' }} />
                      </h2>
                      <p className="text-blue-100 mt-1 text-lg">Design your product with attention to detail</p>
                    </div>
                  </div>
                  <div className="hidden md:flex space-x-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              <div className="space-y-10">
                {/* Enhanced ID and Name Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="group relative">
                    <label htmlFor="id" className="flex items-center text-base font-bold text-slate-700 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Tag className="h-5 w-5 text-blue-600" />
                      </div>
                      Product ID *
                      <span className="ml-2 text-xs text-red-500 animate-pulse">Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover:border-slate-300 text-slate-900 placeholder-slate-400 font-medium shadow-inner hover:shadow-lg"
                        placeholder="Enter unique product ID (e.g., P001)"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-focus-within:opacity-100 animate-pulse transition-opacity duration-300"></div>
                    </div>
                  </div>

                  <div className="group relative">
                    <label htmlFor="name" className="flex items-center text-base font-bold text-slate-700 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      Product Name *
                      <span className="ml-2 text-xs text-red-500 animate-pulse">Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-purple-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 group-hover:border-slate-300 text-slate-900 placeholder-slate-400 font-medium shadow-inner hover:shadow-lg"
                        placeholder="Enter captivating product name"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full opacity-0 group-focus-within:opacity-100 animate-pulse transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Description */}
                <div className="group relative">
                  <label htmlFor="description" className="flex items-center text-base font-bold text-slate-700 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    Product Description *
                    <span className="ml-2 text-xs text-red-500 animate-pulse">Required</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-6 py-5 bg-gradient-to-br from-slate-50 to-indigo-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 group-hover:border-slate-300 resize-none text-slate-900 placeholder-slate-400 font-medium shadow-inner hover:shadow-lg"
                      placeholder="Describe your product in detail... What makes it special? What's its story? Why should bidders be excited about it?"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                    <div className="absolute bottom-4 right-4 flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-focus-within:opacity-100 animate-pulse transition-opacity duration-300"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-focus-within:opacity-100 animate-pulse transition-opacity duration-300" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full opacity-0 group-focus-within:opacity-100 animate-pulse transition-opacity duration-300" style={{ animationDelay: '1s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Auction End Time */}
                <div className="group relative">
                  <label htmlFor="time" className="flex items-center text-base font-bold text-slate-700 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    Auction End Time *
                    <span className="ml-2 text-xs text-red-500 animate-pulse">Required</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-emerald-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 group-hover:border-slate-300 text-slate-900 font-medium shadow-inner hover:shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Clock className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Perfect Timing Strategy</p>
                        <p className="text-xs text-emerald-600">Set the deadline to create urgency and maximize bidding activity</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6 pt-12 border-t-2 border-gradient-to-r from-slate-200 to-blue-200">
                  <Link
                    to="/admin"
                    className="group relative px-10 py-5 border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-xl bg-white/50 backdrop-blur-sm"
                  >
                    <span className="flex items-center justify-center space-x-3">
                      <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-2" />
                      <span>Cancel</span>
                    </span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-500/0 to-slate-500/0 group-hover:from-slate-500/5 group-hover:to-slate-500/5 transition-all duration-300"></div>
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative overflow-hidden px-12 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-6 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-indigo-400/0 group-hover:from-blue-400/20 group-hover:via-purple-400/20 group-hover:to-indigo-400/20 transition-all duration-300 animate-pulse"></div>
                    
                    {isLoading ? (
                      <span className="relative flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span>Creating Your Masterpiece...</span>
                      </span>
                    ) : (
                      <span className="relative flex items-center justify-center space-x-3">
                        <Save className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <span>Create Product</span>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Enhanced Footer Elements */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Ready to launch your auction empire</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">Success awaits</span>
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};