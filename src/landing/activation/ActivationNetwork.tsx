import { useEffect, useState } from "react";
import { BriefcaseBusiness, Gift, Megaphone, Send, Smartphone, Users } from "lucide-react";
import { LANDING_COPY } from "../copy";
import { Stamp } from "../motif/Stamp";
import { useRevealed } from "../motif/useRevealed";

const { chip, destinations, litSlot, litLabel } = LANDING_COPY.activation;

const ICONS = {
  smartphone: Smartphone,
  users: Users,
  megaphone: Megaphone,
  gift: Gift,
  briefcase: BriefcaseBusiness,
} as const;

type Destination = (typeof destinations)[number];

/* Rails geometry in the SVG's own space (stretched over the rails band):
   a short trunk down from the middle of the decision bar, a bus across the
   five column centres, one drop per column. The lit path follows trunk →
   bus → the lit column's drop. */
const COLS = [10, 30, 50, 70, 90];
const BUS_Y = 22;
const TRUNK = `M 50 0 L 50 ${BUS_Y}`;
const BUS = `M ${COLS[0]} ${BUS_Y} L ${COLS[COLS.length - 1]} ${BUS_Y}`;
const litPath = (col: number) => `M 50 0 L 50 ${BUS_Y} L ${COLS[col]} ${BUS_Y} L ${COLS[col]} 60`;

const CYCLE_MS = 3600;
const DEFAULT_LIT = destinations.findIndex((d) => d.label === litSlot);

function prefersReducedMotion() {
  return typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/** A surface is lit while the decision reaches it, then keeps what it was
 *  handed: the action stays on its screen, quietly, as delivered. */
type SurfaceState = "idle" | "lit" | "delivered";

/* The structure inside each destination surface: what that system's own
   screen looks like, drawn as bars and frames. When the surface is lit, the
   action that reached it appears as the one line of real text; once the
   network has moved on, the line stays — the decision is in that system
   now — so by the end of a cycle every screen shows what reached it. */
function SurfaceBody({ destination, state }: { destination: Destination; state: SurfaceState }) {
  const lit = state === "lit";
  const shown = state !== "idle";
  const mod = lit ? " is-lit" : shown ? " is-delivered" : "";
  const item = <span className={`activation-item${mod}`}>{destination.item}</span>;
  switch (destination.surface) {
    case "tile":
      return (
        <div className="activation-body activation-body--tile">
          <div className="activation-phone">
            <span className="activation-phone-notch" />
            <span className={`activation-phone-tile${mod}`}>{shown ? item : null}</span>
            <span className="landing-bar" style={{ width: "72%" }} />
            <span className="landing-bar" style={{ width: "48%" }} />
          </div>
        </div>
      );
    case "task":
      return (
        <div className="activation-body activation-body--rows">
          <span className={`activation-row${mod}`}>
            <i className="activation-check" />
            {shown ? item : <span className="landing-bar" style={{ width: "70%" }} />}
          </span>
          {[1, 2].map((i) => (
            <span className="activation-row" key={i}>
              <i className="activation-check" />
              <span className="landing-bar" style={{ width: i === 1 ? "56%" : "62%" }} />
            </span>
          ))}
        </div>
      );
    case "send":
      return (
        <div className="activation-body activation-body--send">
          <span className={`activation-row${mod}`}>
            <i className="activation-avatar" />
            <span className="activation-lines">
              {shown ? item : <span className="landing-bar" style={{ width: "78%" }} />}
              <span className="landing-bar" style={{ width: "54%" }} />
            </span>
          </span>
          <span className={`activation-send${mod}`}>
            <Send size={11} strokeWidth={1.75} />
          </span>
        </div>
      );
    case "offer":
      return (
        <div className="activation-body activation-body--offer">
          <div className={`activation-offer${mod}`}>
            <i className="activation-offer-badge">
              <Gift size={11} strokeWidth={1.75} />
            </i>
            {shown ? item : <span className="landing-bar" style={{ width: "64%" }} />}
            <span className="landing-bar" style={{ width: "40%" }} />
          </div>
        </div>
      );
    case "queue":
      return (
        <div className="activation-body activation-body--rows">
          <span className={`activation-row${mod}`}>
            <i className="activation-avatar" />
            {shown ? item : <span className="landing-bar" style={{ width: "66%" }} />}
          </span>
          {[1, 2].map((i) => (
            <span className="activation-row" key={i}>
              <i className="activation-avatar" />
              <span className="landing-bar" style={{ width: i === 1 ? "58%" : "66%" }} />
            </span>
          ))}
        </div>
      );
  }
}

/**
 * The activation network: governed decisions leaving the instrument and
 * entering the bank's own systems. A decision bar across the top carries the
 * current action, its policy result and its destination; a trunk and bus
 * route it to one of five destination surfaces, drawn as the screens those
 * teams already work in. While the
 * panel is in view the network cycles through the destinations, so the page
 * shows every channel being reached — not only the advisor's queue. Under
 * reduced motion it rests on the advisor queue.
 */
export function ActivationNetwork() {
  const { ref, revealed } = useRevealed<HTMLDivElement>(0.3);
  const [lit, setLit] = useState<number>(DEFAULT_LIT);
  const [cycling, setCycling] = useState(false);
  // Which destinations the cycle has reached so far; they keep their item.
  const [delivered, setDelivered] = useState<boolean[]>(() => destinations.map((_, i) => i === DEFAULT_LIT));

  useEffect(() => {
    if (!revealed || prefersReducedMotion()) return;
    setCycling(true);
    const id = window.setInterval(() => {
      setLit((current) => {
        const next = (current + 1) % destinations.length;
        setDelivered((d) => (d[next] ? d : d.map((v, i) => v || i === next)));
        return next;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [revealed]);

  const current = destinations[lit];
  const summary = `Governed decisions reaching ${destinations
    .slice(0, -1)
    .map((d) => d.label)
    .join(", ")}, and ${destinations[destinations.length - 1].label} workflows, one destination at a time. Currently: ${current.item}, ${litLabel.toLowerCase()} to ${current.label}.`;

  return (
    <div className="activation-network landing-grid-paper" ref={ref} data-cycling={cycling ? "true" : "false"}>
      <p className="sr-only" aria-live="polite">
        {summary}
      </p>

      <div className="activation-diagram" aria-hidden="true">
        <span className="landing-glow activation-glow" style={{ left: `${COLS[lit]}%` }} />

        <div className="activation-connector landing-instrument">
          <span className="activation-connector-title">{chip.title}</span>
          <span className="activation-connector-row">
            <span className="activation-connector-key">{chip.keys.action}</span>
            <span className="activation-connector-value" key={current.item}>
              {current.item}
            </span>
          </span>
          <span className="activation-connector-row">
            <span className="activation-connector-key">{chip.keys.policy}</span>
            <span className="activation-connector-value">{chip.policy}</span>
          </span>
          <span className="activation-connector-row activation-connector-row--destination">
            <span className="activation-connector-key">{chip.keys.destination}</span>
            <span className="activation-connector-value" key={current.label}>
              {current.label}
            </span>
          </span>
        </div>

        <div className="activation-rails">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="activation-rails-svg">
            <path d={TRUNK} className="activation-rail" vectorEffect="non-scaling-stroke" />
            <path d={BUS} className="activation-rail" vectorEffect="non-scaling-stroke" />
            {COLS.map((x) => (
              <path key={x} d={`M ${x} ${BUS_Y} L ${x} 60`} className="activation-rail" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={litPath(lit)} className="activation-rail activation-rail--lit" vectorEffect="non-scaling-stroke" />
            <path key={`comet-${lit}`} d={litPath(lit)} pathLength={100} className="activation-comet" vectorEffect="non-scaling-stroke" />
          </svg>
          {COLS.map((x, index) => (
            <span className={`activation-junction${index === lit ? " is-lit" : ""}`} key={x} style={{ left: `${x}%` }} />
          ))}
        </div>

        <div className="activation-surfaces">
          {destinations.map((destination, index) => {
            const Icon = ICONS[destination.icon];
            const isLit = index === lit;
            const state: SurfaceState = isLit ? "lit" : delivered[index] ? "delivered" : "idle";
            const mod = isLit ? " is-lit" : state === "delivered" ? " is-delivered" : "";
            return (
              <article
                className={`activation-surface landing-glass-light landing-reveal${revealed ? " is-visible" : ""}${mod}`}
                style={{ transitionDelay: revealed && !cycling ? `${index * 40}ms` : "0ms" }}
                key={destination.label}
              >
                <header className="activation-surface-head">
                  <Icon size={14} strokeWidth={1.75} />
                  <span>{destination.label}</span>
                </header>
                <SurfaceBody destination={destination} state={state} />
                <footer className="activation-surface-foot">
                  <span className="activation-surface-kind">{destination.kind}</span>
                  <span className={`activation-surface-stamp${mod}`}>
                    <Stamp state="filled" tone="paper">
                      {litLabel}
                    </Stamp>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
