import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../features/auth/store/authStore";

const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, user, authInitialized } = useAuthStore();

  if (!authInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map((role) =>
    role.toLowerCase(),
  );

  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
