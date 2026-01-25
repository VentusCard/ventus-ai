import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden flex flex-col justify-center pt-20 pb-2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Metallic texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      
      {/* Premium glass orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-10 top-10 w-32 h-32 bg-gradient-to-br from-blue-400/40 to-cyan-300/40 rounded-full filter blur-3xl backdrop-blur-sm"></div>
        <div className="absolute right-20 bottom-20 w-48 h-48 bg-gradient-to-br from-slate-400/30 to-blue-400/30 rounded-full filter blur-3xl backdrop-blur-sm"></div>
        <div className="absolute left-1/2 top-1/2 w-24 h-24 bg-gradient-to-br from-white/20 to-blue-200/20 rounded-full filter blur-2xl"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent drop-shadow-sm">
            Ventus Rewards
          </h1>
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500/20 to-slate-400/20 rounded-2xl backdrop-blur-sm border border-white/10 mb-4">
            <p className="text-xl md:text-2xl max-w-4xl mx-auto text-blue-100 px-6 py-1.5 bg-black/20 rounded-xl backdrop-blur-sm">
              One card. 5x rewards. All your lifestyle spending.
            </p>
          </div>
          <p className="text-lg max-w-3xl mx-auto text-slate-300 leading-relaxed font-light mb-4">
            Discover how Ventus simplifies and amplifies rewards across all your spending — 
            eliminating the need to juggle multiple cards.
          </p>
          
          {/* Get Started / Sign In buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-3">
            <Link to="/app/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/app/login">
              <Button size="lg" variant="outline" className="px-8 border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Scroll indicator */}
          <button 
            onClick={() => document.getElementById('goal-selection')?.scrollIntoView({ behavior: 'smooth' })}
            className="animate-bounce mt-2"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-6 w-6 text-slate-400 hover:text-white transition-colors" />
          </button>
        </div>
      </div>
      
      {/* Subtle bottom line separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
    </div>
  );
};

export default HeroSection;
