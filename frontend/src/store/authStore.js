import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  token: localStorage.getItem("token") || null,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  login: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${get().url}/auth/login`, formData);
      const token = res.data?.token;

      if (!token) {
        throw new Error(res.data?.message || "Invalid login response");
      }

      localStorage.setItem("token", token);
      set({ token, isAuthenticated: true });

      await get().getProfile();
      toast.success("Logged in successfully.");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed. Please check your credentials.");
      console.error("Login failed:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${get().url}/auth/register`, formData);

      if (response.data.success) {
        console.log("Registration successful:", response.data.message);
      } else {
        console.error("Registration failed:", response.data.message);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      set({ loading: false });
    }
  },

  getProfile: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${get().url}/auth/me`, {
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });
      set({ user: res.data, isAuthenticated: true });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      get().logout();
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: () => {
    const token = get().token;
    if (token) {
      get().getProfile();
    } else {
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
