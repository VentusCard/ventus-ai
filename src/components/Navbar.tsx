import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogo from "@/assets/ventus-logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/" onClick={closeMobileMenu}>
          <img src={ventusLogo} alt="Ventus AI" className="h-7 md:h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          <Link to="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">About</Link>
          <Link to="/technology" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">What We Do</Link>
          <Link to="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">FAQ</Link>
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
        <div className="px-4 py-6 space-y-4">
          <Link to="/about" onClick={closeMobileMenu} className="block text-gray-700 hover:text-gray-900 font-medium text-lg py-3 px-2 border-b border-gray-100">About</Link>
          <Link to="/technology" onClick={closeMobileMenu} className="block text-gray-700 hover:text-gray-900 font-medium text-lg py-3 px-2 border-b border-gray-100">What We Do</Link>
          <Link to="/faq" onClick={closeMobileMenu} className="block text-gray-700 hover:text-gray-900 font-medium text-lg py-3 px-2 border-b border-gray-100">FAQ</Link>
          <Link to="/contact" onClick={closeMobileMenu} className="block pt-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Schedule Demo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
