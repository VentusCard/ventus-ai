interface NodeProps {
  cx: number;
  cy: number;
  active?: boolean;
  muted?: boolean;
  className?: string;
}

export function Node({ cx, cy, active = false, muted = false, className = "" }: NodeProps) {
  return (
    <g className={`landing-node ${active ? "is-active" : ""} ${muted ? "is-muted" : ""} ${className}`.trim()}>
      {active ? <circle cx={cx} cy={cy} r="14" className="landing-node__ring" /> : null}
      <circle cx={cx} cy={cy} r={active ? 6 : 4} className="landing-node__dot" />
    </g>
  );
}

