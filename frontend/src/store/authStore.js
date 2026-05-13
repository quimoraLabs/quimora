import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../utils/httpHeaders";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  authInitialized: false,
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
      toast.error(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
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
        toast.success(
          response.data.message || "Registration successful. Please log in.",
        );
        console.log("Registration successful:", response.data.message);
        return true;
      } else {
        toast.error(
          response.data.message || "Registration failed. Please try again.",
        );
        console.error("Registration failed:", response.data.message);
        return false;
      }
    } catch (error) {
      toast.error("An error occurred during registration.");
      console.error("Registration failed:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  requestSendOTP: async (email) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`${get().url}/auth/request-otp`, {"email":email});
      if (response.data.success) {
        toast.success(
          response.data.message || "Otp request send successfully",
        );
      }
      console.log("OTP request send :", response.data.message);
      return true;
    } catch (error) {
      toast.error("An error occurred during send OTP.");
      console.error("Request OTP send failed:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  verifyOTPAndChangePassword: async (body) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`${get().url}/auth/verify-otp`, body);
      if (response.data.success) {
        toast.success(
          response.data.message || "Change password successfully",
        );
      }
      console.log("Password changed successfully:", response.data.message);
      return true;
    } catch (error) {
      toast.error("An error occurred during registration.");
      console.error("Password changed failed:", error);
      return false;
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
          ...cacheBusterHeaders,
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

  checkAuth: async () => {
    const token = get().token;

    if (token) {
      set({ loading: true });
      await get().getProfile();
    } else {
      get().logout();
    }

    set({ authInitialized: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
