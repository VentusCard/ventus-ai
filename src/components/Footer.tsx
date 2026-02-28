import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold tracking-wide mb-4 text-gray-900">VENTUS AI</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Deeper insights. Smarter engagement. Better outcomes.
            </p>
          </div>
          <div className="md:text-right">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Get in Touch</h4>
            <p className="text-gray-500 text-sm mb-4">Have questions? We're here to help.</p>
            <Link to="/contact">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Contact Us</Button>
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2026 Ventus Financial Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
