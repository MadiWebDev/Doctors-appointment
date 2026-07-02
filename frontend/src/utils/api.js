import axios from "axios";

// Production backend URL
const BACKEND_URL = "https://doctors-appointment-sigma-eosin.vercel.app/";

// Create axios instance with base URL
const api = axios.create({
  baseURL: BACKEND_URL || import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});// Request interceptor
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
