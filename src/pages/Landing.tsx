import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Users, Shield, TrendingUp, Clock, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import '../styles/index.css';

export const Landing: React.FC = () => {
  const [animatedStats, setAnimatedStats] = useState({
    auctions: 0,
    users: 0,
    totalBids: 0
  });

  useEffect(() => {
    const targetStats = { auctions: 1250, users: 5680, totalBids: 15420 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimatedStats({
        auctions: Math.floor(targetStats.auctions * progress),
        users: Math.floor(targetStats.users * progress),
        totalBids: Math.floor(targetStats.totalBids * progress)
      });
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-700/20 to-blue-700/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-800/10 to-pink-700/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6 group">
            <Gavel className="h-12 w-12 text-blue-500 mr-3 group-hover:rotate-12 transition-transform duration-300" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Auction Management System
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Professional auction platform for seamless bidding and comprehensive administrative control
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{animatedStats.auctions.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Active Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{animatedStats.users.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Registered Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{animatedStats.totalBids.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Total Bids</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
          <Card className="text-center hover:shadow-2xl hover:shadow-blue-700/40 transition duration-500 transform hover:-translate-y-2 relative overflow-hidden group bg-white/5 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 p-6">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">User Portal</h2>
                <p className="text-gray-300 mb-6">
                  Browse auctions, place bids, manage your wallet, and track your bidding history
                </p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
                  <li className="flex items-center"><Star className="h-4 w-4 text-blue-300 mr-2" /> View active auctions</li>
                  <li className="flex items-center"><TrendingUp className="h-4 w-4 text-blue-300 mr-2" /> Place and track bids</li>
                  <li className="flex items-center"><Shield className="h-4 w-4 text-blue-300 mr-2" /> Manage wallet balance</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 text-blue-300 mr-2" /> Transaction history</li>
                </ul>
              </div>
              <div className="space-y-3">
                <Link to="/user/login"><Button className="w-full">Login as User</Button></Link>
                <Link to="/user/register"><Button variant="secondary" className="w-full">Register as User</Button></Link>
              </div>
            </div>
          </Card>

          <Card className="text-center hover:shadow-2xl hover:shadow-amber-600/40 transition duration-500 transform hover:-translate-y-2 relative overflow-hidden group bg-white/5 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 p-6">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">Admin Portal</h2>
                <p className="text-gray-300 mb-6">
                  Manage auctions, products, monitor bids, and oversee the entire auction system
                </p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6 text-left">
                  <li className="flex items-center"><Gavel className="h-4 w-4 text-amber-400 mr-2" /> Create and manage auctions</li>
                  <li className="flex items-center"><TrendingUp className="h-4 w-4 text-amber-400 mr-2" /> Product management</li>
                  <li className="flex items-center"><Users className="h-4 w-4 text-amber-400 mr-2" /> Monitor all bids</li>
                  <li className="flex items-center"><Shield className="h-4 w-4 text-amber-400 mr-2" /> Settle auctions</li>
                </ul>
              </div>
              <div className="space-y-3">
                <Link to="/admin/login"><Button className="w-full">Login as Admin</Button></Link>
                <Link to="/admin/register"><Button variant="secondary" className="w-full">Register as Admin</Button></Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-20 max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-center text-white mb-12">Platform Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-500/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Gavel className="h-6 w-6 text-green-300" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Bidding</h4>
              <p className="text-gray-300">Live auction updates with instant bid tracking and notifications</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-purple-300" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Secure Transactions</h4>
              <p className="text-gray-300">Encrypted payment processing with comprehensive transaction logs</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-blue-300" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">User Management</h4>
              <p className="text-gray-300">Comprehensive user profiles with role-based access control</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center"><Shield className="h-5 w-5 mr-2" /><span className="text-sm">SSL Secured</span></div>
            <div className="flex items-center"><Users className="h-5 w-5 mr-2" /><span className="text-sm">24/7 Support</span></div>
            <div className="flex items-center"><Star className="h-5 w-5 mr-2" /><span className="text-sm">Trusted Platform</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
