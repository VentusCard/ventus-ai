import { CSSProperties } from "react";

interface RailProps {
  /** "h" draws a horizontal line, "v" a vertical one. Default "h". */
  direction?: "h" | "v";
  /** Brightens the rail to the strong signal color, e.g. for the leg a
   *  decision is currently traveling. Default false (dim rail color). */
  active?: boolean;
  /** CSS length for the rail's long axis. Default "100%". */
  length?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The one recurring motif on the landing page: a thin line connecting two
 * nodes. Used inside the hero DecisionPlane, the Intelligence FlowPlane, the
 * Governance plane, and the Activation network. Keep it to a single 1px line
 * at every size — do not add glow, gradient fill, or thickness variants.
 */
export function Rail({ direction = "h", active = false, length = "100%", className, style }: RailProps) {
  const thickness = "1px";
  const size =
    direction === "h"
      ? { width: length, height: thickness }
      : { width: thickness, height: length };

  return (
    <span
      aria-hidden="true"
      className={["landing-rail", `landing-rail--${direction}`, className].filter(Boolean).join(" ")}
      style={{
        display: "block",
        background: active ? "var(--signal-strong)" : "var(--rail)",
        transition: "background var(--t-stage) var(--ease)",
        ...size,
        ...style,
      }}
    />
  );
}
