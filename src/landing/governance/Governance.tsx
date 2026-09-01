import { CheckCircle2, FileText, ShieldCheck, UserRoundCheck } from "lucide-react";
import { ChapterHeader } from "@/landing/ChapterHeader";
import { Reveal } from "@/landing/Reveal";
import { landingCopy } from "@/landing/copy";

const icons = [CheckCircle2, ShieldCheck, UserRoundCheck, FileText] as const;

function GovernancePlane() {
  return (
    <div className="governance-plane" data-glass-region="governance-plane" aria-label={landingCopy.accessibility.governancePath}>
      <div className="governance-plane__header">
        <span>{landingCopy.governance.planeTitle}</span>
        <span className="governance-plane__status"><i aria-hidden="true" /> {landingCopy.governance.status}</span>
      </div>
      <div className="governance-plane__rail" aria-hidden="true" />
      <div className="governance-plane__rows">
        {landingCopy.governance.rows.map((row, index) => {
          const Icon = icons[index];
          return (
            <div key={row.title} className="governance-plane__row" style={{ animationDelay: `${index * 60}ms` }}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className="governance-plane__node"><Icon aria-hidden="true" /></div>
              <div>
                <strong>{row.title}</strong>
                <p>{row.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Governance() {
  return (
    <section id="governance" className="governance" aria-labelledby="governance-title">
      <div className="landing-shell">
        <ChapterHeader
          eyebrow={landingCopy.governance.eyebrow}
          title={landingCopy.governance.title}
          body={landingCopy.governance.body}
          titleId="governance-title"
          visual={<Reveal><GovernancePlane /></Reveal>}
        />
      </div>
    </section>
  );
}
