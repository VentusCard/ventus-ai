import { LANDING_COPY } from "../copy";
import { Rail } from "../motif/Rail";
import { Stamp } from "../motif/Stamp";
import { useRevealed } from "../motif/useRevealed";
import "./governance.css";

// Rail's own default (--rail) is tuned for paper; this, the page's one
// night chapter, needs the signal-tinted dark-surface rail instead.
const RAIL_DARK_STYLE = { background: "var(--rail-dark)" };

/**
 * Governance — the page's one dark chapter, and decision 5: row 03 stays a
 * hollow stamp (a human step that is visibly *not* required here, not
 * hidden). A 5/7 grid holds the chapter head beside the Decision Control
 * panel; the panel's four rows stamp in once, in sequence, and nothing else
 * on the page moves the way they do.
 */
export function Governance() {
  const { ref, revealed } = useRevealed<HTMLDivElement>();
  const { governance } = LANDING_COPY;

  return (
    <section id="governance" className="landing-chapter landing-chapter--dark">
      <span className="landing-glow governance-glow" aria-hidden="true" />
      <div className="landing-shell governance-layout">
        <div className="landing-chapter-head">
          <p className="landing-eyebrow">{governance.eyebrow}</p>
          <h2>{governance.headline}</h2>
          <p>{governance.body}</p>
        </div>

        <div className="governance-control landing-glass-dark" ref={ref}>
          <div className="governance-control-head">
            <span className="governance-control-label">{governance.planeHeader}</span>
            <span className="governance-control-status">
              <span className="governance-control-dot" aria-hidden="true" />
              {governance.planeStatus}
            </span>
          </div>

          <div className="governance-rows">
            <Rail direction="v" className="governance-rail" style={RAIL_DARK_STYLE} />
            {governance.rows.map((row, index) => (
              <div
                key={row.n}
                className={`governance-row landing-reveal${revealed ? " is-visible" : ""}`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <span className="governance-row-index" aria-hidden="true">
                  {row.n}
                </span>
                <span className="governance-row-text">
                  <strong>{row.title}</strong>
                  <span>{row.body}</span>
                </span>
                <Stamp state={row.stamp.state} tone="night">
                  {row.stamp.label}
                </Stamp>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
