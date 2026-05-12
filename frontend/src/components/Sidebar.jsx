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

export default function Sidebar({ isOpen, setIsOpen }) {
  const user = useAuthStore((state) => state.user);
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
        path: "/student/result",
        name: "Result",
        icon: <UserStar />,
      },
    ],
    Instructor: [
      {
        path: "/instructor",
        name: "Dashboard",
      },
      {
        path: "/instructor/quizes",
        name: "Quizzes",
      },
      {
        path: "/instructor/students",
        name: "Students",
      },
    ],
    admin: [
      {
        path: "/admin",
        name: "Dashboard",
      },
      {
        path: "/admin/quizes",
        name: "Quizzes",
      },
      {
        path: "/instructor/users",
        name: "User Control",
      },
    ],
  };

  return (
    <>
      {/* 1. Backdrop (Mobile par jab sidebar khule toh piche ka area dark karne ke liye) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#050505] z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen dark:bg-[#050505] border-r border-neutral-800/50 transition-transform duration-300 ease-in-out rounded-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-neutral-800/50">
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
          {routes[user?.role]?.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="flex items-center p-3 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl transition-all group"
            >
              <span className="mr-3 text-neutral-400 group-hover:text-blue-500 transition-colors">
                {route.icon || <LayoutDashboard size={20} />}
              </span>
              {route.name}
            </Link>
          ))}
          <div className="p-4 border-t border-neutral-800 space-y-2">
            <Link
              to={"profile"}
              className="flex items-center p-3 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl transition-all group"
            >
              <span className="mr-3 text-neutral-400 group-hover:text-blue-500 transition-colors">
                <UserCheck size={20} />
              </span>
              Profile
            </Link>
            <button
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
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
