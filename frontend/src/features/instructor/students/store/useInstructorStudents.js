import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../../api/axiosClient";

const useInstructorStudents = create((set) => ({
  // Students Overview
  students: [],
  studentsLoading: false,

  // Quiz-specific Submissions
  quizSubmissions: null,
  submissionsLoading: false,

  // Single Attempt Review Inspector
  attemptReview: null,
  reviewLoading: false,

  // Fetch all students who attempted this instructor's quizzes
  fetchStudents: async () => {
    set({ studentsLoading: true });
    try {
      const response = await axiosClient.get("/instructor/students");
      if (response.data?.success) {
        set({ students: response.data.data || [] });
      }
    } catch (error) {
      console.error("Error fetching instructor students:", error);
      toast.error(
        error.response?.data?.message || "Failed to load student analytics."
      );
    } finally {
      set({ studentsLoading: false });
    }
  },

  // Fetch submissions for a specific quiz
  fetchQuizSubmissions: async (quizId) => {
    set({ submissionsLoading: true });
    try {
      const response = await axiosClient.get(
        `/instructor/submissions/${quizId}`
      );
      if (response.data?.success) {
        set({ quizSubmissions: response.data.data });
      }
    } catch (error) {
      console.error("Error fetching quiz submissions:", error);
      toast.error(
        error.response?.data?.message || "Failed to load quiz submissions."
      );
    } finally {
      set({ submissionsLoading: false });
    }
  },

  // Fetch detailed question-by-question review of a student attempt
  fetchAttemptReview: async (attemptId) => {
    set({ reviewLoading: true });
    try {
      const response = await axiosClient.get(
        `/instructor/review/${attemptId}`
      );
      if (response.data?.success) {
        set({ attemptReview: response.data.data });
      }
    } catch (error) {
      console.error("Error fetching attempt review:", error);
      toast.error(
        error.response?.data?.message || "Failed to load student answer sheet."
      );
    } finally {
      set({ reviewLoading: false });
    }
  },

  clearAttemptReview: () => set({ attemptReview: null }),
  clearQuizSubmissions: () => set({ quizSubmissions: null }),
}));

export default useInstructorStudents;
