import { useEffect, useRef } from "react";

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Scrolls the nearest scrollable ancestor so the referenced workspace sits at the
 * top of the viewport when `active` becomes true, and back to the top when it clears.
 */
export function useScrollIntoWorkspace(active: boolean, key: string | null) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (!active) return;
    }

    const el = ref.current;
    if (!el) return;
    const scroller = findScrollParent(el);
    if (!scroller) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

    const id = window.requestAnimationFrame(() => {
      if (!active) {
        scroller.scrollTo({ top: 0, behavior });
        return;
      }
      const offset =
        el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      scroller.scrollTo({ top: Math.max(0, offset - 8), behavior });
    });

    return () => window.cancelAnimationFrame(id);
  }, [active, key]);

  return ref;
}
