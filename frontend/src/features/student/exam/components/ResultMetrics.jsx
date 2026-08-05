export const ResultMetrics = ({ score, totalQuestions, percentage }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
        <span className="text-3xl font-black text-main">
          {score}/{totalQuestions}
        </span>
        <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
          Total Score
        </span>
      </div>
      <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
        <span className="text-3xl font-black text-main">{percentage}%</span>
        <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
          Percentage
        </span>
      </div>
    </div>
  );
};
