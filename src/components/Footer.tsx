import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold tracking-wide mb-4 text-foreground">VENTUS</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-Powered Transaction Enrichment and Lifestyle Intelligence Platform
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Navigation</h4>
            <div className="space-y-2">
              <Link to="/tepilot" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                TePilot Dashboard
              </Link>
              <Link to="/tepilot/advisor-console" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Advisor Console
              </Link>
              <Link to="/tepilot/rewards-pipeline" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Rewards Pipeline
              </Link>
            </div>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Get in Touch</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Have questions? We're here to help.
            </p>
            <Link to="/contact">
              <Button size="sm">Contact Us</Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">© 2025 Ventus Financial Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
