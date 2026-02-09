const TechnologyBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Animated Conic Gradient Mesh Base */}
      <div 
        className="absolute inset-0 animate-gradient-rotate opacity-40"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 30%, 
              hsl(0, 0%, 0%) 0deg,
              hsl(220, 70%, 12%) 60deg,
              hsl(0, 0%, 0%) 120deg,
              hsl(260, 60%, 14%) 180deg,
              hsl(0, 0%, 0%) 240deg,
              hsl(200, 80%, 12%) 300deg,
              hsl(0, 0%, 0%) 360deg
            )
          `,
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />
      
      {/* Layer 2: Second rotating gradient (opposite direction) */}
      <div 
        className="absolute inset-0 animate-gradient-rotate-reverse opacity-35 mix-blend-screen"
        style={{
          background: `
            conic-gradient(from 180deg at 70% 70%, 
              hsl(0, 0%, 0%) 0deg,
              hsl(280, 60%, 14%) 90deg,
              hsl(0, 0%, 0%) 180deg,
              hsl(200, 70%, 16%) 270deg,
              hsl(0, 0%, 0%) 360deg
            )
          `,
          filter: 'blur(120px)',
          willChange: 'transform',
        }}
      />

      {/* Layer 3: Floating Radial Gradient Spots */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] animate-mesh-breathe opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, hsl(217, 91%, 60%) 0%, transparent 60%)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] animate-mesh-breathe opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 60% 60%, hsl(271, 81%, 56%) 0%, transparent 55%)',
          filter: 'blur(90px)',
          mixBlendMode: 'screen',
          animationDelay: '5s',
          willChange: 'transform, opacity',
        }}
      />
      
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] animate-mesh-breathe opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(187, 96%, 42%) 0%, transparent 50%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
          animationDelay: '2.5s',
          willChange: 'transform, opacity',
        }}
      />

      {/* Layer 4: Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
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

      {/* Layer 6: Noise texture for grain */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 7: Vignette effect for focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 40%, hsl(0, 0%, 0%) 100%)',
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default TechnologyBackground;
