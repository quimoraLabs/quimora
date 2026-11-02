import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  History,
  Users,
  ShieldCheck,
  X,
  FileText,
  Target,
  Trophy,
  Award,
  Zap,
  FolderTree,
  ChevronDown,
  Layers,
  GraduationCap,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/quimora.png";
import useHierarchyStore from "../../features/student/store/useHierarchyStore";

export default function Sidebar({ isOpen, setIsOpen, role }) {
  const currentRole = role?.toLowerCase() || "user";
  const location = useLocation();
  const navigate = useNavigate();

  const {
    domains,
    selectedDomain,
    courses,
    selectedCourse,
    fetchDomains,
    selectDomain,
    selectCourse,
  } = useHierarchyStore();

  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  useEffect(() => {
    if (currentRole === "user") {
      fetchDomains();
    }
  }, [currentRole, fetchDomains]);

  const instructorRoutes = [
    {
      path: "/instructor",
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: "/instructor/quizzes",
      name: "Manage Quizzes",
      icon: <BookOpen size={18} />,
    },
    {
      path: "/instructor/students",
      name: "Student Roster",
      icon: <UserCheck size={18} />,
    },
  ];

  const adminRoutes = [
    {
      path: "/admin",
      name: "System Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: "/admin/users",
      name: "User Management",
      icon: <Users size={18} />,
    },
    {
      path: "/admin/roles",
      name: "Role Administration",
      icon: <ShieldCheck size={18} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-dvh w-68 bg-surface border-r border-soft transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header & Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-soft">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Quimora Logo"
                className="w-28 h-12 rounded-lg object-contain"
              />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-xl text-muted min-h-10 min-w-10 flex items-center justify-center cursor-pointer hover:text-main hover:bg-elevated transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links Area */}
          <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto scrollbar-none">
            {/* Student Domain & Course Focused Hierarchy Navigation */}
            {currentRole === "user" ? (
              <>
                {/* 1. Dashboard Link */}
                <NavLink
                  to="/student"
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-white shadow-sm shadow-accent/20"
                        : "text-muted hover:text-main hover:bg-elevated"
                    }`
                  }
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard Overview</span>
                </NavLink>

                {/* 2. Focused Domain Banner (Level 1) */}
                <div className="pt-2">
                  <div className="px-1 text-2xs font-extrabold uppercase tracking-wider text-muted mb-1.5 flex items-center justify-between">
                    <span>Active Domain</span>
                    {domains.length > 1 ? (
                      <button
                        onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                        className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Switch</span>
                        <ChevronDown size={10} className={`transition-transform duration-200 ${isDomainDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                        Level 1
                      </span>
                    )}
                  </div>

                  {/* Clean Focused Domain Pill */}
                  <div className="p-3 rounded-2xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <FolderTree size={16} />
                      </div>
                      <div className="truncate">
                        <h3 className="text-xs font-bold text-main truncate">
                          {selectedDomain?.name || "Select Track"}
                        </h3>
                        <p className="text-3xs text-muted truncate">Current Focused Track</p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Dropdown for Domain Switching */}
                  {isDomainDropdownOpen && domains.length > 1 && (
                    <div className="mt-1.5 p-1 bg-surface border border-soft rounded-2xl shadow-lg space-y-0.5 z-20">
                      <div className="px-2 py-1 text-3xs font-bold text-muted uppercase">
                        Available Tracks
                      </div>
                      {domains.map((dom) => (
                        <button
                          key={dom._id}
                          onClick={() => {
                            selectDomain(dom);
                            setIsDomainDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            selectedDomain?._id === dom._id
                              ? "bg-indigo-600 text-white shadow-xs font-bold"
                              : "text-muted hover:text-main hover:bg-elevated"
                          }`}
                        >
                          <span className="truncate">{dom.name}</span>
                          {selectedDomain?._id === dom._id && <CheckCircle2 size={13} className="shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Domain's Focused Courses (Level 2) */}
                <div>
                  <div className="px-1 text-2xs font-extrabold uppercase tracking-wider text-muted mb-1.5 flex items-center justify-between">
                    <span>Domain Courses</span>
                    <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">
                      Level 2
                    </span>
                  </div>

                  <div className="space-y-1">
                    {courses.length > 0 ? (
                      courses.map((course) => {
                        const isCourseActive =
                          selectedCourse?._id === course._id &&
                          location.pathname.startsWith("/student/quizzes");

                        return (
                          <button
                            key={course._id}
                            onClick={() => {
                              selectCourse(course);
                              navigate("/student/quizzes");
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                              isCourseActive
                                ? "bg-indigo-600 text-white shadow-xs font-bold"
                                : "text-muted hover:text-main hover:bg-elevated"
                            }`}
                          >
                            <BookOpen size={15} className="shrink-0" />
                            <span className="truncate">{course.title}</span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-2xs text-muted px-2 py-1">No courses found</div>
                    )}
                  </div>
                </div>

                {/* 4. Practice & Complementary Modules (strictly scoped) */}
                <div className="pt-3 border-t border-soft space-y-1">
                  <div className="px-1 text-2xs font-extrabold uppercase tracking-wider text-muted mb-1.5">
                    Practice & Performance
                  </div>

                  <NavLink
                    to="/student/weak-areas"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-xs"
                          : "text-muted hover:text-main hover:bg-elevated"
                      }`
                    }
                  >
                    <Target size={17} />
                    <span>Domain Practice Drills</span>
                  </NavLink>

                  <NavLink
                    to="/student/challenges"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-xs"
                          : "text-muted hover:text-main hover:bg-elevated"
                      }`
                    }
                  >
                    <Zap size={17} />
                    <span>Contests & Challenges</span>
                  </NavLink>

                  <NavLink
                    to="/student/my-attempts"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-xs"
                          : "text-muted hover:text-main hover:bg-elevated"
                      }`
                    }
                  >
                    <FileText size={17} />
                    <span>Attempts & Reports</span>
                  </NavLink>

                  <NavLink
                    to="/student/leaderboard"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                        isActive
                          ? "bg-accent text-white shadow-xs"
                          : "text-muted hover:text-main hover:bg-elevated"
                      }`
                    }
                  >
                    <Trophy size={17} />
                    <span>Olympic Leaderboard</span>
                  </NavLink>
                </div>
              </>
            ) : (
              /* Instructor & Admin Navigation */
              (currentRole === "instructor" ? instructorRoutes : adminRoutes).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/instructor" || item.path === "/admin"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-main hover:bg-elevated"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))
            )}
          </div>

          {/* Selected Scope Breadcrumb Footer */}
          {currentRole === "user" && selectedDomain && (
            <div className="p-3 border-t border-soft bg-elevated/20 text-3xs text-muted truncate">
              <span className="font-bold text-accent">{selectedDomain.name}</span>
              {selectedCourse && (
                <>
                  <span className="mx-1">›</span>
                  <span className="font-semibold text-main truncate">{selectedCourse.title}</span>
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
