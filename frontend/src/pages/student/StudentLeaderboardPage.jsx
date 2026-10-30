import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Sparkles,
  TrendingUp,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";
import useAuthStore from "../../features/auth/store/authStore";

export default function StudentLeaderboardPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedTier, setSelectedTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/student/dashboard");
        if (res.data?.data?.leaderboard) {
          setLeaderboard(res.data.data.leaderboard);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const tiers = [
    { id: "all", label: "Global Arena" },
    { id: "master", label: "Master" },
    { id: "advanced", label: "Advanced" },
    { id: "intermediate", label: "Intermediate" },
    { id: "learner", label: "Learner" },
    { id: "beginner", label: "Beginner" },
  ];

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((item) => {
      const nameMatch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.username || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!nameMatch) return false;
      if (selectedTier === "all") return true;

      const itemTier = (item.tier || item.levelName || "beginner").toLowerCase();
      return itemTier.includes(selectedTier.toLowerCase());
    });
  }, [leaderboard, selectedTier, searchQuery]);

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-main pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Olympic Hall of Fame
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-sm text-muted mt-1">
            Real-time Elo calibrator ranking across all students and cohorts.
          </p>
        </div>

        {/* Tier filter pill buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTier === t.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-surface border border-main text-muted hover:text-main"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🏅 Authentic 3-Step Olympic Podium Stage */}
      {filteredLeaderboard.length > 0 && (
        <div className="bg-surface rounded-3xl border border-main p-6 sm:p-10 shadow-card flex flex-col items-center">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-1.5 border border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              Champions Pedestal
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-main tracking-tight">Olympic Victory Podium</h2>
          </div>

          {/* Unified Podium Stage with 3 Steps */}
          <div className="w-full max-w-2xl flex items-end justify-center gap-2 sm:gap-4 pt-6">
            {/* STEP 2 - SILVER (Left, Medium Height) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex flex-col items-center mb-3 text-center w-full">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center mb-1.5 shadow-xs">
                  2
                </span>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-slate-400 to-slate-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md ring-4 ring-slate-300 dark:ring-slate-600">
                  {(filteredLeaderboard[1]?.name || "—").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-main text-xs sm:text-sm mt-2 truncate max-w-full">
                  {filteredLeaderboard[1]?.name || "Challenger"}
                </h3>
                <p className="text-3xs text-muted truncate">
                  {filteredLeaderboard[1] ? `${filteredLeaderboard[1].tier || "Learner"} • @${filteredLeaderboard[1].username || "student"}` : "Rank 2"}
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-3xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {filteredLeaderboard[1]?.elo ? `${filteredLeaderboard[1].elo} Elo` : "1012 Elo"}
                  </span>
                  {filteredLeaderboard[1]?.averageScore != null && (
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-3xs font-mono font-bold border border-indigo-500/20">
                      {filteredLeaderboard[1].averageScore}% Avg
                    </span>
                  )}
                </div>
              </div>

              {/* Silver Pillar */}
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-linear-to-b from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border-t-2 border-x-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 dark:bg-white/5 opacity-50" />
                <span className="text-4xl sm:text-6xl font-black text-slate-500/40 dark:text-slate-400/20 select-none">
                  2
                </span>
              </div>
            </div>

            {/* STEP 1 - GOLD (Center, Tallest, Elevated) */}
            <div className="flex-1 flex flex-col items-center -mt-6">
              <div className="flex flex-col items-center mb-3 text-center w-full relative">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center font-black text-sm mb-1.5 shadow-md shadow-amber-500/40 animate-bounce">
                  👑
                </div>
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-linear-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl shadow-amber-500/30 ring-4 ring-amber-400">
                  {(filteredLeaderboard[0]?.name || "—").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-main text-sm sm:text-base mt-2 truncate max-w-full">
                  {filteredLeaderboard[0]?.name || "Leader"}
                </h3>
                <p className="text-3xs text-amber-500 font-bold truncate">
                  {filteredLeaderboard[0]?.tier || "Learner"} &bull; @{filteredLeaderboard[0]?.username || "champion"}
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-xs font-mono font-black text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-xs">
                    {filteredLeaderboard[0]?.elo ? `${filteredLeaderboard[0].elo} Elo` : "1024 Elo"}
                  </span>
                  {filteredLeaderboard[0]?.averageScore != null && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-3xs font-mono font-black border border-emerald-500/30">
                      {filteredLeaderboard[0].averageScore}% Avg
                    </span>
                  )}
                </div>
              </div>

              {/* Gold Pillar */}
              <div className="w-full h-40 sm:h-52 rounded-t-2xl bg-linear-to-b from-amber-400 via-yellow-500 to-amber-600 dark:from-amber-600 dark:via-amber-700 dark:to-yellow-800 border-t-2 border-x-2 border-amber-300 dark:border-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10" />
                <span className="text-6xl sm:text-8xl font-black text-amber-700/40 dark:text-yellow-300/20 select-none">
                  1
                </span>
              </div>
            </div>

            {/* STEP 3 - BRONZE (Right, Lowest Height) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex flex-col items-center mb-3 text-center w-full">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center mb-1.5 shadow-xs">
                  3
                </span>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-amber-700 to-amber-900 flex items-center justify-center text-white font-extrabold text-xl shadow-md ring-4 ring-amber-700/50">
                  {(filteredLeaderboard[2]?.name || "—").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-main text-xs sm:text-sm mt-2 truncate max-w-full">
                  {filteredLeaderboard[2]?.name || "Spot Open"}
                </h3>
                <p className="text-3xs text-muted truncate">
                  {filteredLeaderboard[2] ? `@${filteredLeaderboard[2].username || "student"}` : "Unclaimed"}
                </p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-amber-900/10 text-3xs font-mono font-bold text-amber-700 dark:text-amber-400 border border-amber-700/20">
                  {filteredLeaderboard[2] ? `${filteredLeaderboard[2].elo || 1000} Elo` : "1000+ Elo"}
                </span>
              </div>

              {/* Bronze Pillar */}
              <div className="w-full h-20 sm:h-28 rounded-t-2xl bg-linear-to-b from-amber-600 via-amber-700 to-amber-800 dark:from-amber-800 dark:via-amber-900 dark:to-amber-950 border-t-2 border-x-2 border-amber-500/50 dark:border-amber-700 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 dark:bg-white/5 opacity-50" />
                <span className="text-3xl sm:text-5xl font-black text-amber-950/40 dark:text-amber-500/20 select-none">
                  3
                </span>
              </div>
            </div>
          </div>

          {/* Podium Base Stage Line */}
          <div className="w-full max-w-2xl h-3 rounded-b-2xl bg-linear-to-r from-slate-400 via-amber-500 to-amber-700 shadow-md" />
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-surface rounded-3xl border border-main shadow-card overflow-hidden">
        <div className="p-5 md:p-6 border-b border-main flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-main border border-main text-xs text-main placeholder:text-muted focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="text-2xs font-semibold text-muted">
            Displaying {filteredLeaderboard.length} Ranked Candidates
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-main bg-main/50 text-2xs uppercase tracking-wider text-muted font-bold">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Calibrated Tier</th>
                <th className="py-3.5 px-6 text-center">Quizzes</th>
                <th className="py-3.5 px-6 text-center">Average Score</th>
                <th className="py-3.5 px-6 text-right">Rating (Elo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main">
              {filteredLeaderboard.map((item, idx) => {
                const rank = idx + 1;
                const isCurrent = (currentUser?._id && item.userId === currentUser._id) ||
                  (currentUser?.email && item.email === currentUser.email);

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 font-bold"
                        : "hover:bg-main/40"
                    }`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black ${
                          rank === 1
                            ? "bg-amber-400 text-amber-950 shadow-sm shadow-amber-400/50"
                            : rank === 2
                            ? "bg-slate-300 text-slate-800"
                            : rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-main text-muted border border-main"
                        }`}
                      >
                        {rank}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {(item.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-main">{item.name || "Student"}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-md bg-indigo-500 text-white text-3xs font-extrabold uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-2xs text-muted">@{item.username || "student"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        {item.tier || item.levelName || "Learner"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap text-xs font-semibold text-muted">
                      {item.totalTests || 1} {item.totalTests === 1 ? "Quiz" : "Quizzes"}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                        {item.averageScore != null ? `${item.averageScore}%` : "—"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-sm text-main">
                      {item.elo || 1000}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
