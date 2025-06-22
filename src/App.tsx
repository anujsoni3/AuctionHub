
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
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/create-product" element={<CreateProduct />} />
          <Route path="/admin/create-auction" element={<CreateAuction />} />
          <Route path="/auction/:productId" element={<AuctionDetail />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/auctions" element={<AdminAuctions />} />

<Route path="/admin/auction/:auctionId" element={<AdminAuctionDetail />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;