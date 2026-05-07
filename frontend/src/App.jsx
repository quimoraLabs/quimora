import { useEffect } from "react";
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
import Navbar from "./shared/Navbar";
import RegisterPage from "./pages/auth/Register";
import Footer from "./shared/Footer";
import StudentQuiz from "./pages/student/dashboard/quiz/Quiz";
import StudentQuizQuestions from "./pages/student/dashboard/quiz/QuizQuestions";
import LandingPage from "./pages/public/LandingPage";

const ProtectedLayout = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-neutral-800">
    <Navbar />
    <main className="flex-1 flex flex-col  lg:min-h-200">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  const checkAuth = () => useAuthStore.getState().checkAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Public only */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Protected */}
        <Route
          element={
            <ProtectedRoutes allowedRoles={["user", "instructor", "admin"]} />
          }
        >
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/student/quiz" element={<StudentQuiz />} />
            <Route
              path="/student/quiz/test/:quizId"
              element={<StudentQuizQuestions />}
            />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
