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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-amber-600 mr-2" />
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          </div>
          <p className="text-slate-600">Access the administrative panel</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              Login as Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Need admin access?{' '}
              <Link to="/admin/register" className="text-amber-600 hover:text-amber-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};