import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Shield, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(formData);
      showSuccess('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-sky-100 animate-gradient-x flex items-center justify-center p-6">
      <div className="relative w-full max-w-md backdrop-blur-md bg-white/60 rounded-xl shadow-xl border border-white/30 p-6">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-amber-700 hover:text-amber-900 transition duration-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-amber-700 drop-shadow-sm" />
            <h1 className="text-3xl font-bold text-slate-900 drop-shadow">Admin Login</h1>
          </div>
          <p className="text-sm text-slate-700">Access the administrative panel</p>
        </div>

        <Card className="bg-white/40 backdrop-blur-lg rounded-lg shadow-md border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5 p-4">
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter admin username"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter admin password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-pink-500 to-orange-500 hover:from-amber-600 hover:to-red-500 transition-all duration-300 text-white font-semibold shadow-md"
              size="lg"
            >
              Login as Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-700">
              Need admin access?{' '}
              <Link
                to="/admin/register"
                className="text-amber-600 hover:text-amber-800 font-medium transition duration-200"
              >
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
