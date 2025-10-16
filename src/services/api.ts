import axios from 'axios';

const API_BASE_URL = 'https://voiceagent-omnidim-eqsr.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add token from sessionStorage to requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || sessionStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle token expiry by clearing sessionStorage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('admin');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
