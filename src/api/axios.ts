import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://hello-axis-task-manager-backend-production.up.railway.app/api',
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('tm_user');

      // Prevent infinite loop if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response && error.response.status === 403) {
      toast.error(
        error.response.data?.error ||
          'You do not have permission to perform this action',
      );
    }

    return Promise.reject(error);
  },
);

export default api;
