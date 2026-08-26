export const ResultMetrics = ({ marksObtained, totalMarks, percentage, passed }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
        <span className="text-3xl font-black text-main">
          {marksObtained} / {totalMarks}
        </span>
        <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
          Marks Obtained
        </span>
      </div>

      <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
        <span
          className={`text-3xl font-black ${
            passed ? "text-green-500" : "text-red-500"
          }`}
        >
          {percentage}%
        </span>
        <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
          Score Percentage
        </span>
      </div>
    </div>
  );
};