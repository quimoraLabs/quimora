import axios from "axios";
import toast from "react-hot-toast";


// Co-located cache-busting headers
export const CACHE_BUSTER_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://quimora.onrender.com/api/v1",
  headers: {
    ...CACHE_BUSTER_HEADERS,
  },
});

/**
 * Request Interceptor: Automatically injects JWT Bearer token
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor: Catches global status codes (401, 403, Network Errors)
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.error || error.response?.data?.message;

    if (status === 401) {
      // Unauthenticated: Clear token and force re-login
      localStorage.removeItem("token");
      toast.error(errorMessage || "Session expired. Please log in again.");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      // Unauthorized / Forbidden: Role mismatch or restricted access
      toast.error(
        errorMessage ||
          "Access denied. You do not have permission to view this resource.",
      );
    } else if (!error.response) {
      // Network or Server Offline
      toast.error("Network error. Please check your internet connection.");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
