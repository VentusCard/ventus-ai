import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="relative bg-[hsl(220,50%,8%)] text-white">
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Main CTA Content */}
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Experience Ventus AI? <span className="text-white/80">Coming Soon</span>
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Discover intelligent financial technology that transforms how you manage and grow your wealth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
