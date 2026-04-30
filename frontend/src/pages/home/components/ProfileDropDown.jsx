import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const menuSections = [
  {
    id: "user",
    items: [
      {
        label: "View Profile",
        href: "/profile",
        click: false,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4.5 fill-current overflow-visible"
            viewBox="0 0 512 512"
            aria-hidden="true"
          >
            <path d="M253.414 103.434c48.556 0 87.919 40.52 87.919 90.505s-39.363 90.505-87.919 90.505-87.919-40.521-87.919-90.505 39.363-90.505 87.919-90.505m0 36.202c-28.324 0-51.717 24.081-51.717 54.303s23.393 54.303 51.717 54.303 51.717-24.081 51.717-54.303-23.393-54.303-51.717-54.303" />
            <path d="M253.414 0c139.957 0 253.414 113.457 253.414 253.414 0 94.285-51.491 176.544-127.886 220.19-35.728 20.575-77.036 32.582-121.104 33.199l-4.423.025C113.457 506.828 0 393.371 0 253.414S113.457 0 253.414 0m-23.676 346.505c-46.331 0-87.479 29.378-102.607 73.008l-2.339 7.571c35.919 27.232 80.165 42.893 126.504 43.522l5.709-.009c38.24-.62 74.079-11.122 105.072-29.064l19.977-13.243-2.237-6.866c-14.371-44.046-55.062-74.052-101.239-74.901zm23.676-310.303c-119.963 0-217.212 97.249-217.212 217.212 0 57.493 22.337 109.77 58.807 148.624 21.668-55.072 74.965-91.735 134.73-91.735h46.831c59.905 0 113.311 36.835 134.885 92.121 36.686-38.892 59.172-91.325 59.172-149.01-.001-119.963-97.25-217.212-217.213-217.212" />
          </svg>
        ),
      },
      {
        label: "Log Out",
        href: "/login",
        isDanger: true,
        click: true,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4.5 fill-current overflow-visible"
            viewBox="0 0 6.35 6.35"
            aria-hidden="true"
          >
            <path d="M3.172.239a.294.295 0 0 0-.291.297v2.361a.294.295 0 0 0 .588 0V.537a.294.295 0 0 0-.297-.298m1.713.59a.294.295 0 0 0-.028 0 .294.295 0 0 0-.164.522c.51.434.832 1.08.832 1.805a2.353 2.353 0 0 1-2.349 2.365A2.353 2.353 0 0 1 .827 3.158c0-.721.318-1.363.822-1.798a.294.295 0 1 0-.382-.448A2.96 2.96 0 0 0 .239 3.156a2.953 2.953 0 0 0 2.938 2.956 2.95 2.95 0 0 0 2.936-2.956c0-.901-.403-1.712-1.039-2.253A.294.295 0 0 0 4.885.83" />
          </svg>
        ),
      },
    ],
  },
];

const ProfileDropdown = ({ logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        hide();
        // Return focus to toggle button for WCAG compliance
        toggleRef.current?.focus();
      }
    };

    const handleClickOutside = (e) => {
      // Logic: If click is NOT on menu and NOT on toggle button, hide menu
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !toggleRef.current.contains(e.target)
      ) {
        hide();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    isOpen ? hide() : show();
  };

  return (
    <div className="relative inline-block">
      {/* Toggle Button */}
      <button
        ref={toggleRef}
        onClick={handleToggle}
        type="button"
        aria-haspopup="true"
        aria-controls="Profile-menu"
        aria-expanded={isOpen}
        id="Profile-toggle"
        className="px-4 py-2 text-slate-900 text-sm font-semibold rounded-full inline-flex items-center gap-2 cursor-pointer bg-white border border-slate-300 transition duration-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:border-neutral-700"
      >
        Profile
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-3 fill-slate-500 overflow-visible"
          viewBox="0 0 512 512"
        >
          <path d="M511 138.2c-3-13.8-11.2-23.1-25.2-27-15.3-4.3-28 .4-38.8 11.3-41.9 42-83.7 84.1-125.5 126.2-21 21-42.2 41.9-65.4 65L64.7 122.3c-16-16-38.8-16.9-53.6-2.8s-15 38 .6 53.7C83.9 245.8 156.4 318.3 229 390.5c15.8 15.7 38 16.1 53.5.6 73-72.5 145.7-145.2 218.2-218.1 9.5-9.6 13.3-21.4 10.3-34.8" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={menuRef}
          id="Profile-menu"
          aria-labelledby="Profile-toggle"
          className="absolute right-0 top-full mt-2 p-2 min-w- w-max max-w-xs text-slate-800 text-sm font-medium bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] z-50 overflow-hidden dark:text-slate-300 dark:bg-neutral-900 dark:border-neutral-700"
        >
          {menuSections.map((section, index) => (
            <React.Fragment key={section.id}>
              {section.items.map((item) => (
                <li key={item.label} className="block">
                  {item.click ? (
                    <button
                      type="button"
                      onClick={() => {
                        hide();
                        if (logout) logout();
                      }}
                      className={`w-full text-left p-3 flex items-center gap-2 rounded-2xl transition duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        ${
                          item.isDanger
                            ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            : "text-slate-800 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-slate-50"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={hide}
                      className={`w-full p-3 flex items-center gap-2 rounded-2xl transition duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        ${
                          item.isDanger
                            ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            : "text-slate-800 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-slate-50"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              {/* Only show divider if it"s not the last section */}
              {index < menuSections.length - 1 && (
                <li className="my-1 border-t border-slate-300 dark:border-neutral-700" />
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileDropdown;
