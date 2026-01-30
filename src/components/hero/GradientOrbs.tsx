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

      {/* Layer 3: Aurora SVG Ribbons */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Aurora gradient definitions */}
          <linearGradient id="aurora-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
            <stop offset="20%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0.8" />
            <stop offset="80%" stopColor="hsl(187, 96%, 42%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(187, 96%, 42%)" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="aurora-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(330, 70%, 50%)" stopOpacity="0.5" />
            <stop offset="70%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="aurora-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(187, 96%, 42%)" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(187, 96%, 42%)" stopOpacity="0.4" />
            <stop offset="60%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0" />
          </linearGradient>
          
          {/* Glow filter for aurora */}
          <filter id="aurora-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Aurora ribbon 1 - top flowing */}
        <path
          d="M-100,200 Q300,100 600,250 T1200,180 T1800,280 T2100,200"
          fill="none"
          stroke="url(#aurora-gradient-1)"
          strokeWidth="120"
          strokeLinecap="round"
          filter="url(#aurora-glow)"
          className="animate-aurora-wave"
          style={{ 
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        />
        
        {/* Aurora ribbon 2 - middle flowing */}
        <path
          d="M-200,500 Q200,400 500,550 T1100,450 T1700,550 T2200,480"
          fill="none"
          stroke="url(#aurora-gradient-2)"
          strokeWidth="100"
          strokeLinecap="round"
          filter="url(#aurora-glow)"
          className="animate-aurora-wave"
          style={{ 
            animationDelay: '3s',
            animationDuration: '12s',
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        />
        
        {/* Aurora ribbon 3 - bottom flowing */}
        <path
          d="M-150,800 Q350,700 700,850 T1300,750 T1900,880 T2200,800"
          fill="none"
          stroke="url(#aurora-gradient-3)"
          strokeWidth="80"
          strokeLinecap="round"
          filter="url(#aurora-glow)"
          className="animate-aurora-wave"
          style={{ 
            animationDelay: '6s',
            animationDuration: '10s',
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        />
      </svg>

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

      {/* Layer 7: Enhanced noise texture for grain */}
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
