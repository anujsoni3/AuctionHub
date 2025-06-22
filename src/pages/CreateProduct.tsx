import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Save, Package, Clock, FileText, Tag, Sparkles, Package2 } from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/CreateProduct.css'; // Importing the CSS file for styles
// Importing the CSS file for styles
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <Link
            to="/admin"
            className="group inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-all duration-200 hover:translate-x-1"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Admin Panel
          </Link>
          
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-30 blur-2xl"></div>
            
            <div className="relative flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <Package className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Create Product
                  </h1>
                  <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
                </div>
                <p className="text-lg text-slate-600">Add a new product to the auction platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Package2 className="h-6 w-6 mr-3" />
              Product Information
            </h2>
            <p className="text-blue-100 mt-1">Fill in the details for your new product</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* ID and Name Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="group">
                  <label htmlFor="id" className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                    Product ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 text-slate-900 placeholder-slate-400"
                      placeholder="e.g., P001"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="name" className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                    <Package className="h-4 w-4 mr-2 text-blue-500" />
                    Product Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 text-slate-900 placeholder-slate-400"
                      placeholder="e.g., Vintage Watch"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label htmlFor="description" className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 resize-none text-slate-900 placeholder-slate-400"
                    placeholder="Provide a detailed description of the product..."
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                </div>
              </div>

              {/* Auction End Time */}
              <div className="group">
                <label htmlFor="time" className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Auction End Time *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 text-slate-900"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                </div>
                <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                  <p className="text-sm text-blue-700 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Set when the auction for this product should end
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-slate-200">
                <Link
                  to="/admin"
                  className="group px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-center hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                    Cancel
                  </span>
                </Link>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                      Create Product
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all duration-200"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Additional Visual Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Ready to create your next auction product</span>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      
    </div>
  );
};