import { useEffect } from "react";
import { useLocation } from "react-router-dom";

let _suppress = false;

export function suppressNextScroll() {
  _suppress = true;
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (_suppress) {
      _suppress = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
