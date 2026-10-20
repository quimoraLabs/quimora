import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../api/axiosClient";
import useAuthStore from "../../auth/store/authStore";

const useUserStore = create((set) => ({
  user: null,
  loading: false,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  checkToken: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ user: null });
      return false;
    }
    try {
      const response = await axiosClient.get(`/auth/me`);
      set({ user: response.data });
    } catch (error) {
      console.error("Error checking token:", error);
      set({ user: null });
      return false;
    }
  },

  getUser: async (id) => {
    set({ loading: true });
    try {
      const response = await axiosClient.get(`/users/${id}`);
      set({ user: response.data });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  updateUser: async (id, data) => {
    set({ loading: true });
    try {
      const response = await axiosClient.patch(`/users/${id}`, data);
      const updatedData = response.data?.user || response.data;
      set({ user: updatedData });
      
      // Keep authStore in sync
      useAuthStore.setState({ user: updatedData });

      toast.success("Profile updated successfully!");
      return updatedData;
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (id, file) => {
    set({ loading: true });
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosClient.patch(`/users/${id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Avatar updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.response?.data?.message || "Failed to upload avatar.");
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useUserStore;
