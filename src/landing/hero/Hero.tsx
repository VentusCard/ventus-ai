import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { LANDING_COPY } from "../copy";
import { useRequestAccess } from "../request/context";
import { DecisionRecord } from "./DecisionRecord";
import "./hero.css";

const COPY = LANDING_COPY.hero;

/** How far the record and the glow drift as the hero scrolls away — the
 *  record a little faster than the page, the glow a little slower, so the
 *  instrument reads as a layer set above the paper. */
const RECORD_DRIFT = -0.08;
const GLOW_DRIFT = 0.05;
const DRIFT_RANGE = 640;

/**
 * Hero: the thesis and the record, in normal document flow. Four things on
 * the left — eyebrow, headline, one sentence, one action — and the decision
 * record on the right doing the explaining. Nothing else: the audience line
 * and the value cues that used to sit here were cut because the record
 * already says what they said.
 */
export function Hero() {
  const { open } = useRequestAccess();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Scroll-linked drift, only where motion is welcome and the two columns
  // sit side by side. rAF-throttled; one style write per frame.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("matchMedia" in window)) return;
    const allowed = window.matchMedia("(prefers-reduced-motion: no-preference) and (min-width: 900px)");
    let ticking = false;
    const apply = () => {
      ticking = false;
      if (!allowed.matches) {
        section.style.removeProperty("--hero-shift");
        section.style.removeProperty("--hero-glow-shift");
        return;
      }
      const y = Math.min(window.scrollY, DRIFT_RANGE);
      section.style.setProperty("--hero-shift", `${(y * RECORD_DRIFT).toFixed(1)}px`);
      section.style.setProperty("--hero-glow-shift", `${(y * GLOW_DRIFT).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    allowed.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      allowed.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <section className="landing-hero" ref={sectionRef}>
      <div className="landing-hero__glow" aria-hidden="true" />
      <div className="landing-shell landing-hero__grid">
        <div className="landing-hero__copy">
          <span className="landing-eyebrow">{COPY.eyebrow}</span>
          <h1 className="landing-hero__headline">{COPY.headline}</h1>
          <p className="landing-hero__body">{COPY.body}</p>
          <div className="landing-hero__cta-row">
            <button type="button" className="landing-cta" onClick={open}>
              {COPY.cta}
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="landing-hero__visual">
          <DecisionRecord />
        </div>
      </div>
    </section>
  );
}
