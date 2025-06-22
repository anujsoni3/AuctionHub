// src/pages/AdminAuctionDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { apiService, Product } from '../services/api';
import { Clock, ArrowLeft } from 'lucide-react';

export const AdminAuctionDetail: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (auctionId) {
      apiService.getAuctionProducts(auctionId)
        .then((res) => setProducts(res.products || []))
        .catch(console.error);
    }
  }, [auctionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/admin/auctions" className="text-blue-600 hover:underline inline-flex items-center mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Auctions
        </Link>

        <h2 className="text-4xl font-bold text-slate-800 mb-6">Auction Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No products available for this auction.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const isExpired = new Date(product.time) <= new Date();
              return (
                <div key={product.id} className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-1">{product.name}</h3>
                  <p className="text-slate-600 mb-2 text-sm">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(product.time).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
