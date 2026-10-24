import { create } from "zustand";

import axiosClient from "../../../../api/axiosClient";

const useQuizListStore = create((set, get) => ({
  quizzes: [],
  loading: false,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",

  fetchAvailableQuizzes: async (params = {}) => {
    set({ loading: true });
    try {
      const cleanParams = {};
      if (params.interestId) cleanParams.interestId = params.interestId;
      if (params.level) cleanParams.level = params.level;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;

      let response;
      try {
        response = await axiosClient.get("/student/quizzes", { params: cleanParams });
      } catch (err) {
        response = await axiosClient.get("/quizzes/student", { params: cleanParams });
      }
      set({ quizzes: response.data?.data || [] });
    } catch (error) {
      console.error("Error fetching student quizzes:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useQuizListStore;
