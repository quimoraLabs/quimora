import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  History,
  Users,
  ShieldCheck,
  X,
  FileText,
  Target,
  Trophy,
  Award,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/quimora.png";

export default function Sidebar({ isOpen, setIsOpen, role }) {
  // Normalize role string ('user' -> 'user' key matching)
  const currentRole = role?.toLowerCase() || "user";

  const routes = {
    user: [
      {
        path: "/student",
        name: "Dashboard",
        icon: <LayoutDashboard size={19} />,
      },
      {
        path: "/student/quizzes",
        name: "Skill Tracks & Quizzes",
        icon: <BookOpen size={19} />,
      },
      {
        path: "/student/my-attempts",
        name: "Attempts & Reports",
        icon: <FileText size={19} />,
      },
      {
        path: "/student/weak-areas",
        name: "Weak Areas & Practice",
        icon: <Target size={19} />,
      },
      {
        path: "/student/leaderboard",
        name: "Olympic Leaderboard",
        icon: <Trophy size={19} />,
      },
      {
        path: "/student/badges",
        name: "Badges & Milestones",
        icon: <Award size={19} />,
      },
    ],
    instructor: [
      {
        path: "/instructor",
        name: "Dashboard",
        icon: <LayoutDashboard size={19} />,
      },
      {
        path: "/instructor/quizzes",
        name: "Manage Quizzes",
        icon: <BookOpen size={19} />,
      },
      {
        path: "/instructor/students",
        name: "Student Roster",
        icon: <UserCheck size={19} />,
      },
    ],
    admin: [
      {
        path: "/admin",
        name: "System Dashboard",
        icon: <LayoutDashboard size={19} />,
      },
      {
        path: "/admin/users",
        name: "Manage Users",
        icon: <Users size={19} />,
      },
    ],
  };

  const baseRolePath = currentRole === "user" ? "student" : currentRole;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-surface/95 backdrop-blur-xl border-r border-main flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div>
          {/* Logo Section (h-16 matches Header height for seamless horizontal border alignment) */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-main">
            <img src={logo} alt="Quimora Logo" className="w-28" />
            <button
              className="lg:hidden text-muted hover:text-main cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {routes[currentRole]?.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                end={route.path === `/${baseRolePath}`}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                      : "text-muted hover:bg-main hover:text-main"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-lg shadow-indigo-500/50" />
                    )}
                    <span
                      className={`mr-3 transition-colors ${
                        isActive
                          ? "text-indigo-400"
                          : "text-muted group-hover:text-indigo-400"
                      }`}
                    >
                      {route.icon}
                    </span>
                    {route.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Clean System Status Card at bottom */}
        <div className="p-4 border-t border-main">
          <div className="p-3.5 rounded-2xl bg-main/60 border border-main flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-main truncate">Quimora v3.5</p>
              <p className="text-2xs text-muted truncate">Proctoring v2.0 Active</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
