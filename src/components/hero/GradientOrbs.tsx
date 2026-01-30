interface GradientOrbsProps {
  parallaxX?: number;
  parallaxY?: number;
}

const GradientOrbs = ({ parallaxX = 0, parallaxY = 0 }: GradientOrbsProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Animated Conic Gradient Mesh Base */}
      <div 
        className="absolute inset-0 animate-gradient-rotate opacity-15"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 30%, 
              hsl(220, 70%, 12%) 0deg,
              hsl(260, 60%, 15%) 60deg,
              hsl(200, 80%, 15%) 120deg,
              hsl(280, 50%, 12%) 180deg,
              hsl(210, 70%, 14%) 240deg,
              hsl(250, 60%, 14%) 300deg,
              hsl(220, 70%, 12%) 360deg
            )
          `,
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />
      
      {/* Layer 1b: Second rotating gradient (opposite direction) */}
      <div 
        className="absolute inset-0 animate-gradient-rotate-reverse opacity-12 mix-blend-screen"
        style={{
          background: `
            conic-gradient(from 180deg at 70% 70%, 
              hsl(280, 60%, 15%) 0deg,
              hsl(200, 70%, 18%) 90deg,
              hsl(320, 50%, 15%) 180deg,
              hsl(240, 60%, 16%) 270deg,
              hsl(280, 60%, 15%) 360deg
            )
          `,
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: Floating Radial Gradient Spots */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] animate-mesh-breathe opacity-20 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, hsl(217, 91%, 40%) 0%, transparent 60%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
          transform: `translate(${-parallaxX * 1.5}px, ${-parallaxY * 1.5}px)`,
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] animate-mesh-breathe opacity-18 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 60% 60%, hsl(271, 81%, 36%) 0%, transparent 55%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
          animationDelay: '5s',
          transform: `translate(${parallaxX * 1.2}px, ${parallaxY * 1.2}px)`,
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] animate-mesh-breathe opacity-15 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 96%, 30%) 0%, transparent 50%)',
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
          animationDelay: '2.5s',
          transform: `translate(${parallaxX * 2}px, ${parallaxY * 2}px)`,
          willChange: 'transform, opacity',
        }}
      />

      {/* Layer 3: Soft gradient clouds instead of wavy lines */}
      <div
        className="absolute top-0 left-1/4 w-[900px] h-[400px] animate-float-slow opacity-10 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(217, 91%, 35%) 0%, hsl(271, 81%, 30%) 40%, transparent 70%)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          transform: `translate(${parallaxX * 1.8}px, ${parallaxY * 1.8}px)`,
          willChange: 'transform',
        }}
      />
      
      <div
        className="absolute bottom-1/4 right-1/3 w-[700px] h-[350px] animate-float-slow opacity-8 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 96%, 28%) 0%, hsl(217, 91%, 35%) 45%, transparent 70%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
          animationDelay: '4s',
          transform: `translate(${-parallaxX * 2}px, ${-parallaxY * 2}px)`,
          willChange: 'transform',
        }}
      />

      {/* Layer 4: Moving Spotlight - mouse responsive */}
      <div
        className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] animate-spotlight-wander opacity-8 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle at center, hsl(217, 91%, 35%) 0%, transparent 50%)',
          filter: 'blur(40px)',
          mixBlendMode: 'screen',
          transform: `translate(calc(-50% + ${parallaxX * 4}px), calc(-50% + ${parallaxY * 4}px))`,
          willChange: 'transform',
        }}
      />
      
      {/* Secondary spotlight - opposite movement */}
      <div
        className="absolute top-1/3 left-2/3 w-[600px] h-[600px] animate-spotlight-wander opacity-5 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle at center, hsl(271, 81%, 36%) 0%, transparent 45%)',
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
