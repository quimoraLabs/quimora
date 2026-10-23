import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./features/auth/store/authStore";
import Loader from "./components/common/Loader";
import ScrollToTop from "./components/common/ScrollToTop";
import PwaInstallBanner from "./components/common/PwaInstallBanner";
import { AppRouter } from "./routes/AppRouter";

function App() {
  const { checkAuth, authInitialized } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!authInitialized) {
    return <Loader />;
  }

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <PwaInstallBanner />
      <AppRouter />
    </>
  );
}

export default App;
