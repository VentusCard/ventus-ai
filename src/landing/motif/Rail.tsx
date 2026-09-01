interface RailProps {
  d: string;
  active?: boolean;
  className?: string;
}

export function Rail({ d, active = false, className = "" }: RailProps) {
  return (
    <path
      d={d}
      className={`landing-rail ${active ? "is-active" : ""} ${className}`.trim()}
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  );
}

