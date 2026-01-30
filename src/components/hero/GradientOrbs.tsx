const GradientOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blue orb - top left */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-float-slow opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)",
          filter: "blur(60px)",
          animationDelay: "0s",
          animationDuration: "12s",
        }}
      />
      
      {/* Violet orb - top right */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full animate-float-slow opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)",
          filter: "blur(50px)",
          animationDelay: "2s",
          animationDuration: "14s",
        }}
      />
      
      {/* Cyan orb - bottom center */}
      <div
        className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full animate-float-slow opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0) 70%)",
          filter: "blur(80px)",
          animationDelay: "4s",
          animationDuration: "16s",
        }}
      />

      {/* Small accent orb - center left */}
      <div
        className="absolute top-1/2 left-20 w-48 h-48 rounded-full animate-float-slow opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0) 70%)",
          filter: "blur(40px)",
          animationDelay: "1s",
          animationDuration: "10s",
        }}
      />

      {/* Small accent orb - center right */}
      <div
        className="absolute top-1/3 right-32 w-40 h-40 rounded-full animate-float-slow opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0) 70%)",
          filter: "blur(35px)",
          animationDelay: "3s",
          animationDuration: "11s",
        }}
      />
    </div>
  );
};

export default GradientOrbs;
