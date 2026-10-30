import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Printer,
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";
import { formatDate } from "../../utils/formatDate";

export default function StudentReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const [dashRes, attemptsRes] = await Promise.all([
          axiosClient.get("/student/dashboard").catch(() => ({ data: { data: {} } })),
          axiosClient.get("/student/attempts").catch(() => ({ data: { data: [] } })),
        ]);

        if (dashRes.data?.data) {
          setStats(dashRes.data.data);
        }
        if (Array.isArray(attemptsRes.data?.data)) {
          setAttempts(attemptsRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching reports data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  if (loading) return <Loader />;

  const totalTests = stats?.totalTestsTaken || attempts.length || 0;
  const avgScore = stats?.averageScore ?? 0;
  const maxScore = stats?.maxScore ?? 0;
  const passedTests = attempts.filter((a) => (a.scorePercentage || a.score || 0) >= 50).length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-main pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Official Scorecards & Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Performance Reports</h1>
          <p className="text-sm text-muted mt-1">
            Comprehensive diagnostic reports, category proficiencies, and downloadable test certifications.
          </p>
        </div>

        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 w-fit cursor-pointer"
        >
          <span>Take New Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Total Completed Tests</p>
            <p className="text-2xl font-black text-main mt-1">{totalTests}</p>
            <p className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {passedTests} Passed ({passRate}%)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Average Score</p>
            <p className="text-2xl font-black text-main mt-1">{avgScore}%</p>
            <p className="text-2xs text-muted font-medium mt-0.5">Across all completed tracks</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-main shadow-card flex items-center justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wider font-bold text-muted">Best Performance</p>
            <p className="text-2xl font-black text-main mt-1">{maxScore}%</p>
            <p className="text-2xs text-amber-500 font-semibold mt-0.5">Peak calibrated score</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
            <Award className="w-6 h-6" />
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
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Official Scorecards Table */}
      <div className="bg-surface rounded-3xl border border-main shadow-card overflow-hidden">
        <div className="p-5 md:p-6 border-b border-main flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-main">Generated Examination Scorecards</h2>
            <p className="text-xs text-muted mt-0.5">Click any report to view comprehensive question-by-question evaluation & print PDF</p>
          </div>
          <span className="text-2xs font-semibold px-2.5 py-1 rounded-lg bg-main text-muted border border-main w-fit">
            {attempts.length} Total Scorecards
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="p-12 text-center text-muted space-y-3">
            <FileText className="w-12 h-12 mx-auto text-muted/40" />
            <p className="text-sm font-semibold text-main">No test scorecards generated yet</p>
            <p className="text-xs text-muted max-w-md mx-auto">
              Once you complete any examination or skill track, your official analytical report card will appear here.
            </p>
            <Link
              to="/student/quizzes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
            >
              Start First Quiz
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-main bg-main/50 text-2xs uppercase tracking-wider text-muted font-bold">
                  <th className="py-3.5 px-6">Quiz Assessment</th>
                  <th className="py-3.5 px-6">Date Completed</th>
                  <th className="py-3.5 px-6">Score & Marks</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Official Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-main">
                {attempts.map((att, idx) => {
                  const score = Number(att.scorePercentage ?? att.score ?? 0);
                  const isPassed = score >= 50;
                  const attemptId = att._id || att.id;

                  return (
                    <tr key={attemptId || idx} className="hover:bg-main/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-main">{att.quizTitle || att.quizId?.title || "Adaptive Quiz"}</div>
                        <div className="text-2xs text-muted mt-0.5">
                          ID: #{String(attemptId).slice(-6).toUpperCase()}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          <span>{formatDate(att.completedAt || att.createdAt || new Date())}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-main text-sm">
                          {score}%
                        </div>
                        <div className="text-2xs text-muted font-medium">
                          {att.marksObtained ?? att.correctAnswersCount ?? 0} / {att.totalMarks ?? att.totalQuestions ?? 0} Marks
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                            isPassed
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isPassed ? "PASSED" : "FAILED"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          to={`/student/attempts/${attemptId}/report`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Report Card</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
