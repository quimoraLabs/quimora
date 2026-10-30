import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCcw, Home, FileText, ArrowRight, Zap } from "lucide-react";
import axiosClient from "../../../../api/axiosClient";

export const ResultActions = ({ onExit, attemptId, quizId, passed }) => {
  const navigate = useNavigate();
  const [nextChallenge, setNextChallenge] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);

  useEffect(() => {
    if (quizId && passed) {
      setLoadingNext(true);
      axiosClient
        .get(`/api/v2/student/tracks/next-challenge/${quizId}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setNextChallenge(res.data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingNext(false));
    }
  }, [quizId, passed]);

  return (
    <div className="flex flex-col gap-3 pt-4">
      {/* HackerRank-style Next Challenge CTA */}
      {nextChallenge && (
        <button
          onClick={() => {
            if (onExit) {
              onExit(`/student/quizzes/${nextChallenge.nextQuizId}`);
            } else {
              navigate(`/student/quizzes/${nextChallenge.nextQuizId}`);
            }
          }}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 py-4 px-6 rounded-2xl flex items-center justify-between gap-3 transition-all font-bold group"
        >
          <div className="flex items-center gap-2.5 text-left">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold">
                Challenge Solved!
              </div>
              <div className="text-sm font-extrabold text-white">
                Next: {nextChallenge.title}
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-xl font-bold group-hover:translate-x-1 transition-transform">
            Solve Next <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      )}

      {attemptId && (
        <Link
          to={`/student/attempts/${attemptId}/report`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-center cursor-pointer"
        >
          <FileText className="w-5 h-5" /> View / Download Full Report (PDF)
        </Link>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onExit("/student/quizzes")}
          className="flex-1 bg-accent hover:opacity-95 text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold group"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Retake Another Exam
        </button>
        <button
          onClick={() => onExit("/student/quizzes")}
          className="flex-1 bg-surface hover:bg-elevated text-main py-3.5 px-6 rounded-2xl border border-soft flex items-center justify-center gap-2 transition-all font-bold"
        >
          <Home className="w-5 h-5" /> Exit to Desk
        </button>
      </div>
    </div>
  );
};
