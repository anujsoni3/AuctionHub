import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService, Bid } from '../services/api';

export function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }

    apiService.getUserBids(user.username)
      .then(setBids)
      .catch((err) => console.error('Failed to load bids:', err))
      .finally(() => setLoading(false));
  }, [user, nav]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 py-10">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 Profile</h2>

        <div className="mb-6">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">Username:</span> {user.username}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => nav('/change-password')}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Change Password
          </button>
          <button
            onClick={() => {
              logout();
              nav('/');
            }}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">📦 Your Bids</h3>
          {loading ? (
            <p>Loading bids...</p>
          ) : bids.length === 0 ? (
            <p className="text-gray-500">No bids made yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border">Product</th>
                    <th className="py-2 px-4 border">Amount</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{bid.product_name}</td>
                      <td className="py-2 px-4 border">₹{bid.amount}</td>
                      <td className="py-2 px-4 border">{bid.status}</td>
                      <td className="py-2 px-4 border">
                        {new Date(bid.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
