import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Benefits from "@/components/Benefits";

const BenefitsPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center pt-20">
          <div className="max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10 text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
              Choose Your <span className="italic font-light text-muted-foreground">Benefits</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              One card, three tiers—designed to grow with your lifestyle
            </p>
            
            {/* Scroll indicator */}
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="mt-8 animate-fade-in"
              aria-label="Scroll down"
            >
              <ChevronDown className="h-6 w-6 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
            </button>
          </div>
          
          {/* Subtle bottom line separator */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
        </section>
        
        <main>
          <Benefits />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default BenefitsPage;
