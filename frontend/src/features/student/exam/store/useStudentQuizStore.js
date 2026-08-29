import { create } from "zustand";
import toast from "react-hot-toast";
import axiosClient from "../../../../api/axiosClient";

const getAuthToken = () => localStorage.getItem("token");

const useStudentQuizStore = create((set, get) => ({
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
    const token = getAuthToken();
    if (!token) {
      return;
    }

    try {
      const response = await axiosClient.get(
        `/student/attempts/${persistedAttemptId}/result`
      );

      if (response.data.success) {
        const persistedResults =
          response.data.quizResults ??
          response.data.summary ??
          response.data.attemptDetails ??
          null;

        if (persistedResults) {
          set({
            quizResults: persistedResults,
            attemptId: persistedAttemptId,
            lastAttemptId: persistedAttemptId,
          });
          localStorage.setItem("lastAttemptId", persistedAttemptId);
          localStorage.setItem(
            "lastQuizResults",
            JSON.stringify(persistedResults),
          );
        }
      }
    } catch (error) {
      console.error("Failed to refresh persisted quiz result:", error);
    }
  },

  clearQuizSession: () => {
    const { attemptId } = get();
    localStorage.removeItem("lastAttemptId");
    localStorage.removeItem("lastQuizResults");
    localStorage.removeItem("activeExamSession");
    if (attemptId) {
      localStorage.removeItem(`quiz_answers_${attemptId}`);
    }
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

  // 1. Start or Resume Quiz Attempt with accurate timer calculation & answer restoration
  startAttempt: async (quizId, navigate) => {
    if (!quizId) {
      toast.error("Quiz ID is required to start an attempt.");
      return;
    }
    set({ loading: true });
    try {
      const response = await axiosClient.post(`/student/quiz/start`, { quizId });
      if (response.data.success) {
        const { attemptId, quiz, startedAt, answers: backendAnswers } = response.data.data;

        // Calculate actual remaining time based on server startedAt timestamp
        const startedAtMs = startedAt ? new Date(startedAt).getTime() : Date.now();
        const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);
        const totalLimitSeconds = quiz.timeLimit ? quiz.timeLimit * 60 : 600;
        const remainingSeconds = Math.max(0, totalLimitSeconds - elapsedSeconds);

        // Restore initial answers: Check localStorage first, fallback to backend answers
        let initialAnswers = {};
        const cachedAnswersStr = localStorage.getItem(`quiz_answers_${attemptId}`);
        if (cachedAnswersStr) {
          try {
            initialAnswers = JSON.parse(cachedAnswersStr);
          } catch (e) {
            console.error("Failed to parse cached answers:", e);
          }
        }

        // Fallback to backend draft answers if local cache was empty
        if (Object.keys(initialAnswers).length === 0 && Array.isArray(backendAnswers)) {
          backendAnswers.forEach((ans) => {
            if (ans.questionId && Array.isArray(ans.selectedOptions) && ans.selectedOptions.length > 0) {
              initialAnswers[ans.questionId] = ans.selectedOptions.join(",");
            }
          });
        }

        set({
          attemptId: attemptId,
          lastAttemptId: attemptId,
          attemptQuiz: quiz,
          currentIndex: 0,
          timer: remainingSeconds,
          answers: initialAnswers,
          warningCount: 0,
          isFinished: false,
          quizResults: null,
        });

        // Persist session info to localStorage
        localStorage.setItem("lastAttemptId", attemptId);
        localStorage.setItem(
          "activeExamSession",
          JSON.stringify({ attemptId, quizId, startedAt })
        );
        localStorage.setItem(`quiz_answers_${attemptId}`, JSON.stringify(initialAnswers));

        if (navigate) {
          navigate("/student/quiz/start");
        }
      }
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast.error("Failed to start quiz attempt.");
    } finally {
      set({ loading: false });
    }
  },

  // Sync draft answers to backend
  saveDraft: async () => {
    const { attemptId, answers } = get();
    if (!attemptId) return;

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedOptions]) => ({
        questionId,
        selectedOptions: selectedOptions ? selectedOptions.split(",") : [],
      })
    );

    try {
      await axiosClient.patch('/student/quiz/save-draft', {
        attemptId,
        answers: formattedAnswers,
      });
    } catch (err) {
      console.error("Background save draft failed:", err);
    }
  },

  // 2. Select Option Handler (Save to state, localStorage & backend draft)
  selectOption: (questionId, selectedOptions) => {
    const { attemptQuiz, attemptId } = get();
    const question = attemptQuiz?.questions.find((q) => q._id === questionId);

    if (!question) {
      toast.error("Could not find the question to save answer for.");
      return;
    }

    const optionIds = (
      Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions]
    )
      .map((selectedIndex) => {
        const index = Number(selectedIndex);
        return question.options[index]?._id;
      })
      .filter(Boolean);

    const newAnswers = {
      ...get().answers,
      [questionId]: optionIds.join(","),
    };

    set({ answers: newAnswers });

    // Save to localStorage immediately
    if (attemptId) {
      localStorage.setItem(`quiz_answers_${attemptId}`, JSON.stringify(newAnswers));
    }

    // Auto-sync draft to backend
    get().saveDraft();
  },

  // ⏱️ 3. Live Clock Engine (Ticks every second)
  tickTimer: (navigate) => {
    const { timer, isFinished } = get();
    if (isFinished) return;

    if (timer > 1) {
      set({ timer: timer - 1 });
    } else {
      toast.error("Time's up! Your quiz will be submitted automatically.");
      set({ timer: 0 });
      get().submitAttempt(navigate);
    }
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

  // 2. Submit Attempt
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

      const response = await axiosClient.post(
        `/student/quiz/submit`, // 👈 Exact controller route
        { attemptId, answers: formattedAnswers });
      if (response.data.success) {
        toast.success("Quiz submitted successfully!");
        localStorage.removeItem("activeExamSession");
        localStorage.removeItem(`quiz_answers_${attemptId}`);
        set({
          quizResults: response.data.data,
          isFinished: true,
          loading: false,
        });
        localStorage.setItem("lastAttemptId", attemptId);
        localStorage.setItem(
          "lastQuizResults",
          JSON.stringify(response.data.data),
        );
        navigate("/student/quiz/results", { replace: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // 3. Get All Student Attempt History
  studentAllResults: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get(`/student/attempts`);

      if (response.data.success) {
        set({ quizResults: response.data.data }); // 👈 Access via .data.data
      }
    } catch (error) {
      console.error("Error fetching all quiz results:", error);
      toast.error("Failed to fetch quiz results.");
    } finally {
      set({ loading: false });
    }
  },

  // 4. Dashboard Stats
  fetchDashboardStats: async () => {
    set({ dashboardLoading: true });
    const token = getAuthToken();

    if (!token) {
      set({ dashboardStats: null, dashboardLoading: false });
      return;
    }

    try {
      const response = await axiosClient.get(`/student/dashboard`);

      if (response.data.success) {
        set({ dashboardStats: response.data.data }); // 👈 Access via .data.data
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      set({ dashboardLoading: false });
    }
  },

  // 5. Single Result / Attempt Details
  studentResults: async (navigate) => {
    set({ loading: true });
    const { attemptId } = get();
    if (!attemptId) {
      toast.error("Attempt ID is required to fetch results.");
      set({ loading: false });
      return;
    }
    try {
      const response = await axiosClient.get(
        `/student/attempts/${attemptId}`, // 👈 Exact controller route
        );
      if (response.data.success) {
        set({ quizResults: response.data.data }); // 👈 Access via .data.data
        localStorage.setItem("lastAttemptId", attemptId);
        localStorage.setItem(
          "lastQuizResults",
          JSON.stringify(response.data.data),
        );
        navigate("/student/quiz/results"); // Navigate to the quiz results page
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStudentQuizStore;
