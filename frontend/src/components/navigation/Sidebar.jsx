import {
  LayoutDashboard,
  LogOut,
  QuoteIcon,
  UserCheck,
  UserStar,
  User,
  X,
} from "lucide-react";
import useAuthStore from "../../features/auth/store/authStore";
import { NavLink } from "react-router-dom";
import logo from "../../assets/quimora.png";

export default function Sidebar({ isOpen, setIsOpen, role }) {
  const logout = () => useAuthStore.getState().logout();

  // Normalize role string ('user' -> 'user' key matching)
  const currentRole = role?.toLowerCase() || "user";

  const routes = {
    user: [
      {
        path: "/student",
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        path: "/student/quizzes",
        name: "Available Quizzes",
        icon: <QuoteIcon size={20} />,
      },
      {
        path: "/student/my-attempts",
        name: "My Attempts",
        icon: <UserStar size={20} />,
      },
    ],
    instructor: [
      {
        path: "/instructor",
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        path: "/instructor/quizzes",
        name: "Quizzes",
        icon: <QuoteIcon size={20} />,
      },
      {
        path: "/instructor/students",
        name: "Students",
        icon: <UserCheck size={20} />,
      },
    ],
    admin: [
      {
        path: "/admin",
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      { path: "/admin/quizes", name: "Quizzes", icon: <QuoteIcon size={20} /> },
      {
        path: "/admin/instructor/users",
        name: "User Control",
        icon: <UserCheck size={20} />,
      },
    ],
  };

  // Base Path calculation for profile
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
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-800">
            <img src={logo} alt="Quimora Logo" className="w-28" />
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X size={22} />
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
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
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
                          : "text-slate-500 group-hover:text-indigo-400"
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

        {/* Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-1.5">
          <NavLink
            to={`/${baseRolePath}/profile`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
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
                      : "text-slate-500 group-hover:text-indigo-400"
                  }`}
                >
                  <User size={20} />
                </span>
                Profile
              </>
            )}
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut
              size={20}
              className="mr-3 text-red-400/80 group-hover:text-red-400"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
