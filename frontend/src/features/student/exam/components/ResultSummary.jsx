import { CheckCircle2, XCircle, Award } from "lucide-react";

export const ResultSummary = ({ score, totalQuestions, warningCount }) => {
  const incorrectCount = totalQuestions - score;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-muted uppercase tracking-widest px-1">
        Session Summary
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="w-4 h-4 text-accent"
              style={{ color: "var(--color-brand-mid)" }}
            />
            <span className="text-muted font-semibold">Correct Answers</span>
          </div>
          <span className="text-main font-bold">{score}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <div className="flex items-center gap-2">
            <XCircle
              className="w-4 h-4 text-accent"
              style={{ color: "var(--color-brand-mid)" }}
            />
            <span className="text-muted font-semibold">
              Incorrect / Skipped
            </span>
          </div>
          <span className="text-main font-bold">
            {incorrectCount < 0 ? 0 : incorrectCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <div className="flex items-center gap-2">
            <Award
              className="w-4 h-4 text-accent"
              style={{ color: "var(--color-brand-mid)" }}
            />
            <span className="text-muted font-semibold">
              Security Infractions
            </span>
          </div>
          <span className="font-bold text-accent">{warningCount} Flags</span>
        </div>
      </div>
    </div>
  );
};
