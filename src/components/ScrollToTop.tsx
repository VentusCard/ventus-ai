import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, state } = useLocation();

  useEffect(() => {
    // Skip scroll-to-top if navigating with skipScroll state (e.g. FAQ link)
    if ((state as any)?.skipScroll) return;
    window.scrollTo(0, 0);
  }, [pathname, state]);

  return null;
}
