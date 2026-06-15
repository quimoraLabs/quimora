import { useEffect } from "react";
import DataTable from "../../components/DataTable";
import useQuizStore from "../../../../store/quizStore"; // Verify this exact path in your project
import { Loader } from "lucide-react";

const InstructorQuizzesDashboard = () => {
  const { quizzes, fetchQuizzesByInstructor, deleteQuiz, loading } = useQuizStore();

  
  // Trigger fetch exactly ONCE when the component mounts or page reloads
  useEffect(() => {
    console.log("🚀 COMPONENT MOUNTED SUCCESSFULLY!"); // 🚨 2. DEBUG LOG
    
    // Explicit call verification
    if (typeof fetchQuizzesByInstructor === "function") {
      console.log("📞 Calling fetchQuizzesByInstructor API action now...");
      fetchQuizzesByInstructor();
    } else {
      console.error("❌ Action fetchQuizzesByInstructor is not defined on the store!");
    }
  }, [fetchQuizzesByInstructor]);
  console.log(quizzes,loading);

  // Headers configuration array
  const quizHeaders = ["Quiz Title", "Time Limit", "Total Questions", "Status"];

  // Column generator wrapper for individual rows
  const renderQuizRow = (quiz) => (
    <>
      <td className="px-6 py-4 font-medium max-w-50 truncate text-main">{quiz.title}</td>
      <td className="px-6 py-4 text-muted">{quiz.timeLimit} mins</td>
      {/* ⭐ Fix: Checking quiz.questions.length safely using optional chaining. 
        Fallback to quiz.questionsCount if your backend explicitly computes it.
      */}
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

  return (
    <div className="p-6 min-h-screen bg-main">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display text-main">Manage Quizzes</h2>
      </div>
      
      {/* ⭐ UX Fix: Render the loader gracefully inside the layout instead of blocking the entire component */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-main rounded-xl shadow-sm">
          <Loader className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="mt-2 text-sm text-muted">Fetching your quizzes...</p>
        </div>
      ) : (
        <DataTable
          headers={quizHeaders}
          data={quizzes?.data || []} // Fallback to safe empty array to prevent mapping errors
          renderRow={renderQuizRow}
          isView={true}
          isEdit={true}
          isDelete={true}
          onView={(quiz) => console.log("Viewing Quiz ID:", quiz._id)}
          onEdit={(quiz) => console.log("Editing Quiz ID:", quiz._id)}
          onDelete={(quiz) => {
            if (window.confirm("Are you sure you want to delete this quiz?")) {
              deleteQuiz(quiz._id);
            }
          }}
        />
      )}
    </div>
  );
};

export default InstructorQuizzesDashboard;