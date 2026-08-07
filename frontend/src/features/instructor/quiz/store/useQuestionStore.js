import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../../api/axiosClient";
import useQuizStore from "./useQuizStore";

const useQuestionStore = create((set) => ({
  loading: false,
  questions:[],
  currentQuestion: null,

  // Reset helper
  clearCurrentQuestion: () => set({ currentQuestion: null }),

  // FETCH QUESTION BY ID
  getQuizQuestions: async (quizId) => {
    set({ loading: true });
    try {
      const response = await axiosClient.get(
        `/quiz/${quizId}/questions`,
      );

      if (response.data?.success) {
        set({ questions: response.data.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error(
        error.response?.data?.message || "no questions found",
      );
      set({ currentQuestion: null });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchQuestionById: async (quizId, questionId) => {
    set({ loading: true });
    try {
      const response = await axiosClient.get(
        `/quiz/${quizId}/questions/${questionId}`,
      );

      if (response.data?.success) {
        set({ currentQuestion: response.data.question });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching single question:", error);
      toast.error(
        error.response?.data?.message || "Question might have been deleted.",
      );
      set({ currentQuestion: null });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // 1. CREATE QUESTION
  createQuestion: async (quizId, questionData) => {
    set({ loading: true });
    try {
      const response = await axiosClient.post(
        `/quiz/${quizId}/questions`,
        questionData,
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Question added successfully!");

        // Refetch the parent quiz state directly
        await useQuizStore.getState().fetchQuizById?.(quizId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error(
        error.response?.data?.message || "Failed to create question.",
      );
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // 2. UPDATE QUESTION
  updateQuestion: async (quizId, questionId, questionData) => {
    set({ loading: true });
    try {
      const response = await axiosClient.patch(
        `/quiz/${quizId}/questions/${questionId}`,
        questionData,
      );

      if (response.data?.success) {
        toast.success(
          response.data.message || "Question updated successfully!",
        );

        await useQuizStore.getState().fetchQuizById?.(quizId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error(
        error.response?.data?.message || "Failed to update question.",
      );
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // 3. DELETE SINGLE QUESTION
  deleteQuestion: async (quizId, questionId) => {
    set({ loading: true });
    try {
      const response = await axiosClient.delete(
        `/quiz/${quizId}/questions/${questionId}`,
      );

      if (response.data?.success) {
        toast.success(
          response.data.message || "Question deleted successfully!",
        );

        await useQuizStore.getState().fetchQuizById?.(quizId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete question.",
      );
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useQuestionStore;
