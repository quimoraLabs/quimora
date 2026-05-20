import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../utils/httpHeaders";

const useQuizStore = create((set, get) => ({
  quizzes: [],
  loading: false,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  toaken: localStorage.getItem("token") || null,
  currentQuiz: null,

  fetchQuizzes: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${get().url}/quizzes/all`, {
        headers: {
          Authorization: `Bearer ${get().toaken}`,
          ...cacheBusterHeaders,
        },
      });
      set({ quizzes: response.data.data.data || [] });
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
        headers: {
          Authorization: `Bearer ${get().toaken}`,
          ...cacheBusterHeaders,
        },
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
        headers: {
          Authorization: `Bearer ${get().toaken}`,
          ...cacheBusterHeaders,
        },
      });
      set({ quizzes: response.data });
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
        headers: {
          Authorization: `Bearer ${get().toaken}`,
          ...cacheBusterHeaders,
        },
      });
      set((state) => ({ quizzes: [...state.quizzes, response.data] }));
      toast.success("Quiz created successfully!");
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz.");
    } finally {
      set({ loading: false });
    }
  },

  deleteQuiz: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`${get().url}/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${get().toaken}`,
          ...cacheBusterHeaders,
        },
      });
      set((state) => ({
        quizzes: state.quizzes.filter((quiz) => quiz._id !== id),
      }));
      toast.success("Quiz deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz.");
    } finally {
      set({ loading: false });
    }
  },

  updateQuiz: async (id, quizData) => {
    set({ loading: true });
    try {
      const response = await axios.patch(
        `${get().url}/quizzes/${id}`,
        quizData,
        {
          headers: {
            Authorization: `Bearer ${get().toaken}`,
            ...cacheBusterHeaders,
          },
        },
      );
      set((state) => ({
        quizzes: state.quizzes.map((quiz) =>
          quiz._id === id ? response.data : quiz,
        ),
      }));
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
      const response = await axios.patch(
        `${get().url}/quizzes/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${get().toaken}`,
            ...cacheBusterHeaders,
          },
        },
      );
      set((state) => ({
        quizzes: state.quizzes.map((quiz) =>
          quiz._id === id ? response.data : quiz,
        ),
      }));
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
