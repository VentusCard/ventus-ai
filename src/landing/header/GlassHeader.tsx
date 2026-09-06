import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import "./header.css";
import { LANDING_COPY } from "../copy";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import { useRequestAccess } from "../request/context";

const PANEL_ID = "glass-header-panel";

/**
 * Waits for an element with `id` to exist in the DOM, then hands it to
 * `attach` and returns whatever cleanup `attach` wants run when the element
 * (or this hook) goes away. Other workstreams' chapter sections can land a
 * tick after this component mounts (HMR, code-split boundaries), so a plain
 * `document.getElementById` on mount isn't reliable — a MutationObserver on
 * `document.body` picks the element up the moment it appears instead of
 * polling on a timer.
 */
function whenElementReady(id: string, attach: (el: HTMLElement) => () => void): () => void {
  let detach: (() => void) | null = null;
  let observer: MutationObserver | null = null;

  function tryAttach(): boolean {
    const el = document.getElementById(id);
    if (!el) return false;
    detach = attach(el);
    return true;
  }

  if (!tryAttach()) {
    observer = new MutationObserver(() => {
      if (tryAttach() && observer) {
        observer.disconnect();
        observer = null;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    observer?.disconnect();
    detach?.();
  };
}

/**
 * The single persistent nav: wordmark, three same-page chapter anchors, and
 * the Request Access CTA. Fixed floating glass bar on desktop; a compact bar
 * with a slide-down menu panel on mobile. Paper glass by default; the one
 * dark Governance chapter flips it to night glass. See
 * docs/finnovate-landing-goal-c.md Appendix E.
 */
export function GlassHeader() {
  const { open } = useRequestAccess();
  const anchors = LANDING_COPY.header.anchors;

  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement | null>(null);

  // Scroll-driven fill: more opaque past 32px, plus a check of whether the
  // one dark Governance chapter is currently passing behind the header's own
  // band. Both are cheap reads (scrollY, one getBoundingClientRect), so
  // they're batched into a single rAF-throttled handler — at most one layout
  // read per animation frame no matter how fast scroll events fire.
  useEffect(() => {
    let ticking = false;

    function measure() {
      ticking = false;
      setScrolled(window.scrollY > 32);

      const governance = document.getElementById("governance");
      if (governance) {
        const rect = governance.getBoundingClientRect();
        // The bar occupies roughly the top 12-70px (desktop) / 8-58px
        // (mobile) of the viewport; treat "on dark" as the Governance
        // section's box overlapping that band.
        setOnDark(rect.top <= 80 && rect.bottom >= 0);
      } else {
        setOnDark(false);
      }
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  // Active-anchor tracking. One IntersectionObserver watches all three
  // chapter sections through a band roughly a fifth of the way down the
  // viewport (rootMargin shrinks the root to that band). A `true` entry
  // always wins. A `false` entry for the currently active chapter means one
  // of two things: the chapter left the band downward (its top is above the
  // viewport) — keep it active so the last chapter reads active through the
  // footer and the gap below any chapter keeps its owner — or it left the
  // band upward (its top is still below the viewport top), which means the
  // reader is above it: nothing is active until another chapter's own `true`
  // entry arrives. That second rule is what clears the state in the hero,
  // including after an instant jump from the bottom of the page to the top,
  // where no intermediate chapter ever intersects.
  useEffect(() => {
    const ids = anchors.map((anchor) => anchor.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            activeIdRef.current = id;
            setActiveId(id);
          } else if (id === activeIdRef.current) {
            const leftUpward = entry.boundingClientRect.top >= 0;
            if (leftUpward) {
              activeIdRef.current = null;
              setActiveId(null);
            }
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    const cleanups = ids.map((id) =>
      whenElementReady(id, (el) => {
        observer.observe(el);
        return () => observer.unobserve(el);
      })
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      observer.disconnect();
    };
    // anchors comes from a frozen copy.ts export; identity is stable for the
    // life of the module, so this only needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile menu: lock body scroll while open, close + return focus on Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const headerClassName = [
    "glass-header",
    onDark ? "glass-header--on-dark" : scrolled ? "glass-header--scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const brandClassName = [
    "glass-header__brand",
    activeId ? "glass-header__brand--progress" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClassName}>
        <a className={brandClassName} href="#top" aria-label={LANDING_COPY.header.brandAriaLabel}>
          <img className="glass-header__logo" src={ventusLogo} alt="Ventus AI" width={852} height={156} />
        </a>

        <nav className="glass-header__nav" aria-label="Section">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              className="glass-header__link"
              href={`#${anchor.id}`}
              aria-current={activeId === anchor.id ? "location" : undefined}
            >
              {anchor.label}
            </a>
          ))}
        </nav>

        <div className="glass-header__actions">
          <button type="button" className="landing-cta glass-header__desktop-cta" onClick={open}>
            {LANDING_COPY.header.cta}
          </button>
          <button
            type="button"
            className="landing-cta landing-cta--compact glass-header__compact-cta"
            onClick={open}
          >
            {LANDING_COPY.header.cta}
          </button>
          <button
            type="button"
            ref={menuToggleRef}
            className="glass-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={PANEL_ID}
            aria-label={LANDING_COPY.header.menuAriaLabel}
            onClick={() => setMenuOpen((wasOpen) => !wasOpen)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav
          id={PANEL_ID}
          className={["glass-header__panel", onDark ? "glass-header__panel--on-dark" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-label="Section"
        >
          <ul className="glass-header__panel-list">
            {anchors.map((anchor) => (
              <li key={anchor.id}>
                <a
                  className="glass-header__panel-link"
                  href={`#${anchor.id}`}
                  aria-current={activeId === anchor.id ? "location" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {anchor.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
