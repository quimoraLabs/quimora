import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Sparkles,
  BookOpen,
  ChevronRight,
  Clock,
  Target,
  Layers,
  FolderTree,
  CheckCircle2,
  Lock,
  Eye,
} from "lucide-react";
import useHierarchyStore from "../../features/student/store/useHierarchyStore";
import QuizDetailsModal from "../../features/student/quiz/QuizDetailsModal";
import FirstTimePracticeModal from "../../features/student/quiz/FirstTimePracticeModal";
import axiosClient from "../../api/axiosClient";

export default function QuizListPage() {
  const navigate = useNavigate();
  const {
    domains,
    selectedDomain,
    courses,
    selectedCourse,
    courseHierarchy,
    loading,
    selectDomain,
    selectCourse,
  } = useHierarchyStore();

  const [expandedChapterIndex, setExpandedChapterIndex] = useState(0);
  const [inspectedQuiz, setInspectedQuiz] = useState(null);
  const [pendingQuiz, setPendingQuiz] = useState(null);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [practiceStarting, setPracticeStarting] = useState(false);

  // Directly navigate to exam instructions
  const proceedToExamInstructions = (quiz) => {
    const quizId = quiz._id || quiz.id;
    try {
      sessionStorage.setItem("activeExamQuizId", quizId);
      sessionStorage.setItem("activeExamQuizTitle", quiz.title || "Assessment");
      sessionStorage.setItem("activeExamQuizDuration", String(quiz.duration || quiz.timeLimit || 15));
      sessionStorage.setItem("activeExamQuizQuestions", String(quiz.totalQuestions || quiz.questions?.length || 15));
    } catch (e) {
      console.warn("sessionStorage warning:", e);
    }

    navigate("/student/quiz/rules", {
      state: {
        quizId,
        title: quiz.title,
        timeLimit: quiz.duration || quiz.timeLimit || 15,
        totalQuestions: quiz.totalQuestions || quiz.questions?.length || 15,
        tags: quiz.tags || [],
      },
    });
  };

  const handleStartExam = async (quiz) => {
    const quizId = quiz._id || quiz.id;
    if (!quizId) {
      toast.error("Quiz identifier is invalid or missing");
      return;
    }

    // Check eligibility and whether this is a first-time attempt
    try {
      const res = await axiosClient.get(`/student/quiz/${quizId}/eligibility`);
      if (res.data?.success) {
        const { shouldShowFirstTimePracticeModal, isEligible, progress } = res.data.data;

        if (progress?.isLocked) {
          toast.error("You have reached the maximum attempt limit for this certification quiz.");
          return;
        }

        if (shouldShowFirstTimePracticeModal) {
          setPendingQuiz(quiz);
          setShowFirstTimeModal(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Eligibility check bypass on network glitch:", err);
    }

    // Default flow if not first time or already seen
    proceedToExamInstructions(quiz);
  };

  // Student clicks "Start Practice Quiz" from First Time Modal
  const handleStartPracticeFromModal = async () => {
    if (!pendingQuiz) return;
    try {
      setPracticeStarting(true);
      const quizId = pendingQuiz._id || pendingQuiz.id;

      // 1. Acknowledge the modal so it won't show again
      await axiosClient.post(`/student/quiz/${quizId}/acknowledge-first-time-modal`);

      // 2. Launch targeted practice drill for this quiz topic
      const topicName = pendingQuiz.title || selectedCourse?.title || "Fundamentals";
      const domainName = selectedDomain?.name || "General";

      const res = await axiosClient.post("/practice/mode2/start", {
        scopeType: "quiz",
        targetName: topicName,
        domainName: domainName,
      });

      if (res.data?.success) {
        sessionStorage.setItem("activePracticeSession", JSON.stringify(res.data.data));
        setShowFirstTimeModal(false);
        setPendingQuiz(null);
        navigate("/student/practice/room");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start practice quiz";
      toast.error(msg);
      // If daily target not set, redirect to weak-areas to set target or proceed to exam
      if (msg.includes("daily practice target")) {
        setShowFirstTimeModal(false);
        navigate("/student/weak-areas");
      }
    } finally {
      setPracticeStarting(false);
    }
  };

  // Student clicks "Skip & Start Main Exam" from First Time Modal
  const handleSkipPracticeFromModal = async () => {
    if (!pendingQuiz) return;
    try {
      const quizId = pendingQuiz._id || pendingQuiz.id;
      // Acknowledge so modal never shows again for this quiz
      await axiosClient.post(`/student/quiz/${quizId}/acknowledge-first-time-modal`);
    } catch (e) {
      console.warn("Acknowledge warning:", e);
    }
    const target = pendingQuiz;
    setShowFirstTimeModal(false);
    setPendingQuiz(null);
    proceedToExamInstructions(target);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* 4-Level Breadcrumb & Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curriculum Hierarchy: Domain › Course › Chapter › Quiz</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {selectedCourse?.title || "Course Curriculum"}
        </h1>
        <p className="text-sm text-muted mt-1">
          {selectedDomain?.name ? `Domain: ${selectedDomain.name} • ` : ""}
          {selectedCourse?.description || "Select a course to view its sequential chapters and challenge quizzes."}
        </p>
      </div>

      {/* LEVEL 1: Active Domain Focus Header */}
      <div className="flex items-center justify-between p-3.5 bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <FolderTree size={18} />
          </div>
          <div>
            <div className="text-3xs font-extrabold uppercase tracking-wider text-indigo-500">
              Active Focus Domain
            </div>
            <h2 className="text-base font-extrabold text-main">
              {selectedDomain?.name || "Web Development"}
            </h2>
          </div>
        </div>
        <span className="text-2xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-soft text-muted">
          All courses & drills locked to this domain
        </span>
      </div>

      {/* LEVEL 2: Course Selector Under Domain */}
      <div className="space-y-2">
        <div className="text-2xs font-extrabold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen size={13} className="text-purple-500" />
          <span>2. Select Course</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {courses.map((course) => (
            <button
              key={course._id}
              onClick={() => selectCourse(course)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCourse?._id === course._id
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                  : "bg-surface border border-soft text-muted hover:text-main hover:bg-elevated"
              }`}
            >
              {course.title}
            </button>
          ))}
        </div>
      </div>

      {/* LEVEL 3 & 4: Chapters & Quizzes Drill-down */}
      <div className="space-y-4 pt-2">
        <div className="text-2xs font-extrabold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-emerald-500" />
          <span>3. Course Chapters & Associated Quizzes</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted bg-surface rounded-2xl border border-soft">
            Loading course curriculum tree...
          </div>
        ) : courseHierarchy?.chapters?.length > 0 ? (
          <div className="space-y-3">
            {courseHierarchy.chapters.map((chapter, cIdx) => (
              <div
                key={chapter._id}
                className="rounded-2xl border border-soft bg-surface shadow-xs transition-all overflow-hidden"
              >
                {/* Chapter Header Accordion */}
                <div
                  onClick={() =>
                    setExpandedChapterIndex(expandedChapterIndex === cIdx ? -1 : cIdx)
                  }
                  className="p-4.5 flex items-center justify-between select-none cursor-pointer hover:bg-elevated/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      0{chapter.orderIndex || cIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-main">{chapter.title}</h3>
                      <p className="text-2xs text-muted">
                        Passing Threshold: {chapter.requiredPassingScore || 50}% •{" "}
                        {chapter.quizzes?.length || 0} Quizzes in this Chapter
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted">
                      {chapter.quizzes?.length} {chapter.quizzes?.length === 1 ? "Quiz" : "Quizzes"}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-muted transition-transform duration-200 ${
                        expandedChapterIndex === cIdx ? "rotate-90 text-accent" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Level 4: Associated Quizzes inside Chapter */}
                {expandedChapterIndex === cIdx && (
                  <div className="border-t border-soft divide-y divide-soft bg-elevated/20">
                    {chapter.quizzes && chapter.quizzes.length > 0 ? (
                      chapter.quizzes.map((quiz, qIdx) => (
                        <div
                          key={quiz._id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-surface border border-soft text-muted">
                                Quiz #{qIdx + 1}
                              </span>
                              <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                                {quiz.level || "Beginner"}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-main mt-1">{quiz.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-2xs text-muted">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {quiz.duration || 15} mins
                              </span>
                              <span className="flex items-center gap-1">
                                <Target size={12} /> {quiz.totalQuestions || 15} Questions
                              </span>
                              <span>Max Attempts: {quiz.maxAttempts || 3}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => setInspectedQuiz(quiz)}
                              className="px-3 py-1.5 rounded-xl border border-soft text-xs font-semibold text-muted hover:text-main hover:bg-elevated transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Details</span>
                            </button>
                            <button
                              onClick={() => handleStartExam(quiz)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play size={13} className="fill-current" />
                              <span>Take Exam</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-muted">
                        No quizzes added to this chapter yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted bg-surface rounded-2xl border border-soft">
            No chapters found for this course.
          </div>
        )}
      </div>

      {/* Quiz Details Modal */}
      {inspectedQuiz && (
        <QuizDetailsModal
          quiz={inspectedQuiz}
          onClose={() => setInspectedQuiz(null)}
          onStartExam={handleStartExam}
        />
      )}

      {/* Optional First-Time Practice Modal (HackerRank Style) */}
      <FirstTimePracticeModal
        isOpen={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
        topicTitle={pendingQuiz?.title || "this topic"}
        onStartPractice={handleStartPracticeFromModal}
        onSkipAndProceed={handleSkipPracticeFromModal}
        loading={practiceStarting}
      />
    </div>
  );
}
