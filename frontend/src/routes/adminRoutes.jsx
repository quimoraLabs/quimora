import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminDashboard from "../pages/dashboards/admin/AdminDashboard";

export const AdminRoutes = () => (
  <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
    <Route path="/admin" element={<AdminDashboard />} />
  </Route>
);
