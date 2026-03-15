import axios from 'axios';

const explicitApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

const getAutoApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    return '/api';
  }

  if (hostname.startsWith('api.')) {
    return window.location.origin;
  }

  const rootHost = hostname.replace(/^www\./, '');
  return `https://api.${rootHost}`;
};

const API_BASE_URL = (
  explicitApiBaseUrl && explicitApiBaseUrl.toLowerCase() !== 'auto'
    ? explicitApiBaseUrl
    : getAutoApiBaseUrl()
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = typeof originalRequest.url === 'string' ? originalRequest.url : '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login/') ||
      requestUrl.includes('/auth/register/') ||
      requestUrl.includes('/auth/check-') ||
      requestUrl.includes('/auth/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const accessToken = response.data.access_token || response.data.access;
        if (!accessToken) {
          throw new Error('No access token');
        }

        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
