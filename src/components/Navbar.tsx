import { useEffect, useState } from "react";
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

/** Section anchors tracked for the nav underline, in document order. */
const TRACKED_SECTIONS = ["intelligence", "personalization", "insights", "faq"];

const useActiveSection = (pathname: string) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(null);
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) {
          setActiveId(null);
          return;
        }
        // Only one item active at a time: the most visible tracked section.
        let best: string | null = null;
        let bestRatio = -1;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        setActiveId(best);
      },
      { rootMargin: "-72px 0px -40% 0px", threshold: [0, 0.05, 0.2, 0.5, 0.9] }
    );

    // Page content can mount after the nav (lazy routes), so poll briefly for anchors.
    const seen = new Set<string>();
    const attach = () => {
      for (const id of TRACKED_SECTIONS) {
        if (seen.has(id)) continue;
        const el = document.getElementById(id);
        if (el) {
          seen.add(id);
          observer.observe(el);
        }
      }
    };
    attach();
    const interval = window.setInterval(attach, 300);
    const stop = window.setTimeout(() => window.clearInterval(interval), 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
      observer.disconnect();
    };
  }, [pathname]);

  return activeId;
};


const navLinkClass =
  "relative cursor-pointer text-[13px] font-medium uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900";

const Underline = ({ active }: { active: boolean }) => (
  <span
    aria-hidden
    className="pointer-events-none absolute -bottom-[6px] left-0 h-[2px] rounded-full bg-blue-600 transition-[width] duration-200 ease-out"
    style={{ width: active ? "100%" : "0%" }}
  />
);


interface NavbarProps {
  offsetTop?: number;
}

const Navbar = ({ offsetTop = 16 }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHome = location.pathname === "/";
  const activeSection = useActiveSection(true);
  const activeId = isHome ? activeSection : location.pathname.replace("/", "");

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
    <div
      className="fixed left-0 right-0 z-50 px-4 md:px-6 transition-[top] duration-300"
      style={{ top: offsetTop }}
    >
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
              className={navLinkClass}
            >
              {l.label}
              <Underline active={activeId === l.id} />
            </a>
          ))}
          <Link to="/insights" className={navLinkClass}>
            Insights
            <Underline active={activeId === "insights"} />
          </Link>
          <span className="h-4 w-px bg-slate-200" />
          <Link to="/faq" className={navLinkClass}>
            FAQ
            <Underline active={activeId === "faq"} />
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
    </div>
  );
};

export default Navbar;
