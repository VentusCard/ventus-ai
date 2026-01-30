interface GradientOrbsProps {
  parallaxX?: number;
  parallaxY?: number;
}

const GradientOrbs = ({ parallaxX = 0, parallaxY = 0 }: GradientOrbsProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Animated Conic Gradient Mesh Base */}
      <div 
        className="absolute inset-0 animate-gradient-rotate opacity-30"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 30%, 
              hsl(220, 70%, 20%) 0deg,
              hsl(260, 60%, 25%) 60deg,
              hsl(200, 80%, 25%) 120deg,
              hsl(280, 50%, 20%) 180deg,
              hsl(210, 70%, 22%) 240deg,
              hsl(250, 60%, 23%) 300deg,
              hsl(220, 70%, 20%) 360deg
            )
          `,
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />
      
      {/* Layer 1b: Second rotating gradient (opposite direction) */}
      <div 
        className="absolute inset-0 animate-gradient-rotate-reverse opacity-25 mix-blend-screen"
        style={{
          background: `
            conic-gradient(from 180deg at 70% 70%, 
              hsl(280, 60%, 25%) 0deg,
              hsl(200, 70%, 30%) 90deg,
              hsl(320, 50%, 25%) 180deg,
              hsl(240, 60%, 28%) 270deg,
              hsl(280, 60%, 25%) 360deg
            )
          `,
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: Floating Radial Gradient Spots */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] animate-mesh-breathe opacity-40 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, hsl(217, 91%, 60%) 0%, transparent 60%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
          transform: `translate(${-parallaxX * 1.5}px, ${-parallaxY * 1.5}px)`,
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] animate-mesh-breathe opacity-35 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 60% 60%, hsl(271, 81%, 56%) 0%, transparent 55%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
          animationDelay: '5s',
          transform: `translate(${parallaxX * 1.2}px, ${parallaxY * 1.2}px)`,
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] animate-mesh-breathe opacity-30 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 96%, 42%) 0%, transparent 50%)',
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
          animationDelay: '2.5s',
          transform: `translate(${parallaxX * 2}px, ${parallaxY * 2}px)`,
          willChange: 'transform, opacity',
        }}
      />

      {/* Layer 3: Soft gradient clouds instead of wavy lines */}
      <div
        className="absolute top-0 left-1/4 w-[900px] h-[400px] animate-float-slow opacity-20 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(217, 91%, 60%) 0%, hsl(271, 81%, 56%) 40%, transparent 70%)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          transform: `translate(${parallaxX * 1.8}px, ${parallaxY * 1.8}px)`,
          willChange: 'transform',
        }}
      />
      
      <div
        className="absolute bottom-1/4 right-1/3 w-[700px] h-[350px] animate-float-slow opacity-15 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 96%, 42%) 0%, hsl(217, 91%, 60%) 45%, transparent 70%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
          animationDelay: '4s',
          transform: `translate(${-parallaxX * 2}px, ${-parallaxY * 2}px)`,
          willChange: 'transform',
        }}
      />

      {/* Layer 4: Moving Spotlight - mouse responsive */}
      <div
        className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] animate-spotlight-wander opacity-15 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle at center, hsl(217, 91%, 60%) 0%, transparent 50%)',
          filter: 'blur(40px)',
          mixBlendMode: 'screen',
          transform: `translate(calc(-50% + ${parallaxX * 4}px), calc(-50% + ${parallaxY * 4}px))`,
          willChange: 'transform',
        }}
      />
      
      {/* Secondary spotlight - opposite movement */}
      <div
        className="absolute top-1/3 left-2/3 w-[600px] h-[600px] animate-spotlight-wander opacity-10 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle at center, hsl(271, 81%, 56%) 0%, transparent 45%)',
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
          animationDelay: '12s',
          animationDirection: 'reverse',
          transform: `translate(${-parallaxX * 3}px, ${-parallaxY * 3}px)`,
          willChange: 'transform',
        }}
      />

      {/* Layer 5: Subtle hue-shifting overlay */}
      <div
        className="absolute inset-0 animate-hue-dance opacity-[0.08] mix-blend-overlay"
        style={{
          background: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(271, 81%, 56%) 50%, hsl(187, 96%, 42%) 100%)',
          willChange: 'filter',
        }}
      />

      {/* Layer 6: Glass morphism overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backdropFilter: 'blur(1px)',
          background: 'linear-gradient(180deg, transparent 0%, hsl(220, 50%, 8%) 100%)',
        }}
      />

      {/* Layer 7: Animated Trend Lines for "pattern finding" effect */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 transition-transform duration-500 ease-out"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${parallaxX * 0.8}px, ${parallaxY * 0.8}px)`,
        }}
      >
        <defs>
          <linearGradient id="trend-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
            <stop offset="20%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0.8" />
            <stop offset="80%" stopColor="hsl(187, 96%, 42%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(187, 96%, 42%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trend-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0.5" />
            <stop offset="70%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
          </linearGradient>
          <filter id="trend-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Primary trend line - upward momentum */}
        <path
          d="M0,400 Q150,380 250,320 T450,280 Q550,250 650,300 T850,220 Q950,180 1050,240 T1200,180"
          fill="none"
          stroke="url(#trend-gradient-1)"
          strokeWidth="2"
          filter="url(#trend-glow)"
          className="animate-trend-wave"
          style={{ strokeDasharray: '1200', strokeDashoffset: '1200' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="1200"
            to="0"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M0,400 Q150,380 250,320 T450,280 Q550,250 650,300 T850,220 Q950,180 1050,240 T1200,180;
              M0,380 Q150,340 250,360 T450,300 Q550,320 650,260 T850,280 Q950,220 1050,200 T1200,220;
              M0,420 Q150,360 250,300 T450,320 Q550,280 650,340 T850,240 Q950,200 1050,260 T1200,200;
              M0,400 Q150,380 250,320 T450,280 Q550,250 650,300 T850,220 Q950,180 1050,240 T1200,180
            "
          />
        </path>
        
        {/* Secondary trend line - discovery pattern */}
        <path
          d="M0,480 Q200,440 350,400 T600,360 Q750,320 900,380 T1200,300"
          fill="none"
          stroke="url(#trend-gradient-2)"
          strokeWidth="1.5"
          filter="url(#trend-glow)"
          opacity="0.6"
          style={{ strokeDasharray: '1200', strokeDashoffset: '1200' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="1200"
            to="0"
            dur="5s"
            begin="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M0,480 Q200,440 350,400 T600,360 Q750,320 900,380 T1200,300;
              M0,460 Q200,420 350,450 T600,380 Q750,400 900,340 T1200,320;
              M0,500 Q200,460 350,380 T600,400 Q750,340 900,400 T1200,280;
              M0,480 Q200,440 350,400 T600,360 Q750,320 900,380 T1200,300
            "
          />
        </path>
        
        {/* Tertiary subtle line - background depth */}
        <path
          d="M0,520 Q300,480 500,440 T800,400 Q1000,360 1200,380"
          fill="none"
          stroke="hsl(217, 91%, 60%)"
          strokeWidth="1"
          opacity="0.2"
          style={{ strokeDasharray: '8 12' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-40"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="d"
            dur="12s"
            repeatCount="indefinite"
            values="
              M0,520 Q300,480 500,440 T800,400 Q1000,360 1200,380;
              M0,500 Q300,520 500,460 T800,420 Q1000,380 1200,400;
              M0,540 Q300,500 500,480 T800,380 Q1000,400 1200,360;
              M0,520 Q300,480 500,440 T800,400 Q1000,360 1200,380
            "
          />
        </path>
        
        {/* Data point markers that pulse along the primary line */}
        <circle cx="250" cy="320" r="4" fill="hsl(217, 91%, 60%)" filter="url(#trend-glow)">
          <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="320;360;300;320" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="650" cy="300" r="3" fill="hsl(271, 81%, 56%)" filter="url(#trend-glow)">
          <animate attributeName="opacity" values="0;1;0" dur="4s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="cy" values="300;260;340;300" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="1050" cy="240" r="4" fill="hsl(187, 96%, 42%)" filter="url(#trend-glow)">
          <animate attributeName="opacity" values="0;1;0" dur="4s" begin="2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="240;200;260;240" dur="8s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Layer 8: Enhanced noise texture for grain */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 8: Vignette effect for focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 50%, hsl(220, 50%, 8%) 100%)',
          opacity: 0.4,
        }}
      />
    </div>
  );
};

export default GradientOrbs;
