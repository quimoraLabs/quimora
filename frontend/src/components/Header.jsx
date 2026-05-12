import { Menu, Moon, Sun } from "lucide-react";
import useAuthStore from "../store/authStore";

export function Header({ title, setSidebarOpen, toggleDarkMode, darkMode }) {
  const user = useAuthStore((state) => state.user);
  // console.log(user?.name?.split(" ")[0][0]);
  return (
    <header className="h-20 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b shadow shadow-slate-400  dark:shadow-slate-600 border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-5 z-40 lg:ml-64 rounded-2xl">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} className="w-5 h-5 text-slate-600 dark:text-slate-400"/>
        </button>
        <h1 className="text-xl font-medium dark:text-white text-slate-800">{title}</h1>
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-gray-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium dark:text-white text-slate-700">
            
            {user?.name}
            
          </p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
            @{user?.username}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 border border-blue-400/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-sm">
            {/* {user?.name?.split(" ")[0][0] } */}
          </span>
        </div>
      </div>
    </header>
  );
}
