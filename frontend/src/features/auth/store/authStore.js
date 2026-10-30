import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../api/axiosClient";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  authInitialized: false,
  token: localStorage.getItem("token") || null,

  login: async (formData) => {
    set({ loading: true });
    try {
      const res = await axiosClient.post(`/auth/login`, formData);
      const token = res.data?.token;

      if (!token) {
        throw new Error(res.data?.message || "Invalid login response");
      }

      localStorage.setItem("token", token);
      set({ token });

      // Fetch profile BEFORE marking isAuthenticated: true to ensure user & role are populated
      const profileRes = await axiosClient.get(`/auth/me`);
      set({ user: profileRes.data, isAuthenticated: true });

      toast.success("Logged in successfully.");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid email or password";
      toast.error(errorMsg);
      get().logout();
      return false;
    } finally {
      set({ loading: false });
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const response = await axiosClient.post(`/auth/register`, formData);

      if (response.data.success) {
        toast.success(
          response.data.message || "Registration successful. Please log in.",
        );
        console.log("Registration successful:", response.data.message);
        return true;
      } else {
        const errorMsg = response.data?.message || "Registration failed.";
        toast.error(errorMsg);
        console.error("Registration failed:", errorMsg);
        return false;
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred during registration.";
      toast.error(errorMsg);
      console.error("Registration failed:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  requestSendOTP: async (email) => {
    set({ loading: true });
    try {
      const response = await axiosClient.patch(`/auth/request-otp`, {
        email: email,
      });
      if (response.data.success) {
        toast.success(response.data.message || "Otp request send successfully");
      }
      console.log("OTP request send :", response.data.message);
      return true;
    } catch (error) {      
      console.error("Request OTP send failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send OTP. Please check your email.";
      toast.error(errorMsg);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  verifyOTPAndChangePassword: async (body) => {
    set({ loading: true });
    try {
      const response = await axiosClient.patch(`/auth/verify-otp`, body);
      if (response.data.success) {
        toast.success(response.data.message || "Change password successfully");
      }
      console.log("Password changed successfully:", response.data.message);
      toast.success("Password changed successfully. Please log in again.");
      get().logout();
      return true;
    } catch (error) {
      console.error("Password changed failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to verify OTP or update password.";
      toast.error(errorMsg);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true });
    try {
      const response = await axiosClient.patch(`/auth/change-password`, {
        currentPassword,
        newPassword,
      });
      if (response.data.success) {
        toast.success("Password changed successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Change password failed:", error);
      toast.error(error.response?.data?.message || "Failed to change password.");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getProfile: async () => {
    set({ loading: true });
    try {
      const token = get().token;
      if (!token) {
        throw new Error("No token found. User is not authenticated.");
      }
      const res = await axiosClient.get(`/auth/me`);
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
