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
  Zap,
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
        path: "/student/challenges",
        name: "Live Challenges & Cups",
        icon: <Zap size={19} />,
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
        name: "User Management",
        icon: <Users size={19} />,
      },
      {
        path: "/admin/roles",
        name: "Role Administration",
        icon: <ShieldCheck size={19} />,
      },
    ],
  };

  const navItems = routes[currentRole] || routes.user;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-surface border-r border-soft transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header & Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-soft">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Quimora Logo"
                className="w-8 h-8 rounded-lg object-contain shadow-xs"
              />
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                Quimora
              </span>
            </div>
            {/* Mobile close toggle */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-muted hover:text-main hover:bg-elevated transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links (Scrollable area) */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/student" || item.path === "/instructor" || item.path === "/admin"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                    isActive
                      ? "bg-accent text-white shadow-sm shadow-accent/20"
                      : "text-muted hover:text-main hover:bg-elevated"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-white" : "text-muted group-hover:text-main"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
