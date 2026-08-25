import { useEffect, useState } from "react";
import { Award, Users, Clock, Eye, CheckCircle, Search, Download } from "lucide-react";
import useInstructorStudents from "../../students/store/useInstructorStudents";
import AttemptReviewModal from "./AttemptReviewModal";
import { exportToCSV } from "../../../../utils/exportUtils";

export default function QuizSubmissionsTable({ quizId }) {
  const {
    quizSubmissions,
    submissionsLoading,
    fetchQuizSubmissions,
    attemptReview,
    reviewLoading,
    fetchAttemptReview,
    clearAttemptReview,
  } = useInstructorStudents();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuizSubmissions(quizId);
    }
  }, [quizId, fetchQuizSubmissions]);

  const submissions = quizSubmissions?.submissions || [];
  const quizTitle = quizSubmissions?.quizTitle || "Quiz";

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenReview = (attemptId) => {
    setSelectedAttemptId(attemptId);
    fetchAttemptReview(attemptId);
  };

  const handleCloseReview = () => {
    setSelectedAttemptId(null);
    clearAttemptReview();
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const exportData = submissions.map((s) => ({
      Rank: s.rank,
      StudentName: s.studentName,
      Email: s.studentEmail,
      ScorePercentage: `${s.score}%`,
      CorrectAnswers: `${s.correctAnswersCount}/${s.totalQuestions}`,
      TimeSpentSeconds: s.timeTaken,
      SubmittedAt: s.completedAt ? new Date(s.completedAt).toLocaleString() : "N/A",
    }));

    exportToCSV(exportData, `${quizTitle.replace(/\s+/g, "_")}_Submissions`);
  };

  return (
    <div className="rounded-2xl border border-main bg-surface p-6 shadow-card transition-colors space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-main">
        <div>
          <h3 className="text-lg font-bold text-main font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Student Submissions ({submissions.length})
          </h3>
          <p className="text-xs text-muted">
            All students who have completed this quiz with their grades and rankings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-main bg-surface pl-9 pr-4 py-2 text-xs text-main placeholder:text-muted outline-none transition focus:border-accent"
            />
          </div>

          {/* Export Button */}
          <button
            type="button"
            disabled={submissions.length === 0}
            onClick={handleExportCSV}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              submissions.length > 0
                ? "border-main bg-elevated text-main hover:border-accent hover:text-accent cursor-pointer shadow-xs"
                : "border-main/50 bg-surface/50 text-muted cursor-not-allowed opacity-50"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {submissionsLoading ? (
        <div className="py-12 text-center text-muted font-medium animate-pulse">
          Loading student submissions...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-12 text-center text-muted border border-dashed border-main rounded-xl space-y-2">
          <Award className="w-8 h-8 mx-auto text-muted/50" />
          <p className="text-sm font-medium">No submissions recorded yet.</p>
          <p className="text-xs text-muted">
            Once students start attempting and completing this quiz, their scores will show up here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-main">
          <table className="w-full text-left text-sm">
            <thead className="bg-elevated text-xs font-semibold uppercase text-muted tracking-wider border-b border-main">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4">Time Spent</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main text-main">
              {filteredSubmissions.map((sub) => {
                const isTop3 = sub.rank <= 3;
                const rankColor =
                  sub.rank === 1
                    ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                    : sub.rank === 2
                    ? "bg-slate-300/20 text-slate-300 border-slate-300/30"
                    : sub.rank === 3
                    ? "bg-amber-700/20 text-amber-600 border-amber-700/30"
                    : "bg-surface text-muted border-main";

                return (
                  <tr
                    key={sub.attemptId}
                    className="hover:bg-main/20 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${rankColor}`}
                      >
                        #{sub.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-main text-sm">
                        {sub.studentName}
                      </div>
                      <div className="text-xs text-muted">{sub.studentEmail}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          sub.score >= 50
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {sub.score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-muted">
                      <span className="font-medium text-main">
                        {sub.correctAnswersCount}
                      </span>{" "}
                      / {sub.totalQuestions} questions
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted" />
                        {Math.floor((sub.timeTaken || 0) / 60)}m{" "}
                        {(sub.timeTaken || 0) % 60}s
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-muted">
                      {sub.completedAt
                        ? new Date(sub.completedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(sub.attemptId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-main bg-elevated text-xs font-semibold text-main hover:border-accent hover:text-accent transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Sheet
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Answer Sheet Inspection Modal */}
      <AttemptReviewModal
        isOpen={Boolean(selectedAttemptId)}
        onClose={handleCloseReview}
        reviewData={attemptReview}
        loading={reviewLoading}
      />
    </div>
  );
}
