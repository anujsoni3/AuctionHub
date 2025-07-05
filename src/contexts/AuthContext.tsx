import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  username: string;
  mobile_number: string;
}

interface Admin {
  id: string;
  name: string;
  username: string;
  mobile_number: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  login: (credentials: any) => Promise<any>;
  adminLogin: (credentials: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const currentAdmin = authService.getCurrentAdmin();
    
    if (currentUser) setUser(currentUser);
    if (currentAdmin) setAdmin(currentAdmin);
    
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const response = await authService.userLogin(credentials);
    setUser(response.user);
    return response;
  };

  const adminLogin = async (credentials: any) => {
    const response = await authService.adminLogin(credentials);
    setAdmin(response.admin);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setAdmin(null);
  };

  const value = {
    user,
    admin,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
    login,
    adminLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};