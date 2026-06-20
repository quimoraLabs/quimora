import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../utils/httpHeaders";
import useQuizStore from "./quizStore";

const useQuestionStore = create((set, get) => ({
  loading: false,
  currentQuestion: null,
  url:
    import.meta.env.VITE_API_URL + "/quiz" || "http://localhost:5000/api/quiz",

  // Dynamically retrieves the freshest auth token from localStorage
  getAuthHeaders: () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      ...cacheBusterHeaders,
    };
  },

  // Asynchronous action to fetch fresh single question data from database
  fetchQuestionById: async (quizId, questionId) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${get().url}/${quizId}/questions/${questionId}`,
        { headers: get().getAuthHeaders() },
      );

      if (response.data.success) {
        set({ currentQuestion: response.data.question });
        return true;
      }
      console.log(response.data.question);

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

  // Clean up helper to reset current question when modal closes
  clearCurrentQuestion: () => set({ currentQuestion: null }),

  // 1. CREATE QUESTION
  createQuestion: async (quizId, questionData) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${get().url}/${quizId}/questions`,
        questionData,
        { headers: get().getAuthHeaders() },
      );

      if (response.data.success) {
        toast.success(response.data.message || "Question added successfully!");

        const quizStore = useQuizStore.getState();
        if (typeof quizStore.fetchQuizById === "function") {
          await quizStore.fetchQuizById(quizId);
        }

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
      const response = await axios.patch(
        `${get().url}/${quizId}/questions/${questionId}`,
        questionData,
        { headers: get().getAuthHeaders() },
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Question updated successfully!",
        );

        // Trigger parent state re-fetch immediately after successful database mutation
        const quizStore = useQuizStore.getState();
        if (typeof quizStore.fetchQuizById === "function") {
          await quizStore.fetchQuizById(quizId);
        }
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
      const response = await axios.delete(
        `${get().url}/${quizId}/questions/${questionId}`,
        { headers: get().getAuthHeaders() },
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Question deleted successfully!",
        );

        // Clear layout metrics and array items via a secure database-driven synchronization call
        const quizStore = useQuizStore.getState();
        if (typeof quizStore.fetchQuizById === "function") {
          await quizStore.fetchQuizById(quizId);
        }
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
