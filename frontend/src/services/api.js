import axios from 'axios';

// Create axios instance without importing store
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// We'll set up interceptors after store is created
let storeRef = null;

export const setStore = (store) => {
  storeRef = store;
};

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    if (storeRef) {
      const state = storeRef.getState();
      const token = state.auth?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for token refresh queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Extract error message from response (handle both 'message' and 'error' fields)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    error.customMessage = errorMessage;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/v1/user/refresh-token');
        const { user, accessToken } = response.data;
        
        if (storeRef) {
          // Dynamically import the action to avoid circular dependency
          const { setCredentials } = await import('../features/auth/authSlice');
          storeRef.dispatch(setCredentials({ user, accessToken }));
        }
        
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (storeRef) {
          const { logout } = await import('../features/auth/authSlice');
          storeRef.dispatch(logout());
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;