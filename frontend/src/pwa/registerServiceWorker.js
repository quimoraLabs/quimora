// PWA Service Worker Registration & Install Manager

let deferredInstallPrompt = null;
const listeners = new Set();

export const registerServiceWorker = () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Capture beforeinstallprompt event for in-app install prompts
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    listeners.forEach((listener) => listener(true));
  });

  // Track appinstalled event
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    listeners.forEach((listener) => listener(false));
    console.log("[PWA] Quimora installed successfully as native app!");
  });

  // Register service worker on window load
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registered with scope:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New version available! Ready to reload.");
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error("[PWA] Service Worker registration failed:", err);
      });
  });
};

/**
 * Hook or subscriber for installable state
 */
export const subscribeToInstallPrompt = (callback) => {
  listeners.add(callback);
  callback(Boolean(deferredInstallPrompt));
  return () => listeners.delete(callback);
};

/**
 * Trigger native install prompt
 */
export const promptPwaInstall = async () => {
  if (!deferredInstallPrompt) {
    return false;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === "accepted") {
    deferredInstallPrompt = null;
    listeners.forEach((listener) => listener(false));
    return true;
  }
  return false;
};

/**
 * Check if app is running in standalone PWA mode
 */
export const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://")
  );
};
