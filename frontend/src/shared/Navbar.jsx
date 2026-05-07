import ProfileDropdown from "../pages/home/components/ProfileDropDown";
import { Link } from "react-router-dom";
import quimoraLogo from "../assets/quimora.png";
import useAuthStore from "../store/authStore";


export default function Navbar() {
  const logout = () => useAuthStore.getState().logout();

  return (
    <nav className="flex bg-white items-center justify-between px-6 py-4 border-b dark:border-b dark:border-neutral-900 dark:bg-neutral-950">
      <img src={quimoraLogo} alt="Quimora Logo" className="h-8" />

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-300">
          Home
        </Link>
        <Link to="/student/quiz" className="hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-300">
          Quiz
        </Link>
        <ProfileDropdown logout={logout} />
      </div>
    </nav>
  );
}

