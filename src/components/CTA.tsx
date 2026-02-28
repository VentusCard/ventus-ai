import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Experience Ventus AI?
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Discover intelligent financial technology that transforms how you manage and grow your wealth.
        </p>
        <Link to="/contact">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Contact Us
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTA;
