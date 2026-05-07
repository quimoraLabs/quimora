import { Link } from "react-router-dom";
import quimoraLogo from "../../../assets/quimora.png";

export default function Navbar() {
  return (
    <nav className="flex bg-white items-center justify-between px-6 py-4 border-b dark:border-b dark:border-neutral-900 dark:bg-neutral-950">
      <Link
        to="/"
        className="hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-300"
      >
        <img src={quimoraLogo} alt="Quimora Logo" className="h-8" />
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link
          to="/"
          className="hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-300"
        >
          Home
        </Link>
        <Link
          to="/"
          className="hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-300"
        >
          Quiz
        </Link>
      </div>
      <div className="flex items-center gap-4 text-sm font-medium">
        <button className="text-slate-900 dark:text-gray-300 hover:text-indigo-600 transition-colors">
          Login
        </button>
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md">
          Register
        </button>
      </div>
    </nav>
  );
}
