import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../api/axiosClient";


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
      //   toast.error("Failed to fetch user profile.");
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  updateUser: async (id, data) => {
    set({ loading: true });
    try {


      const response = await axiosClient.patch(`/users/${id}`, data);
      set({ user: response.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      set({ loading: false });
    }
  },
}));

export default useUserStore;
