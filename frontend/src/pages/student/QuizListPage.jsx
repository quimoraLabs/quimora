import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, SlidersHorizontal, BookOpen, RotateCcw, Search, Tag, X, CheckCircle2, Eye, Compass, ArrowRight } from "lucide-react";
import useQuizListStore from "../../features/student/quiz/store/useQuizListStore";
import DataTable from "../../components/common/DataTable";
import InterestFilterBar from "../../features/student/components/InterestFilterBar";
import InterestOnboardingModal from "../../features/student/components/InterestOnboardingModal";
import QuizDetailsModal from "../../features/student/quiz/QuizDetailsModal";
import axiosClient from "../../api/axiosClient";

const getTopicBadge = (quiz) => {
  const t = (quiz?.title || "").toLowerCase();
  const tags = (quiz?.tags || []).map((x) => x.toLowerCase());

  if (t.includes("html") || tags.includes("html") || tags.includes("html5")) {
    return { label: "HTML5", bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
  }
  if (t.includes("css") || tags.includes("css") || tags.includes("css3") || tags.includes("flexbox")) {
    return { label: "CSS3", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" };
  }
  if (t.includes("javascript") || t.includes(" js ") || tags.includes("javascript") || tags.includes("es6")) {
    return { label: "JavaScript", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  }
  if (t.includes("react") || tags.includes("react")) {
    return { label: "React", bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" };
  }
  if (t.includes("node") || t.includes("express") || tags.includes("node")) {
    return { label: "Node.js", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  }
  if (t.includes("sql") || tags.includes("sql")) {
    return { label: "SQL", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
  }
  if (t.includes("mongo") || tags.includes("mongodb")) {
    return { label: "MongoDB", bg: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" };
  }
  if (t.includes("comprehensive") || tags.includes("comprehensive")) {
    return { label: "Comprehensive", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
  }
  return { label: "Specialized", bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
};

function QuizListPage() {
  const navigate = useNavigate();
  const { fetchAvailableQuizzes, quizzes } = useQuizListStore();
  const [interests, setInterests] = useState([]);
  const [selectedInterestId, setSelectedInterestId] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectedQuiz, setInspectedQuiz] = useState(null);

  // Fetch Student Selected Interests for strictly customized view
  const fetchStudentInterests = useCallback(async () => {
    try {
      const res = await axiosClient.get("/api/v2/interests/student/profile");
      if (res.data?.success && res.data?.data?.interests) {
        setInterests(res.data.data.interests);
        if (res.data.data.interests.length > 0) {
          setSelectedInterestId(res.data.data.interests[0]._id);
        }
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresOnboarding) {
        setIsModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchStudentInterests();
    fetchAvailableQuizzes();
  }, [fetchStudentInterests, fetchAvailableQuizzes]);

  const handleStartExam = useCallback((quiz) => {
    const quizId = quiz._id || quiz.id;
    if (!quizId) {
      toast.error("Quiz identifier is invalid or missing");
      return;
    }

    try {
      sessionStorage.setItem("activeExamQuizId", quizId);
      sessionStorage.setItem("activeExamQuizTitle", quiz.title || "Assessment");
      sessionStorage.setItem("activeExamQuizDuration", String(quiz.timeLimit || 15));
      sessionStorage.setItem("activeExamQuizQuestions", String(quiz.questions?.length || 15));
    } catch (e) {
      console.warn("sessionStorage warning:", e);
    }

    navigate("/student/quiz/rules", {
      state: {
        quizId,
        title: quiz.title,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.questions?.length || 15,
        tags: quiz.tags || [],
      },
    });
  }, [navigate]);

  const handleOnboardingComplete = useCallback(() => {
    setIsModalOpen(false);
    fetchStudentInterests();
    fetchAvailableQuizzes();
  }, [fetchStudentInterests, fetchAvailableQuizzes]);

  // Base interest-filtered quizzes
  const interestFilteredQuizzes = useMemo(() => {
    if (!quizzes || quizzes.length === 0) {
      return [];
    }

    if (!interests || interests.length === 0) {
      return quizzes;
    }

    const studentInterestIdStrings = new Set(
      interests.map((i) => (i._id?.toString() || i.id?.toString() || "").trim())
    );

    const allowedQuizzes = quizzes.filter((q) => {
      const matchesId = (q.interestIds || []).some((item) => {
        const idStr = (typeof item === "object" ? item?._id : item)?.toString() || "";
        return studentInterestIdStrings.has(idStr);
      });
      if (matchesId) return true;

      return interests.some((interest) => {
        const tags = (interest.topicTags || []).map((t) => t.toLowerCase());
        const interestName = (interest.name || "").toLowerCase();
        const title = (q.title || "").toLowerCase();
        const desc = (q.description || "").toLowerCase();
        const quizTags = (q.tags || []).map((t) => t.toLowerCase());

        return (
          tags.some((tag) => title.includes(tag) || desc.includes(tag) || quizTags.includes(tag)) ||
          title.includes(interestName) ||
          desc.includes(interestName)
        );
      });
    });

    if (!selectedInterestId) {
      return allowedQuizzes;
    }

    const currentSelected = interests.find(
      (i) => (i._id?.toString() || i.id?.toString()) === selectedInterestId.toString()
    );

    return allowedQuizzes.filter((q) => {
      const matchesSelectedId = (q.interestIds || []).some((item) => {
        const idStr = (typeof item === "object" ? item?._id : item)?.toString() || "";
        return idStr === selectedInterestId.toString();
      });
      if (matchesSelectedId) return true;

      if (!currentSelected) return false;

      const tags = (currentSelected.topicTags || []).map((t) => t.toLowerCase());
      const interestName = (currentSelected.name || "").toLowerCase();
      const title = (q.title || "").toLowerCase();
      const desc = (q.description || "").toLowerCase();
      const quizTags = (q.tags || []).map((t) => t.toLowerCase());

      return (
        tags.some((tag) => title.includes(tag) || desc.includes(tag) || quizTags.includes(tag)) ||
        title.includes(interestName) ||
        desc.includes(interestName)
      );
    });
  }, [quizzes, interests, selectedInterestId]);

  const availableSubtopics = useMemo(() => {
    const set = new Set();
    interestFilteredQuizzes.forEach((q) => {
      const badge = getTopicBadge(q);
      if (badge?.label) set.add(badge.label);
    });
    return Array.from(set);
  }, [interestFilteredQuizzes]);

  const finalQuizzes = useMemo(() => {
    let result = interestFilteredQuizzes;

    if (selectedSubtopic !== "all") {
      result = result.filter((q) => getTopicBadge(q).label === selectedSubtopic);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((q) => {
        const title = (q.title || "").toLowerCase();
        const desc = (q.description || "").toLowerCase();
        const tags = (q.tags || []).map((t) => t.toLowerCase());
        const badge = getTopicBadge(q).label.toLowerCase();
        return title.includes(query) || desc.includes(query) || tags.some((t) => t.includes(query)) || badge.includes(query);
      });
    }

    return result;
  }, [interestFilteredQuizzes, selectedSubtopic, searchQuery]);

  const headers = useMemo(() => ["Quiz Title", "Time Limit", "Questions", "Attempts", ""], []);

  const renderQuizRow = useCallback((quiz) => {
    const maxAttempts = Math.min(Number(quiz?.maxAttempts) || 3, 3);
    const attemptsUsed = Number(quiz?.attemptsUsed) || 0;
    const attemptsRemaining = quiz?.attemptsRemaining !== undefined
      ? Math.min(Number(quiz.attemptsRemaining), Math.max(0, maxAttempts - attemptsUsed))
      : Math.max(0, maxAttempts - attemptsUsed);
    const isExhausted = attemptsRemaining <= 0 || quiz?.canAttempt === false;
    const badge = getTopicBadge(quiz);

    return (
      <>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider border ${badge.bg}`}>
              {badge.label}
            </span>
            {quiz?.level && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                {quiz.level}
              </span>
            )}
            <div className="text-sm font-semibold text-main">{quiz?.title}</div>
          </div>
          <div className="text-xs text-muted max-w-xl line-clamp-1">{quiz?.description}</div>

          <div className="mt-2 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-2xs text-muted">
              <span className="w-4 h-4 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xs font-bold">
                {(quiz?.instructor?.name || quiz?.createdBy?.name || "Quimora Faculty").charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {quiz?.instructor?.name || quiz?.createdBy?.name || "Academic Certified"}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-3xs uppercase tracking-wider">
                • Verified Faculty
              </span>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-main">
          {quiz?.timeLimit} mins
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-main">
          {quiz?.questions?.length || 15}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted">Used:</span>
              <span className="font-semibold text-main">{attemptsUsed}</span>
              <span className="text-muted">/</span>
              <span className="text-muted">{maxAttempts}</span>
            </div>
            <div className="text-2xs font-medium">
              {isExhausted ? (
                <span className="text-rose-500 font-bold">Exhausted (3/3)</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {attemptsRemaining} {attemptsRemaining === 1 ? "attempt" : "attempts"} left
                </span>
              )}
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setInspectedQuiz(quiz)}
              title="Inspect Assessment Specs & Topics"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Details</span>
            </button>

            <button
              onClick={() => handleStartExam(quiz)}
              disabled={isExhausted}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isExhausted
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExhausted ? "Limit Reached" : "Take Exam"}</span>
            </button>
          </div>
        </td>
      </>
    );
  }, [handleStartExam]);

  const activeInterestObj = useMemo(() => {
    return interests.find((i) => (i._id?.toString() || i.id?.toString()) === selectedInterestId?.toString()) || interests[0];
  }, [interests, selectedInterestId]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            Adaptive Catalog
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Available Quizzes</h1>
          <p className="text-sm text-muted mt-1">
            Quizzes customized strictly to your chosen learning interests and electives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeInterestObj && (
            <button
              onClick={() => navigate(`/student/tracks/${activeInterestObj._id || activeInterestObj.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Open Skill Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Manage Interests
          </button>
        </div>
      </div>

      {/* Interest Filter Bar */}
      {interests.length > 0 && (
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <InterestFilterBar
            interests={interests}
            activeInterestId={selectedInterestId}
            onSelectInterest={(id) => {
              setSelectedInterestId(id);
              setSelectedSubtopic("all");
            }}
          />
        </div>
      )}

      {/* Granular Topic Choice Toolbar: Search & Subtopic Chips */}
      {interestFilteredQuizzes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Subtopic Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-medium text-muted mr-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Topic:
            </span>
            <button
              onClick={() => setSelectedSubtopic("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubtopic === "all"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Topics ({interestFilteredQuizzes.length})
            </button>
            {availableSubtopics.map((sub) => {
              const count = interestFilteredQuizzes.filter((q) => getTopicBadge(q).label === sub).length;
              const isActive = selectedSubtopic === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubtopic(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-55">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search HTML, CSS, JS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-main focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Quizzes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable
          headers={headers}
          data={finalQuizzes}
          renderRow={renderQuizRow}
          emptyMessage="No quizzes found matching your current interest or filter. Try selecting another topic or manage your interests."
        />
      </div>

      {/* Onboarding / Interests Modal */}
      <InterestOnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Quiz Details Modal */}
      <QuizDetailsModal
        isOpen={Boolean(inspectedQuiz)}
        quiz={inspectedQuiz}
        onClose={() => setInspectedQuiz(null)}
        onTakeExam={handleStartExam}
      />
    </div>
  );
}

export default QuizListPage;
