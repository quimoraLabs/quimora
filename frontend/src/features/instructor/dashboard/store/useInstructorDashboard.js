import { create } from "zustand";
import axiosClient from "../../../../api/axiosClient";

const useInstructorDashboard = create((set) => ({
  dashboardStats: null,
  dashboardLoading: false,

  fetchDashboardStats: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ dashboardStats: null, dashboardLoading: false });
      return;
    }

    set({ dashboardLoading: true });

    try {
      const response = await axiosClient.get("/instructor/dashboard");

      if (response.data?.success) {
        set({ dashboardStats: response.data.data });
      }
    } catch (error) {
      // 401 & 403 errors are already intercepted and toasted by axiosClient
      console.log(error)
      set({ dashboardStats: null });
    } finally {
      set({ dashboardLoading: false });
    }
  },

  resetDashboardStore: () =>
    set({ dashboardStats: null, dashboardLoading: false }),
}));

export default useInstructorDashboard;
