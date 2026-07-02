import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leaveflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manage API error toasts and session expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.includes('/auth/login') || requestUrl.includes('login');

    if (status === 401) {
      if (!isLoginRequest) {
        const token = localStorage.getItem('leaveflow_token');
        if (token) {
          localStorage.removeItem('leaveflow_token');
          localStorage.removeItem('leaveflow_user');
          toast.error('Session expired. Please log in again.');
          // Redirect to login safely
          setTimeout(() => {
            window.location.replace('/login');
          }, 200);
        }
      }
    } else if (status === 403) {
      toast.error('Access Denied.');
    } else if (status === 404) {
      toast.error('Requested resource not found. (404)');
    } else if (status === 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
