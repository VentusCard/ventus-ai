import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";

const SECTION_LINKS = [
  { id: "problem", label: "Problem" },
  { id: "one-customer", label: "Solution" },
  { id: "outcomes", label: "Results" },
  { id: "integration", label: "Integrations" },
  { id: "faq", label: "FAQs" },
];

const SCROLL_SECTIONS = [
  { id: "problem", link: "problem" },
  { id: "one-customer", link: "one-customer" },
  { id: "intelligence-database", link: "one-customer" },
  { id: "coworker", link: "one-customer" },
  { id: "outcomes", link: "outcomes" },
  { id: "integration", link: "integration" },
  { id: "governance", link: "integration" },
  { id: "faq", link: "faq" },
];

const PAGE_LINKS = [{ to: "/insights", label: "Insights" }];


const DARK_SECTION_IDS = ["hero", "governance"];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onDark, setOnDark] = useState(location.pathname === "/");
  const [activeLink, setActiveLink] = useState<string | null>(null);

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

      let current: string | null = null;
      for (const section of SCROLL_SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probe + window.innerHeight * 0.35) {
          current = section.link;
        }
      }
      setActiveLink(current);
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
      <nav className={`mx-auto max-w-5xl rounded-2xl border backdrop-blur-xl transition-colors duration-500 ${shell}`}>
        {/* Desktop */}
        <div className="hidden md:flex h-14 items-center justify-between pl-6 pr-3">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={ventusLogoTransparent} alt="Ventus AI" className="h-4 w-auto" />
          </Link>

          <div className="flex items-center gap-6">
            {SECTION_LINKS.map((l) => {
              const isActive = activeLink === l.id;
              return (
                <a
                  key={l.id}
                  href={`/#${l.id}`}
                  onClick={(e) => goToSection(e, l.id)}
                  className={`relative cursor-pointer text-[13px] font-medium uppercase tracking-wide transition-colors ${linkTone} ${
                    isActive ? "text-blue-600" : ""
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </a>
              );
            })}
            <span className={`h-4 w-px ${onDark ? "bg-white/20" : "bg-slate-200"}`} />
            {PAGE_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-[13px] font-medium uppercase tracking-wide transition-colors ${linkTone}`}
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
            className={onDark ? "text-white" : "text-gray-700"}
            aria-label="Toggle menu"
            style={{ minWidth: "auto", minHeight: "auto", padding: 0 }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 px-5 pb-5 pt-2">
            {SECTION_LINKS.map((l) => {
              const isActive = activeLink === l.id;
              return (
                <a
                  key={l.id}
                  href={`/#${l.id}`}
                  onClick={(e) => goToSection(e, l.id)}
                  className={`block w-full cursor-pointer border-b border-gray-100 py-3 text-left text-base font-medium ${
                    isActive ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
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
