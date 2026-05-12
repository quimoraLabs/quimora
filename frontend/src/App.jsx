import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes, Outlet } from "react-router-dom";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import LoginPage from "./pages/auth/Login";
import useAuthStore from "./store/authStore";
import { Toaster } from "react-hot-toast";
import PublicRoutes from "./routes/PublicRoutes";
import Profile from "./pages/profile/Profile";
import Home from "./pages/home/Home";
import Unauthorized from "./pages/Unauthorized";
import Navbar from "./components/Navbar";
import RegisterPage from "./pages/auth/Register";
import Footer from "./components/Footer";
import StudentQuiz from "./pages/student/dashboard/quiz/Quiz";
import StudentQuizQuestions from "./pages/student/dashboard/quiz/QuizQuestions";
import LandingPage from "./pages/public/LandingPage";
import About from "./pages/public/AboutUs";
import ContactUs from "./pages/public/ContactUs";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";
import StudentDashboard from "./pages/student/dashboard/StudentDashboard";
import StudentResult from "./pages/student/result/StudentResult";

const PublicLayout = ({ darkMode, toggleDarkMode, navLinks }) => {
  // const user = useAuthStore((state) => state.user);
  return (
    <div className="min-h-screen flex flex-col dark:bg-neutral-900">
      {/* <Sidebar /> */}
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        navLinks={navLinks}
      />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const DashboardLayout = ({ darkMode, toggleDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen dark:bg-[#0f172a] bg-slate-100  text-neutral-200 selection:bg-blue-500/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col min-h-screen px-2">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          title={"Student"}
          setSidebarOpen={setIsSidebarOpen}
        />
        <main className="lg:ml-64 flex-1 pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const checkAuth = () => useAuthStore.getState().checkAuth();
  console.log(checkAuth);
  const [darkMode, setDarkMode] = useState(() => {
    // Check if window is defined (SSR safety, though we are in a client environment)
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const navLinks = [
    { name: "Home", href: "/public" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* --- 1. LAYOUT BINA NAVBAR/FOOTER KE (Auth Pages) --- */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- 2. LAYOUT NAVBAR/FOOTER KE SAATH (Everything else) --- */}
        <Route
          element={
            <PublicLayout
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              navLinks={navLinks}
            />
          }
        >
          {/* Public Pages with Navbar */}
          <Route element={<PublicRoutes />}>
            <Route path="/contact" element={<ContactUs />} />
            {/* <Route path="/" element={checkAuth ? <Home/> : <LandingPage />} /> */}
            <Route path="/public" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Route>

        <Route
          element={
            <DashboardLayout
              navLinks={navLinks}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        >
          {/* Protected Pages with Navbar */}
          <Route
            element={
              <ProtectedRoutes allowedRoles={["user", "instructor", "admin"]} />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/student">
              {/* Matches "/student" exactly */}
              <Route index element={<StudentDashboard />} />

              {/* Matches "/student/quizzes" */}
              <Route path="quizzes" element={<StudentQuiz />} />

              <Route path="result" element={<StudentResult />} />

              {/* Matches "/student/quiz/test/:quizId" */}
              <Route
                path="quiz/test/:quizId"
                element={<StudentQuizQuestions />}
              />
            </Route>
          </Route>
        </Route>

        {/* Error Pages (Usually no navbar) */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
