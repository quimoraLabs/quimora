import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import quimoraLogo from "../assets/quimora.png";
import useAuthStore from "../store/authStore";

const menuItems = [
  { label: "Home", to: "/" },
  { label: "Profile", to: "/profile" },
//   { label: "Logout", to: "/login" }
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logout = () => useAuthStore.getState().logout();
  const menuRef = useRef(null);
  const lastFocusedElementRef = useRef(null);

  const openMenu = () => {
    lastFocusedElementRef.current = document.activeElement;
    setIsMenuOpen(true);

    // Move focus into menu after state update
    setTimeout(() => {
      menuRef.current?.focus();
    }, 0);
  };

  const handleLogout = () => {
    logout();
    NavLink.to("/login");
    closeMenu();
    };

  const handleClickOutside = (e) => {
    if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
      closeMenu();
    }  
};

  const closeMenu = () => {
    setIsMenuOpen(false);

    // Restore focus after state update
    setTimeout(() => {
      lastFocusedElementRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <nav
      className="flex py-2 px-4 md:px-8 bg-white border-b border-slate-300 dark:border-neutral-700 dark:bg-neutral-900 min-h-17 relative z-20"
      aria-label="Main navigation"
        onClick={handleClickOutside}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 w-full">
        <div
          id="collapseMenu"
          ref={menuRef}
          tabIndex={-1}
          className={`${isMenuOpen ? "block" : "hidden"} flex-1 lg:block max-lg:bg-white dark:max-lg:bg-neutral-900 max-lg:border-r max-lg:border-slate-300 dark:max-lg:border-neutral-700 max-lg:w-64 max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto max-sm:w-full z-50 outline-none`}
        >
          <div className="py-2 px-4 flex justify-between items-center border-b border-slate-300 sticky top-0 bg-white dark:border-neutral-700 dark:bg-neutral-900 lg:hidden max-lg:min-h-17">
            <NavLink
              to="/"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              onClick={closeMenu}
            >
              <span className="sr-only">Your Company</span>
              <img
                src={quimoraLogo}
                alt="Quimora logo"
                className="h-9 w-auto"
              />
            </NavLink>
            <button
              type="button"
              aria-controls="collapseMenu"
              onClick={closeMenu}
              id="toggleClose"
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              <span className="sr-only">Close main menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-slate-900 dark:fill-slate-50"
                aria-hidden="true"
                viewBox="0 0 329.269 329"
              >
                <path
                  d="M194.8 164.77 323.013 36.555c8.343-8.34 8.343-21.825 0-30.164-8.34-8.34-21.825-8.34-30.164 0L164.633 134.605 36.422 6.391c-8.344-8.34-21.824-8.34-30.164 0-8.344 8.34-8.344 21.824 0 30.164l128.21 128.215L6.259 292.984c-8.344 8.34-8.344 21.825 0 30.164a21.27 21.27 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25l128.21-128.214 128.216 128.214a21.27 21.27 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25 8.343-8.34 8.343-21.824 0-30.164zm0 0"
                  data-original="#000000"
                />
              </svg>
            </button>
          </div>

          <ul className="flex flex-col gap-8 font-semibold text-sm text-slate-900 dark:text-slate-50 lg:flex-row max-lg:p-6">
            {menuItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${isActive ? "text-blue-700 dark:text-blue-300" : ""}`
                  }
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          aria-controls="collapseMenu"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          id="toggleOpen"
          onClick={openMenu}
          className="lg:hidden focus:outline-none focus-visible:ring-2 
               cursor-pointer focus-visible:ring-blue-500 rounded
               "
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-7 w-7 fill-slate-900 dark:fill-slate-50"
            aria-hidden="true"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>

        <NavLink
          to="/"
          className="min-w-9 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <span className="sr-only">Your Company</span>
          <img
            src={quimoraLogo}
            alt="Quimora logo"
            className="h-9 w-auto"
          />
        </NavLink>
            <button className="text-white font-semibold cursor-pointer " onClick={handleLogout}>
                Logout
            </button>
        
      </div>
    </nav>
  );
}
