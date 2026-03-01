import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Set this before navigating to suppress the next scroll-to-top */
(window as any).__skipNextScrollToTop = false;

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ((window as any).__skipNextScrollToTop) {
      (window as any).__skipNextScrollToTop = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
