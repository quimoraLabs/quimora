import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { cacheBusterHeaders } from "../utils/httpHeaders";

const getAuthToken = () => localStorage.getItem("token");

const useAttemptQuizStore = create((set, get) => ({
  attemptQuiz: null,
  attemptId: null,
  loading: false,
  quiz: null,
  currentIndex: 0,
  timer: 0,
  answers: {},
  warningCount: 0,
  isFinished: false,
  quizResults: null,
  dashboardStats: null,
  dashboardLoading: false,
  lastAttemptId: null,
  url: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  loadPersistedQuizResult: async () => {
    const persistedAttemptId = localStorage.getItem("lastAttemptId");
    const persistedQuizResults = localStorage.getItem("lastQuizResults");

    if (persistedQuizResults) {
      try {
        set({ quizResults: JSON.parse(persistedQuizResults) });
      } catch (error) {
        console.error("Could not parse cached quiz results:", error);
      }
    }

    if (!persistedAttemptId) {
      return;
    }

    const { url } = get();
    const token = getAuthToken();
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(`${url}/attempts/results/${persistedAttemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...cacheBusterHeaders,
        },
      });

      if (response.data.success) {
        const persistedResults =
          response.data.quizResults ??
          response.data.summary ??
          response.data.attemptDetails ??
          null;

        if (persistedResults) {
          set({ quizResults: persistedResults, attemptId: persistedAttemptId, lastAttemptId: persistedAttemptId });
          localStorage.setItem("lastAttemptId", persistedAttemptId);
          localStorage.setItem("lastQuizResults", JSON.stringify(persistedResults));
        }
      }
    } catch (error) {
      console.error("Failed to refresh persisted quiz result:", error);
    }
  },

  clearQuizSession: () => {
    localStorage.removeItem("lastAttemptId");
    localStorage.removeItem("lastQuizResults");
    set({
      attemptQuiz: null,
      attemptId: null,
      currentIndex: 0,
      timer: 0,
      answers: {},
      warningCount: 0,
      isFinished: false,
      quizResults: null,
      lastAttemptId: null,
    });
  },

  //   1 Start quiz attempt
  startAttempt: async (quizId, navigate) => {
    if (!quizId) {
      toast.error("Quiz ID is required to start an attempt.");
      return;
    }
    set({ loading: true });
    try {
      const response = await axios.post(
        `${get().url}/attempts/start`,
        { quizId },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            ...cacheBusterHeaders,
          },
        },
      );
      if (response.data.success) {
        // Extract properties safely from cleanly mapped response.data
        const { attemptId, quiz } = response.data;

        set({
          attemptId: attemptId, // Store your persistent database attempt tracker session ID
          lastAttemptId: attemptId,
          attemptQuiz: quiz, // This contains title, description, and your clean dynamic questions array
          currentIndex: 0,
          timer: quiz.timeLimit ? quiz.timeLimit * 60 : 600, // Convert minutes from backend database directly to local countdown seconds
          answers: {}, // Clean object format for instant hash map lookups
          warningCount: 0,
          isFinished: false,
          quizResults: null,
        });
        localStorage.setItem("lastAttemptId", attemptId);

        // after state is set, navigate to the quiz interface
        navigate("/student/start-quiz");
      }
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast.error("Failed to start quiz attempt.");
    } finally {
      set({ loading: false });
    }
  },

  // 2. Select Option Handler (Save against questionId)
  selectOption: (questionId, selectedOptions) => {
    set((state) => ({
      answers: {
        ...state.answers,
        // Keep it clean as an array or comma-separated string depending on selection source
        [questionId]: Array.isArray(selectedOptions)
          ? selectedOptions.toString()
          : selectedOptions.toString(),
      },
    }));
  },

  // ⏱️ 3. Live Clock Engine (Ticks every second)
  tickTimer: (navigate) => {
    set((state) => {
      if (state.timer > 0) {
        return { timer: state.timer - 1 };
      } else {
        // Timer expired, handle accordingly
        toast.error("Time's up! Your quiz will be submitted automatically.");
        get().submitAttempt(navigate); // Auto-submit on timer expiration
        return { timer: 0 };
      }
    });
  },

  // 4 anti-cheat warning incrementer
  incrementWarning: (message, navigate) => {
    toast.error(message);
    set((state) => {
      const newCount = state.warningCount + 1;
      if (newCount >= 3) {
        toast.error(
          "You have exceeded the maximum number of warnings. Your quiz will be submitted.",
        );
        get().submitAttempt(navigate);
      }
      return { warningCount: newCount };
    });
  },

  // 5. Pagination Controls
  goToNextQuestion: () => {
    const { currentIndex, attemptQuiz } = get();
    if (attemptQuiz && currentIndex < attemptQuiz.questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  goToPreviousQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  //   6. Submit quiz attempt
  submitAttempt: async (navigate) => {
    const { attemptId, attemptQuiz, answers, isFinished, loading } = get();
    if (!attemptId || !attemptQuiz) {
      toast.error("Attempt ID is required to submit an attempt.");
      return false;
    }
    if (isFinished || loading) {
      toast.error("This quiz attempt has already been submitted.");
      return false;
    }

    set({ loading: true });
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedOptions]) => ({
          questionId,
          selectedOptions: selectedOptions ? selectedOptions.split(",") : [],
        }),
      );

      const response = await axios.post(
        `${get().url}/attempts/submit`,
        { attemptId, answers: formattedAnswers },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            ...cacheBusterHeaders,
          },
        },
      );
      if (response.data.success) {
        toast.success("Quiz submitted successfully!");
        // Store results in state for display on results page
        set({
          quizResults: response.data.summary,
          isFinished: true,
          loading: false,
        });
        localStorage.setItem("lastAttemptId", attemptId);
        localStorage.setItem("lastQuizResults", JSON.stringify(response.data.summary));
        // Navigate to results page after submission
        navigate("/student/quiz-results", { replace: true }); // Use replace to prevent going back to quiz interface
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      toast.error("Failed to submit quiz attempt.");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  studentAllResults: async () => {
    set({ loading: true });
    const token = getAuthToken();
    try {
      const response = await axios.get(`${get().url}/attempts/my-results`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...cacheBusterHeaders,
        },
      });
      // console.log(response.data.attempts.data);

      if (response.data.success) {
        set({ quizResults: response.data.attempts?.data ?? response.data.attempts ?? [] });
        // navigate("/student/my-results");
      }
    } catch (error) {
      console.error("Error fetching all quiz results:", error);
      toast.error("Failed to fetch quiz results.");
    } finally {
      set({ loading: false });
    }
  },

  fetchDashboardStats: async () => {
    set({ dashboardLoading: true });
    const { url } = get();
    const token = getAuthToken();

    if (!token) {
      set({ dashboardStats: null, dashboardLoading: false });
      return;
    }

    try {
      const response = await axios.get(`${url}/attempts/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...cacheBusterHeaders,
        },
      });

      if (response.data.success) {
        set({ dashboardStats: response.data.dashboard });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // toast.error("Failed to load dashboard stats.");
    } finally {
      set({ dashboardLoading: false });
    }
  },

  studentResults: async (navigate) => {
    set({ loading: true });
    const { attemptId } = get();
    const token = getAuthToken();
    if (!attemptId) {
      toast.error("Attempt ID is required to fetch results.");
      set({ loading: false });
      return;
    }
    try {
      const response = await axios.get(
        `${get().url}/attempts/results/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...cacheBusterHeaders,
          },
        },
      );
      if (response.data.success) {
        set({ quizResults: response.data.summary });
        localStorage.setItem("lastAttemptId", attemptId);
        localStorage.setItem("lastQuizResults", JSON.stringify(response.data.summary));
        navigate("/student/quiz-results");
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      toast.error("Failed to fetch quiz results.");
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAttemptQuizStore;
