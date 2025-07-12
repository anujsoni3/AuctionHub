import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import {  ArrowLeft, Sparkles, UserPlus } from 'lucide-react';

export const UserRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    mobile_number: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.userRegister(formData);
      showSuccess('Registration successful! Please login.');
      navigate('/user/login');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-emerald-300 to-blue-300 opacity-30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-300 to-emerald-300 opacity-30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-700 hover:text-blue-900 transition-all duration-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4 group">
            <div className="relative">
              <UserPlus className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-emerald-400 animate-bounce" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
              Create Account
            </h1>
          </div>
          <p className="text-slate-600 text-md">Join the auction platform today</p>
        </div>

        <Card className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-xl p-6 border border-white/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              placeholder="Enter your full name"
            />

            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
              placeholder="Choose a username"
            />

            <Input
              label="Mobile Number"
              name="mobile_number"
              type="tel"
              value={formData.mobile_number}
              onChange={handleChange}
              autoComplete="tel"
              required
              placeholder="Enter your mobile number"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              placeholder="Create a secure password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 transition duration-300 text-white font-semibold shadow-lg rounded-lg"
              size="lg"
            >
              Create Your Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Already have an account?</span>
              </div>
            </div>
            <p className="mt-4 text-slate-600">
              <Link to="/user/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
