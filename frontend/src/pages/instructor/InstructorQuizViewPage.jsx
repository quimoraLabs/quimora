import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  HelpCircle,
  Users,
  Award,
  Edit3,
  Calendar,
  BookOpen,
  ListOrdered,
} from "lucide-react";
import useQuizStore from "../../features/instructor/quiz/store/useQuizStore";
import StatCard from "../../components/common/StatCard";
import StatsGrid from "../../components/common/StatsGrid";
import QuestionManager from "../../features/instructor/question/components/QuestionManager";
import useQuestionStore from "../../features/instructor/question/store/useQuestionStore";
import QuizFormModal from "../../features/instructor/quiz/components/QuizForm";
import QuizSubmissionsTable from "../../features/instructor/submissions/components/QuizSubmissionsTable";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  timeLimit: 20,
  maxAttempts: 1,
  startDate: "",
  endDate: "",
};

export default function InstructorQuizViewPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { questions, getQuizQuestions } = useQuestionStore();
  const { currentQuiz, fetchQuizById, updateQuiz, loading } = useQuizStore();

  const [activeTab, setActiveTab] = useState("questions"); // "questions" | "submissions"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (quizId) {
      fetchQuizById(quizId);
      getQuizQuestions(quizId);
    }
  }, [fetchQuizById, getQuizQuestions, quizId]);

  // Loading state handling
  if (loading && !currentQuiz) {
    return (
      <div className="p-8 text-center text-muted font-sans animate-pulse">
        Loading quiz details...
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="p-8 text-center text-muted font-sans space-y-4">
        <p>Quiz not found or you don&apos;t have permission to view it.</p>
        <button
          onClick={() => navigate("/instructor/quizzes")}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // API Data Extraction
  const {
    title,
    description,
    status,
    timeLimit,
    stats,
    tags = [],
    startDate,
    endDate,
    maxAttempts,
  } = currentQuiz;

  const handleOpenEdit = () => {
    setEditForm({
      title: title || "",
      description: description || "",
      timeLimit: timeLimit || 20,
      maxAttempts: maxAttempts || 1,
      startDate: startDate ? startDate.split("T")[0] : "",
      endDate: endDate ? endDate.split("T")[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveQuiz = async (formData) => {
    const success = await updateQuiz(quizId, formData);
    if (success) {
      setIsEditModalOpen(false);
      fetchQuizById(quizId);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 text-main font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-main p-6 rounded-2xl shadow-card">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${
                status === "published"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}
            >
              {status}
            </span>

            {/* Tags */}
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-elevated text-accent border border-main"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-main">
            {title}
          </h1>
          <p className="text-sm text-muted max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-accent text-white rounded-xl shadow-card hover:opacity-90 transition-all cursor-pointer"
          >
            <Edit3 size={16} /> Edit Quiz
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <StatsGrid columns="4">
        <StatCard
          icon={HelpCircle}
          title="Total Questions"
          value={questions.length}
          change="Available in test"
          changeType="neutral"
          gradient="from-cyan-500 to-blue-600"
          index={0}
        />
        <StatCard
          icon={Clock}
          title="Time Limit"
          value={`${timeLimit} mins`}
          change="Per attempt session"
          changeType="neutral"
          gradient="from-amber-500 to-orange-600"
          index={1}
        />
        <StatCard
          icon={Users}
          title="Total Attempts"
          value={stats?.attempts || 0}
          change={stats?.attempts > 0 ? "Completed by students" : "No submissions yet"}
          changeType={stats?.attempts > 0 ? "positive" : "neutral"}
          gradient="from-purple-500 to-indigo-600"
          index={2}
        />
        <StatCard
          icon={Award}
          title="Max Attempts"
          value={maxAttempts}
          change={maxAttempts === 1 ? "Single take allowed" : "Multiple retakes allowed"}
          changeType="neutral"
          gradient="from-emerald-500 to-teal-600"
          index={3}
        />
      </StatsGrid>

      {/* Extra Info Banner */}
      <div className="bg-surface/60 border border-main p-4 rounded-2xl flex flex-wrap gap-6 text-xs text-muted">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-muted" />
          <span>
            Start:{" "}
            <strong className="text-main font-semibold">
              {startDate ? new Date(startDate).toLocaleDateString() : "Always Active"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-muted" />
          <span>
            End:{" "}
            <strong className="text-main font-semibold">
              {endDate ? new Date(endDate).toLocaleDateString() : "No Expiry"}
            </strong>
          </span>
        </div>
      </div>

      {/* Navigation Tabs (Questions vs Submissions) */}
      <div className="flex items-center gap-2 border-b border-main pb-2">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
            activeTab === "questions"
              ? "bg-accent text-white shadow-xs"
              : "text-muted hover:text-main hover:bg-surface"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Questions Management ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
            activeTab === "submissions"
              ? "bg-accent text-white shadow-xs"
              : "text-muted hover:text-main hover:bg-surface"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Student Submissions & Leaderboard
        </button>
      </div>

      {/* Tab Content Panels */}
      {activeTab === "questions" ? (
        <QuestionManager quizId={quizId} />
      ) : (
        <QuizSubmissionsTable quizId={quizId} />
      )}

      {/* Edit Quiz Modal */}
      <QuizFormModal
        isOpen={isEditModalOpen}
        quiz={currentQuiz}
        form={editForm}
        setForm={setEditForm}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveQuiz}
      />
    </div>
  );
}
