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
import LandingPage from "./pages/public/LandingPage";
import About from "./pages/public/AboutUs";
import ContactUs from "./pages/public/ContactUs";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";
import RequestOTP from "./pages/auth/forgetPassword/RequestOTP";
// import ChangePassword from "./pages/auth/forgetPassword/ChangePassword";
import VerifyOTP from "./pages/auth/forgetPassword/VerifyOTP";
import StudentQuiz from "./pages/dashboards/student/dashboard/quiz/Quiz";
import StudentQuizQuestions from "./pages/dashboards/student/dashboard/quiz/QuizQuestions";
import StudentDashboard from "./pages/dashboards/student/dashboard/StudentDashboard";
import StudentResult from "./pages/dashboards/student/result/StudentResult";
import { QuizLanding } from "./pages/dashboards/student/dashboard/quiz/InstructionQuiz";
import { ResultCard } from "./pages/dashboards/student/dashboard/quiz/TestResult";
import Loader from "./components/Loader";
import AdminDashboard from "./pages/dashboards/admin/AdminDashboard";
import InstructorDashboard from "./pages/dashboards/instructor/InstructorDashboard";
import AccessDenied from "./pages/restriction/AccessDenied";
import { useTheme } from "./utils/useTheme";
import InstructorQuizzesDashboard from "./pages/dashboards/instructor/quiz/Quiz";
import ViewQuiz from "./pages/dashboards/instructor/quiz/ViewQuiz";
import CreateQuiz from "./pages/dashboards/instructor/quiz/AddQuiz";
import InstructorStudentDash from "./pages/dashboards/instructor/student/StudentDash";

const PublicLayout = ({ darkMode, toggleDarkMode, navLinks }) => {
  // const user = useAuthStore((state) => state.user);
  return (
    <div className="min-h-screen flex flex-col bg-main">
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


const DashboardLayout = ({ darkMode, toggleDarkMode, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-main text-main selection:bg-brand-start/30 selection:text-text-main">
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

function App() {
  const { checkAuth, isAuthenticated, user, authInitialized } = useAuthStore();
  // console.log(checkAuth);
  const { theme, toggleTheme } = useTheme();

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

        {/* ================= 2. GUEST ONLY ROUTES ================= */}

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
              darkMode={theme === "dark"}
              toggleDarkMode={toggleTheme}
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
              darkMode={theme === "dark"}
              toggleDarkMode={toggleTheme}
              role={user?.role}
            />
          }
        >
          {/* 🟢 Common Secure Zone  */}
          <Route
            element={
              <ProtectedRoutes allowedRoles={["user", "instructor", "admin"]} />
            }
          >
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
              <Route path="quizzes" element={<InstructorQuizzesDashboard />} />
              <Route path="students" element={<InstructorStudentDash />} />
              <Route path="quizzes/:quizId" exact element={<ViewQuiz />} />

              <Route path="quizzes/create" element={<CreateQuiz />} />
            </Route>
          </Route>

          {/* 🧑‍🎓 Student Only Zone */}
          <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
            <Route path="/student">
              <Route index element={<StudentDashboard />} />
              <Route path="quizzes" element={<StudentQuiz />} />
              <Route path="my-attempts" element={<StudentResult />} />
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
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
