import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Settings, Menu, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-white/95 via-white/90 to-blue-50/90 backdrop-blur-xl border-b border-gradient-to-r from-gray-200/60 via-blue-200/40 to-gray-200/60 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group transform hover:scale-105 transition-all duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src="/logo.jpg" 
                alt="Smart Auction Logo" 
                className="relative h-12 w-12 object-contain rounded-xl border-2 border-white shadow-lg" 
              />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Smart Auction
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                Premium Bidding Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                isActive('/') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              {isActive('/') && <Zap className="h-3 w-3 text-yellow-300" />}
            </Link>
            
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                isActive('/dashboard') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
              {isActive('/dashboard') && <Zap className="h-3 w-3 text-yellow-300" />}
            </Link>
            
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                location.pathname.startsWith('/admin') 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin Panel</span>
              {location.pathname.startsWith('/admin') && <Zap className="h-3 w-3 text-yellow-300" />}
            </Link>
          </nav>

          <div className="md:hidden">
            <button className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
    </header>
  );
};