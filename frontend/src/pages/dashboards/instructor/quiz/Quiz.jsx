import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import useQuizStore from "../../../../store/quizStore"; 
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import QuizForm from "../components/QuizForm"; // Imported form clean wrapper

const InstructorQuizzesDashboard = () => {
  const { quizzes, fetchQuizzesByInstructor, deleteQuiz, updateQuiz, loading } = useQuizStore();
  
  // Minimal parent input payload binding block
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    timeLimit: "",
    maxAttempts: "",
    tags: "",
  });

  useEffect(() => {
    if (typeof fetchQuizzesByInstructor === "function") {
      fetchQuizzesByInstructor();
    }
  }, [fetchQuizzesByInstructor]);

  const quizHeaders = ["Quiz Title", "Time Limit", "Total Questions", "Status"];

  const renderQuizRow = (quiz) => (
    <>
      <td className="px-6 py-4 font-medium max-w-50 truncate text-main">{quiz.title}</td>
      <td className="px-6 py-4 text-muted">{quiz.timeLimit} mins</td>
      <td className="px-6 py-4 text-muted">
        {(quiz.questions?.length || quiz.questionsCount || 0)} Qs
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
          quiz.status === "published" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
        }`}>
          {quiz.status || "draft"}
        </span>
      </td>
    </>
  );

  // Fills up initial structural setup from targeted item values instantly
  const handleEditSetup = (quiz) => {
    setQuizForm({
      title: quiz.title || "",
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || "",
      maxAttempts: quiz.maxAttempts || "",
      tags: quiz.tags || "",
    });
  };

  const handleUpdateDispatch = async (id) => {
    await updateQuiz(id, quizForm);
  };

  return (
    <div className="p-6 min-h-screen bg-main">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display text-main">Manage Quizzes</h2>
        <Link to={"/instructor/quizzes/create"}>Add Quiz</Link>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-main rounded-xl shadow-sm">
          <Loader className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="mt-2 text-sm text-muted">Fetching your quizzes...</p>
        </div>
      ) : (
        <DataTable
          type="quiz"
          headers={quizHeaders}
          data={quizzes?.data || []} 
          onDelete={deleteQuiz}
          onUpdate={handleUpdateDispatch}
          onEditClick={handleEditSetup}
          renderRow={renderQuizRow}
          isView={true}
          isEdit={true}
          isDelete={true}
          loading={loading}
          renderUpdateForm={() => <QuizForm quizData={quizForm} setQuizData={setQuizForm} />}
        />
      )}
    </div>
  );
};

export default InstructorQuizzesDashboard;