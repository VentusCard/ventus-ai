import { ChapterHeader } from "@/landing/ChapterHeader";
import { Reveal } from "@/landing/Reveal";
import { ActivationNetwork } from "@/landing/activation/ActivationNetwork";
import { ClosingBand } from "@/landing/activation/ClosingBand";
import { landingCopy } from "@/landing/copy";

interface ActivationProps {
  onRequestAccess: (trigger: HTMLButtonElement) => void;
}

export function Activation({ onRequestAccess }: ActivationProps) {
  return (
    <section id="activation" className="activation" aria-labelledby="activation-title">
      <div className="landing-shell">
        <ChapterHeader
          eyebrow={landingCopy.activation.eyebrow}
          title={landingCopy.activation.title}
          body={landingCopy.activation.body}
          titleId="activation-title"
          light
          visual={<Reveal><ActivationNetwork /></Reveal>}
        />
        <Reveal><ClosingBand onRequestAccess={onRequestAccess} /></Reveal>
      </div>
    </section>
  );
}
