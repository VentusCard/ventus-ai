import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DataNetworkSVG from "@/components/hero/DataNetworkSVG";
import GradientOrbs from "@/components/hero/GradientOrbs";
import { useMouseParallax } from "@/hooks/useMouseParallax";

const Hero = () => {
  const parallax = useMouseParallax(0.5);

  return (
    <div id="hero" className="relative bg-black text-white flex items-center justify-center overflow-hidden min-h-screen pt-20">
      {/* Gradient Orbs Background */}
      <GradientOrbs parallaxX={parallax.x} parallaxY={parallax.y} />
      
      {/* Data Network Visualization */}
      <div className="absolute inset-0 z-0">
        <DataNetworkSVG parallaxX={parallax.x} parallaxY={parallax.y} />
      </div>

      {/* Seamless gradient overlay for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-black/80 to-black z-0 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10 text-center py-2 w-full flex flex-col justify-center h-full">
        {/* Content container with staggered animations */}
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 pt-8 md:pt-12">
          {/* Headline with enhanced typography and subtle parallax */}
          <h1 
            className="font-sans text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight animate-fade-float transition-transform duration-200 ease-out"
            style={{ 
              animationDelay: "0.2s", 
              animationFillMode: "backwards",
              transform: `translate(${parallax.x * 0.2}px, ${parallax.y * 0.2}px)`,
            }}
          >
            <span className="font-bold text-white">Turn transaction data into</span>{" "}
            <span className="relative font-display font-normal italic text-white inline-block">
              <span className="relative z-20 animate-[unleashed_2s_ease-out_0.5s_both]">
                consumer intelligence
              </span>
              {/* Elegant brushstroke with metallic shimmer */}
              <svg className="absolute bottom-0 left-0 w-full h-3 md:h-4 lg:h-5 animate-[brushstroke-draw_1.5s_ease-out_0.5s_both] opacity-90" viewBox="0 0 200 20" preserveAspectRatio="none" style={{
                transform: 'translateY(50%)'
              }}>
                <defs>
                  <linearGradient id="brushstroke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" />
                    <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.9" />
                    <stop offset="75%" stopColor="#94a3b8" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
                  </linearGradient>
                  <filter id="shimmer">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                    <feMerge> 
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d="M5,15 Q25,8 50,12 T100,10 Q125,8 150,11 T190,13" stroke="url(#brushstroke-gradient)" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#shimmer)" className="animate-[shimmer_3s_ease-in-out_infinite]" />
              </svg>
              {/* Brushstroke reveal overlay */}
              <div className="absolute inset-0 bg-black animate-[brushstroke_1.5s_ease-out_0.5s_both] origin-left z-10"></div>
            </span>
          </h1>
          
          {/* Enhanced subheading */}
          <p 
            className="text-base md:text-lg font-medium text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-float transition-transform duration-200 ease-out"
            style={{ 
              animationDelay: "0.4s", 
              animationFillMode: "backwards",
              transform: `translate(${parallax.x * 0.15}px, ${parallax.y * 0.15}px)`,
            }}
          >
            Beyond basic enrichment—interpreting transaction data to reveal consumer intent, behavior, and life events
          </p>
          
          {/* Schedule Demo button */}
          <div 
            className="mt-6 md:mt-8 flex items-center justify-center relative z-30 animate-fade-float transition-transform duration-200 ease-out"
            style={{ 
              animationDelay: "0.6s", 
              animationFillMode: "backwards",
              transform: `translate(${parallax.x * 0.1}px, ${parallax.y * 0.1}px)`,
            }}
          >
            <Link to="/contact">
              <Button size="lg">
                Schedule Demo
              </Button>
            </Link>
          </div>
          
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
    </div>
  );
};

export default Hero;
