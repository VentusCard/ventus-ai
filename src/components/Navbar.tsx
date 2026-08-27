import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Gift, Package, MessageCircle, BarChart3, Bot, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";
import AnnouncementBar from "./AnnouncementBar";

const DARK_HERO_PAGES = ["/smartrewards", "/engagement", "/wealth", "/analytics", "/travel"];

const behavioralIntelligenceItems = [
  { to: "/solutions/offer-intelligence", title: "Next Offer", desc: "Serve personalized offers before customers go looking", Icon: Gift },
  { to: "/solutions/product-intelligence", title: "Next Product", desc: "Surface the right product at the right moment", Icon: Package },
  { to: "/solutions/conversation-intelligence", title: "Next Conversation", desc: "Surface the right conversation at the right moment.", Icon: MessageCircle },
];

const analyticsItems = [
  { to: "/solutions/portfolio-intelligence", title: "Customer Intelligence", desc: "Bank-wide behavioral intelligence for executive teams.", Icon: BarChart3 },
  { to: "/solutions/campaign-intelligence", title: "Segment of One Campaigns", desc: "Build micro-segment campaigns from life events, behavior, and financial signals.", Icon: Megaphone },
  { to: "/coworker", title: "Ventus AI Coworker", desc: "AI teammate for advisors and banking teams.", Icon: Bot },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);

  const isDarkHero = DARK_HERO_PAGES.includes(location.pathname);
  const isTransparent = isDarkHero && !isMobileMenuOpen;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => { setIsMobileMenuOpen(false); setMobileSolutionsOpen(false); };

  const scrollToFaq = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMobileMenu();
    if (location.pathname === "/") {
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const textColor = isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const mobileIconColor = isTransparent ? "text-white" : "text-gray-700";

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      <AnnouncementBar />
      <nav className={`transition-colors duration-300 ${isTransparent ? "bg-[#0A1628]" : "ventus-glass-nav"}`}>
      {/* Desktop navbar */}
      <div className="hidden md:flex h-16 items-center justify-between px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={ventusLogoTransparent} alt="Ventus AI" className="h-5 w-auto" />
          </Link>

          {/* Solutions dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button className={`${textColor} text-sm font-medium transition-colors flex items-center gap-1`}>
              Solutions <ChevronDown size={14} className={`transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
            </button>
            {solutionsOpen && (
              <div className="absolute top-full left-0 pt-2" onMouseEnter={() => setSolutionsOpen(true)}>
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-4 w-[640px] grid grid-cols-2">
                  <div className="px-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">Banking Personalization</div>
                    {behavioralIntelligenceItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setSolutionsOpen(false)}
                        className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 mt-0.5">
                          <item.Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 border-l border-gray-100">
                    <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">BANK-FACING INTELLIGENCE</div>
                    {analyticsItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setSolutionsOpen(false)}
                        className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 mt-0.5">
                          <item.Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/insights" className={`${textColor} text-sm font-medium transition-colors`}>Insights</Link>
          <a href="/#faq" onClick={scrollToFaq} className={`${textColor} text-sm font-medium transition-colors cursor-pointer`}>FAQ</a>
        </div>
        <Link to="/contact">
          <Button
            size="sm"
            className={isTransparent
              ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          >
            Schedule Demo
          </Button>
        </Link>
      </div>

      {/* Mobile navbar */}
      <div className="flex md:hidden h-16 items-center justify-between" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <Link to="/" onClick={closeMobileMenu}>
          <img src={ventusLogoTransparent} alt="Ventus AI" className="h-5 w-auto" />
        </Link>
        <button onClick={toggleMobileMenu} className={mobileIconColor} aria-label="Toggle menu" style={{ minWidth: 'auto', minHeight: 'auto', padding: 0 }}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-nav-menu"
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div style={{ padding: '1.5rem' }}>
          <button
            onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
            className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-100 text-left"
          >
            Solutions <ChevronDown size={16} className={`transition-transform ${mobileSolutionsOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileSolutionsOpen && (
              <div className="pl-4 border-b border-gray-100 pb-2">
                <div className="pt-2 text-[11px] uppercase tracking-wider text-[#9CA3AF]">Banking Personalization</div>
                {behavioralIntelligenceItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={closeMobileMenu} className="flex items-center gap-2 py-2.5 text-sm text-gray-600 hover:text-gray-900">
                    <item.Icon size={14} className="text-blue-600" />
                    {item.title}
                  </Link>
                ))}
                <div className="mr-4 my-1 border-t border-gray-200" />
                <div className="pt-2 text-[11px] uppercase tracking-wider text-[#9CA3AF]">BANK-FACING INTELLIGENCE</div>
                {analyticsItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={closeMobileMenu} className="flex items-center gap-2 py-2.5 text-sm text-gray-600 hover:text-gray-900">
                    <item.Icon size={14} className="text-blue-600" />
                    {item.title}
                  </Link>
                ))}
            </div>
          )}
          <Link to="/insights" onClick={closeMobileMenu} className="flex items-center w-full text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-100 text-left">Insights</Link>
          <a href="/#faq" onClick={scrollToFaq} className="flex items-center w-full text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-100 text-left cursor-pointer">FAQ</a>

          <Link to="/contact" onClick={closeMobileMenu} className="block pt-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Schedule Demo</Button>
          </Link>
        </div>
      </div>
      </nav>
    </div>
  );
};

export default Navbar;
