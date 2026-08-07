import { create } from "zustand";

import axiosClient from "../../../../api/axiosClient";

const useQuizListStore = create((set, get) => ({
  quizzes: [],
  loading: false,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",

  fetchAvailableQuizzes: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get(`${get().url}/quizzes/student`);
      set({ quizzes: response.data?.data || [] });
    } catch (error) {
      console.error("Error fetching student quizzes:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useQuizListStore;
