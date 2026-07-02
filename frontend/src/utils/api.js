import axios from "axios";

// Uses relative URL - Vercel proxy forwards /api/* to backend
const api = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Temporarily disable refresh token logic to stop refresh loop
    return Promise.reject(error);
  }
);

export default api;
