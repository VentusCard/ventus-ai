import { ArrowRight } from "lucide-react";
import { landingCopy } from "@/landing/copy";
import { DecisionPlane } from "@/landing/hero/DecisionPlane";

interface HeroProps {
  onRequestAccess: (trigger: HTMLButtonElement) => void;
}

export function Hero({ onRequestAccess }: HeroProps) {
  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-shell landing-hero__grid">
        <div className="landing-hero__copy">
          <p className="landing-eyebrow">{landingCopy.hero.eyebrow}</p>
          <h1 id="landing-hero-title">{landingCopy.hero.title}</h1>
          <p className="landing-hero__body">{landingCopy.hero.body}</p>
          <div className="landing-hero__actions">
            <button type="button" className="landing-button" onClick={(event) => onRequestAccess(event.currentTarget)}>
              {landingCopy.hero.cta}
              <ArrowRight aria-hidden="true" />
            </button>
            <p>{landingCopy.hero.audience}</p>
          </div>
        </div>
        <div className="landing-hero__plane"><DecisionPlane /></div>
      </div>

      <div className="landing-shell landing-cues" aria-label={landingCopy.accessibility.valueFramework}>
        {landingCopy.hero.cues.map((cue, index) => (
          <div key={cue.title} className="landing-cue">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{cue.title}</strong>
              <p>{cue.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
