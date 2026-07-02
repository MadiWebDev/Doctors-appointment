import axios from "axios";

// Hardcoded production backend URL — env var fallback kept for local dev
const BACKEND_URL = "https://doctors-appointment-sigma-coral.vercel.app";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || BACKEND_URL,
  withCredentials: true, // Important for httpOnly cookies
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
