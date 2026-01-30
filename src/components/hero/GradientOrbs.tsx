interface GradientOrbsProps {
  parallaxX?: number;
  parallaxY?: number;
}

const GradientOrbs = ({ parallaxX = 0, parallaxY = 0 }: GradientOrbsProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Animated Conic Gradient Mesh Base - black base with colored accents */}
      <div 
        className="absolute inset-0 animate-gradient-rotate opacity-60"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 30%, 
              hsl(0, 0%, 0%) 0deg,
              hsl(220, 70%, 15%) 60deg,
              hsl(0, 0%, 0%) 120deg,
              hsl(260, 60%, 18%) 180deg,
              hsl(0, 0%, 0%) 240deg,
              hsl(200, 80%, 15%) 300deg,
              hsl(0, 0%, 0%) 360deg
            )
          `,
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />
      
      {/* Layer 1b: Second rotating gradient (opposite direction) - black base */}
      <div 
        className="absolute inset-0 animate-gradient-rotate-reverse opacity-50 mix-blend-screen"
        style={{
          background: `
            conic-gradient(from 180deg at 70% 70%, 
              hsl(0, 0%, 0%) 0deg,
              hsl(280, 60%, 18%) 90deg,
              hsl(0, 0%, 0%) 180deg,
              hsl(200, 70%, 20%) 270deg,
              hsl(0, 0%, 0%) 360deg
            )
          `,
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: Floating Radial Gradient Spots */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] animate-mesh-breathe opacity-50 transition-transform duration-500 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, hsl(217, 91%, 60%) 0%, transparent 60%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
          transform: `translate(${-parallaxX * 1.5}px, ${-parallaxY * 1.5}px)`,
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] animate-mesh-breathe opacity-45 transition-transform duration-500 ease-out"
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
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] animate-mesh-breathe opacity-40 transition-transform duration-500 ease-out"
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
        className="absolute top-0 left-1/4 w-[900px] h-[400px] animate-float-slow opacity-25 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(217, 91%, 60%) 0%, hsl(271, 81%, 56%) 40%, transparent 70%)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          transform: `translate(${parallaxX * 1.8}px, ${parallaxY * 1.8}px)`,
          willChange: 'transform',
        }}
      />
      
      <div
        className="absolute bottom-1/4 right-1/3 w-[700px] h-[350px] animate-float-slow opacity-20 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 96%, 42%) 0%, hsl(217, 91%, 60%) 45%, transparent 70%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
          animationDelay: '4s',
          transform: `translate(${-parallaxX * 2}px, ${-parallaxY * 2}px)`,
          willChange: 'transform',
        }}
      />


      {/* Layer 5: Subtle hue-shifting overlay */}
      <div
        className="absolute inset-0 animate-hue-dance opacity-[0.12] mix-blend-overlay"
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
          background: 'linear-gradient(180deg, transparent 0%, black 100%)',
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
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 50%, black 100%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
};

export default GradientOrbs;
