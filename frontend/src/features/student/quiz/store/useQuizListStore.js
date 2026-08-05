import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../../../utils/httpHeaders";

const getAuthToken = () => localStorage.getItem("token");

const useQuizListStore = create((set, get) => ({
  quizzes: [],
  loading: false,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",

  fetchAvailableQuizzes: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${get().url}/quizzes/student`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          ...cacheBusterHeaders,
        },
      });
      set({ quizzes: response.data?.data || [] });
    } catch (error) {
      console.error("Error fetching student quizzes:", error);
      toast.error("Failed to load available quizzes.");
    } finally {
      set({ loading: false });
    }
  },
}));

export default useQuizListStore;
