import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

export const AdminRoutes = () => (
  <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
    <Route path="/admin" element={<AdminDashboardPage />} />
  </Route>
);
