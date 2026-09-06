import { LANDING_COPY } from "../copy";
import { ActivationNetwork } from "./ActivationNetwork";
import { ClosingBand } from "./ClosingBand";
import "./activation.css";

/**
 * Activation — the paper surface. Chapter head, the governed decision
 * fanning out into existing bank workflows, then the page's closing beat
 * and its final CTA.
 */
export function Activation() {
  const { activation } = LANDING_COPY;

  return (
    <section id="activation" className="landing-chapter">
      <div className="landing-shell">
        <div className="landing-chapter-head landing-chapter-head--split">
          <p className="landing-eyebrow">{activation.eyebrow}</p>
          <h2>{activation.headline}</h2>
          <p>{activation.body}</p>
        </div>

        <ActivationNetwork />
        <ClosingBand />
      </div>
    </section>
  );
}
