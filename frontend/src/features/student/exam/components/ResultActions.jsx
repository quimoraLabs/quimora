import { RefreshCcw, Home } from "lucide-react";

export const ResultActions = ({ onExit }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <button
        onClick={() => onExit("/student/quizzes")}
        className="flex-1 bg-accent hover:opacity-95 text-white py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold group"
      >
        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        Retake Another Exam
      </button>
      <button
        onClick={() => onExit("/student/quizzes")}
        className="flex-1 bg-surface hover:bg-elevated text-main py-4 px-6 rounded-2xl border border-soft flex items-center justify-center gap-2 transition-all font-bold"
      >
        <Home className="w-5 h-5" /> Exit to Desk
      </button>
    </div>
  );
};
