import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Users, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Gavel className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900">Auction Management System</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Professional auction platform for seamless bidding and comprehensive administrative control
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* User Portal */}
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">User Portal</h2>
              <p className="text-slate-600 mb-6">
                Browse auctions, place bids, manage your wallet, and track your bidding history
              </p>
              <ul className="text-sm text-slate-500 space-y-2 mb-6">
                <li>• View active auctions</li>
                <li>• Place and track bids</li>
                <li>• Manage wallet balance</li>
                <li>• Transaction history</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Link to="/user/login">
                <Button className="w-full" size="lg">Login as User</Button>
              </Link>
              <Link to="/user/register">
                <Button variant="secondary" className="w-full" size="lg">Register as User</Button>
              </Link>
            </div>
          </Card>

          {/* Admin Portal */}
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Admin Portal</h2>
              <p className="text-slate-600 mb-6">
                Manage auctions, products, monitor bids, and oversee the entire auction system
              </p>
              <ul className="text-sm text-slate-500 space-y-2 mb-6">
                <li>• Create and manage auctions</li>
                <li>• Product management</li>
                <li>• Monitor all bids</li>
                <li>• Settle auctions</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Link to="/admin/login">
                <Button className="w-full" size="lg">Login as Admin</Button>
              </Link>
              <Link to="/admin/register">
                <Button variant="secondary" className="w-full" size="lg">Register as Admin</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-center text-slate-900 mb-12">Platform Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Gavel className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Real-time Bidding</h4>
              <p className="text-slate-600">Live auction updates with instant bid tracking and notifications</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Secure Transactions</h4>
              <p className="text-slate-600">Encrypted payment processing with comprehensive transaction logs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">User Management</h4>
              <p className="text-slate-600">Comprehensive user profiles with role-based access control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};