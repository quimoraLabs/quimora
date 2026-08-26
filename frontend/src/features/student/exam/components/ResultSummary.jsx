import { CheckCircle2, XCircle, HelpCircle, ShieldAlert } from "lucide-react";

export const ResultSummary = ({
  correctAnswersCount,
  incorrectAnswersCount,
  unattemptedCount,
  warningCount,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-muted uppercase tracking-widest px-1">
        Session Summary
      </h3>
      <div className="space-y-2">
        {/* Correct Answers */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-soft">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-muted font-semibold">Correct Answers</span>
          </div>
          <span className="text-main font-bold">{correctAnswersCount}</span>
        </div>

        {/* Incorrect Answers */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-soft">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-muted font-semibold">Incorrect (Penalty Applied)</span>
          </div>
          <span className="text-red-500 font-bold">{incorrectAnswersCount}</span>
        </div>

        {/* Skipped / Unattempted */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-soft">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span className="text-muted font-semibold">Skipped (No Penalty)</span>
          </div>
          <span className="text-amber-500 font-bold">{unattemptedCount}</span>
        </div>

        {/* Security Flags */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-soft">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-muted font-semibold">Security Infractions</span>
          </div>
          <span className="font-bold text-accent">{warningCount} Flags</span>
        </div>
      </div>
    </div>
  );
};