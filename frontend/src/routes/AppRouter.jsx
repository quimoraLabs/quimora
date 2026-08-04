import { useState } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useTheme } from "../utils/useTheme";

// Wrappers & Guards
import ProtectedRoutes from "./ProtectedRoutes";
import Profile from "../pages/profile/Profile";
import AccessDenied from "../pages/restriction/AccessDenied";

// UI Components
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";
import Sidebar from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";

// Clean Route Imports (No Naming Conflicts!)
import { GuestRoutes } from "./guestRoutes";
import { WebsiteRoutes } from "./websiteRoutes";
import { StudentRoutes, StudentQuizRoutes } from "./studentRoutes";
import { InstructorRoutes } from "./instructorRoutes";
import { AdminRoutes } from "./adminRoutes";

// Layout Wrappers
const PublicLayout = ({ darkMode, toggleDarkMode, navLinks }) => (
  <div className="min-h-screen flex flex-col bg-main">
    <Navbar
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      navLinks={navLinks}
    />
    <main className="pt-20 flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const DashboardLayout = ({ darkMode, toggleDarkMode, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-main text-main">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        role={role}
      />
      <div className="flex flex-col min-h-screen px-2">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          title={role}
          setSidebarOpen={setIsSidebarOpen}
        />
        <main className="lg:ml-64 flex-1 pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppRouter = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const userRole = user?.role?.toLowerCase();
  const navLinks = [
    { name: "Home", href: "/public" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <Routes>
      {/* Root Entry */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={
                userRole === "admin"
                  ? "/admin"
                  : userRole === "user"
                    ? "/student"
                    : "/instructor"
              }
              replace
            />
          ) : (
            <Navigate to="/public" replace />
          )
        }
      />

      {/* Guest Auth Zone */}
      {GuestRoutes()}

      {/* Public Marketing Pages */}
      <Route
        element={
          <PublicLayout
            darkMode={theme === "dark"}
            toggleDarkMode={toggleTheme}
            navLinks={navLinks}
          />
        }
      >
        {WebsiteRoutes()}
      </Route>

      {/* Role Dashboard Shell */}
      <Route
        element={
          <DashboardLayout
            darkMode={theme === "dark"}
            toggleDarkMode={toggleTheme}
            role={userRole}
          />
        }
      >
        <Route
          element={
            <ProtectedRoutes allowedRoles={["user", "instructor", "admin"]} />
          }
        >
          <Route path="/profile" element={<Profile />} />
        </Route>

        {AdminRoutes()}
        {InstructorRoutes()}
        {StudentRoutes()}
      </Route>

      {/* Fullscreen Quiz Shell */}
      {StudentQuizRoutes()}

      {/* Fallbacks */}
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
