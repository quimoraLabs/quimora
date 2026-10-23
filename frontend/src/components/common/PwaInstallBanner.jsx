import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, WifiOff, Sparkles, CheckCircle2 } from "lucide-react";
import {
  subscribeToInstallPrompt,
  promptPwaInstall,
  isStandaloneMode,
} from "../../pwa/registerServiceWorker";

export default function PwaInstallBanner() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    // Check if already in standalone mode
    if (isStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    // Subscribe to install prompt
    const unsubscribe = subscribeToInstallPrompt((canInstall) => {
      setIsInstallable(canInstall);
    });

    // Check dismissed in session
    const dismissedSession = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissedSession) {
      setIsDismissed(true);
    }

    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    const installed = await promptPwaInstall();
    if (installed) {
      setIsInstalled(true);
      setIsInstallable(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  return (
    <>
      {/* Offline Alert Notification Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-semibold py-2 px-4 shadow-md flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>You are currently offline. Quimora is running in cached offline mode.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating In-App Install Banner (Mobile & Desktop) */}
      <AnimatePresence>
        {isInstallable && !isDismissed && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] bg-surface/95 backdrop-blur-md border border-indigo-500/30 dark:border-indigo-500/20 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-main truncate">
                    Install Quimora App
                  </h4>
                  <button
                    onClick={handleDismiss}
                    className="text-muted hover:text-main p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label="Dismiss banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-muted leading-relaxed mt-0.5">
                  Install for faster access, offline capability, and distraction-free learning.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-brand-mid hover:bg-brand-primary text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all shadow-md shadow-brand-mid/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Install Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-muted hover:text-main transition-colors cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
