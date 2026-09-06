import { useRequestAccess } from "../request/context";
import { LANDING_COPY } from "../copy";

/**
 * The page's closing beat — a solid dark instrument set into the paper
 * Activation surface, ending on the page's second and last Request Access
 * CTA (the header's is separate and always present).
 */
export function ClosingBand() {
  const { open } = useRequestAccess();
  const { closing } = LANDING_COPY.activation;

  return (
    <div className="activation-closing landing-instrument">
      <div className="activation-closing-copy">
        <p className="landing-eyebrow">{closing.eyebrow}</p>
        <h2 className="activation-closing-headline">{closing.headline}</h2>
        <p className="activation-closing-body">{closing.body}</p>
      </div>
      <button type="button" className="landing-cta landing-cta--on-dark" onClick={open}>
        {closing.cta}
      </button>
    </div>
  );
}
