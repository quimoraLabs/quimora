import { useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import useQuizStore from "../../store/quizStore";
import DataTable from "../../components/DataTable";

function StudentQuiz() {

  const navigate = useNavigate();
  const { fetchQuizzes } = useQuizStore();
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);
  const { quizzes } = useQuizStore();

  const handleStart = useCallback((quiz) => {
    if (!quiz || !quiz.id) {
      toast.error("Invalid Question");
      return;
    }

    navigate("/student/quiz/rules", { state: { quizId: quiz.id, title: quiz.title, timeLimit: quiz.timeLimit, totalQuestions: quiz.questions.length } });
  }, [navigate]);

  // Define the headers for the DataTable
  const headers = useMemo(() => ['Quiz Title', 'Time Limit', 'Questions', ''], []);

  // Define the renderRow function for the DataTable
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
        {quiz?.questions?.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => handleStart(quiz)} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-mid hover:bg-brand-primary transition-all">
          <Play className="w-4 h-4" /> Start
        </button>
      </td>
    </>
  ), [handleStart]);

  return (
    <div className="p-6 text-main min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>

      {quizzes.length > 0 ? (
        <DataTable
          headers={headers}
          data={quizzes}
          renderRow={renderQuizRow}
          // Set these to false so the DataTable's default action column is not rendered,
          // as the "Start" button is handled within renderQuizRow.
          isView={false}
          isEdit={false}
          isDelete={false}
          type="quiz" // Or whatever type is appropriate for display purposes
        />
      ) : (
        <p>No quizzes found. Check your backend!</p>
      )}
    </div>
  );
}

export default StudentQuiz;
