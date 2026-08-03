import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { COMPANY_ONE_LINER, OUTCOMES_INLINE } from "@/lib/companyCopy";

const Footer = () => {
  return (
    <footer className="bg-[#0A1628] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold tracking-wide mb-4 text-white">VENTUS AI</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              {COMPANY_ONE_LINER} We extract signals in spending behavior, financial behavior, and
              major life events, then orchestrate them into the systems banks already run.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-white/70">
              {OUTCOMES_INLINE}
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Solutions</h4>
            <nav className="flex flex-col gap-2.5">
              <p className="text-[11px] uppercase tracking-wider text-white/70">Behavioral Intelligence</p>
              <Link to="/solutions/offer-intelligence" className="text-white/60 hover:text-white text-sm transition-colors">Next Offer</Link>
              <Link to="/solutions/product-intelligence" className="text-white/60 hover:text-white text-sm transition-colors">Next Product</Link>
              <Link to="/solutions/conversation-intelligence" className="text-white/60 hover:text-white text-sm transition-colors">Next Conversation</Link>
              <p className="text-[11px] uppercase tracking-wider text-white/70 mt-3">Analytics</p>
              <Link to="/solutions/portfolio-intelligence" className="text-white/60 hover:text-white text-sm transition-colors">Customer Intelligence</Link>
              <Link to="/solutions/campaign-intelligence" className="text-white/60 hover:text-white text-sm transition-colors">Segment of One Campaigns</Link>
              <Link to="/coworker" className="text-white/60 hover:text-white text-sm transition-colors">Ventus AI Coworker</Link>
            </nav>
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
