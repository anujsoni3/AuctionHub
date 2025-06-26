import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../services/api';

interface User {
  name: string;
  username: string;
}

interface AuthState {
  user?: User;
  admin?: User;
  role?: 'user' | 'admin' | null;
}

interface AuthCtx extends AuthState {
  login: (u: string, p: string) => Promise<void>;
  adminLogin: (u: string, p: string) => Promise<void>;
  loginAs: (role: 'user' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ role: null });

  const login = async (u: string, p: string) => {
    const res = await apiService.login(u, p);
    setState({ user: res.user, role: 'user' });
  };

  const adminLogin = async (u: string, p: string) => {
    const res = await apiService.adminLogin(u, p);
    setState({ admin: res.admin, role: 'admin' });
  };

  const loginAs = (role: 'user' | 'admin') => {
    setState(prev => ({ ...prev, role }));
  };

  const logout = () => setState({ role: null });

  return (
    <AuthContext.Provider value={{ ...state, login, adminLogin, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
