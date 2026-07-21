import { useEffect, useRef, useState } from "react";
import SEO from "@/components/SEO";
import ScrollDrivenHeroV2 from "@/components/ScrollDrivenHeroV2";
import ScrollReveal from "@/components/ScrollReveal";
import PipelineConsole from "@/components/home/PipelineConsole";
import IntegrationProof from "@/components/home/IntegrationProof";
import { GROWTH_PLAY_SCENARIOS, type GrowthPlayId } from "@/components/home/growthPlayScenarios";
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  Landmark,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";

import ImpactDeliveryConsole from "@/components/home/ImpactDeliveryConsole";

// Home V2 — design-review candidate. Language: "ruled ledger paper" —
// warm paper with faint ruling, ink-only display type, mono for machine
// truth, Ventus blue for action, and green for verified outcomes. Benchmarked against Modern
// Treasury / Taktile / Mercury; see src/styles/v2-theme.css. Compare with "/".

// Banks fund growth by service line. This map lets each buyer find the outcome
// they own while making the shared Ventus operating layer visible.
const serviceLines = [
  {
    line: "Consumer Banking",
    Icon: Landmark,
    priorities: [
      {
        outcome: "Retain primary deposits",
        play: "Deposit Primacy Defense",
        measure: "Deposits retained",
      },
      {
        outcome: "Grow household balances",
        play: "Liquidity Capture",
        measure: "Incremental balances",
      },
      {
        outcome: "Deepen primary relationships",
        play: "Relationship Expansion",
        measure: "Products per household",
      },
    ],
  },
  {
    line: "Wealth Management",
    Icon: TrendingUp,
    priorities: [
      {
        outcome: "Grow advised assets",
        play: "Qualified Wealth Growth",
        measure: "Net new assets",
      },
      {
        outcome: "Prevent asset outflow",
        play: "Asset-Movement Defense",
        measure: "Assets retained",
      },
      {
        outcome: "Increase advisor capacity",
        play: "Next-Best Conversation",
        measure: "Qualified conversions",
      },
    ],
  },
  {
    line: "Small Business",
    Icon: BriefcaseBusiness,
    priorities: [
      {
        outcome: "Grow operating deposits",
        play: "Cash-Flow Growth",
        measure: "Operating balances",
      },
      {
        outcome: "Expand payments relationships",
        play: "Merchant Services Attach",
        measure: "Fee revenue",
      },
      {
        outcome: "Surface financing needs",
        play: "Working-Capital Moments",
        measure: "Qualified originations",
      },
    ],
  },
  {
    line: "Cards & Payments",
    Icon: CreditCard,
    priorities: [
      {
        outcome: "Increase active spend",
        play: "Spend Re-engagement",
        measure: "Incremental spend",
      },
      {
        outcome: "Improve offer economics",
        play: "Offer Optimization",
        measure: "Incremental margin",
      },
      {
        outcome: "Reduce card attrition",
        play: "Card Relationship Defense",
        measure: "Active accounts retained",
      },
    ],
  },
];

const BUSINESS_LINE_SCROLL_START = 0.08;
const BUSINESS_LINE_SCROLL_END = 0.84;

function V2Nav() {
  // Apple pattern: the sticky nav's CTA appears only once the hero's own CTA
  // has scrolled away — never two identical buttons in one viewport.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b" style={{ borderColor: "var(--v2-rule)", backgroundColor: "rgba(250,249,246,0.9)", backdropFilter: "blur(8px)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link to="/" className="flex items-center">
          <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {[
            ["Platform", "/platform"],
            ["Growth Plays", "#growth-plays"],
            ["Integrations", "#integration"],
            ["Insights", "/insights"],
          ].map(([label, href]) =>
            href.startsWith("#") ? (
              <a key={label} href={href} className="text-[13px] font-semibold transition-colors hover:opacity-100" style={{ color: "var(--v2-ink-soft)" }}>
                {label}
              </a>
            ) : (
              <Link key={label} to={href} className="text-[13px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
                {label}
              </Link>
            ),
          )}
        </nav>
        <Link
          to="/contact"
          className="v2-btn !px-4 !py-2.5 !text-[13px]"
          style={{ opacity: scrolled ? 1 : 0, pointerEvents: scrolled ? "auto" : "none", transition: "opacity 300ms ease" }}
          tabIndex={scrolled ? 0 : -1}
          aria-hidden={!scrolled}
        >
          Schedule a demo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

function V2Footer() {
  return (
    <footer style={{ backgroundColor: "var(--v2-console)" }}>
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center">
              <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto brightness-0 invert" />
            </div>
            <p className="v2-mono mt-4 max-w-sm text-[11px] leading-5" style={{ color: "var(--v2-console-faint)" }}>
              governed growth plays · measured lift · decision ledger
            </p>
          </div>
          <div className="flex gap-14">
            {[
              ["Product", [["Platform", "/platform"], ["Growth Plays", "#growth-plays"], ["Integrations", "#integration"]]],
              ["Company", [["Insights", "/insights"], ["Contact", "/contact"]]],
            ].map(([group, links]) => (
              <div key={group as string}>
                <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-console-faint)" }}>{group as string}</p>
                <ul className="mt-3 space-y-2">
                  {(links as string[][]).map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith("#") ? (
                        <a href={href} className="text-[13px] font-medium text-white/80 transition hover:text-white">{label}</a>
                      ) : href.startsWith("/") && !href.endsWith(".html") ? (
                        <Link to={href} className="text-[13px] font-medium text-white/80 transition hover:text-white">{label}</Link>
                      ) : (
                        <a href={href} className="text-[13px] font-medium text-white/80 transition hover:text-white">{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t pt-6" style={{ borderColor: "var(--v2-console-line)" }}>
          <p className="v2-mono text-[10px] leading-5" style={{ color: "var(--v2-console-faint)" }}>
            © {new Date().getFullYear()} Ventus AI · Every number on this site carries its truth state — live, demo, or illustrative. No customer outcomes are claimed until verified against a holdout in a bank pilot.
          </p>
        </div>
      </div>
    </footer>
  );
}

const IndexV2 = () => {
  const [activePlayId, setActivePlayId] = useState<GrowthPlayId>("deposit");
  const [activeServiceLineIndex, setActiveServiceLineIndex] = useState(0);
  const serviceLineSectionRef = useRef<HTMLElement>(null);
  const activePlay = GROWTH_PLAY_SCENARIOS[activePlayId];
  const activeServiceLine = serviceLines[activeServiceLineIndex];

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    let animationFrame = 0;

    const syncServiceLineToScroll = () => {
      animationFrame = 0;
      const section = serviceLineSectionRef.current;
      if (!section || !desktop.matches) return;

      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1);
      const rawProgress = (64 - rect.top) / scrollRange;
      const progress = Math.min(
        Math.max(
          (rawProgress - BUSINESS_LINE_SCROLL_START)
            / (BUSINESS_LINE_SCROLL_END - BUSINESS_LINE_SCROLL_START),
          0,
        ),
        1,
      );
      const nextIndex = Math.min(
        serviceLines.length - 1,
        Math.floor(progress * serviceLines.length),
      );

      setActiveServiceLineIndex((current) => current === nextIndex ? current : nextIndex);
    };

    const requestSync = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(syncServiceLineToScroll);
      }
    };

    syncServiceLineToScroll();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Smooth scroll without snap: scroll-snap (even `proximity`) fights the wheel
  // and feels jerky, especially in reverse. We keep `scroll-behavior: smooth`
  // for anchor links but let the wheel scroll freely.
  useEffect(() => {
    const html = document.documentElement;
    const prev = {
      snapType: html.style.scrollSnapType,
      padTop: html.style.scrollPaddingTop,
      behavior: html.style.scrollBehavior,
    };
    html.style.scrollSnapType = "none";
    html.style.scrollPaddingTop = "64px";
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollSnapType = prev.snapType;
      html.style.scrollPaddingTop = prev.padTop;
      html.style.scrollBehavior = prev.behavior;
    };
  }, []);

  return (
    <div className="v2">
      <SEO
        title="Ventus AI — Governed Growth Plays with Measured Incremental Lift"
        description="Ventus turns raw transactions into governed Growth Plays — with holdouts, measured incremental lift, and a Decision Ledger — so banks grow with proof, not dashboards."
        path="/v2"
        noindex
      />
      <V2Nav />

      <main className="flex flex-col">
        <ScrollDrivenHeroV2 />

        {/* Service-line map: each buyer sees the P&L outcome they own, while the
            shared operating layer establishes the bank-wide expansion path. */}
        <section
          ref={serviceLineSectionRef}
          id="growth-plays"
          className="v2-ruled v2-rule-t scroll-mt-16 md:min-h-[280vh]"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 md:sticky md:top-16 md:px-8">
            <ScrollReveal>
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div className="max-w-4xl">
                  <p
                    className="v2-mono mb-4 text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: "var(--v2-blue)" }}
                  >
                    Bank-wide growth
                  </p>
                  <h2 className="v2-display text-3xl md:text-[56px]">
                    One decision loop.{" "}
                    <span style={{ color: "var(--v2-ink-faint)" }}>Across the bank.</span>
                  </h2>
                </div>
                <p className="v2-body max-w-md text-sm md:text-base lg:pb-1">
                  One governed layer. Multiple P&amp;L outcomes.
                </p>
              </div>

              <div
                className="mt-12 overflow-hidden rounded border bg-white/80"
                style={{
                  borderColor: "var(--v2-rule)",
                  boxShadow: "0 12px 36px rgba(15, 23, 42, 0.045)",
                }}
              >
                <div
                  className="grid grid-cols-2 border-b bg-[#F5F7FA] md:grid-cols-4"
                  style={{ borderColor: "var(--v2-rule)" }}
                  role="group"
                  aria-label="Bank business lines"
                >
                  {serviceLines.map(({ line, Icon }, index) => {
                    const active = index === activeServiceLineIndex;

                    return (
                      <button
                        key={line}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setActiveServiceLineIndex(index)}
                        className={[
                          "flex min-h-14 items-center gap-2.5 px-4 text-left transition-colors md:border-b-0",
                          index < 2 ? "border-b" : "",
                          index % 2 === 0 ? "border-r" : "",
                          index < serviceLines.length - 1 ? "md:border-r" : "md:border-r-0",
                        ].join(" ")}
                        style={{
                          borderColor: "var(--v2-rule)",
                          backgroundColor: active ? "white" : "transparent",
                          boxShadow: active ? "inset 0 -2px 0 var(--v2-blue)" : "none",
                          color: active ? "var(--v2-ink)" : "var(--v2-ink-soft)",
                        }}
                      >
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{ color: active ? "var(--v2-blue)" : "var(--v2-ink-faint)" }}
                        />
                        <span className="text-[12px] font-semibold sm:text-[13px]">{line}</span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="hidden grid-cols-[44px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-6 border-b px-6 py-3 md:grid"
                  style={{ borderColor: "var(--v2-rule)", backgroundColor: "#FCFCFB" }}
                >
                  <span aria-hidden="true" />
                  {["P&L priority", "Growth Play", "Success measure"].map((column) => (
                    <span
                      key={column}
                      className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--v2-ink-faint)" }}
                    >
                      {column}
                    </span>
                  ))}
                </div>

                <div key={activeServiceLine.line} className="animate-in fade-in duration-300">
                  {activeServiceLine.priorities.map(({ outcome, play, measure }, index) => (
                    <div
                      key={play}
                      className={[
                        "grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 gap-y-3 px-4 py-5 sm:grid-cols-[38px_minmax(0,1fr)] sm:px-5 md:grid-cols-[44px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)] md:items-center md:gap-6 md:px-6 md:py-5",
                        index < activeServiceLine.priorities.length - 1 ? "border-b" : "",
                      ].join(" ")}
                      style={{ borderColor: "var(--v2-rule)" }}
                    >
                      <span
                        className="v2-mono pt-0.5 text-[10px] font-semibold md:pt-0"
                        style={{ color: "var(--v2-ink-faint)" }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0">
                        <p
                          className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em] md:hidden"
                          style={{ color: "var(--v2-ink-faint)" }}
                        >
                          P&amp;L priority
                        </p>
                        <p
                          className="mt-1 text-[14px] font-semibold leading-5 md:mt-0"
                          style={{ color: "var(--v2-ink)" }}
                        >
                          {outcome}
                        </p>
                      </div>

                      <div className="col-start-2 min-w-0 md:col-start-auto">
                        <p
                          className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em] md:hidden"
                          style={{ color: "var(--v2-ink-faint)" }}
                        >
                          Growth Play
                        </p>
                        <p className="mt-1 text-[13px] font-semibold md:mt-0" style={{ color: "var(--v2-blue)" }}>
                          {play}
                        </p>
                      </div>

                      <div className="col-start-2 min-w-0 md:col-start-auto">
                        <p
                          className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em] md:hidden"
                          style={{ color: "var(--v2-ink-faint)" }}
                        >
                          Success measure
                        </p>
                        <p className="mt-1 text-[12px] font-medium leading-5 md:mt-0" style={{ color: "var(--v2-ink-soft)" }}>
                          {measure}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* The loop — shown as a live console, not four text cards. */}
        <PipelineConsole
          scenario={activePlay}
          activePlayId={activePlayId}
          onPlayChange={setActivePlayId}
        />

        <ImpactDeliveryConsole scenario={activePlay} />

        <IntegrationProof />

        {/* One public conversion path — and the business model, stated plainly. */}
        <section className="v2-ruled v2-rule-t" style={{ paddingTop: 144, paddingBottom: 144 }}>
          <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
            <ScrollReveal>
              <h2 className="v2-display mx-auto max-w-3xl text-4xl md:text-[64px]">Make every decision measurable.</h2>
              <p className="v2-body mx-auto mt-7 max-w-xl text-base md:text-lg">
                We build the first deployment with you — a fixed-fee pilot, measured
                against your holdout, in your perimeter.
              </p>
              <div className="mt-9 flex justify-center">
                <Link to="/contact" className="v2-btn">
                  Schedule a demo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <V2Footer />
    </div>
  );
};

export default IndexV2;
