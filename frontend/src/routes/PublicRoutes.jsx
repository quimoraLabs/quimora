import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Loader from "../components/Loader";

const PublicRoutes = () => {
  const { isAuthenticated, user, authInitialized } = useAuthStore();

  if (!authInitialized) {
    return <Loader />;
  }

  if (isAuthenticated) {
    const role = user?.role?.toLowerCase();
    const targetDashboard =
      role === "admin"
        ? "/admin"
        : role === "instructor"
          ? "/instructor"
          : "/student";

    return <Navigate to={targetDashboard} replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;
