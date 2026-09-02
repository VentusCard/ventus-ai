import { useEffect, useState } from "react";
import { ArrowLeftRight, BriefcaseBusiness, Globe, Share2, Users } from "lucide-react";
import { LANDING_COPY } from "../copy";
import { Stamp } from "../motif/Stamp";

const RECORD = LANDING_COPY.hero.record;

/* One icon per approved signal family, one stroke weight everywhere. */
const SOURCE_ICONS = {
  transactions: ArrowLeftRight,
  relationships: Share2,
  digital: Globe,
  teams: Users,
} as const;

/* Geometry of the stage drawing in the SVG's own space. The rails SVG is
   stretched over the middle column (preserveAspectRatio none) so the four
   source rows and the workflow card, laid out in HTML, meet it at these y
   values: four 36px rows with 10px gaps in a 174px-tall stage; the decision
   node at the vertical centre. */
const W = 100;
const H = 174;
const SOURCE_Y = [18, 64, 110, 156];
const NODE_X = 70;
const MID_Y = 87;

function railPath(y: number) {
  return `M 0 ${y} C 32 ${y}, ${NODE_X - 24} ${MID_Y}, ${NODE_X} ${MID_Y}`;
}

const LIT_PATH = `M ${NODE_X} ${MID_Y} L ${W} ${MID_Y}`;

function prefersReducedMotion() {
  return typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/**
 * The decision record: the hero visual and the page's motif. A solid navy
 * instrument on paper carrying one choreographed cycle: the four approved
 * signal families light and send their context down the rails, the decision
 * node resolves, one lit rail carries the action into an existing workflow,
 * and the record is stamped. The cycle is a single CSS timeline (see
 * hero.css) so it needs no timers; under reduced motion it renders at rest
 * in its final, filed state.
 *
 * The stage is decorative and aria-hidden; the rows are real text and the
 * sr-only summary carries the drawing's meaning.
 */
export function DecisionRecord() {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    if (!prefersReducedMotion()) setMotion(true);
  }, []);

  return (
    <div className={`decision-record landing-instrument${motion ? " is-playing" : " is-static"}`}>
      <div className="decision-record__bar">
        <span className="decision-record__title">{RECORD.title}</span>
        <span className="decision-record__status" aria-hidden="true">
          {RECORD.status.map((item, index) => (
            <span key={item} className={`decision-record__status-item${index === 2 ? " is-hollow" : ""}`}>
              <i />
              {item}
            </span>
          ))}
        </span>
        <span className="decision-record__badge">{RECORD.badge}</span>
      </div>

      <div className="decision-record__stage landing-grid-dark" aria-hidden="true">
        <span className="landing-glow decision-record__glow decision-record__glow--node" />
        <span className="landing-glow decision-record__glow decision-record__glow--card" />

        <span className="decision-record__stage-label">{RECORD.pathLabels.context}</span>
        <span className="decision-record__stage-label" />
        <span className="decision-record__stage-label">{RECORD.pathLabels.workflow}</span>

        <div className="decision-record__sources">
          {RECORD.sources.map((source, index) => {
            const Icon = SOURCE_ICONS[source.key];
            return (
              <span className="decision-record__source landing-glass-dark" style={{ "--i": index } as React.CSSProperties} key={source.key}>
                <Icon size={14} strokeWidth={1.75} />
                {source.label}
              </span>
            );
          })}
        </div>

        <div className="decision-record__rails">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="decision-record__rails-svg">
            {SOURCE_Y.map((y, index) => (
              <g key={y}>
                <path d={railPath(y)} className="decision-record__rail" vectorEffect="non-scaling-stroke" />
                <path
                  d={railPath(y)}
                  pathLength={100}
                  className="decision-record__comet"
                  style={{ "--i": index } as React.CSSProperties}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
            <path d={LIT_PATH} className="decision-record__rail decision-record__rail--lit" vectorEffect="non-scaling-stroke" />
            <path d={LIT_PATH} pathLength={100} className="decision-record__comet decision-record__comet--lit" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="decision-record__node" style={{ left: `${NODE_X}%`, top: `${(MID_Y / H) * 100}%` }}>
            <i className="decision-record__node-ripple" />
            <i className="decision-record__node-ring decision-record__node-ring--outer" />
            <i className="decision-record__node-ring" />
            <i className="decision-record__node-disc" />
          </span>
          <span className="decision-record__stage-label decision-record__stage-label--decision" style={{ left: `${NODE_X}%` }}>
            {RECORD.pathLabels.decision}
          </span>
        </div>

        <div className="decision-record__workflow">
          <div className="decision-record__card landing-glass-dark">
            <div className="decision-record__card-head">
              <BriefcaseBusiness size={14} strokeWidth={1.75} />
              {RECORD.workflowSlot.title}
            </div>
            <div className="decision-record__card-item">
              <span className="decision-record__card-item-text">{RECORD.workflowSlot.item}</span>
              <span className="landing-bar landing-bar--dark decision-record__card-bar" />
            </div>
            <div className="decision-record__card-foot">
              <span className="decision-record__card-stamp">
                <Stamp state="filled" tone="night">
                  {RECORD.rows[3].stamp.label}
                </Stamp>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="decision-record__rows">
        {RECORD.rows.map((row, index) => (
          <div
            className="decision-record__row"
            style={{ "--i": index } as React.CSSProperties}
            key={row.key}
            data-mobile={(RECORD.mobileRows as readonly string[]).includes(row.key) ? "true" : "false"}
          >
            <span className="decision-record__key">{row.key}</span>
            <span className="decision-record__value">{row.value}</span>
            <span className="decision-record__stamp">
              <Stamp state={row.stamp.state} tone="night">
                {row.stamp.label}
              </Stamp>
            </span>
          </div>
        ))}
      </div>

      <p className="sr-only">{RECORD.srSummary}</p>
    </div>
  );
}
