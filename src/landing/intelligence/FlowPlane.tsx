import { ArrowLeftRight, BriefcaseBusiness, Globe, Share2, Users } from "lucide-react";
import { LANDING_COPY } from "../copy";
import { Stamp } from "../motif/Stamp";

interface FlowPlaneProps {
  /** 0 = Understand, 1 = Decide, 2 = Activate. */
  stage: 0 | 1 | 2;
}

const STAGES = LANDING_COPY.intelligence.stages;
const PLANE = LANDING_COPY.intelligence.plane;
const SOURCES = LANDING_COPY.hero.record.sources;
const STATE_NAMES = ["understand", "decide", "activate"] as const;

const SOURCE_ICONS = {
  transactions: ArrowLeftRight,
  relationships: Share2,
  digital: Globe,
  teams: Users,
} as const;

/* Rails, in a 100×100 space stretched over the body; the cards use the
   same percentages in intelligence.css. Two sets: the wide composition
   (≥900px, the plane spans the shell and the three states progress left to
   right) and the narrow one (two columns inside a phone-width plane). CSS
   shows one set per breakpoint. */
const RAILS = {
  wide: {
    /* scattered sources → the forming relationship view */
    understand: [
      "M 17 18 C 27 18, 28 42, 32 42",
      "M 20 39 C 27 39, 28 47, 32 47",
      "M 16 61 C 27 61, 28 53, 32 53",
      "M 21 82 C 29 82, 29 58, 32 58",
    ],
    /* the same four, once the sources have folded into a stack */
    folded: [
      "M 15 38 C 22 38, 23 42, 32 42",
      "M 16 46 C 22 46, 23 47, 32 47",
      "M 15 54 C 22 54, 23 53, 32 53",
      "M 16 62 C 22 62, 23 58, 32 58",
    ],
    decide: "M 51 50 L 57 50",
    activate: "M 76 50 L 82 50",
  },
  narrow: {
    understand: [
      "M 23 14 C 40 14, 44 42, 52 42",
      "M 26 38 C 40 38, 44 46, 52 46",
      "M 17 62 C 36 62, 44 54, 52 54",
      "M 22 86 C 40 86, 44 58, 52 58",
    ],
    folded: [],
    decide: "M 47 50 L 52 50",
    activate: "M 47 43 C 50 43, 50 50, 52 50",
  },
} as const;

function Rails({ variant }: { variant: keyof typeof RAILS }) {
  const rails = RAILS[variant];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`flow-rails flow-rails--${variant}`}>
      <g className="flow-rails__group flow-rails__group--understand">
        {rails.understand.map((d) => (
          <path key={d} d={d} className="flow-rail" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g className="flow-rails__group flow-rails__group--folded">
        {rails.folded.map((d) => (
          <path key={d} d={d} className="flow-rail" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g className="flow-rails__group flow-rails__group--decide">
        <path d={rails.decide} className="flow-rail flow-rail--lit" vectorEffect="non-scaling-stroke" />
      </g>
      <g className="flow-rails__group flow-rails__group--activate">
        <path d={rails.activate} className="flow-rail flow-rail--lit" vectorEffect="non-scaling-stroke" />
        <path d={rails.activate} pathLength={100} className="flow-comet" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/**
 * The Intelligence chapter's one visual: a wide navy instrument whose three
 * states are one composition that rearranges itself. Elements move between
 * positions (over --t-move) rather than crossfading as separate layers, so
 * the reader sees the context gather, the list appear, and the chosen
 * action travel into the queue — left to right across the plane, so the
 * final state shows the whole path at once.
 *
 * Every station of the path is on the plane in every state — the ones not
 * yet reached as faint dashed outlines — so the reader always sees where
 * the current step sits in the whole:
 *
 *  - Understand: the four approved signal families, scattered on the left,
 *    gathering along faint rails into a relationship view still forming.
 *  - Decide: the sources fold into a stack, the relationship view is solid,
 *    and a short list of candidate actions lights beside it, one raised —
 *    within policy.
 *  - Activate: the earlier stations step back and the raised action lands,
 *    at the right, in an advisor's queue, filed.
 *
 * Structure is drawn as bars; the only real text inside the drawing is the
 * action that was chosen. A visually-hidden caption carries the state change
 * for screen readers.
 */
export function FlowPlane({ stage }: FlowPlaneProps) {
  const current = STAGES[stage];
  const state = STATE_NAMES[stage];

  return (
    <div className="flow-plane landing-instrument" data-state={state}>
      <div className="flow-plane__head">
        <span className="flow-plane__head-label">{PLANE.header}</span>
        <span className="flow-plane__head-steps" aria-hidden="true">
          {STAGES.map((s, i) => (
            <span key={s.key} className={`flow-plane__step${i === stage ? " is-current" : ""}${i < stage ? " is-done" : ""}`}>
              <i />
              {s.title}
            </span>
          ))}
        </span>
        <span className="flow-plane__head-stage">{current.title}</span>
      </div>

      <div className="flow-plane__body landing-grid-dark" aria-hidden="true">
        <span className="landing-glow flow-glow flow-glow--a" />
        <span className="landing-glow flow-glow flow-glow--b" />

        <Rails variant="wide" />
        <Rails variant="narrow" />

        {SOURCES.map((source, i) => {
          const Icon = SOURCE_ICONS[source.key];
          return (
            <span className={`flow-source flow-source--${i + 1} landing-glass-dark`} key={source.key}>
              <Icon size={13} strokeWidth={1.75} />
              {source.label}
            </span>
          );
        })}

        <div className="flow-card flow-card--relationship landing-glass-dark">
          <div className="flow-card__head">{PLANE.relationship.title}</div>
          <div className="flow-card__rows">
            {PLANE.relationship.rows.map((row, i) => (
              <span className="flow-card__row" key={row}>
                <span className="flow-card__row-label">{row}</span>
                <span className="landing-bar landing-bar--dark" style={{ width: `${[62, 44, 54, 38][i]}%` }} />
              </span>
            ))}
          </div>
        </div>

        <div className="flow-card flow-card--candidates landing-glass-dark">
          <div className="flow-card__head">{PLANE.candidates.title}</div>
          <div className="flow-card__rows">
            <span className="flow-card__row flow-card__row--raised">
              <span className="flow-card__row-text">{PLANE.candidates.raised}</span>
              <span className="flow-card__tag">{PLANE.candidates.tag}</span>
            </span>
            <span className="flow-card__row is-faded">
              <span className="landing-bar landing-bar--dark" style={{ width: "58%" }} />
            </span>
            <span className="flow-card__row is-faded">
              <span className="landing-bar landing-bar--dark" style={{ width: "46%" }} />
            </span>
          </div>
        </div>

        <div className="flow-card flow-card--workflow landing-glass-dark">
          <div className="flow-card__head">
            <BriefcaseBusiness size={13} strokeWidth={1.75} />
            {PLANE.workflow.title}
          </div>
          <div className="flow-card__rows">
            <span className="flow-card__row flow-card__row--raised">
              <span className="flow-card__row-text">{PLANE.workflow.item}</span>
            </span>
            <span className="flow-card__row is-faded">
              <span className="landing-bar landing-bar--dark" style={{ width: "52%" }} />
            </span>
          </div>
          <div className="flow-card__foot">
            <Stamp state="filled" tone="night">
              {PLANE.workflow.stamp}
            </Stamp>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current.title}: {current.body}
      </p>
    </div>
  );
}
