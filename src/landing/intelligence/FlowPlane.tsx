import { Node } from "@/landing/motif/Node";
import { Rail } from "@/landing/motif/Rail";
import { landingCopy } from "@/landing/copy";

interface FlowPlaneProps {
  stage: number;
  compact?: boolean;
}

export function FlowPlane({ stage, compact = false }: FlowPlaneProps) {
  return (
    <div className={`flow-plane stage-${stage + 1} ${compact ? "is-compact" : ""}`} data-glass-region={compact ? undefined : "intelligence-plane"} aria-label={`${landingCopy.intelligence.stages[stage].title}: ${landingCopy.intelligence.stages[stage].body}`}>
      <div className="flow-plane__header">
        <span>{landingCopy.intelligence.planeTitle}</span>
        <span>{landingCopy.intelligence.stages[stage].title.toUpperCase()}</span>
      </div>
      <div className="flow-plane__body">
        <svg viewBox="0 0 680 390" role="img" aria-label={landingCopy.accessibility.flowSequence}>
          <Rail d="M85 75 C185 75 210 195 320 195" active={stage >= 0} />
          <Rail d="M85 195 C185 195 210 195 320 195" active={stage >= 0} />
          <Rail d="M85 315 C185 315 210 195 320 195" active={stage >= 0} />
          <Rail d="M320 195 C430 195 470 195 590 195" active={stage === 2} />
          <Node cx={85} cy={75} muted={stage === 1} />
          <Node cx={85} cy={195} active={stage === 1} />
          <Node cx={85} cy={315} muted={stage === 1} />
          <Node cx={320} cy={195} active={stage >= 1} />
          <Node cx={590} cy={195} active={stage === 2} />
          <circle cx="320" cy="195" r="5" className="flow-plane__signal" />
        </svg>

        <div className="flow-plane__columns">
          {landingCopy.intelligence.plane.map((column) => (
            <div key={column.label}>
              <span>{column.label}</span>
              {column.items.map((item) => <small key={item}>{item}</small>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
