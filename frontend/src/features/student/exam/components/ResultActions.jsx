import { RefreshCcw, Home, FileText } from "lucide-react";

export const ResultActions = ({ onExit, attemptId }) => {
  const handleOpenReport = () => {
    if (attemptId) {
      window.open(`/student/attempts/${attemptId}/report`, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-4">
      {attemptId && (
        <button
          onClick={handleOpenReport}
          className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold"
        >
          <FileText className="w-5 h-5" /> View / Download Full Report (PDF)
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onExit("/student/quizzes")}
          className="flex-1 bg-accent hover:opacity-95 text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Retake Another Exam
        </button>
        <button
          onClick={() => onExit("/student/quizzes")}
          className="flex-1 bg-surface hover:bg-elevated text-main py-3.5 px-6 rounded-2xl border border-soft flex items-center justify-center gap-2 transition-all font-bold"
        >
          <Home className="w-5 h-5" /> Exit to Desk
        </button>
      </div>
    </div>
  );
};
