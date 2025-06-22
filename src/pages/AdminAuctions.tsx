// New file: src/pages/AdminAuctions.tsx
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { apiService } from '../services/api';
import { Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Auction {
  id: string;
  name: string;
  valid_until: string;
  product_ids: string[];
}

export const AdminAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    apiService.getAllAuctions()
      .then((res) => setAuctions(res.auctions || []))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">All Auctions</h1>
          <p className="text-lg text-blue-100">View auction details and their associated products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-white/95 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{auction.name}</h3>
                <p className="text-sm text-slate-600">Valid until: {new Date(auction.valid_until).toLocaleString()}</p>
              </div>
              <p className="text-sm text-slate-500 mb-4">Products: {auction.product_ids.length}</p>
              <Link
                to={`/admin/auction/${auction.id}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
