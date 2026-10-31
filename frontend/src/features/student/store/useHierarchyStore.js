import { create } from "zustand";
import axiosClient from "../../../api/axiosClient";

export const useHierarchyStore = create((set, get) => ({
  domains: [],
  selectedDomain: null,
  courses: [],
  selectedCourse: null,
  courseHierarchy: null,
  loading: false,
  error: null,

  // Fetch all domains
  fetchDomains: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get("/hierarchy/domains");
      if (res.data?.success) {
        const domains = res.data.data || [];
        set({ domains });

        // Auto-select first domain or restore saved
        const savedDomainId = localStorage.getItem("selectedDomainId");
        const found = domains.find((d) => d._id === savedDomainId) || domains[0];
        if (found) {
          get().selectDomain(found);
        }
      }
    } catch (err) {
      set({ error: err.message || "Failed to load domains" });
    } finally {
      set({ loading: false });
    }
  },

  // Select a domain & load its courses
  selectDomain: async (domain) => {
    if (!domain) return;
    localStorage.setItem("selectedDomainId", domain._id);
    set({ selectedDomain: domain, selectedCourse: null, courseHierarchy: null, loading: true });

    try {
      const res = await axiosClient.get(`/hierarchy/domains/${domain._id}/courses`);
      if (res.data?.success) {
        const courses = res.data.data || [];
        set({ courses });

        // Auto-select first course or restore saved
        const savedCourseId = localStorage.getItem(`selectedCourseId_${domain._id}`);
        const foundCourse = courses.find((c) => c._id === savedCourseId) || courses[0];
        if (foundCourse) {
          get().selectCourse(foundCourse);
        }
      }
    } catch (err) {
      set({ error: err.message || "Failed to load courses" });
    } finally {
      set({ loading: false });
    }
  },

  // Select a course & load its chapters with quizzes
  selectCourse: async (course) => {
    if (!course) return;
    const { selectedDomain } = get();
    if (selectedDomain) {
      localStorage.setItem(`selectedCourseId_${selectedDomain._id}`, course._id);
    }
    set({ selectedCourse: course, loading: true });

    try {
      const res = await axiosClient.get(`/hierarchy/courses/${course._id}/hierarchy`);
      if (res.data?.success) {
        set({ courseHierarchy: res.data.data });
      }
    } catch (err) {
      set({ error: err.message || "Failed to load course hierarchy" });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useHierarchyStore;

