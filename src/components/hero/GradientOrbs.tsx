interface GradientOrbsProps {
  parallaxX?: number;
  parallaxY?: number;
}

const GradientOrbs = ({ parallaxX = 0, parallaxY = 0 }: GradientOrbsProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Animated Conic Gradient Mesh Base - more subtle */}
      <div 
        className="absolute inset-0 animate-gradient-rotate opacity-40"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 30%, 
              hsl(0, 0%, 0%) 0deg,
              hsl(220, 60%, 12%) 60deg,
              hsl(0, 0%, 0%) 120deg,
              hsl(260, 50%, 14%) 180deg,
              hsl(0, 0%, 0%) 240deg,
              hsl(200, 70%, 12%) 300deg,
              hsl(0, 0%, 0%) 360deg
            )
          `,
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />
      
      {/* Layer 1b: Second rotating gradient (opposite direction) - more subtle */}
      <div 
        className="absolute inset-0 animate-gradient-rotate-reverse opacity-30 mix-blend-screen"
        style={{
          background: `
            conic-gradient(from 180deg at 70% 70%, 
              hsl(0, 0%, 0%) 0deg,
              hsl(280, 50%, 14%) 90deg,
              hsl(0, 0%, 0%) 180deg,
              hsl(200, 60%, 16%) 270deg,
              hsl(0, 0%, 0%) 360deg
            )
          `,
          filter: 'blur(120px)',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: Floating Radial Gradient Spots - very subtle */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] opacity-15 transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, hsl(217, 70%, 50%) 0%, transparent 70%)',
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
          transform: `translate(${-parallaxX * 0.5}px, ${-parallaxY * 0.5}px)`,
          willChange: 'transform',
        }}
      />
      
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] opacity-12 transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 60% 60%, hsl(271, 60%, 45%) 0%, transparent 70%)',
          filter: 'blur(130px)',
          mixBlendMode: 'screen',
          transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`,
          willChange: 'transform',
        }}
      />
      
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] opacity-10 transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 70%, 35%) 0%, transparent 70%)',
          filter: 'blur(100px)',
          mixBlendMode: 'screen',
          transform: `translate(${parallaxX * 0.6}px, ${parallaxY * 0.6}px)`,
          willChange: 'transform',
        }}
      />

      {/* Layer 3: Soft gradient clouds - removed for cleaner look */}

      {/* Layer 5: Subtle hue-shifting overlay - minimal */}
      <div
        className="absolute inset-0 animate-hue-dance opacity-[0.08] mix-blend-overlay"
        style={{
          background: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(271, 81%, 56%) 50%, hsl(187, 96%, 42%) 100%)',
          willChange: 'filter',
        }}
      />

      {/* Layer 6: Glass morphism overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backdropFilter: 'blur(1px)',
          background: 'linear-gradient(180deg, transparent 0%, black 100%)',
        }}
      />


      {/* Layer 8: Enhanced noise texture for grain - reduced */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 8: Vignette effect for focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 50%, black 100%)',
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default GradientOrbs;
