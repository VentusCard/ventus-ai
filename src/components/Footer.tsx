import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold tracking-wide mb-4 text-white">VENTUS AI</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Intelligent Financial Technology. AI-Powered Insights for Modern Banking.
            </p>
          </div>

          {/* Get in Touch */}
          <div className="md:text-right">
            <h4 className="text-lg font-semibold mb-4 text-white">Get in Touch</h4>
            <p className="text-white/70 text-sm mb-4">
              Have questions? We're here to help.
            </p>
            <Link to="/contact">
              <Button size="sm" className="bg-white text-black hover:bg-white/90">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © 2026 Ventus Financial Technologies Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
