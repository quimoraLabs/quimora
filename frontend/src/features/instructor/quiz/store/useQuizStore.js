import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../../api/axiosClient";

const useQuizStore = create((set, get) => ({
  quizzes: [],
  loading: false,
  currentQuiz: null,

  fetchQuizById: async (id) => {
    set({ loading: true });
    try {
      const response = await axiosClient.get(`/quizzes/${id}`);
      set({ currentQuiz: response.data?.data });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error(error.response?.data?.message || "Failed to fetch quiz.");
    } finally {
      set({ loading: false });
    }
  },

  fetchQuizzesByInstructor: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/quizzes/instructor");
      set({ quizzes: response.data?.data || [] });
    } catch (error) {
      console.error("Error fetching quizzes by instructor:", error);
      toast.error(error.response?.data?.message || "Failed to fetch quizzes.");
    } finally {
      set({ loading: false });
    }
  },

  createQuiz: async (quizData) => {
    set({ loading: true });
    try {
      const response = await axiosClient.post("/quizzes", quizData);
      if (response.data?.success) toast.success("Quiz created successfully!");
      await get().fetchQuizzesByInstructor();
      return response.data?.data || response.data?.quiz || true;
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
      await axiosClient.delete(`/quizzes/${id}`);
      await get().fetchQuizzesByInstructor();
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
      await axiosClient.patch(`/quizzes/${id}`, quizData);
      await get().fetchQuizzesByInstructor();
      toast.success("Quiz updated successfully!");
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error(error.response?.data?.message || "Failed to update quiz.");
    } finally {
      set({ loading: false });
    }
  },

  changeQuizStatus: async (id, status) => {
    set({ loading: true });
    try {
      await axiosClient.patch(`/quizzes/${id}/status`, { status });
      await get().fetchQuizzesByInstructor();
      toast.success("Quiz status updated successfully!");
    } catch (error) {
      console.error("Error updating quiz status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update quiz status.",
      );
    } finally {
      set({ loading: false });
    }
  },
  toggleQuizActiveStatus: async (id) => {
    set({ loading: true });
    try {
      await axiosClient.patch(`/quizzes/${id}/activity`);
      await get().fetchQuizzesByInstructor();
      toast.success("Quiz status updated successfully!");
    } catch (error) {
      console.error("Error updating quiz status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update quiz status.",
      );
    } finally {
      set({ loading: false });
    }
  },
}));

export default useQuizStore;
