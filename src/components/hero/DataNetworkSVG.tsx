const DataNetworkSVG = () => {
  // Node positions for the data network
  const nodes = [
    { cx: 80, cy: 120, delay: "0s" },
    { cx: 180, cy: 80, delay: "0.2s" },
    { cx: 280, cy: 140, delay: "0.4s" },
    { cx: 150, cy: 200, delay: "0.3s" },
    { cx: 350, cy: 100, delay: "0.5s" },
    { cx: 420, cy: 180, delay: "0.6s" },
    { cx: 320, cy: 240, delay: "0.7s" },
    { cx: 480, cy: 120, delay: "0.4s" },
    { cx: 520, cy: 200, delay: "0.8s" },
    { cx: 600, cy: 140, delay: "0.5s" },
  ];

  // Connection lines between nodes
  const connections = [
    { x1: 80, y1: 120, x2: 180, y2: 80, delay: "0.1s" },
    { x1: 180, y1: 80, x2: 280, y2: 140, delay: "0.3s" },
    { x1: 180, y1: 80, x2: 150, y2: 200, delay: "0.4s" },
    { x1: 280, y1: 140, x2: 350, y2: 100, delay: "0.5s" },
    { x1: 280, y1: 140, x2: 320, y2: 240, delay: "0.6s" },
    { x1: 350, y1: 100, x2: 420, y2: 180, delay: "0.7s" },
    { x1: 350, y1: 100, x2: 480, y2: 120, delay: "0.6s" },
    { x1: 420, y1: 180, x2: 520, y2: 200, delay: "0.8s" },
    { x1: 480, y1: 120, x2: 600, y2: 140, delay: "0.7s" },
    { x1: 520, y1: 200, x2: 600, y2: 140, delay: "0.9s" },
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-40"
      viewBox="0 0 700 320"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Glow filter for nodes */}
        <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Gradient for connection lines */}
        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
        </linearGradient>

        {/* Gradient for nodes */}
        <radialGradient id="node-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Animated connection lines */}
      {connections.map((line, i) => (
        <line
          key={`line-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="url(#line-gradient)"
          strokeWidth="1"
          className="animate-draw-line"
          style={{
            animationDelay: line.delay,
            strokeDasharray: "200",
            strokeDashoffset: "200",
          }}
        />
      ))}

      {/* Animated nodes with glow */}
      {nodes.map((node, i) => (
        <g key={`node-${i}`} className="animate-float-slow" style={{ animationDelay: node.delay }}>
          {/* Outer glow ring */}
          <circle
            cx={node.cx}
            cy={node.cy}
            r="8"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1"
            className="animate-pulse-glow"
            style={{ animationDelay: node.delay }}
            opacity="0.4"
          />
          {/* Inner node */}
          <circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill="url(#node-gradient)"
            filter="url(#node-glow)"
            className="animate-pulse-glow"
            style={{ animationDelay: node.delay }}
          />
        </g>
      ))}
    </svg>
  );
};

export default DataNetworkSVG;
