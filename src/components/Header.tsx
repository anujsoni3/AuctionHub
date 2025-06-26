import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, admin, role, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white shadow-2xl border-b border-gray-700">
      <nav className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-300 tracking-wide"
        >
          Smart Auction
        </Link>

        <ul className="flex gap-6 items-center">
          {/* Admin Logged In */}
          {role === 'admin' && admin && (
            <>
              <li>
                <Link 
                  to="/admin" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg ${
                    isActive('/admin') 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Admin Panel
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {/* User Logged In */}
          {role === 'user' && user && (
            <>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg ${
                    isActive('/dashboard') 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg ${
                    isActive('/profile') 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {/* Not Logged In */}
          {!role && (
            <>
              <li>
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-green-600 hover:shadow-lg ${
                    isActive('/login') 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-600 hover:shadow-lg ${
                    isActive('/register') 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Register
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/login" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg ${
                    isActive('/admin/login') 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Admin Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};