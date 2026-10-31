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

        // Auto-select first domain, restore saved, or align with student's enrolled profile
        const savedDomainId = localStorage.getItem("selectedDomainId");
        let found = domains.find((d) => d._id === savedDomainId);

        try {
          const profRes = await axiosClient.get("/interests/student/profile");
          const userInterests =
            profRes.data?.data?.interests ||
            profRes.data?.data?.profile?.interests ||
            [];
          if (userInterests.length > 0) {
            const firstInterest = userInterests[0];
            const interestName = (typeof firstInterest === "object" ? firstInterest.name || "" : "").toLowerCase();
            const interestSlug = (typeof firstInterest === "object" ? firstInterest.slug || "" : "").toLowerCase();

            const matchedByInterest = domains.find((d) => {
              const domName = d.name.toLowerCase();
              if (interestName.includes("python") || interestName.includes("data science") || interestSlug.includes("data-science")) {
                return domName.includes("python") || domName.includes("data science");
              }
              if (interestName.includes("web") || interestSlug.includes("web")) {
                return domName.includes("web");
              }
              return domName.includes(interestName) || interestName.includes(domName);
            });

            if (matchedByInterest) {
              const isSavedStillMatching = found && (
                (found.name.toLowerCase().includes("python") && (interestName.includes("python") || interestName.includes("data science"))) ||
                (found.name.toLowerCase().includes("web") && interestName.includes("web"))
              );
              if (!savedDomainId || !isSavedStillMatching) {
                found = matchedByInterest;
              }
            }
          }
        } catch (e) {
          console.warn("Could not fetch student interest profile for domain auto-select:", e);
        }

        found = found || domains[0];
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

