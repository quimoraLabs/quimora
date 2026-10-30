import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Printer,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import ResultModal from "../../features/student/quiz/ResultModal";
import useStudentQuizStore from "../../features/student/exam/store/useStudentQuizStore";
import Loader from "../../components/common/Loader";
import { formatDate } from "../../utils/formatDate";
import axiosClient from "../../api/axiosClient";

export default function QuizHistoryPage() {
  const navigate = useNavigate();
  const { studentAllResults, quizResults, loading } = useStudentQuizStore();
  const [stats, setStats] = useState(null);

  // Modal State for Quick Modal View
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    studentAllResults();

    // Fetch dashboard summary stats for top summary cards
    axiosClient
      .get("/student/dashboard")
      .then((res) => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching stats for history page:", err));
  }, [studentAllResults]);

  const openReport = (attempt) => {
    setSelectedAttempt(attempt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAttempt(null);
  };

  if (loading) {
    return <Loader />;
  }

  const results = Array.isArray(quizResults) ? quizResults : [];
  const totalTests = stats?.totalTestsTaken || results.length || 0;
  const avgScore = stats?.averageScore ?? (results.length > 0 ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length) : 0);
  const maxScore = stats?.maxScore ?? (results.length > 0 ? Math.max(...results.map((r) => r.score || 0)) : 0);
  const passedTests = results.filter((a) => (a.score || 0) >= 50).length;

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-main pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Attempts & Performance Scorecards
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Quiz Attempts & Reports</h1>
          <p className="text-sm text-muted mt-1">
            Review every examination attempt, track score history, and view your official report cards.
          </p>
        </div>

        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 w-fit cursor-pointer"
        >
          <span>Attempt New Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Total Tests Taken</p>
            <p className="text-2xl font-black text-main mt-1">{totalTests}</p>
            <p className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {passedTests} Passed ({totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%)
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Average Score</p>
            <p className="text-2xl font-black text-main mt-1">{avgScore}%</p>
            <p className="text-2xs text-muted font-medium mt-0.5">Across all completed quizzes</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Best Score</p>
            <p className="text-2xl font-black text-main mt-1">{maxScore}%</p>
            <p className="text-2xs text-amber-500 font-semibold mt-0.5">Highest score achieved</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Calibrated Elo Tier</p>
            <p className="text-2xl font-black text-main mt-1">{stats?.overallElo || 1000}</p>
            <p className="text-2xs text-purple-600 dark:text-purple-400 font-bold mt-0.5 uppercase">
              {stats?.levelName || "Beginner"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Attempts & Reports Table */}
      <div className="bg-surface rounded-3xl border border-main shadow-card overflow-hidden">
        <div className="p-5 md:p-6 border-b border-main flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-main">Examination Attempts & Scorecards</h2>
            <p className="text-xs text-muted mt-0.5">
              Click &quot;Full Report (PDF)&quot; to view detailed question breakdown and official certificate.
            </p>
          </div>
          <span className="text-2xs font-semibold px-2.5 py-1 rounded-lg bg-main text-muted border border-main">
            {results.length} Recorded Attempts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-main bg-main/50 text-2xs uppercase tracking-wider text-muted font-bold">
                <th className="py-3.5 px-6">Quiz Name</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Score & Status</th>
                <th className="py-3.5 px-6">Accuracy</th>
                <th className="py-3.5 px-6">Time Taken</th>
                <th className="py-3.5 px-6 text-right">Report Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-muted space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-muted/40" />
                    <p className="text-sm font-semibold text-main">No quiz attempts recorded yet</p>
                    <p className="text-xs text-muted max-w-md mx-auto">
                      Complete any quiz from the catalog to see your attempt history and generated report card here.
                    </p>
                    <Link
                      to="/student/quizzes"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
                    >
                      Start First Quiz
                    </Link>
                  </td>
                </tr>
              ) : (
                results.map((attempt, index) => {
                  const score = Number(attempt?.score ?? 0);
                  const isPassed = score >= 50;
                  const attemptId = attempt?._id || attempt?.id;
                  const durationSecs = Number(attempt?.timeTakenInSeconds || attempt?.timeTaken || 0);
                  const mins = Math.floor(durationSecs / 60);
                  const secs = durationSecs % 60;
                  const durationFormatted = `${mins}m ${secs}s`;

                  return (
                    <tr
                      key={attemptId || index}
                      className="hover:bg-main/40 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-main">{attempt?.quizTitle}</div>
                        <div className="text-2xs text-muted mt-0.5">
                          ID: #{String(attemptId).slice(-6).toUpperCase()}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          <span>
                            {formatDate(
                              attempt?.completedAt || attempt?.startedAt || new Date()
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              isPassed ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {score}%
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-3xs font-bold uppercase ${
                              isPassed
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            }`}
                          >
                            {isPassed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-muted whitespace-nowrap">
                        {attempt?.correctAnswersCount ?? 0} / {attempt?.totalQuestions ?? 0} Correct
                      </td>

                      <td className="py-4 px-6 text-xs text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted" />
                          <span>{durationFormatted}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReport(attempt)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-main transition-colors bg-main px-3 py-1.5 rounded-xl border border-main cursor-pointer"
                            title="Quick popup preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Quick View</span>
                          </button>

                          <Link
                            to={`/student/attempts/${attemptId}/report`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 cursor-pointer shadow-xs"
                            title="Open comprehensive official report card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Full Report (PDF)</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- QUICK REPORT POPUP MODAL --- */}
      {isModalOpen && selectedAttempt && (
        <ResultModal
          selectedAttempt={selectedAttempt}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}
