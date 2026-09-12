import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import ResultModal from "../../features/student/quiz/ResultModal";
import useStudentQuizStore from "../../features/student/exam/store/useStudentQuizStore";
import Loader from "../../components/common/Loader";
import { formatDate } from "../../utils/formatDate";

export default function QuizHistoryPage() {
  const navigate = useNavigate();
  const { studentAllResults } = useStudentQuizStore();

  useEffect(() => {
    studentAllResults();
  }, [studentAllResults]);

  // console.log(studentAllResults);
  const { quizResults, loading } = useStudentQuizStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const openReport = (attempt) => {
    setSelectedAttempt(attempt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAttempt(null);
  };

  const handleFullReportClick = (attemptId) => {
    navigate(`/student/attempts/${attemptId}/report`);
  }

  const attemptsTableRows =
    Array.isArray(quizResults) && quizResults.length > 0 ? (
      quizResults.map((attempt, index) => {
        const isPassed = attempt.score >= 50;
        return (
          <tr
            key={index}
            className=" hover:bg-bg-main transition-colors duration-150 border-b border-bg-main"
          >
            <td className="p-4 font-medium text-main">
              <div>{attempt?.quizTitle}</div>
            </td>
            <td className="p-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-text-muted" />
                {formatDate(
                  attempt?.completedAt
                    ? attempt?.completedAt
                    : attempt?.startedAt,
                )}
              </span>
            </td>

            <td className="p-4">
              <span
                className={`font-semibold ${isPassed ? "text-emerald-400" : "text-rose-400"}`}
              >
                {attempt?.score}%
              </span>
            </td>
            <td className="p-4 text-text-muted">
              {attempt?.correctAnswersCount}/{attempt?.totalQuestions} Qns
            </td>
            <td className="p-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                {(
                  attempt?.timeTakenInSeconds / 60 +
                  (attempt?.timeTakenInSeconds % 60)
                ).toFixed(2)}{" "}
                sec
              </span>
            </td>
            <td className="p-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openReport(attempt)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                >
                  Quick Report
                </button>
                <Link
                  to={`/student/attempts/${attempt._id || attempt.id}/report`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 cursor-pointer"
                >
                  Full Report (PDF)
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="6" className="p-6 text-center text-slate-400">
          No quiz attempts were found yet. Complete a quiz to see your results
          here.
        </td>
      </tr>
    );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen relative">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-main md:text-3xl">
          Your Quiz Attempts
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review your past performance and detailed test analysis.
        </p>
      </div>

      {/* Attempts Table */}
      <div className="bg-surface border border-main rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-main text-xs font-semibold uppercase tracking-wider text-text-main">
                <th className="p-4">Quiz Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Score</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Time Taken</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-main/20 text-sm">
              {attemptsTableRows}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REPORT MODAL --- */}
      {isModalOpen && selectedAttempt && (
        <ResultModal
          selectedAttempt={selectedAttempt}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}
