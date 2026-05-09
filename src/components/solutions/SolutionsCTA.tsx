import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SolutionsCTA = () => (
  <section className="bg-white py-20">
    <div className="max-w-3xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        See what Ventus finds in your transaction data.
      </h2>
      <Link to="/contact">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          Schedule a Demo
        </Button>
      </Link>
    </div>
  </section>
);

export default SolutionsCTA;
