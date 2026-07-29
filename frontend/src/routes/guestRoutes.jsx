import { Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";
import RequestOTP from "../pages/auth/forgetPassword/RequestOTP";
import VerifyOTP from "../pages/auth/forgetPassword/VerifyOTP";

export const GuestRoutes = () => (
  <Route element={<PublicRoutes />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/auth/forget-password" element={<RequestOTP />} />
    <Route path="/auth/reset-password" element={<VerifyOTP />} />
  </Route>
);
