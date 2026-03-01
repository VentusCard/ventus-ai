import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Layers, Gift, Users, Briefcase, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogo from "@/assets/ventus-logo.png";

const coreProduct = {
  title: "Transaction Enrichment",
  desc: "Extract lifestyle pillars, intent signals, and behavioral patterns from every transaction.",
  icon: Layers,
  href: "/enrichment",
};

const insightTools = [
  {
    title: "Analytics & Targeting",
    desc: "Portfolio-level intelligence with behavioral segmentation and campaign targeting.",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    title: "Smart Rewards",
    desc: "Match deals to customers based on life stage, spending velocity, and purchase cycles.",
    icon: Gift,
    href: "/smartrewards",
  },
  {
    title: "Customer Engagement",
    desc: "Hyper-targeted campaigns and segments powered by real behavioral intelligence.",
    icon: Users,
    href: "/engagement",
  },
  {
    title: "Wealth Management Copilot",
    desc: "AI-powered relationship intelligence with life event detection for advisors.",
    icon: Briefcase,
    href: "/wealth",
  },
];

const allProducts = [coreProduct, ...insightTools];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  };

  const scrollToFaq = useCallback(() => {
    closeMobileMenu();
    const doScroll = () => {
      const el = document.getElementById("faq");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(doScroll, 100);
    } else {
      doScroll();
    }
  }, [location.pathname, navigate]);

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        {/* Left: Logo + Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={ventusLogo} alt="Ventus AI" className="h-6 w-auto" />
          </Link>

          {/* Products dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Products <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${isProductsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
              <div className="w-[340px] bg-white rounded-xl border border-gray-200 shadow-xl p-3">
                {/* ONE TECH CORE */}
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase px-3 pt-1 pb-2">One Tech Core</p>
                <Link
                  to={coreProduct.href}
                  onClick={() => setIsProductsOpen(false)}
                  className={`flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors group relative ${location.pathname === coreProduct.href ? "bg-blue-50/50" : ""}`}
                >
                  {location.pathname === coreProduct.href && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-blue-600" />
                  )}
                  <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <coreProduct.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{coreProduct.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{coreProduct.desc}</p>
                  </div>
                </Link>

                {/* Divider */}
                <div className="mx-3 my-2 border-t border-gray-100" />

                {/* FOUR INSIGHT TOOLS */}
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase px-3 pt-1 pb-2">Four Insight Tools</p>
                <div className="space-y-0.5">
                  {insightTools.map((p) => (
                    <Link
                      key={p.href}
                      to={p.href}
                      onClick={() => setIsProductsOpen(false)}
                      className={`flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors group relative ${location.pathname === p.href ? "bg-blue-50/50" : ""}`}
                    >
                      {location.pathname === p.href && (
                        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-blue-600" />
                      )}
                      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <p.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={scrollToFaq} className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">FAQ</button>
        </div>

        {/* Mobile logo */}
        <Link to="/" onClick={closeMobileMenu} className="md:hidden">
          <img src={ventusLogo} alt="Ventus AI" className="h-6 w-auto" />
        </Link>

        {/* Right: CTA */}
        <div className="hidden md:block">
          <Link to="/contact">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Schedule Demo</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={toggleMobileMenu} className="md:hidden text-gray-700 p-2" aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
      }`}>
        <div className="px-4 py-6 space-y-2">
          <button
            onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
            className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900 font-medium text-lg py-3 px-2 border-b border-gray-100"
          >
            Products
            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${isMobileProductsOpen ? 'max-h-96' : 'max-h-0'}`}>
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase px-6 pt-2 pb-1">One Tech Core</p>
              <Link to={coreProduct.href} onClick={closeMobileMenu} className="block text-gray-500 hover:text-gray-900 text-base py-2 px-6">
                {coreProduct.title}
              </Link>
              <div className="mx-6 my-1 border-t border-gray-100" />
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase px-6 pt-2 pb-1">Four Insight Tools</p>
              {insightTools.map((p) => (
                <Link key={p.href} to={p.href} onClick={closeMobileMenu} className="block text-gray-500 hover:text-gray-900 text-base py-2 px-6">
                  {p.title}
                </Link>
              ))}
            </div>
          <button onClick={scrollToFaq} className="block text-gray-700 hover:text-gray-900 font-medium text-lg py-3 px-2 border-b border-gray-100 w-full text-left">FAQ</button>
          <Link to="/contact" onClick={closeMobileMenu} className="block pt-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Schedule Demo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
