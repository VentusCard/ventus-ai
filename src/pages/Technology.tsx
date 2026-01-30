import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Brain, Gift, Users, Briefcase } from "lucide-react";

const Technology = () => {
  const capabilities = [
    {
      icon: Brain,
      title: "Advanced Transaction Enrichment",
      description: "Our semantic AI goes beyond basic merchant name cleaning. We extract deep, contextual signals from every transaction—merchant category, location patterns, spending velocity, and more—to build a complete picture of customer behavior."
    },
    {
      icon: Gift,
      title: "Intelligent Reward Personalization",
      description: "Using AI-driven purchase personas, we help institutions deliver rewards, offers, and content that resonate with each customer's unique lifestyle and spending habits."
    },
    {
      icon: Users,
      title: "Holistic Customer Engagement",
      description: "We enable banks to offer a unified experience—combining rewards, perks, and educational content—in a way that feels seamless and personalized, not like a patchwork of products."
    },
    {
      icon: Briefcase,
      title: "Wealth Management CoPilot",
      description: "For advisors and wealth managers, Ventus surfaces lifestyle events and behavioral insights that automate administrative tasks and create opportunities for proactive, meaningful client engagement."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What We Do
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Turn transaction data into actionable consumer intelligence 
              with our four core capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <capability.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {capability.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Technology;
