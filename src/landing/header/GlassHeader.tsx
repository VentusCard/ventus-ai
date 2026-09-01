import { MouseEvent, useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusWordmark from "@/assets/ventus-logo-transparent.png";
import { useReducedMotion } from "@/landing/useReducedMotion";
import { landingCopy } from "@/landing/copy";

const sections = landingCopy.navigation.sections;

type SectionId = (typeof sections)[number]["id"];

interface GlassHeaderProps {
  onRequestAccess: (trigger: HTMLButtonElement) => void;
}

export function GlassHeader({ onRequestAccess }: GlassHeaderProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = sections.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    if (!("IntersectionObserver" in window) || nodes.length === 0) return;

    const updateActiveSection = () => {
      const marker = window.innerHeight * 0.34;
      const candidates = nodes.filter((node) => node.getBoundingClientRect().top <= marker);
      const current = candidates[candidates.length - 1];
      setActiveSection(current ? current.id as SectionId : null);
    };

    const observer = new IntersectionObserver(
      updateActiveSection,
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.2, 0.6] },
    );

    nodes.forEach((node) => observer.observe(node));
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveSection(id);
    setMenuOpen(false);
  };

  return (
    <header className={`landing-header ${scrolled ? "is-scrolled" : ""} ${activeSection === "activation" ? "is-over-mineral" : ""} ${menuOpen ? "is-menu-open" : ""}`} data-glass-region="header">
      <div className="landing-header__bar">
        <a className="landing-header__brand" href="#top" aria-label={landingCopy.navigation.homeAriaLabel}>
          <img src={ventusWordmark} alt={landingCopy.brandName} />
        </a>

        <nav className="landing-header__nav" aria-label={landingCopy.navigation.ariaLabel}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => navigate(event, section.id)}
              className={activeSection === section.id ? "is-active" : ""}
              aria-current={activeSection === section.id ? "location" : undefined}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="landing-header__actions">
          <Button className="landing-button landing-button--header" onClick={(event) => onRequestAccess(event.currentTarget)}>{landingCopy.navigation.cta}</Button>
          <button
            type="button"
            className="landing-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={landingCopy.navigation.menuAriaLabel}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav id="landing-mobile-nav" className="landing-header__mobile-nav" aria-label={landingCopy.navigation.mobileAriaLabel}>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => navigate(event, section.id)}
            className={activeSection === section.id ? "is-active" : ""}
            aria-current={activeSection === section.id ? "location" : undefined}
          >
            <span>{section.label}</span>
            <ArrowRight aria-hidden="true" />
          </a>
        ))}
      </nav>
    </header>
  );
}
