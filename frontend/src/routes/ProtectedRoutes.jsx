import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, user, authInitialized } = useAuthStore();

  if (!authInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;