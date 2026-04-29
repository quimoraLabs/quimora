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

const ProtectedLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
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
        </Route>

        {/* Public normal */}

        {/* Protected */}
        <Route element={<ProtectedRoutes allowedRoles={["user", "admin"]} />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
