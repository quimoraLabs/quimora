import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";
import useQuizListStore from "../../features/student/quiz/store/useQuizListStore";
import DataTable from "../../components/common/DataTable";
import InterestFilterBar from "../../features/student/components/InterestFilterBar";
import axiosClient from "../../api/axiosClient";

function QuizListPage() {
  const navigate = useNavigate();
  const { fetchAvailableQuizzes, quizzes } = useQuizListStore();
  const [interests, setInterests] = useState([]);
  const [selectedInterestId, setSelectedInterestId] = useState(null);

  useEffect(() => {
    fetchAvailableQuizzes();

    // Fetch active interests for the filter bar
    const fetchInterests = async () => {
      try {
        const res = await axiosClient.get("/interests");
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setInterests(res.data.data);
        }
      } catch (err) {
        console.error("Could not load interests:", err);
      }
    };

    fetchInterests();
  }, [fetchAvailableQuizzes]);

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

  // Filter quizzes by active interest
  const filteredQuizzes = useMemo(() => {
    if (!selectedInterestId) return quizzes;

    const activeInterest = interests.find((i) => i._id === selectedInterestId);
    if (!activeInterest) return quizzes;

    const tags = (activeInterest.topicTags || []).map((t) => t.toLowerCase());
    const interestName = activeInterest.name.toLowerCase();

    return quizzes.filter((q) => {
      const title = (q.title || "").toLowerCase();
      const desc = (q.description || "").toLowerCase();
      const quizTags = (q.tags || []).map((t) => t.toLowerCase());

      const matchesTags = tags.some(
        (t) => title.includes(t) || desc.includes(t) || quizTags.includes(t)
      );
      const matchesName = title.includes(interestName) || desc.includes(interestName);

      return matchesTags || matchesName;
    });
  }, [quizzes, selectedInterestId, interests]);

  // Define headers for the DataTable
  const headers = useMemo(() => ["Quiz Title", "Time Limit", "Questions", ""], []);

  // Define renderRow for DataTable
  const renderQuizRow = useCallback((quiz) => (
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
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => handleStart(quiz)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
        >
          <Play className="w-4 h-4" /> Start
        </button>
      </td>
    </>
  ), [handleStart]);

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
            Browse and filter quizzes customized to your learning interests.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 self-start sm:self-auto">
          Showing {filteredQuizzes.length} of {quizzes.length} Quizzes
        </div>
      </div>

      {/* Interest Filter Bar */}
      {interests.length > 0 && (
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <InterestFilterBar
            interests={interests}
            activeInterestId={selectedInterestId}
            onSelectInterest={setSelectedInterestId}
          />
        </div>
      )}

      {/* Quizzes Table */}
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
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No quizzes match this interest topic.
          </p>
          <p className="text-xs text-muted mt-1">
            Try switching to &quot;All Quizzes&quot; or selecting a different topic above.
          </p>
          <button
            onClick={() => setSelectedInterestId(null)}
            className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizListPage;
