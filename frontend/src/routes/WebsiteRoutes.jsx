import { Route } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import About from "../pages/public/AboutUs";
import ContactUs from "../pages/public/ContactUs";

export const WebsiteRoutes = () => (
  <>
    <Route path="/public" element={<LandingPage />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<ContactUs />} />
  </>
);
