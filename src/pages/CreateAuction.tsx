import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Save, Gavel, Plus, X, CheckCircle2, Clock, Package2, Sparkles, Calendar, Trophy, Zap, Star, ChevronRight } from 'lucide-react';
import { apiService, Product } from '../services/api';
import '../styles/CreateAuction.css'; 

export const CreateAuction: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    valid_until: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await apiService.getAdminProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      alert('Please select at least one product for the auction.');
      return;
    }

    setIsLoading(true);

    try {
      await apiService.createAuction({
        ...formData,
        product_ids: selectedProducts,
      });
      alert('Auction created successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating auction:', error);
      alert('Failed to create auction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getSelectedProductDetails = () => {
    return availableProducts.filter(p => selectedProducts.includes(p.id));
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 relative overflow-hidden">
     
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-blue-50/30"></div>

    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

    <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200/15 to-pink-200/15 rounded-full blur-2xl animate-pulse animation-delay-4000"></div>
    
      <Header />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Breadcrumb */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-emerald-600 font-medium">Create Auction</span>
          </div>
          
          <Link
            to="/admin"
            className="group inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-all duration-300 hover:translate-x-1 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/60 hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Admin Panel
          </Link>
          
          <div className="relative">
            {/* Enhanced Background decoration */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-40 blur-2xl animate-pulse"></div>
            <div className="absolute top-12 -right-12 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-25 blur-3xl animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-30 blur-xl animate-pulse animation-delay-4000"></div>
            
            <div className="relative flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl blur-lg opacity-25 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30">
                  <Gavel className="h-12 w-12 text-white animate-bounce" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                    Create Auction
                  </h1>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-7 w-7 text-emerald-500 animate-pulse" />
                    <Trophy className="h-6 w-6 text-yellow-500 animate-bounce animation-delay-1000" />
                  </div>
                </div>
                <p className="text-xl text-slate-600 font-medium mb-2">Set up a new auction with selected products</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Lightning Fast Setup</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Scheduled Launch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Enhanced Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-3xl blur-lg"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
              <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-8 py-8">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Auction Details</h3>
                      <p className="text-emerald-100 text-sm font-medium">Configure your auction settings</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse animation-delay-500"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-1000"></div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-10">
                  <div className="group">
                    <label htmlFor="id" className="block text-sm font-bold text-slate-700 mb-4 flex items-center space-x-2">
                      <span>Auction ID</span>
                      <span className="text-red-500">*</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-lg text-lg font-medium placeholder-slate-400"
                        placeholder="e.g., A001, FLASH2024, MEGA_SALE"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-4 flex items-center space-x-2">
                      <span>Auction Name</span>
                      <span className="text-red-500">*</span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-500"></div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-lg text-lg font-medium placeholder-slate-400"
                        placeholder="e.g., Flash Sale June, Premium Electronics Auction"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="valid_until" className="block text-sm font-bold text-slate-700 mb-4 flex items-center space-x-2">
                      <span>Auction End Time</span>
                      <span className="text-red-500">*</span>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-1000"></div>
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="valid_until"
                        name="valid_until"
                        value={formData.valid_until}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-6 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-lg text-lg font-medium"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={isLoading || selectedProducts.length === 0}
                      className="w-full group relative inline-flex justify-center items-center px-8 py-6 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 text-white font-bold text-lg rounded-2xl hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-700 focus:outline-none focus:ring-6 focus:ring-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-emerald-500/30 hover:shadow-3xl hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-95"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-7 w-7 border-3 border-white border-t-transparent mr-4"></div>
                          <span className="animate-pulse">Creating Your Auction...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-6 w-6 mr-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                          <span>Create Auction</span>
                          <Sparkles className="h-5 w-5 ml-2 animate-pulse" />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all duration-300"></div>
                        </>
                      )}
                    </button>
                    
                    {selectedProducts.length === 0 && (
                      <p className="text-center text-sm text-amber-600 mt-3 font-medium animate-pulse">
                        ⚠ Please select at least one product to enable auction creation
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Enhanced Product Selection */}
          <div className="space-y-8">
            {/* Selected Products */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-3xl blur-lg"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-6 py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Selected Products</h3>
                        <p className="text-emerald-100 text-sm">Ready for auction</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <span className="text-white font-bold text-lg">{selectedProducts.length}</span>
                      </div>
                      {selectedProducts.length > 0 && (
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-4">
                      {getSelectedProductDetails().map((product, index) => (
                        <div 
                          key={product.id} 
                          className="group relative p-5 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-teal-50 rounded-2xl border-2 border-emerald-200/60 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 rounded-2xl transition-all duration-300"></div>
                          <div className="relative flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
                                  <Package2 className="h-3 w-3 mr-1" />
                                  ID: {product.id}
                                </div>
                                <div className="flex items-center text-xs text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full">
                                  <Star className="h-3 w-3 mr-1" />
                                  Selected
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleProduct(product.id)}
                              className="ml-4 p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                          <Package2 className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-slate-600 font-bold text-lg mb-2">No products selected yet</p>
                      <p className="text-sm text-slate-500 mb-4">Choose products from the list below to get started</p>
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse animation-delay-500"></div>
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse animation-delay-1000"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Products */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-indigo-100/20 rounded-3xl blur-lg"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-6 py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Package2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Available Products</h3>
                        <p className="text-blue-100 text-sm">Click to add to auction</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <span className="text-white font-bold text-lg">{availableProducts.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {availableProducts.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {availableProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slideIn ${
                            selectedProducts.includes(product.id)
                              ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-teal-50 shadow-lg shadow-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-gradient-to-r from-slate-50/50 to-white hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30'
                          }`}
                          onClick={() => toggleProduct(product.id)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-bold text-slate-900 text-lg group-hover:text-slate-800">{product.name}</h4>
                                {selectedProducts.includes(product.id) && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full">
                                  <Package2 className="h-3 w-3 mr-1" />
                                  {product.id}
                                </div>
                                {!selectedProducts.includes(product.id) && (
                                  <div className="flex items-center text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Click to add
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedProducts.includes(product.id) ? (
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-pulse">
                                  <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 border-2 border-slate-300 rounded-2xl flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-300 group-hover:shadow-lg">
                                  <Plus className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                          <Package2 className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <X className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-slate-600 font-bold text-lg mb-2">No products available</p>
                      <p className="text-sm text-slate-500 mb-4">Create some products first to start building auctions</p>
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse animation-delay-500"></div>
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse animation-delay-1000"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer Section */}
        <div className="mt-16 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/60 shadow-lg">
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Real-time Updates</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Instant Creation</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Premium Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
  );
};  
      