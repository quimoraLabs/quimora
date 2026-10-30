import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Target,
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";

export default function StudentWeakAreasPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weakAreas, setWeakAreas] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadWeakAreas = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/student/dashboard");
        if (res.data?.data) {
          setStats(res.data.data);
          const rawWeak = res.data.data.weakAreas || [];
          setWeakAreas(rawWeak);
        }
      } catch (err) {
        console.error("Error loading weak areas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWeakAreas();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-main pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Target className="w-3.5 h-3.5" />
            Remedial Topic Focus
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Weak Areas & Practice</h1>
          <p className="text-sm text-muted mt-1">
            Targeted topics where your accuracy dipped below 60%. Practice these topics to boost your calibrated Elo.
          </p>
        </div>

        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 w-fit cursor-pointer"
        >
          <span>Explore All Quizzes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 md:p-5 rounded-2xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main">How to Recover Points:</h3>
            <p className="text-xs text-muted leading-relaxed mt-0.5">
              Failing questions in higher tiers deducts rank XP. Taking short diagnostic quizzes on these specific weak topics restores your consistency polygon on the radar.
            </p>
          </div>
        </div>

        <span className="text-2xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
          {weakAreas.length} Topics Under-Performing
        </span>
      </div>

      {/* Weak Areas Grid */}
      {weakAreas.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-main shadow-card p-12 text-center text-muted space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
          <h3 className="text-base font-bold text-main">No Critical Weak Areas Detected!</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            You are performing above the 60% baseline across all assessed categories. Keep testing in higher difficulty tiers to maintain your streak.
          </p>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
          >
            Attempt Advanced Quizzes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {weakAreas.map((area, idx) => {
            const accuracy = Math.round(Number(area.accuracy || area.score || 0));
            const topicName = area.topic || area.category || area.name || `Topic #${idx + 1}`;
            const totalQuestions = area.totalQuestions || area.attemptCount || 10;
            const mistakes = area.mistakes || Math.max(1, Math.round(totalQuestions * (1 - accuracy / 100)));

            return (
              <div
                key={idx}
                className="bg-surface rounded-3xl border border-main shadow-card p-6 flex flex-col justify-between space-y-5 hover:border-amber-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Critical Attention
                    </span>
                    <span className="text-2xs font-bold text-muted">
                      {mistakes} Missed Questions
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-main group-hover:text-amber-500 transition-colors">
                    {topicName}
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Concept accuracy is currently at <strong>{accuracy}%</strong>. Recommended to review foundational syntax and logic flow.
                  </p>

                  {/* Accuracy Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-2xs font-semibold text-muted">
                      <span>Current Mastery</span>
                      <span className="font-bold text-amber-500">{accuracy}% / 100%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-main overflow-hidden border border-main">
                      <div
                        className="h-full bg-linear-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, accuracy)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Practice CTA */}
                <Link
                  to={`/student/quizzes`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice {topicName} Now</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
