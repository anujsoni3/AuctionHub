import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { AuctionDetail } from './pages/AuctionDetail';
import { CreateProduct } from './pages/CreateProduct';
import { CreateAuction } from './pages/CreateAuction';
import { AdminProductList } from './pages/AdminProductList';
import { AdminAuctions } from './pages/AdminAuctions';
import { AdminAuctionDetail } from './pages/AdminAuctonDetail';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { ChangePassword } from './pages/ChangePassword';
import  Register  from './pages/Register'; // ✅ Add this import
import { Profile } from './pages/UserProfile';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* ✅ Add this route */}
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADMIN AUTH */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/create-product" element={<CreateProduct />} />
          <Route path="/admin/create-auction" element={<CreateAuction />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/auctions" element={<AdminAuctions />} />
          <Route path="/admin/auction/:auctionId" element={<AdminAuctionDetail />} />

          {/* PUBLIC AUCTION DETAIL */}
          <Route path="/auction/:productId" element={<AuctionDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
