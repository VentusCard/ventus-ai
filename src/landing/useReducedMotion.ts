import { useEffect, useState } from "react";

const getReducedMotion = () => {
  if (typeof window === "undefined") return false;
  const devOverride = import.meta.env.DEV && new URLSearchParams(window.location.search).get("reduced-motion") === "1";
  return devOverride || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(getReducedMotion());
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

