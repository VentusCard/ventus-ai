import { useState } from "react";
import { Button } from "@/components/ui/button";
import EnrichmentMockup from "@/components/hero/EnrichmentMockup";
import AnimatedHeroTitle from "@/components/hero/AnimatedHeroTitle";

const Hero = () => {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="relative bg-white text-gray-900 flex items-start lg:items-center justify-center overflow-hidden pt-52 pb-16 md:py-36 lg:min-h-screen lg:py-0 lg:pt-12">
      <div className="hidden lg:block absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden lg:block absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-300/8 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <AnimatedHeroTitle onComplete={() => setShowContent(true)} />

            <p
              className={`text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed transition-all duration-700 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`
              }>
              A modular AI layer that turns transaction data into lifestyle profiles, life event detection, and purchase intelligence — automatically.
            </p>

            <Button
              variant="outline"
              size="lg"
              className={`border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-700 ${
                showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>

          <div className="hidden lg:flex justify-center">
            <EnrichmentMockup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
