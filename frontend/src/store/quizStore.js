import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../utils/httpHeaders";

const useQuizStore = create((set, get) => ({
  quizzes: [],
  loading: false,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  currentQuiz: null,

  // Helper function to dynamically get the freshest token from localStorage
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      ...cacheBusterHeaders,
    };
  },

  fetchQuizzes: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${get().url}/quizzes/all`, {
        headers: get().getAuthHeaders(),
      });
      // Double check if your backend returns data nested inside .data.data
      set({ quizzes: response.data?.data?.data || [] });
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to fetch quizzes.");
    } finally {
      set({ loading: false });
    }
  },

  fetchQuizById: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${get().url}/quizzes/${id}`, {
        headers: get().getAuthHeaders(),
      });
      set({ currentQuiz: response.data });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to fetch quiz.");
    } finally {
      set({ loading: false });
    }
  },

  fetchQuizzesByInstructor: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${get().url}/quizzes`, {
        headers: get().getAuthHeaders(),
      });
      set({ quizzes: response.data.data });
    } catch (error) {
      console.error("Error fetching quizzes by instructor:", error);
      toast.error("Failed to fetch quizzes.");
    } finally {
      set({ loading: false });
    }
  },

  createQuiz: async (quizData) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${get().url}/quizzes`, quizData, {
        headers: get().getAuthHeaders(),
      });
      if (response.data.success) toast.success("Quiz created successful ");
      return true;
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error(error.response?.data?.message || "Failed to create quiz.");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuiz: async (id) => {
    set({ loading: true });
    try {
      // 1. Delete the item from the database
      await axios.delete(`${get().url}/quizzes/${id}`, {
        headers: get().getAuthHeaders(),
      });

      // 2. Freshly re-fetch the updated list from the backend
      await get().fetchQuizzesByInstructor();

      // 3. Show success alert only after both backend steps finish
      toast.success("Quiz deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error(error.response?.data?.message || "Failed to delete quiz.");
    } finally {
      set({ loading: false });
    }
  },

  updateQuiz: async (id, quizData) => {
    set({ loading: true });
    try {
      await axios.patch(`${get().url}/quizzes/${id}`, quizData, {
        headers: get().getAuthHeaders(),
      });

      await get().fetchQuizzesByInstructor();

      toast.success("Quiz updated successfully!");
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error("Failed to update quiz.");
    } finally {
      set({ loading: false });
    }
  },

  changeQuizStatus: async (id, status) => {
    set({ loading: true });
    try {
      await axios.patch(
        `${get().url}/quizzes/${id}/status`,
        { status },
        {
          headers: get().getAuthHeaders(),
        },
      );  
      await get().fetchQuizzesByInstructor();

      toast.success("Quiz status updated successfully!");
    } catch (error) {
      console.error("Error updating quiz status:", error);
      toast.error("Failed to update quiz status.");
    } finally {
      set({ loading: false });
    }
  },
}));

export default useQuizStore;
