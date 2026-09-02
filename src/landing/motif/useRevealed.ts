import { useEffect, useRef, useState } from "react";

/**
 * Shared entrance-reveal hook. Returns a ref to attach to the element and a
 * boolean that flips true once, the first time the element crosses ~40% of
 * the viewport. Every section uses this instead of hand-rolling an
 * IntersectionObserver, so the "once, on entry, no re-trigger" rule stays
 * consistent page-wide.
 *
 * Respects prefers-reduced-motion by starting (and staying) revealed — the
 * CSS in landing.css also disables the transition itself as a second layer
 * of defense.
 */
export function useRevealed<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, revealed };
}
