import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


const Footer = () => {
  return (
    <footer className="bg-[#0A1628] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold tracking-wide mb-4 text-white">VENTUS AI</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Ventus AI is a customer intelligence and personalization engine for financial
              institutions. We extract behavioral, life-event, financial, demographic, and risk
              signals from the data banks already hold, then route them into the systems they
              already run.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-white/70">
              More card spend · More products per customer · More deposits · Better retention
            </p>

          </div>


          {/* Learn */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Learn</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/platform" className="text-white/60 hover:text-white text-sm transition-colors">Platform</Link>
              <Link to="/transaction-enrichment" className="text-white/60 hover:text-white text-sm transition-colors">Transaction Enrichment</Link>
              <Link to="/insights" className="text-white/60 hover:text-white text-sm transition-colors">Insights</Link>
              <Link to="/faq" className="text-white/60 hover:text-white text-sm transition-colors">FAQ</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/about" className="text-white/60 hover:text-white text-sm transition-colors">About</Link>
              <Link to="/contact" className="text-white/60 hover:text-white text-sm transition-colors">Schedule Demo</Link>
            </nav>
            <p className="text-white/60 text-sm mt-5 mb-3">Have questions? We're here to help.</p>
            <Link to="/contact">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Contact Us</Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-white/70 text-xs">© 2026 Ventus Financial Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
