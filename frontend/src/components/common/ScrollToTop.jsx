import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component
 * Automatically scrolls window and layout containers to the very top (0, 0)
 * whenever the route or pathname changes.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Instantly reset standard window scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // 2. Reset html & body elements (handles cross-browser quirks)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Reset any scrollable main container if styled with overflow
    const mainElements = document.querySelectorAll("main, #main-content");
    mainElements.forEach((el) => {
      if (el) {
        el.scrollTop = 0;
      }
    });
  }, [pathname, search]);

  return null;
}
