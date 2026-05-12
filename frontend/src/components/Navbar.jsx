import { Sun, Moon, Menu, X } from "lucide-react";
import useAuthStore from "../store/authStore";
import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropDown";
import logo from "../assets/quimora.png"

const Navbar = ({ darkMode, toggleDarkMode, navLinks, isLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logout = () => useAuthStore.getState().logout();
  console.log(isLoggedIn);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <img src={logo} className="h-2/3"/>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
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
            {isLoggedIn ? (
             <ProfileDropdown logout={logout}/>
            ) : (
              <>
                <Link
                  className="px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  to="login"
                >
                  Login
                </Link>
                <Link
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700  hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-transform"
                  to={"register"}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 px-4 pt-2 pb-6"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-medium text-gray-600 dark:text-gray-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-gray-100 dark:border-slate-800" />
            {isLoggedIn ? (
              <ProfileDropdown/>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  className="w-full py-3 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl"
                  to="login"
                >
                  Login
                </Link>
                <Link
                  className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-xl"
                  to="register"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
