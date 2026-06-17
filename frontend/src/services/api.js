import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../utils/constants';
import { getToken, clearAuthStorage, setToken } from '../utils/storage';

// ─── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
let isRefreshing = false;
let refreshFailedCallbacks = [];

const onRefreshFailed = (cb) => {
  refreshFailedCallbacks.push(cb);
};

const flushRefreshFailed = () => {
  refreshFailedCallbacks.forEach((cb) => cb());
  refreshFailedCallbacks = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // 401 — try silent token refresh once
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      if (isRefreshing) {
        return new Promise((_, reject) => {
          onRefreshFailed(() => reject(error));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = getToken();
        if (token) {
          const res = await axios.post(
            `${API_BASE_URL}/jwt/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const newToken = res.data?.token;
          if (newToken) {
            setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            return api(originalRequest);
          }
        }
        throw new Error('No valid token to refresh');
      } catch {
        isRefreshing = false;
        flushRefreshFailed();
        clearAuthStorage();
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Error toast mapping
    switch (status) {
      case 400:
        toast.error(`Bad request: ${message}`);
        break;
      case 403:
        toast.error('Access denied. Insufficient permissions.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 409:
        toast.error(`Conflict: ${message}`);
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (!error.response && error.code === 'ERR_NETWORK') {
          toast.error('Network error. Check your connection.');
        } else if (status !== 401) {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

export default api;
