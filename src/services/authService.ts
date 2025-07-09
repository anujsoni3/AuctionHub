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
  // ------------------------------
  // ✅ User authentication
  // ------------------------------
  async userLogin(credentials: LoginCredentials) {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
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

  // ------------------------------
  // ✅ Admin authentication
  // ------------------------------
  async adminLogin(credentials: AdminLoginCredentials) {
    const response = await api.post('/admin/login', credentials);
    if (response.data.token) {
      sessionStorage.setItem('admin_token', response.data.token);
      sessionStorage.setItem('admin', JSON.stringify(response.data.admin));
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

  // ------------------------------
  // 🔐 Logout
  // ------------------------------
  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('admin');
  },

  // ------------------------------
  // 👤 Get current user/admin
  // ------------------------------
  getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentAdmin() {
    const admin = sessionStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },
  async getMyAuctions() {
  const response = await api.get('/my_auctions');
  return response.data;
  },


  // ------------------------------
  // 🔐 Auth checks
  // ------------------------------
  isAuthenticated() {
    return !!sessionStorage.getItem('token');
  },

  isAdminAuthenticated() {
    return !!sessionStorage.getItem('admin_token');
  }

};
