import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechnologyBackground from "@/components/technology/TechnologyBackground";
import { Brain, Gift, Users, Briefcase, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

// Icon animation classes mapped by icon type
const iconAnimations: Record<string, string> = {
  Brain: "group-hover:animate-icon-pulse",
  Gift: "group-hover:animate-icon-bounce",
  Users: "group-hover:animate-icon-wave",
  Briefcase: "group-hover:animate-icon-tilt",
};

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
}

const Technology = () => {
  const capabilities: Capability[] = [
    {
      icon: Brain,
      title: "Advanced Transaction Enrichment",
      description: "Our semantic AI goes beyond basic merchant name cleaning. We extract deep, contextual signals from every transaction—merchant category, location patterns, spending velocity, and more—to build a complete picture of customer behavior.",
      route: "/enrichment"
    },
    {
      icon: Gift,
      title: "Intelligent Reward Personalization",
      description: "Using AI-driven purchase personas, we help institutions deliver rewards, offers, and content that resonate with each customer's unique lifestyle and spending habits.",
      route: "/smartrewards"
    },
    {
      icon: Users,
      title: "Holistic Customer Engagement",
      description: "We enable banks to offer a unified experience—combining rewards, perks, and educational content—in a way that feels seamless and personalized, not like a patchwork of products.",
      route: "/engagement"
    },
    {
      icon: Briefcase,
      title: "Wealth Management CoPilot",
      description: "For advisors and wealth managers, Ventus surfaces lifestyle events and behavioral insights that automate administrative tasks and create opportunities for proactive, meaningful client engagement.",
      route: "/wealth"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <TechnologyBackground />
      <Navbar />
      <main className="pt-20 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Header with staggered entrance animations */}
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-float"
              style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
            >
              What We Do
            </h1>
            <p 
              className="text-xl text-foreground/70 max-w-3xl mx-auto animate-fade-float"
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              Turn transaction data into actionable consumer intelligence with our four core capabilities.
            </p>
          </div>
          
          {/* Capability cards with staggered animations and enhanced hover states */}
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => {
              const IconComponent = capability.icon;
              const iconName = capability.icon.displayName || capability.icon.name;
              const iconAnimation = iconAnimations[iconName] || "";
              
              return (
                <Link 
                  key={index}
                  to={capability.route}
                  className="group p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm 
                    hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] 
                    hover:scale-[1.02] transition-all duration-500 ease-out animate-fade-float"
                  style={{ 
                    animationDelay: `${0.4 + index * 0.1}s`, 
                    animationFillMode: 'backwards' 
                  }}
                >
                  {/* Icon container with glow effect on hover */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 
                    transition-all duration-500 group-hover:bg-primary/20 
                    group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                    <IconComponent 
                      className={`w-6 h-6 text-primary transition-all duration-300 
                        group-hover:scale-110 ${iconAnimation}`} 
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    {capability.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed mb-4">
                    {capability.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary font-medium 
                    group-hover:gap-3 transition-all duration-300">
                    Learn More 
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Technology;
