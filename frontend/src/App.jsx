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
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "var(--color-bg-surface, #0f1422)",
            color: "var(--color-text-main, #f8fafc)",
            border: "1px solid var(--color-border-main, rgba(255, 255, 255, 0.1))",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            fontSize: "13px",
            fontWeight: 500,
          },
        }}
      />
      <PwaInstallBanner />
      <AppRouter />
    </>
  );
}

export default App;
