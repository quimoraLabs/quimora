import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  History,
  Award,
  Coins,
  Zap,
} from "lucide-react";
import useAuthStore from "../../features/auth/store/authStore";
import axiosClient from "../../api/axiosClient";

export function Header({ title, setSidebarOpen, toggleDarkMode, darkMode }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rawRole = user?.role?.toLowerCase() || "student";
  const role = rawRole === "user" ? "student" : rawRole;
  const profilePath = `/${role}/profile`;

  const [studentStats, setStudentStats] = useState({
    coins: user?.profile?.coinsBalance ?? 100,
    elo: user?.profile?.overallElo ?? 1000,
    tier: user?.profile?.levelName ?? "Learner",
  });

  useEffect(() => {
    if (!user || role !== "student") return;
    let isMounted = true;
    const fetchQuickStats = async () => {
      try {
        const res = await axiosClient.get("/interests/student/profile");
        if (isMounted && res.data?.success && res.data?.data?.profile) {
          const p = res.data.data.profile;
          setStudentStats({
            coins: p.coinsBalance ?? 100,
            elo: p.overallElo ?? 1000,
            tier: p.levelName ?? "Learner",
          });
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchQuickStats();
    return () => {
      isMounted = false;
    };
  }, [role, user]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-main flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 w-full transition-colors">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden p-2 rounded-full hover:bg-main transition-colors text-muted hover:text-main cursor-pointer"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-main capitalize tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Gamification Badges, Theme Toggle & User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Student Gamification Badges: Coins & Elo */}
        {role === "student" && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Coins Balance Pill */}
            <Link
              to="/student/profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 transition-all font-mono font-bold text-xs shadow-xs"
              title="Quimora Coins Balance (Click to view Profile & Rewards)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{studentStats.coins}</span>
            </Link>

            {/* Elo Rating Pill */}
            <Link
              to="/student/leaderboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 transition-all font-mono font-bold text-xs shadow-xs"
              title="Arena Calibrated Elo Rating (Click to view Leaderboard)"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/30 shrink-0" />
              <span>{studentStats.elo}</span>
              <span className="hidden md:inline text-3xs font-sans font-semibold px-1.5 py-0.2 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                {studentStats.tier}
              </span>
            </Link>
          </div>
        )}

        {/* Dark/Light Quick Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-main border border-transparent hover:border-main transition-all cursor-pointer text-muted hover:text-main"
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-main border border-transparent hover:border-main transition-all cursor-pointer group"
          >
            {/* User Avatar */}
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {/* Name & Username (desktop) */}
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-main leading-none group-hover:text-indigo-500 transition-colors">
                {user?.name || "Student"}
              </p>
              <p className="text-2xs text-muted font-medium mt-0.5">
                @{user?.username || role}
              </p>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 hidden sm:block ${
                isDropdownOpen ? "rotate-180 text-indigo-500" : ""
              }`}
            />
          </button>

          {/* Floating Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 p-2 bg-surface rounded-2xl border border-main shadow-2xl backdrop-blur-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header: User Info Card */}
              <div className="p-3 rounded-xl bg-main/50 border border-main/60 flex items-center gap-3">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-main truncate">
                    {user?.name}
                  </p>
                  <p className="text-2xs text-muted truncate">
                    {user?.email}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-3xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize">
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      {role}
                    </span>
                    {role === "student" && (
                      <>
                        <span className="text-3xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                          🪙 {studentStats.coins}
                        </span>
                        <span className="text-3xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded-full border border-indigo-500/20">
                          ⚡ {studentStats.elo} Elo
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="pt-1 space-y-0.5">
                <Link
                  to={profilePath}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-main transition-all"
                >
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>My Profile</span>
                </Link>

                {role === "student" && (
                  <>
                    <Link
                      to="/student/my-attempts"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-main transition-all"
                    >
                      <History className="w-4 h-4 text-emerald-500" />
                      <span>Attempts & Reports</span>
                    </Link>

                    <Link
                      to="/student/badges"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-main transition-all"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Badges & Milestones</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="my-1 border-t border-main/80" />

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
