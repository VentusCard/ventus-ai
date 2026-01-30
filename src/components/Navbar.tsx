import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ventusLogo from "@/assets/ventus-logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center flex-1 md:flex-initial">
          <Link to="/" onClick={closeMobileMenu} className="group">
            <img 
              src={ventusLogo} 
              alt="Ventus Card" 
              className="h-6 md:h-8 w-auto transition-opacity duration-300 group-hover:opacity-90"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/about"
            className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 px-3 group"
          >
            <span className="relative">
              About
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </span>
          </Link>
          <Link 
            to="/technology"
            className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 px-3 group"
          >
            <span className="relative">
              Technology
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </span>
          </Link>
          <Link 
            to="/contact"
            className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 px-3 group"
          >
            <span className="relative">
              Contact
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </span>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-end pr-2">
          <button
            onClick={toggleMobileMenu}
            className="text-white/90 hover:text-white flex items-center justify-end w-16 h-12 pr-2 transition-colors duration-300 z-50 relative"
            aria-label="Toggle mobile menu"
            type="button"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="h-6 w-6" />
            ) : (
              <Menu size={24} className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg border-b border-border/50 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'opacity-100 visible translate-y-0' 
          : 'opacity-0 invisible -translate-y-2'
      }`}>
        <div className="px-4 py-6 space-y-4">
          <Link 
            to="/about"
            onClick={closeMobileMenu}
            className="block text-white/90 hover:text-white font-medium text-lg py-3 px-2 transition-all duration-300 border-b border-white/10 hover:bg-white/5 rounded"
          >
            About
          </Link>
          <Link 
            to="/technology"
            onClick={closeMobileMenu}
            className="block text-white/90 hover:text-white font-medium text-lg py-3 px-2 transition-all duration-300 border-b border-white/10 hover:bg-white/5 rounded"
          >
            Technology
          </Link>
          <Link 
            to="/contact"
            onClick={closeMobileMenu}
            className="block text-white/90 hover:text-white font-medium text-lg py-3 px-2 transition-all duration-300 border-b border-white/10 hover:bg-white/5 rounded"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
