import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EnrichmentMockup from "@/components/hero/EnrichmentMockup";

const Hero = () => {
  return (
    <div className="relative bg-white text-gray-900 flex items-center justify-center overflow-hidden min-h-screen pt-20">
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-300/8 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — headline & CTAs */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              Turn transaction data into{" "}
              <span className="italic text-blue-600">intelligence</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
              Banks sit on the most valuable behavioral data in the world. Ventus transforms it into lifestyle signals, intent detection, and life event intelligence — without touching core infrastructure.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Schedule Demo
                </Button>
              </Link>
              <Link to="/technology">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column — floating mockup (hidden on mobile) */}
          <div className="hidden lg:flex justify-center">
            <EnrichmentMockup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
