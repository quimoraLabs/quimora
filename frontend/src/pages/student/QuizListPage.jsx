import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, SlidersHorizontal, BookOpen, RotateCcw, Search, Tag, X } from "lucide-react";
import useQuizListStore from "../../features/student/quiz/store/useQuizListStore";
import DataTable from "../../components/common/DataTable";
import InterestFilterBar from "../../features/student/components/InterestFilterBar";
import InterestOnboardingModal from "../../features/student/components/InterestOnboardingModal";
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
    fetchAvailableQuizzes({ interestId: selectedInterestId });
  }, [fetchAvailableQuizzes, selectedInterestId]);

  useEffect(() => {
    fetchStudentInterests();
  }, [fetchStudentInterests]);

  const handleStart = useCallback((quiz) => {
    const quizId = quiz?._id || quiz?.id;
    if (!quiz || !quizId) {
      toast.error("Invalid quiz selection");
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

    // If student has no selected interests yet, show all available published quizzes
    if (!interests || interests.length === 0) {
      return quizzes;
    }

    const studentInterestIdStrings = new Set(
      interests.map((i) => (i._id?.toString() || i.id?.toString() || "").trim())
    );

    // 1. Base filter: Quiz belongs strictly to student's chosen topics
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

  // Extract available subtopics from current pool of quizzes (e.g. HTML, CSS, JavaScript)
  const availableSubtopics = useMemo(() => {
    const set = new Set();
    interestFilteredQuizzes.forEach((q) => {
      const badge = getTopicBadge(q);
      if (badge && badge.label) {
        set.add(badge.label);
      }
    });
    return Array.from(set);
  }, [interestFilteredQuizzes]);

  // Apply subtopic pill filter and search query filter
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

  // Define headers for the DataTable
  const headers = useMemo(() => ["Quiz Title", "Time Limit", "Questions", "Attempts", ""], []);

  // Define renderRow for DataTable
  const renderQuizRow = useCallback((quiz) => {
    // Strictly clamp maxAttempts to 3
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
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
              {badge.label}
            </span>
            {quiz?.level && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                {quiz.level}
              </span>
            )}
            <div className="text-sm font-semibold text-main">{quiz?.title}</div>
          </div>
          <div className="text-xs text-muted max-w-xl line-clamp-1">{quiz?.description}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
          {quiz?.timeLimit} minutes
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
          {quiz?.questions?.length || 0}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                !isExhausted
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              {attemptsUsed} / {maxAttempts} Used
            </span>
            <span className="text-[11px] text-muted">
              {!isExhausted
                ? `${attemptsRemaining} attempts left`
                : "No attempts remaining"}
            </span>
          </div>
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
            {finalQuizzes.length} Quizzes Available
          </div>
        </div>
      </div>

      {/* Interest Filter Bar (strictly displays only student's selected interests) */}
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
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search HTML, CSS, JS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-main placeholder:text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quizzes Table / Empty State */}
      {finalQuizzes.length > 0 ? (
        <DataTable
          headers={headers}
          data={finalQuizzes}
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
            {searchQuery || selectedSubtopic !== "all"
              ? "No quizzes match your active filter or search"
              : interests.length === 0
              ? "No interests selected in your profile yet"
              : selectedInterestId
              ? "No quizzes found for this selected topic"
              : "No quizzes match your selected interests"}
          </p>
          <p className="text-xs text-muted mt-1.5">
            {searchQuery || selectedSubtopic !== "all"
              ? "Try resetting the subtopic filter or clearing your search query."
              : interests.length === 0
              ? "Select your current topics or electives to unlock tailored quizzes."
              : selectedInterestId
              ? "Try switching to 'All Quizzes' or pick another topic from your interests."
              : "Update your interests to explore quizzes across different engineering topics."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {(searchQuery || selectedSubtopic !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubtopic("all");
                }}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Reset Topic Filters
              </button>
            )}
            {selectedInterestId && (
              <button
                onClick={() => setSelectedInterestId(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Clear Interest Filter
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
