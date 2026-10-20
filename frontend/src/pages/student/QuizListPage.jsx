import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, SlidersHorizontal, BookOpen, RotateCcw } from "lucide-react";
import useQuizListStore from "../../features/student/quiz/store/useQuizListStore";
import DataTable from "../../components/common/DataTable";
import InterestFilterBar from "../../features/student/components/InterestFilterBar";
import InterestOnboardingModal from "../../features/student/components/InterestOnboardingModal";
import axiosClient from "../../api/axiosClient";

function QuizListPage() {
  const navigate = useNavigate();
  const { fetchAvailableQuizzes, quizzes } = useQuizListStore();
  const [interests, setInterests] = useState([]);
  const [selectedInterestId, setSelectedInterestId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(true);

  // Fetch only the student's chosen interests from their profile
  const fetchStudentInterests = useCallback(async () => {
    try {
      setLoadingInterests(true);
      const res = await axiosClient.get("/interests/student/profile");
      if (res.data?.success && res.data?.data?.profile) {
        const studentInterests = res.data.data.profile.interests || [];
        setInterests(studentInterests);
      }
    } catch (err) {
      console.error("Could not load student profile interests:", err);
    } finally {
      setLoadingInterests(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableQuizzes();
    fetchStudentInterests();
  }, [fetchAvailableQuizzes, fetchStudentInterests]);

  const handleStart = useCallback((quiz) => {
    if (!quiz || !quiz.id) {
      toast.error("Invalid Question");
      return;
    }

    navigate("/student/quiz/rules", {
      state: {
        quizId: quiz.id,
        title: quiz.title,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.questions?.length || 0,
      },
    });
  }, [navigate]);

  const handleOnboardingComplete = useCallback(() => {
    setIsModalOpen(false);
    fetchStudentInterests();
    fetchAvailableQuizzes();
  }, [fetchStudentInterests, fetchAvailableQuizzes]);

  // Strictly filter quizzes by the student's selected profile interests
  const filteredQuizzes = useMemo(() => {
    if (!quizzes || quizzes.length === 0 || !interests || interests.length === 0) {
      return [];
    }

    const studentInterestIdStrings = new Set(
      interests.map((i) => (i._id?.toString() || i.id?.toString() || "").trim())
    );

    // 1. Base filter: Quiz MUST belong to at least one of the student's chosen profile topics
    const allowedQuizzes = quizzes.filter((q) => {
      // Direct ID check
      const matchesId = (q.interestIds || []).some((item) => {
        const idStr = (typeof item === "object" ? item?._id : item)?.toString() || "";
        return studentInterestIdStrings.has(idStr);
      });
      if (matchesId) return true;

      // Fallback topic tag or name matching against student's selected interests
      return interests.some((interest) => {
        const tags = (interest.topicTags || []).map((t) => t.toLowerCase());
        const interestName = (interest.name || "").toLowerCase();
        const title = (q.title || "").toLowerCase();
        const desc = (q.description || "").toLowerCase();
        const quizTags = (q.tags || []).map((t) => t.toLowerCase());

        return (
          tags.some((t) => title.includes(t) || desc.includes(t) || quizTags.includes(t)) ||
          title.includes(interestName) ||
          desc.includes(interestName)
        );
      });
    });

    // 2. If a specific interest filter pill is clicked, filter strictly to that topic
    if (selectedInterestId) {
      const activeInterest = interests.find(
        (i) => (i._id?.toString() || i.id?.toString()) === selectedInterestId.toString()
      );
      if (!activeInterest) return allowedQuizzes;

      const targetId = (activeInterest._id?.toString() || activeInterest.id?.toString() || "").trim();
      const tags = (activeInterest.topicTags || []).map((t) => t.toLowerCase());
      const interestName = (activeInterest.name || "").toLowerCase();

      return allowedQuizzes.filter((q) => {
        const matchesId = (q.interestIds || []).some((item) => {
          const idStr = (typeof item === "object" ? item?._id : item)?.toString() || "";
          return idStr === targetId;
        });
        if (matchesId) return true;

        const title = (q.title || "").toLowerCase();
        const desc = (q.description || "").toLowerCase();
        const quizTags = (q.tags || []).map((t) => t.toLowerCase());

        return (
          tags.some((t) => title.includes(t) || desc.includes(t) || quizTags.includes(t)) ||
          title.includes(interestName) ||
          desc.includes(interestName)
        );
      });
    }

    return allowedQuizzes;
  }, [quizzes, selectedInterestId, interests]);

  // Define headers for the DataTable
  const headers = useMemo(() => ["Quiz Title", "Time Limit", "Questions", "Attempts", ""], []);

  // Define renderRow for DataTable
  const renderQuizRow = useCallback((quiz) => {
    const isExhausted = quiz?.maxAttempts > 0 && (quiz?.attemptsRemaining === 0 || quiz?.canAttempt === false);

    return (
      <>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-main">{quiz?.title}</div>
          <div className="text-sm text-muted">{quiz?.description}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
          {quiz?.timeLimit} minutes
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
          {quiz?.questions?.length || 0}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {quiz?.maxAttempts > 0 ? (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                  !isExhausted
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                {quiz?.attemptsUsed || 0} / {quiz?.maxAttempts} Used
              </span>
              <span className="text-[11px] text-muted">
                {!isExhausted
                  ? `${quiz?.attemptsRemaining ?? (quiz.maxAttempts - (quiz.attemptsUsed || 0))} attempts left`
                  : "No attempts remaining"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <RotateCcw className="w-3 h-3" />
                Unlimited
              </span>
              <span className="text-[11px] text-muted">
                {quiz?.attemptsUsed || 0} attempts taken
              </span>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => handleStart(quiz)}
            disabled={isExhausted}
            className={`inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white transition-all shadow-sm ${
              isExhausted
                ? "bg-gray-400 dark:bg-zinc-700 opacity-60 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }`}
          >
            <Play className="w-4 h-4" /> {isExhausted ? "Limit Reached" : "Start"}
          </button>
        </td>
      </>
    );
  }, [handleStart]);

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Catalog
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Available Quizzes</h1>
          <p className="text-sm text-muted mt-1">
            Quizzes customized strictly to your chosen learning interests and electives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Manage Interests
          </button>

          <div className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredQuizzes.length} Quizzes Available
          </div>
        </div>
      </div>

      {/* Interest Filter Bar (strictly displays only student's selected interests) */}
      {interests.length > 0 && (
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <InterestFilterBar
            interests={interests}
            activeInterestId={selectedInterestId}
            onSelectInterest={setSelectedInterestId}
          />
        </div>
      )}

      {/* Quizzes Table / Empty State */}
      {filteredQuizzes.length > 0 ? (
        <DataTable
          headers={headers}
          data={filteredQuizzes}
          renderRow={renderQuizRow}
          isView={false}
          isEdit={false}
          isDelete={false}
          type="quiz"
        />
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {interests.length === 0
              ? "No interests selected in your profile yet"
              : selectedInterestId
              ? "No quizzes found for this selected topic"
              : "No quizzes match your selected interests"}
          </p>
          <p className="text-xs text-muted mt-1.5">
            {interests.length === 0
              ? "Select your current topics or electives to unlock tailored quizzes."
              : selectedInterestId
              ? "Try switching to 'All Quizzes' or pick another topic from your interests."
              : "Update your interests to explore quizzes across different engineering topics."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {selectedInterestId && (
              <button
                onClick={() => setSelectedInterestId(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Clear Topic Filter
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
            >
              Manage Interests
            </button>
          </div>
        </div>
      )}

      {/* Onboarding / Interest Management Modal */}
      <InterestOnboardingModal
        isOpen={isModalOpen}
        initialSelectedIds={interests.map((i) => i._id || i.id)}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

export default QuizListPage;
