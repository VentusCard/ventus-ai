import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";
import AnnouncementBar from "./AnnouncementBar";


/** Pages where the hero has a dark background and the navbar should start transparent */
const DARK_HERO_PAGES = ["/", "/smartrewards", "/engagement", "/wealth", "/analytics", "/travel", "/insights"];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const isDarkHero = DARK_HERO_PAGES.includes(location.pathname);
  const isTransparent = isDarkHero && !isMobileMenuOpen;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
      {showAnnouncement && <AnnouncementBar onDismiss={() => setShowAnnouncement(false)} />}
      <nav className={`transition-colors duration-300 ${isTransparent ? "bg-[#0a0f1e]" : "bg-white"}`}>
      {/* Desktop navbar */}
      <div className="hidden md:flex h-16 items-center justify-between px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={ventusLogoTransparent} alt="Ventus AI" className="h-5 w-auto" />
          </Link>
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
