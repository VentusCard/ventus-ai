import { Node } from "@/landing/motif/Node";
import { Rail } from "@/landing/motif/Rail";
import { landingCopy } from "@/landing/copy";

export function DecisionPlane() {
  return (
    <div className="decision-plane" data-glass-region="hero-decision-plane" aria-label={landingCopy.accessibility.decisionPlane}>
      <div className="decision-plane__header">
        <span>{landingCopy.hero.brandLabel}</span>
        <span className="decision-plane__status"><i aria-hidden="true" /> {landingCopy.hero.status}</span>
      </div>

      <div className="decision-plane__body">
        <svg className="decision-plane__rails" viewBox="0 0 640 420" role="img" aria-label={landingCopy.accessibility.decisionFlow}>
          <Rail d="M140 72 C140 150 270 150 320 210" />
          <Rail d="M320 72 C320 150 320 150 320 210" />
          <Rail d="M500 72 C500 150 370 150 320 210" />
          <Rail d="M320 210 C270 270 140 270 140 348" active />
          <Rail d="M320 210 C320 270 320 270 320 348" active />
          <Rail d="M320 210 C370 270 500 270 500 348" active />
          <Node cx={140} cy={72} />
          <Node cx={320} cy={72} />
          <Node cx={500} cy={72} />
          <Node cx={320} cy={210} active />
          <Node cx={140} cy={348} />
          <Node cx={320} cy={348} />
          <Node cx={500} cy={348} />
        </svg>

        <div className="decision-plane__labels">
          {landingCopy.hero.plane.map((layer, index) => (
            <div key={layer.label} className={`decision-plane__layer decision-plane__layer--${index + 1}`}>
              <span>{layer.label}</span>
              <div>
                {layer.items.map((item) => <small key={item}>{item}</small>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
