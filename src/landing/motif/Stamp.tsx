import type { ReactNode } from "react";

export type StampState = "filled" | "hollow";
export type StampTone = "night" | "paper";

/**
 * The page's only chip. A filled dot means policy has spoken (Approved,
 * Passed, Retained); a ring means a human step is involved or not required
 * (Human review, No human step). State lives in the form of the dot so it
 * survives colour blindness and greyscale; tone follows the surface the stamp
 * sits on. Styles: .landing-stamp in landing.css.
 */
export function Stamp({
  state,
  tone = "night",
  className = "",
  children,
}: {
  state: StampState;
  tone?: StampTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`landing-stamp landing-stamp--${state} landing-stamp--${tone} ${className}`.trim()}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
