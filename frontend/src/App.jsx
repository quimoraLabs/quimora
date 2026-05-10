import { useEffect,useState } from "react";
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

const GlobalLayout = ({ darkMode, toggleDarkMode,navLinks }) => {
  const user = useAuthStore((state) => state.user); // Reactive state
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-neutral-900">
      <Navbar darkMode={darkMode} isLoggedIn={!!user} toggleDarkMode={toggleDarkMode} navLinks={navLinks}/>
      <main className="flex-1 mt-30">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const checkAuth = () => useAuthStore.getState().checkAuth();
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
    { name: "Home", href: "/home" },
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
        <Route element={<GlobalLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} navLinks={navLinks}/>}>
          
          {/* Public Pages with Navbar */}
          <Route element={<PublicRoutes />}>
          <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          
          {/* Protected Pages with Navbar */}
          <Route element={<ProtectedRoutes allowedRoles={["user", "instructor", "admin"]} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/student/quiz" element={<StudentQuiz />} />
            <Route path="/student/quiz/test/:quizId" element={<StudentQuizQuestions />} />
          </Route>

        </Route>

        {/* Error Pages (Usually no navbar) */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
};


export default App;
