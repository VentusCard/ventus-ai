import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown } from "lucide-react";

const PartnerHero = () => {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
          Partner with <span className="italic font-light text-muted-foreground">Ventus</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Reach customers who are actively pursuing the lifestyle goals that align with your brand.
        </p>
        <Button 
          size="lg"
          className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => window.open("https://www.ventusrewards.com", "_blank")}
        >
          Sign Up Now
          <ExternalLink className="w-5 h-5 ml-2" />
        </Button>
        
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
  );
};

export default PartnerHero;