import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";

const SECTION_LINKS = [
  { id: "flows", label: "Platform" },
  { id: "coworker", label: "Coworker" },
  { id: "governance", label: "Governance" },
  { id: "integration", label: "Integrations" },
];

const PAGE_LINKS = [{ to: "/insights", label: "Insights" }];


const DARK_SECTION_IDS = ["hero", "flows", "governance"];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onDark, setOnDark] = useState(location.pathname === "/");

  useEffect(() => {
    const measure = () => {
      const probe = 44;
      const isDark = DARK_SECTION_IDS.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= probe && rect.bottom >= probe;
      });
      setOnDark(isDark);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [location.pathname]);

  const shell = onDark
    ? "border-white/15 bg-white/10 shadow-[0_8px_30px_rgba(2,6,23,0.35)]"
    : "border-slate-200/80 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.08)]";
  const linkTone = onDark
    ? "text-slate-200 hover:text-white"
    : "text-gray-600 hover:text-gray-900";

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
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6">
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
            <span className="h-4 w-px bg-slate-200" />
            {PAGE_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[13px] font-medium uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
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
            {PAGE_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={closeMobileMenu}
                className="block w-full border-b border-gray-100 py-3 text-left text-base font-medium text-gray-700"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/contact" onClick={closeMobileMenu} className="block pt-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Schedule Demo</Button>
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
