import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HueField from "@/components/HueField";

const CTA = () => {
  return (
    <section className="bg-white py-20 relative overflow-hidden">
      <HueField
        blobs={[
          { hue: "sky", size: 760, top: "-30%", left: "12%" },
          { hue: "indigo", size: 620, bottom: "-30%", right: "8%" },
          { hue: "violet", size: 480, top: "10%", left: "-8%", opacity: 0.45 },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="ventus-glass mx-auto max-w-4xl rounded-[28px] px-8 py-14 md:px-14 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Experience Ventus AI?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            See what Ventus finds in your transaction data.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.7)]">
              Schedule a Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
