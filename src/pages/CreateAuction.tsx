import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Save, Gavel, Plus, X, CheckCircle2, Clock, Package2, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-2xl"></div>
            
            <div className="relative flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                <Gavel className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Create Auction
                  </h1>
                  <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
                </div>
                <p className="text-lg text-slate-600">Set up a new auction with selected products</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Auction Details
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-8">
                <div className="group">
                  <label htmlFor="id" className="block text-sm font-semibold text-slate-700 mb-3">
                    Auction ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 group-hover:border-slate-300"
                      placeholder="e.g., A001"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                    Auction Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 group-hover:border-slate-300"
                      placeholder="e.g., Flash Sale June"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="valid_until" className="block text-sm font-semibold text-slate-700 mb-3">
                    Auction End Time *
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      id="valid_until"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 group-hover:border-slate-300"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isLoading || selectedProducts.length === 0}
                    className="w-full group relative inline-flex justify-center items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        Creating Auction...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                        Create Auction
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all duration-200"></div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Enhanced Product Selection */}
          <div className="space-y-6">
            {/* Selected Products */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Selected Products
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedProducts.length}
                  </span>
                </h3>
              </div>
              
              <div className="p-6">
                {selectedProducts.length > 0 ? (
                  <div className="space-y-4">
                    {getSelectedProductDetails().map((product, index) => (
                      <div 
                        key={product.id} 
                        className="group relative p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">{product.name}</h4>
                            <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                            <div className="flex items-center mt-2 text-xs text-emerald-600 font-medium">
                              <Package2 className="h-3 w-3 mr-1" />
                              ID: {product.id}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleProduct(product.id)}
                            className="ml-4 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <Package2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No products selected</p>
                    <p className="text-sm text-slate-400 mt-1">Choose products from the list below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Products */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Package2 className="h-5 w-5 mr-2" />
                  Available Products
                </h3>
              </div>
              
              <div className="p-6">
                {availableProducts.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {availableProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                          selectedProducts.includes(product.id)
                            ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md shadow-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                        }`}
                        onClick={() => toggleProduct(product.id)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 group-hover:text-slate-800">{product.name}</h4>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">ID: {product.id}</p>
                          </div>
                          <div className="ml-4">
                            {selectedProducts.includes(product.id) ? (
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 border-2 border-slate-300 rounded-full flex items-center justify-center group-hover:border-slate-400 group-hover:bg-slate-100 transition-all duration-200">
                                <Plus className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:scale-110" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <Package2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No products available</p>
                    <p className="text-sm text-slate-400 mt-1">Create some products first</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};