import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HueField from "@/components/HueField";

const CTA = () => {
  return (
    <section className="bg-white py-14 relative overflow-hidden">
      <HueField
        blobs={[
          { hue: "sky", size: 640, top: "-25%", left: "12%" },
          { hue: "indigo", size: 520, bottom: "-25%", right: "8%" },
          { hue: "violet", size: 400, top: "10%", left: "-8%", opacity: 0.4 },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="ventus-glass mx-auto max-w-3xl rounded-2xl px-6 py-10 md:px-10 md:py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            See what Ventus finds in your data.
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto mb-6">
            Bring a sample file. We'll show you the signals in it.
          </p>

          <Link to="/contact">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)]">
              Schedule a Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
