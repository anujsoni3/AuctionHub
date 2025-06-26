import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeft, Save, Gavel, Plus, X, CheckCircle2, Clock, Package2, Calendar, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-blue-600 font-medium">Create Auction</span>
          </div>
          
          <Link
            to="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Gavel className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Auction</h1>
              <p className="text-gray-600 mt-1">Set up a new auction with selected products</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Auction Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Auction Details</h3>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
                    Auction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter unique auction ID"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Auction Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter auction name"
                  />
                </div>

                <div>
                  <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-2">
                    Auction End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="valid_until"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading || selectedProducts.length === 0}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating Auction...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Auction
                      </>
                    )}
                  </button>
                  
                  {selectedProducts.length === 0 && (
                    <p className="text-center text-sm text-amber-600 mt-2">
                      Please select at least one product to create the auction
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Product Selection */}
          <div className="space-y-6">
            {/* Selected Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Selected Products</h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedProducts.length} selected
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {selectedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {getSelectedProductDetails().map((product) => (
                      <div 
                        key={product.id} 
                        className="flex items-start justify-between p-4 bg-green-50 border border-green-200 rounded-md"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded mt-2">
                            ID: {product.id}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className="ml-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No products selected</p>
                    <p className="text-sm text-gray-400 mt-1">Choose products from the list below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package2 className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">Available Products</h3>
                  </div>
                  <span className="text-sm text-gray-500">{availableProducts.length} available</span>
                </div>
              </div>
              
              <div className="p-6">
                {availableProducts.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${
                          selectedProducts.includes(product.id)
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleProduct(product.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mt-2">
                              {product.id}
                            </span>
                          </div>
                          <div className="ml-4">
                            {selectedProducts.includes(product.id) ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                <Plus className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No products available</p>
                    <p className="text-sm text-gray-400 mt-1">Create products first to start building auctions</p>
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