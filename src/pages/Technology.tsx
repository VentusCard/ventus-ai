

import { Brain, Gift, Users, Briefcase, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div>
      <main className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Do
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Turn transaction data into actionable consumer intelligence with our four core capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => {
              const IconComponent = capability.icon;
              return (
                <Link 
                  key={index}
                  to={capability.route}
                  className="group p-8 rounded-2xl border border-gray-200 bg-white 
                    hover:bg-gray-50 hover:border-blue-300 hover:shadow-lg 
                    hover:scale-[1.02] transition-all duration-500 ease-out"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 
                    transition-all duration-500 group-hover:bg-blue-100">
                    <IconComponent className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-blue-600">
                    {capability.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-4">
                    {capability.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-blue-600 font-medium 
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
    </div>
  );
};

export default Technology;
