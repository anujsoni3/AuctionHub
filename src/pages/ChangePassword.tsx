import { useState } from 'react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
export function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    new_password: '',
  });
  const [msg, setMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.changePassword(
        form.username,
        form.password,
        form.new_password,
      );
      setMsg('Password updated successfully');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setMsg(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200/50 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h2>
            <p className="text-gray-600">Update your account security credentials</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="current-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  id="current-password"
                  name="password"
                  type="password"
                  placeholder="Enter your current password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new_password"
                  type="password"
                  placeholder="Enter your new password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-teal-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-teal-800 focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
            >
              Update Password
            </button>

            {msg && (
              <div className={`border rounded-xl p-3 ${
                msg.includes('successfully') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-center text-sm font-medium ${
                  msg.includes('successfully') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {msg}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Security Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use a strong password with mixed characters</li>
                    <li>• Avoid using personal information</li>
                    <li>• Don't reuse passwords from other accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}