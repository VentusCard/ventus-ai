
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play();
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
      });
    }, {
      threshold: 0.5
    });

    if (videoRef.current) {
      observer.observe(videoRef.current);
      
      // Add event listener for video progress
      const handleVideoProgress = () => {
        if (videoRef.current) {
          const progress = videoRef.current.currentTime / videoRef.current.duration;
          // Show button when video is 75% complete
          if (progress >= 0.75 && !videoEnded) {
            setVideoEnded(true);
          }
        }
      };
      
      videoRef.current.addEventListener('timeupdate', handleVideoProgress);
      
      // Cleanup function to remove event listener
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', checkMobile);
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleVideoProgress);
        }
      };
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleGetStarted = () => {
    // Smooth scroll to Features section with proper offset to account for navbar
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      const offsetTop = featuresSection.offsetTop - 100; // Add 100px offset for navbar and spacing
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="hero" className="relative bg-[hsl(220,50%,8%)] text-white flex items-center justify-center overflow-hidden min-h-screen pt-20">
      {/* Seamless gradient overlay for smooth transition to footer */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[hsl(220,50%,8%)]/80 to-[hsl(220,50%,8%)] z-0 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10 text-center py-2 w-full flex flex-col justify-center h-full">
        {/* Add spacing between navbar and hero content */}
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 pt-8 md:pt-12">
          {/* Headline with enhanced typography and brushstroke animation */}
          <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight">
            <span className="font-bold text-white">Rewards</span>, <span className="relative font-display font-normal italic text-white inline-block">
              <span className="relative z-20 animate-[unleashed_2s_ease-out_0.5s_both]">
                Made Smarter
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
              <div className="absolute inset-0 bg-[hsl(220,50%,8%)] animate-[brushstroke_1.5s_ease-out_0.5s_both] origin-left z-10"></div>
            </span>
          </h1>
          
          {/* Enhanced subheading with soft blue-gray tone */}
          <p className="text-base md:text-lg font-bold text-blue-gray-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered smart rewards personalized to you
          </p>
          
          {/* Video Centerpiece - removed hover effects and mobile animations */}
          <div className="relative w-full max-w-2xl md:max-w-3xl mx-auto transform scale-60 md:scale-65 lg:scale-70 transition-all duration-700 ease-out">
            <div className="relative aspect-video overflow-hidden">
              {/* Enhanced gradient overlays for seamless blending */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Stronger feathered edges that blend into black background */}
                <div className="absolute top-0 left-0 right-0 h-8 md:h-12 bg-gradient-to-b from-[hsl(220,50%,8%)] via-[hsl(220,50%,8%)]/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-[hsl(220,50%,8%)] via-[hsl(220,50%,8%)]/80 to-transparent"></div>
                <div className="absolute top-0 bottom-0 left-0 w-8 md:w-12 bg-gradient-to-r from-[hsl(220,50%,8%)] via-[hsl(220,50%,8%)]/60 to-transparent"></div>
                <div className="absolute top-0 bottom-0 right-0 w-8 md:w-12 bg-gradient-to-l from-[hsl(220,50%,8%)] via-[hsl(220,50%,8%)]/60 to-transparent"></div>
                
                {/* Subtle vignette effect */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[hsl(220,50%,8%)]/20"></div>
              </div>
              
              {/* Video element with reduced opacity for better blending */}
              <video ref={videoRef} className="w-full h-full object-cover opacity-90" autoPlay muted loop playsInline preload="auto">
                <source src="https://github.com/rojchen98/ventuscard/raw/refs/heads/main/Gen-4%20A%20premium%20credit%20card%20named%20Ventus%20Card%20is%20displayed%20in%20the%20center%20of%20the%20frame%20against%20a%20smooth%20black%20background%20The%20card%20has%20a%20sleek%20marbled%20design%20in%20deep%20shades%20of%20blue,%20indigo,%20and%20violet,%20(6).mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Softer shadow effects that blend with background */}
            <div className="absolute -inset-8 md:-inset-12 bg-gradient-radial from-[hsl(220,50%,8%)]/10 via-[hsl(220,50%,8%)]/30 to-[hsl(220,50%,8%)] opacity-60 blur-3xl -z-10"></div>
          </div>
          
          {/* Learn More button */}
          <div className="mt-6 md:mt-8 flex items-center justify-center relative z-30">
            <Link to="/smartrewards">
              <Button size="lg">
                Learn More
              </Button>
            </Link>
          </div>
          
        </div>
      </div>
      
      {/* Subtle bottom line separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
    </div>
  );
};

export default Hero;
