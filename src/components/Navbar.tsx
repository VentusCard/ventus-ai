import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";

const SECTION_LINKS = [
  { id: "intelligence", label: "Intelligence" },
  { id: "personalization", label: "Personalization" },
];

const PAGE_LINKS = [
  { to: "/insights", label: "Insights" },
  { to: "/faq", label: "FAQ" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const goToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    closeMobileMenu();
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (location.pathname === "/") {
      scroll();
    } else {
      navigate("/");
      setTimeout(scroll, 320);
    }
  };

  return (
    <nav className="mx-auto max-w-5xl rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {/* Desktop */}
      <div className="hidden md:flex h-14 items-center justify-between pl-6 pr-3">
        <Link to="/" onClick={closeMobileMenu}>
          <img src={ventusLogoTransparent} alt="Ventus AI" className="h-4 w-auto" />
        </Link>

        <div className="flex items-center gap-6">
          {SECTION_LINKS.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              onClick={(e) => goToSection(e, l.id)}
              className="cursor-pointer text-[13px] font-medium uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/insights"
            className="text-[13px] font-medium uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900"
          >
            Insights
          </Link>
          <span className="h-4 w-px bg-slate-200" />
          <Link
            to="/faq"
            className="text-[13px] font-medium uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900"
          >
            FAQ
          </Link>
        </div>

        <Link to="/contact">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Schedule Demo
          </Button>
        </Link>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden h-14 items-center justify-between px-5">
        <Link to="/" onClick={closeMobileMenu}>
          <img src={ventusLogoTransparent} alt="Ventus AI" className="h-4 w-auto" />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="text-gray-700"
          aria-label="Toggle menu"
          style={{ minWidth: "auto", minHeight: "auto", padding: 0 }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-5 pb-5 pt-2">
          {SECTION_LINKS.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              onClick={(e) => goToSection(e, l.id)}
              className="block w-full cursor-pointer border-b border-gray-100 py-3 text-left text-base font-medium text-gray-700"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/insights"
            onClick={closeMobileMenu}
            className="block w-full border-b border-gray-100 py-3 text-left text-base font-medium text-gray-700"
          >
            Insights
          </Link>
          <div className="my-2 h-px bg-slate-200" />
          <Link
            to="/faq"
            onClick={closeMobileMenu}
            className="block w-full border-b border-gray-100 py-3 text-left text-base font-medium text-gray-700"
          >
            FAQ
          </Link>
          <Link to="/contact" onClick={closeMobileMenu} className="block pt-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Schedule Demo</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
