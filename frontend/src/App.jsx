import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import LoginPage from "./pages/auth/Login";
import useAuthStore from "./store/authStore";
import { Toaster } from "react-hot-toast";
import PublicRoutes from "./routes/PublicRoutes";
import Profile from "./pages/profile/Profile";
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
import RequestOTP from "./pages/auth/forgetPassword/RequestOTP";
// import ChangePassword from "./pages/auth/forgetPassword/ChangePassword";
import VerifyOTP from "./pages/auth/forgetPassword/VerifyOTP";
import { QuizLanding } from "./pages/student/dashboard/quiz/InstructionQuiz";
import { ResultCard } from "./pages/student/dashboard/quiz/TestResult";
import Loader from "./components/Loader";
import AdminDashboard from "./pages/dashboards/admin/AdminDashboard";
import InstructorDashboard from "./pages/dashboards/instructor/InstructorDashboard";
import AccessDenied403 from "./pages/restriction/AccessDenied";

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

const DashboardLayout = ({ darkMode, toggleDarkMode,role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen dark:bg-[#0f172a] bg-slate-100  text-neutral-200 selection:bg-blue-500/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role={role} />
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

function App() {
  const { checkAuth, isAuthenticated, user, authInitialized } = useAuthStore();
  // console.log(checkAuth);
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
  }, [checkAuth]);

  const navLinks = [
    { name: "Home", href: "/public" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  if (!authInitialized) {
    return <Loader />;
  }

  return (
<>
  <Toaster position="top-center" reverseOrder={false} />

  <Routes>
    {/* ================= 1. MASTER ROOT DIRECTION ================= */}
    <Route
      path="/"
      element={
        isAuthenticated ? (
          <Navigate
            to={
              user?.role === "admin"
                ? "/admin"
                : user?.role === "user"
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

    {/* ================= 2. GUEST ONLY ROUTES (Bina Navbar) ================= */}
    <Route element={<PublicRoutes />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth">
        <Route path="forget-password" element={<RequestOTP />} />
        <Route path="reset-password" element={<VerifyOTP />} />
      </Route>
    </Route>

    {/* ================= 3. GUEST ONLY ROUTES (Navbar + Footer) ================= */}
    <Route
      element={
        <PublicLayout
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          navLinks={navLinks}
        />
      }
    >
      <Route element={<PublicRoutes />}>
        <Route path="/public" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route>
    </Route>

    {/* ================= 4. PROTECTED ROUTES (Dashboard Layout) ================= */}
    <Route
      element={
        <DashboardLayout
          navLinks={navLinks}
          darkMode={darkMode}
          role={user?.role}
          toggleDarkMode={toggleDarkMode}
        />
      }
    >
      {/* 🟢 Common Secure Zone (Sabhi Logged-in Users ke liye) */}
      <Route element={<ProtectedRoutes allowedRoles={["user", "instructor", "admin"]} />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 👑 Admin Only Zone */}
      <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
        <Route path="/admin">
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* 👨‍🏫 Instructor Only Zone */}
      <Route element={<ProtectedRoutes allowedRoles={["instructor"]} />}>
        <Route path="/instructor">
          <Route index element={<InstructorDashboard />} />
        </Route>
      </Route>

      {/* 🧑‍🎓 Student Only Zone */}
      <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
        <Route path="/student">
          <Route index element={<StudentDashboard />} />
          <Route path="quizzes" element={<StudentQuiz />} />
          <Route path="result" element={<StudentResult />} />
        </Route>
      </Route>
    </Route>

    {/* ================= 5. PROTECTED ROUTES (Full Screen Quiz - No Sidebar) ================= */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student">
        <Route path="quiz-rules" element={<QuizLanding />} />
        <Route path="start-quiz" element={<StudentQuizQuestions />} />
        <Route path="quiz-results" element={<ResultCard />} />
      </Route>
    </Route>

    {/* Error Pages */}
    <Route path="/access-denied" element={<AccessDenied403 />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</>
  );
}

export default App;
