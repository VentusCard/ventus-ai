import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-white text-gray-900 flex items-center justify-center overflow-hidden min-h-screen pt-20">
      {/* Aurora blob effects */}
      <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-300/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10 text-center w-full flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
            Turn transaction data into{" "}
            <span className="italic text-blue-600">intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Beyond basic enrichment — interpreting transaction data to reveal consumer intent, behavior, and life events
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

        {/* Credibility bar */}
        <div className="mt-20 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-400 tracking-wide uppercase">
            Trusted by top 10 US financial institutions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
