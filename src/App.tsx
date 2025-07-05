import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useToast } from './components/ui/Toast';

// Pages
import { Landing } from './pages/Landing';
import { UserLogin } from './pages/auth/UserLogin';
import { UserRegister } from './pages/auth/UserRegister';
import { AdminLogin } from './pages/auth/AdminLogin';
import { AdminRegister } from './pages/auth/AdminRegister';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserAuctions } from './pages/user/UserAuctions';
import { UserBids } from './pages/user/UserBids';
import { UserWallet } from './pages/user/UserWallet';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAuctions } from './pages/admin/AdminAuctions';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuctionDetail } from './pages/admin/AdminAuctionDetail';
function App() {
  const { ToastContainer } = useToast();

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Protected user routes */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/auctions" element={
              <ProtectedRoute>
                <UserAuctions />
              </ProtectedRoute>
            } />
            <Route path="/user/bids" element={
              <ProtectedRoute>
                <UserBids />
              </ProtectedRoute>
            } />
            <Route path="/user/wallet" element={
              <ProtectedRoute>
                <UserWallet />
              </ProtectedRoute>
            } />

            {/* Protected admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/auctions" element={
              <ProtectedRoute requireAdmin>
                <AdminAuctions />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute requireAdmin>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requireAdmin>
                <AdminReports />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/auctions/:auctionId" element={
              <ProtectedRoute requireAdmin>
                <AdminAuctionDetail />
              </ProtectedRoute>
            } />


            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;