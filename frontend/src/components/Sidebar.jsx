import {
  LayoutDashboard,
  LogOut,
  QuoteIcon,
  UserCheck,
  UserStar,
  X,
} from "lucide-react"; // Close icon ke liye
import useAuthStore from "../store/authStore";
import { Link } from "react-router-dom";
import logo from "../assets/quimora.png";

// import { useEffect } from "react";

export default function Sidebar({ isOpen, setIsOpen, role }) {
  const logout = () => useAuthStore.getState().logout();
  const routes = {
    user: [
      {
        path: "/student",
        name: "Dashboard",
        icon: <LayoutDashboard />,
      },
      {
        path: "/student/quizzes",
        name: "Available Quizzes",
        icon: <QuoteIcon />,
      },
      {
        path: "/student/my-attempts",
        name: "My Attempts",
        icon: <UserStar />,
      },
    ],
    instructor: [
      {
        path: "/instructor",
        name: "Dashboard",
        icon: <LayoutDashboard />,
      },
      {
        path: "/instructor/quizes",
        name: "Quizzes",
        icon: <QuoteIcon />,
      },
      {
        path: "/instructor/students",
        name: "Students",
        icon: <UserCheck />,
      },
    ],
    admin: [
      {
        path: "/admin",
        name: "Dashboard",
        icon: <LayoutDashboard />,
      },
      {
        path: "/admin/quizes",
        name: "Quizzes",
        icon: <QuoteIcon />,
      },
      {
        path: "/instructor/users",
        name: "User Control",
        icon: <UserCheck />,
      },
    ],
  };

  return (
    <>
      {/* 1. Backdrop (Mobile par jab sidebar khule toh piche ka area dark karne ke liye) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#050505]/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-surface border-r border-main transition-transform duration-300 ease-in-out rounded-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-300 dark:border-neutral-600/50">
          <img src={logo} className="w-32" />

          {/* Mobile Close Button */}
          <button
            className="lg:hidden text-neutral-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {routes[role]?.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="flex items-center p-3 text-neutral-400 dark:hover:text-white hover:bg-slate-200 hover:text-slate-500 dark:hover:bg-neutral-800/50 rounded-xl transition-all group"
            >
              <span className="mr-3 text-slate-500 dark:text-neutral-400 group-hover:text-blue-500 transition-colors">
                {route.icon || <LayoutDashboard size={20} />}
              </span>
              {route.name}
            </Link>
          ))}
          <div className="p-4 border-t dark:border-neutral-800 space-y-2">
            <Link
              to={"profile"}
              className="flex items-center p-3 text-neutral-400 dark:hover:text-white hover:bg-slate-200 hover:text-slate-500 dark:hover:bg-neutral-800/50 rounded-xl transition-all group"
            >
              <span className="mr-3 text-slate-500 dark:text-neutral-400 group-hover:text-blue-500 transition-colors">
                <UserCheck size={20} />
              </span>
              Profile
            </Link>
            <button
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 hover:bg-red-400/5 transition-all"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
