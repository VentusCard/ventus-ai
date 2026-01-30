const GradientOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blue orb - top left with morphing */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] animate-morph-slow opacity-25"
        style={{
          background: "radial-gradient(ellipse at 30% 30%, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, rgba(59, 130, 246, 0) 70%)",
          filter: "blur(60px)",
          animationDelay: "0s",
        }}
      />
      
      {/* Violet orb - top right with pulse */}
      <div
        className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full animate-float-slow opacity-20"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(139, 92, 246, 0) 70%)",
          filter: "blur(50px)",
          animationDelay: "2s",
          animationDuration: "14s",
        }}
      />

      {/* Inner violet accent */}
      <div
        className="absolute top-10 right-40 w-48 h-48 rounded-full animate-pulse-glow opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.6) 0%, rgba(167, 139, 250, 0) 70%)",
          filter: "blur(30px)",
          animationDelay: "1s",
        }}
      />
      
      {/* Cyan orb - bottom center, largest */}
      <div
        className="absolute -bottom-60 left-1/2 -translate-x-1/2 w-[700px] h-[700px] animate-morph-slow opacity-15"
        style={{
          background: "radial-gradient(ellipse at 50% 70%, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(6, 182, 212, 0) 70%)",
          filter: "blur(100px)",
          animationDelay: "4s",
        }}
      />

      {/* Accent cyan ring */}
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full animate-float-slow opacity-10"
        style={{
          background: "transparent",
          border: "1px solid rgba(34, 211, 238, 0.3)",
          filter: "blur(2px)",
          animationDelay: "5s",
          animationDuration: "20s",
        }}
      />

      {/* Small accent orb - center left with drift */}
      <div
        className="absolute top-1/2 left-10 w-64 h-64 rounded-full animate-float-slow opacity-20"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(96, 165, 250, 0.5) 0%, rgba(96, 165, 250, 0) 70%)",
          filter: "blur(40px)",
          animationDelay: "1s",
          animationDuration: "10s",
        }}
      />

      {/* Small accent orb - center right */}
      <div
        className="absolute top-1/3 right-20 w-56 h-56 rounded-full animate-float-slow opacity-15"
        style={{
          background: "radial-gradient(circle at 60% 30%, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0) 70%)",
          filter: "blur(35px)",
          animationDelay: "3s",
          animationDuration: "11s",
        }}
      />

      {/* Layered glow center - behind text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] animate-pulse-glow opacity-10"
        style={{
          background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "0s",
          animationDuration: "5s",
        }}
      />

      {/* Subtle color shift overlay */}
      <div
        className="absolute inset-0 animate-color-shift opacity-5"
        style={{
          background: "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default GradientOrbs;
