import { Menu, Moon, Sun } from "lucide-react";
import useAuthStore from "../store/authStore";

export function Header({ title, setSidebarOpen, toggleDarkMode, darkMode }) {
  const user = useAuthStore((state) => state.user);
  // console.log(user?.name?.split(" ")[0][0]);
  return (
    <header className="h-20 bg-bg-surface backdrop-blur-md border-b shadow drop-shadow-bg-main border-border-main  flex items-center justify-between px-4 sm:px-8 sticky top-5 z-40 lg:ml-64 rounded-2xl">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden p-2 rounded-full hover:bg-bg-main transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} className="w-5 h-5 text-slate-600 dark:text-slate-400"/>
        </button>
        <h1 className="text-xl font-medium dark:text-white text-slate-800 capitalize">{title}</h1>
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full hover:bg-bg-main transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-400" />
        )}
      </button>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-text-main capitalize">
            
            {user?.name}
            
          </p>
          <p className="text-[10px] text-text-muted uppercase tracking-widest italic">
            @{user?.username}
          </p>
        </div>
       
          <img src={user?.avatar?.url} alt={user?.name} className="w-8 h-8 rounded-full object-cover border-2 border-border-main" />
        {/* </div> */}
      </div>
    </header>
  );
}
