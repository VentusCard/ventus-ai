interface DataNetworkSVGProps {
  parallaxX?: number;
  parallaxY?: number;
}

const DataNetworkSVG = ({ parallaxX = 0, parallaxY = 0 }: DataNetworkSVGProps) => {
  // Primary layer nodes
  const primaryNodes = [
    { cx: 80, cy: 120, r: 5, delay: "0s" },
    { cx: 180, cy: 80, r: 4, delay: "0.2s" },
    { cx: 280, cy: 140, r: 6, delay: "0.4s" },
    { cx: 150, cy: 200, r: 4, delay: "0.3s" },
    { cx: 350, cy: 100, r: 5, delay: "0.5s" },
    { cx: 420, cy: 180, r: 4, delay: "0.6s" },
    { cx: 320, cy: 240, r: 5, delay: "0.7s" },
    { cx: 480, cy: 120, r: 4, delay: "0.4s" },
    { cx: 520, cy: 200, r: 6, delay: "0.8s" },
    { cx: 600, cy: 140, r: 5, delay: "0.5s" },
    { cx: 650, cy: 80, r: 4, delay: "0.6s" },
    { cx: 50, cy: 220, r: 4, delay: "0.7s" },
  ];

  // Secondary layer nodes (smaller, more subtle)
  const secondaryNodes = [
    { cx: 120, cy: 160, r: 2, delay: "1s" },
    { cx: 220, cy: 120, r: 2, delay: "1.2s" },
    { cx: 380, cy: 160, r: 2, delay: "1.4s" },
    { cx: 450, cy: 240, r: 2, delay: "1.3s" },
    { cx: 560, cy: 100, r: 2, delay: "1.5s" },
    { cx: 30, cy: 180, r: 2, delay: "1.1s" },
    { cx: 680, cy: 180, r: 2, delay: "1.6s" },
  ];

  // Primary connections - straight lines with looping draw animation
  const primaryConnections = [
    { x1: 80, y1: 120, x2: 180, y2: 80, dur: "3s", delay: "0s" },
    { x1: 180, y1: 80, x2: 280, y2: 140, dur: "3.5s", delay: "0.2s" },
    { x1: 180, y1: 80, x2: 150, y2: 200, dur: "4s", delay: "0.4s" },
    { x1: 280, y1: 140, x2: 350, y2: 100, dur: "3.2s", delay: "0.3s" },
    { x1: 280, y1: 140, x2: 320, y2: 240, dur: "4.5s", delay: "0.5s" },
    { x1: 350, y1: 100, x2: 420, y2: 180, dur: "3s", delay: "0.6s" },
    { x1: 350, y1: 100, x2: 480, y2: 120, dur: "3.8s", delay: "0.1s" },
    { x1: 420, y1: 180, x2: 520, y2: 200, dur: "3.3s", delay: "0.7s" },
    { x1: 480, y1: 120, x2: 600, y2: 140, dur: "4s", delay: "0.2s" },
    { x1: 520, y1: 200, x2: 600, y2: 140, dur: "3.5s", delay: "0.8s" },
    { x1: 600, y1: 140, x2: 650, y2: 80, dur: "3.2s", delay: "0.4s" },
    { x1: 50, y1: 220, x2: 80, y2: 120, dur: "4.2s", delay: "0.3s" },
    { x1: 50, y1: 220, x2: 150, y2: 200, dur: "3.6s", delay: "0.5s" },
    { x1: 320, y1: 240, x2: 420, y2: 180, dur: "3s", delay: "0.6s" },
  ];

  // Secondary connections (fainter)
  const secondaryConnections = [
    { x1: 120, y1: 160, x2: 180, y2: 80 },
    { x1: 120, y1: 160, x2: 150, y2: 200 },
    { x1: 220, y1: 120, x2: 280, y2: 140 },
    { x1: 380, y1: 160, x2: 350, y2: 100 },
    { x1: 380, y1: 160, x2: 420, y2: 180 },
    { x1: 450, y1: 240, x2: 520, y2: 200 },
    { x1: 560, y1: 100, x2: 600, y2: 140 },
    { x1: 560, y1: 100, x2: 480, y2: 120 },
  ];

  // Data pulse paths (subset of connections for animated pulses)
  const pulsePaths = [
    { x1: 80, y1: 120, x2: 180, y2: 80, duration: "2s", delay: "0s" },
    { x1: 180, y1: 80, x2: 280, y2: 140, duration: "2.5s", delay: "0.5s" },
    { x1: 280, y1: 140, x2: 350, y2: 100, duration: "2s", delay: "1s" },
    { x1: 350, y1: 100, x2: 480, y2: 120, duration: "2.2s", delay: "1.5s" },
    { x1: 480, y1: 120, x2: 600, y2: 140, duration: "2s", delay: "2s" },
    { x1: 150, y1: 200, x2: 320, y2: 240, duration: "3s", delay: "0.8s" },
    { x1: 420, y1: 180, x2: 520, y2: 200, duration: "2.5s", delay: "1.2s" },
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30 transition-transform duration-100 ease-out"
      viewBox="0 0 700 320"
      preserveAspectRatio="xMidYMid slice"
      style={{
        transform: `translate(${parallaxX * 1.5}px, ${parallaxY * 1.5}px)`,
      }}
    >
      <defs>
        {/* Enhanced glow filter for nodes */}
        <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Intense glow for active nodes */}
        <filter id="node-glow-intense" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for primary connection lines */}
        <linearGradient id="line-gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
        </linearGradient>

        {/* Gradient for secondary connection lines */}
        <linearGradient id="line-gradient-secondary" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
        </linearGradient>

        {/* Gradient for data pulses */}
        <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
          <stop offset="50%" stopColor="#c4b5fd" stopOpacity="1" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>

        {/* Node gradients */}
        <radialGradient id="node-gradient-blue" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
          <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
        </radialGradient>

        <radialGradient id="node-gradient-violet" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
        </radialGradient>

        <radialGradient id="node-gradient-cyan" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* Background grid pattern (very subtle) */}
      <g className="opacity-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <line
            key={`grid-h-${i}`}
            x1="0"
            y1={i * 25}
            x2="700"
            y2={i * 25}
            stroke="#64748b"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 30 }).map((_, i) => (
          <line
            key={`grid-v-${i}`}
            x1={i * 25}
            y1="0"
            x2={i * 25}
            y2="320"
            stroke="#64748b"
            strokeWidth="0.5"
          />
        ))}
      </g>

      {/* Secondary connections (drawn first, appear behind) */}
      <g className="opacity-40">
        {secondaryConnections.map((line, i) => (
          <line
            key={`sec-line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="url(#line-gradient-secondary)"
            strokeWidth="0.5"
            className="animate-draw-line"
            style={{
              animationDelay: `${1 + i * 0.15}s`,
              strokeDasharray: "200",
              strokeDashoffset: "200",
            }}
          />
        ))}
      </g>

      {/* Primary connections - straight lines with looping draw animation */}
      {primaryConnections.map((line, i) => {
        const length = Math.sqrt(Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2));
        return (
          <line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="url(#line-gradient-primary)"
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{
              strokeDasharray: length,
              strokeDashoffset: length,
            }}
          >
            <animate
              attributeName="stroke-dashoffset"
              values={`${length};0;0;${-length}`}
              keyTimes="0;0.4;0.6;1"
              dur={line.dur}
              begin={line.delay}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0 0 1 1; 0.4 0 0.6 1"
            />
          </line>
        );
      })}

      {/* Data pulses traveling along paths */}
      {pulsePaths.map((path, i) => (
        <g key={`pulse-${i}`}>
          <circle r="3" fill="url(#pulse-gradient)" filter="url(#node-glow)">
            <animateMotion
              dur={path.duration}
              repeatCount="indefinite"
              begin={path.delay}
            >
              <mpath xlinkHref={`#pulse-path-${i}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur={path.duration}
              repeatCount="indefinite"
              begin={path.delay}
            />
            <animate
              attributeName="r"
              values="2;3;2"
              dur={path.duration}
              repeatCount="indefinite"
              begin={path.delay}
            />
          </circle>
          <path
            id={`pulse-path-${i}`}
            d={`M${path.x1},${path.y1} L${path.x2},${path.y2}`}
            fill="none"
            stroke="none"
          />
        </g>
      ))}

      {/* Secondary nodes */}
      {secondaryNodes.map((node, i) => (
        <g key={`sec-node-${i}`} className="animate-float-slow" style={{ animationDelay: node.delay }}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="#94a3b8"
            opacity="0.4"
            className="animate-pulse-glow"
            style={{ animationDelay: node.delay }}
          />
        </g>
      ))}

      {/* Primary nodes with enhanced effects */}
      {primaryNodes.map((node, i) => {
        const gradients = ["node-gradient-blue", "node-gradient-violet", "node-gradient-cyan"];
        const gradient = gradients[i % 3];
        return (
          <g key={`node-${i}`} className="animate-float-slow" style={{ animationDelay: node.delay, animationDuration: `${8 + (i % 4)}s` }}>
            {/* Outer ripple ring */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 3}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="0.5"
              className="animate-ripple"
              style={{ animationDelay: `${parseFloat(node.delay) + 1}s` }}
              opacity="0"
            />
            {/* Middle glow ring */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 2}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1"
              className="animate-pulse-glow"
              style={{ animationDelay: node.delay }}
              opacity="0.3"
            />
            {/* Inner glow */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 1.5}
              fill={`url(#${gradient})`}
              filter="url(#node-glow)"
              opacity="0.5"
            />
            {/* Core node */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={`url(#${gradient})`}
              filter="url(#node-glow-intense)"
              className="animate-pulse-glow"
              style={{ animationDelay: node.delay }}
            />
          </g>
        );
      })}

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <circle
          key={`particle-${i}`}
          cx={50 + (i * 33) % 600}
          cy={30 + (i * 47) % 260}
          r={0.5 + (i % 3) * 0.3}
          fill="#94a3b8"
          className="animate-particle-drift"
          style={{
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${15 + (i % 10)}s`,
          }}
          opacity={0.2 + (i % 5) * 0.1}
        />
      ))}
    </svg>
  );
};

export default DataNetworkSVG;
