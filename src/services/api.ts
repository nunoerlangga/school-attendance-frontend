import axios from 'axios';

const api = axios.create({
  baseURL: 'https://wanita-nonremovable-japingly.ngrok-free.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're already trying to log in
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('nama');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
