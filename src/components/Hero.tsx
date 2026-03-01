import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-white text-gray-900 flex items-center justify-center overflow-hidden min-h-screen pt-20">
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-300/8 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10 text-center w-full flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
            Turn transaction data into{" "}
            <span className="italic text-blue-600">intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Banks sit on the most valuable behavioral data in the world. Ventus transforms it into lifestyle signals, intent detection, and life event intelligence — without touching core infrastructure.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Link to="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Schedule Demo
              </Button>
            </Link>
            <Link to="/tepilot">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
