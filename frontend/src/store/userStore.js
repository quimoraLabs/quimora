import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../utils/httpHeaders";

const useUserStore = create((set, get) => ({
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
      const response = await axios.get(`${get().url}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...cacheBusterHeaders
        },
      });
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
      const token = localStorage.getItem("token");

      const response = await axios.get(`${get().url}/users/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...cacheBusterHeaders
        },
      });
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
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${get().url}/users/update/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...cacheBusterHeaders
          },
        },
      );
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
