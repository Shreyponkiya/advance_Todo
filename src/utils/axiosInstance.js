import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ✅ REQUEST: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE: handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔥 Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.error("Session expired. Please login again.");

      // ⏱️ Small delay so toast is visible
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    }

    return Promise.reject(error);
  }
);

export default api;
