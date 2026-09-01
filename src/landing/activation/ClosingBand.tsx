import { ArrowRight } from "lucide-react";
import { landingCopy } from "@/landing/copy";

interface ClosingBandProps {
  onRequestAccess: (trigger: HTMLButtonElement) => void;
}

export function ClosingBand({ onRequestAccess }: ClosingBandProps) {
  return (
    <div className="closing-band">
      <h2>{landingCopy.activation.closingTitle}</h2>
      <div>
        <p>{landingCopy.activation.closingBody}</p>
        <button type="button" className="landing-button" onClick={(event) => onRequestAccess(event.currentTarget)}>
          {landingCopy.activation.cta}
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
