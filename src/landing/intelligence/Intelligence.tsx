import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { LANDING_COPY } from "../copy";
import { useRevealed } from "../motif/useRevealed";
import { FlowPlane } from "./FlowPlane";
import "./intelligence.css";

const { eyebrow, headline, body, stages } = LANDING_COPY.intelligence;
const STAGE_NUMBERS = ["01", "02", "03"] as const;
const STAGE_COUNT = stages.length;

/** Cycle mode: one stage holds this long before the plane moves on. */
const STAGE_MS = 5000;
/** Cycle mode: a reader who picks a stage keeps it this long. */
const HOLD_AFTER_CLICK_MS = 14000;
/** Pinned mode: the composition holds for this much scroll, split into thirds. */
const DWELL_VH = 120;
/** Pinned mode: the block never sits under the floating header bar. */
const MIN_PIN_TOP = 96;

type Stage = 0 | 1 | 2;

/**
 * Three ways the chapter can run, decided from the viewport and the
 * reader's motion preference, in this order:
 *
 *  - pinned: the whole composition — head, plane, step row — holds in the
 *    viewport while the reader scrolls through 120vh, and scroll progress
 *    is the stage: the first third is Understand, the second Decide, the
 *    third Activate. The active step's line fills with the scroll, so every
 *    pixel of scrolling answers. Needs a wide, tall viewport (the whole
 *    block has to fit) and no reduced-motion preference.
 *  - cycle: narrow or short viewports; nothing is pinned, the plane advances
 *    on its own every 5s while in view and a click holds a stage.
 *  - static: reduced motion; the steps are plain tabs, nothing moves by
 *    itself.
 */
type Mode = "pinned" | "cycle" | "static";

function computeMode(): Mode {
  if (typeof window === "undefined" || !("matchMedia" in window)) return "static";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  return window.matchMedia("(min-width: 900px) and (min-height: 800px)").matches ? "pinned" : "cycle";
}

export function Intelligence() {
  const [mode, setMode] = useState<Mode>(computeMode);
  const [stage, setStage] = useState<Stage>(0);
  const [cycling, setCycling] = useState(false);
  const holdUntil = useRef(0);
  const [tick, setTick] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);
  const { ref: revealRef, revealed } = useRevealed<HTMLDivElement>(0.25);

  // Mode follows the viewport and the motion preference live.
  useEffect(() => {
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(min-width: 900px) and (min-height: 800px)"),
    ];
    const update = () => setMode(computeMode());
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  // Pinned mode: measure the block so the scroller is exactly block + dwell,
  // and centre the block in the space under the header.
  useLayoutEffect(() => {
    if (mode !== "pinned") return;
    const scroller = scrollerRef.current;
    const block = blockRef.current;
    if (!scroller || !block) return;
    const measure = () => {
      const h = block.getBoundingClientRect().height;
      scroller.style.setProperty("--intel-block-h", `${Math.round(h)}px`);
      const top = Math.max(MIN_PIN_TOP, Math.round((window.innerHeight - h) / 2));
      scroller.style.setProperty("--intel-pin-top", `${top}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(block);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mode]);

  // Pinned mode: scroll progress → stage (thirds) and the scrubbed line.
  useEffect(() => {
    if (mode !== "pinned") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let ticking = false;
    const measure = () => {
      ticking = false;
      const rect = scroller.getBoundingClientRect();
      const pinTop = parseFloat(getComputedStyle(scroller).getPropertyValue("--intel-pin-top")) || MIN_PIN_TOP;
      const dwell = rect.height - (parseFloat(getComputedStyle(scroller).getPropertyValue("--intel-block-h")) || 0);
      if (dwell <= 0) return;
      const progress = Math.min(1, Math.max(0, (pinTop - rect.top) / dwell));
      const scaled = progress * STAGE_COUNT;
      const next = Math.min(STAGE_COUNT - 1, Math.floor(scaled)) as Stage;
      const within = next === STAGE_COUNT - 1 && progress >= 1 ? 1 : scaled - next;
      scroller.style.setProperty("--stage-progress", within.toFixed(3));
      setStage((current) => (current === next ? current : next));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode]);

  // Cycle mode: the plane advances on its own while in view.
  useEffect(() => {
    if (mode !== "cycle" || !revealed) {
      setCycling(false);
      return;
    }
    setCycling(true);
    const id = window.setInterval(() => {
      if (Date.now() < holdUntil.current) return;
      setStage((current) => ((current + 1) % STAGE_COUNT) as Stage);
      setTick((t) => t + 1);
    }, STAGE_MS);
    return () => window.clearInterval(id);
  }, [mode, revealed]);

  // Picking a step: in pinned mode, scroll to the middle of that step's
  // third; otherwise select it directly (and hold it, in cycle mode).
  const pick = useCallback(
    (index: Stage) => {
      if (mode === "pinned") {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const rect = scroller.getBoundingClientRect();
        const pinTop = parseFloat(getComputedStyle(scroller).getPropertyValue("--intel-pin-top")) || MIN_PIN_TOP;
        const dwell = rect.height - (parseFloat(getComputedStyle(scroller).getPropertyValue("--intel-block-h")) || 0);
        const top = window.scrollY + rect.top - pinTop + dwell * ((index + 0.5) / STAGE_COUNT);
        window.scrollTo({ top, behavior: "smooth" });
        return;
      }
      holdUntil.current = Date.now() + HOLD_AFTER_CLICK_MS;
      setStage(index);
      setTick((t) => t + 1);
    },
    [mode],
  );

  // Arrow keys walk the steps like a tab list; focus follows the choice.
  const onStepKey = useCallback(
    (event: KeyboardEvent<HTMLOListElement>) => {
      const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
      if (!delta) return;
      event.preventDefault();
      const next = ((stage + delta + STAGE_COUNT) % STAGE_COUNT) as Stage;
      pick(next);
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>(".intelligence-step__button");
      buttons[next]?.focus();
    },
    [pick, stage],
  );

  const composition = (
    <div className="intelligence-block" ref={blockRef}>
      <div className="landing-chapter-head landing-chapter-head--split">
        <p className="landing-eyebrow">{eyebrow}</p>
        <h2>{headline}</h2>
        <p>{body}</p>
      </div>

      <div className="intelligence-layout" ref={revealRef} data-mode={mode} data-cycling={cycling ? "true" : "false"}>
        <FlowPlane stage={stage} />

        <ol className="intelligence-stepper" aria-label="Stages" onKeyDown={onStepKey}>
          {stages.map((item, index) => {
            const active = index === stage;
            return (
              <li
                key={item.key}
                className="intelligence-step"
                data-active={active ? "true" : "false"}
                data-done={index < stage ? "true" : "false"}
              >
                <button
                  type="button"
                  className="intelligence-step__button"
                  onClick={() => pick(index as Stage)}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="intelligence-step__line" aria-hidden="true">
                    {active ? <span className="intelligence-step__progress" key={tick} /> : null}
                  </span>
                  <span className="intelligence-step__index">{STAGE_NUMBERS[index]}</span>
                  <span className="intelligence-step__title">{item.title}</span>
                  <span className="intelligence-step__body">{item.body}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );

  return (
    <section id="intelligence" className="landing-chapter" data-mode={mode}>
      {mode === "pinned" ? (
        <div className="landing-shell intelligence-scroller" ref={scrollerRef} style={{ ["--intel-dwell" as string]: `${DWELL_VH}vh` }}>
          <div className="intelligence-pinned">{composition}</div>
        </div>
      ) : (
        <div className="landing-shell">{composition}</div>
      )}
    </section>
  );
}
