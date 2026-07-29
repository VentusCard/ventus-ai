import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace("#", ""));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    const params = new URLSearchParams(search);
    if (params.has("scrollTo")) {
      const target = params.get("scrollTo");
      setTimeout(() => {
        const el = document.getElementById(target || "");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}
