interface SparklineProps {
  data: number[];
  className?: string;
  stroke?: string;
  width?: number;
  height?: number;
}

/** Tiny inline trend line — no chart library, no animation. */
export function Sparkline({
  data,
  className,
  stroke = "#475569",
  width = 88,
  height = 22,
}: SparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(2)},${(height - ((v - min) / span) * (height - 2) - 1).toFixed(2)}`)
    .join(" ");

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
