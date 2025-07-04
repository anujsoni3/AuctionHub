import api from './api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  mobile_number: string;
}

interface AdminLoginCredentials extends LoginCredentials {
  role: string;
}

interface AdminRegisterData extends RegisterData {
  role: string;
}

export const authService = {
  // User authentication
  async userLogin(credentials: LoginCredentials) {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async userRegister(data: RegisterData) {
    const response = await api.post('/register', data);
    return response.data;
  },

  async changePassword(data: { username: string; password: string; new_password: string }) {
    const response = await api.post('/change-password', data);
    return response.data;
  },

  // Admin authentication
  async adminLogin(credentials: AdminLoginCredentials) {
    const response = await api.post('/admin/login', credentials);
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  async adminRegister(data: AdminRegisterData) {
    const response = await api.post('/admin/register', data);
    return response.data;
  },

  async adminChangePassword(data: { username: string; password: string; new_password: string; role: string }) {
    const response = await api.post('/admin/change-password', data);
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
  },

  // Get current user/admin
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentAdmin() {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  isAdminAuthenticated() {
    return !!localStorage.getItem('admin_token');
  }
};