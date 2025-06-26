import { useState } from 'react';
import { apiService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminLogin() {
  const { loginAs } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.adminLogin(form.username, form.password);
      loginAs('admin');
      nav('/admin');
    } catch (err: any) {
      setMsg(err.message || 'Admin login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200/50 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-600">Secure administrator portal</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="admin-username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrator Username
                </label>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  placeholder="Enter admin username"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-800 focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
            >
              Access Admin Panel
            </button>

            {msg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-center text-red-600 text-sm font-medium">{msg}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}