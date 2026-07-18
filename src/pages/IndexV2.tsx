import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import ScrollDrivenHeroV2 from "@/components/ScrollDrivenHeroV2";
import ScrollReveal from "@/components/ScrollReveal";
import PipelineConsole from "@/components/home/PipelineConsole";
import IntegrationProof from "@/components/home/IntegrationProof";
import CapabilityProofStrip from "@/components/home/CapabilityProofStrip";
import { GROWTH_PLAY_SCENARIOS, type GrowthPlayId } from "@/components/home/growthPlayScenarios";
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  Landmark,
  ShieldCheck,
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
    outcome: "Retain primary deposits",
    play: "Deposit Primacy Defense",
    Icon: Landmark,
  },
  {
    line: "Wealth Management",
    outcome: "Grow advised net new assets",
    play: "Qualified Wealth Growth",
    Icon: TrendingUp,
  },
  {
    line: "Small Business",
    outcome: "Deepen operating relationships",
    play: "Cash-Flow Growth",
    Icon: BriefcaseBusiness,
  },
  {
    line: "Cards & Payments",
    outcome: "Grow active card spend",
    play: "Spend & Rewards Growth",
    Icon: CreditCard,
  },
];

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
  const activePlay = GROWTH_PLAY_SCENARIOS[activePlayId];

  return (
    <div className="v2">
      <SEO
        title="Ventus AI — Governed Growth Plays with Measured Incremental Lift"
        description="Ventus turns raw transactions into governed Growth Plays — with holdouts, measured incremental lift, and a Decision Ledger — so banks grow with proof, not dashboards."
        path="/"
      />
      <V2Nav />

      <main className="flex flex-col">
        <ScrollDrivenHeroV2 />
        <CapabilityProofStrip />

        {/* Service-line map: each buyer sees the P&L outcome they own, while the
            shared operating layer establishes the bank-wide expansion path. */}
        <section id="growth-plays" className="v2-ruled v2-rule-t scroll-mt-16" style={{ paddingTop: 112, paddingBottom: 112 }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
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
                  Start with one business outcome. Expand on the same governed infrastructure.
                </p>
              </div>

              <div
                className="mt-10 overflow-hidden rounded-lg border bg-white/75 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
                style={{ borderColor: "var(--v2-rule)" }}
              >
                <div
                  className="hidden grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)] gap-6 border-b bg-[#F8FAFC] px-6 py-3 md:grid"
                  style={{ borderColor: "var(--v2-rule)" }}
                >
                  {["Business line", "Outcome owned", "Example Growth Play"].map((column) => (
                    <span
                      key={column}
                      className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--v2-ink-faint)" }}
                    >
                      {column}
                    </span>
                  ))}
                </div>

                {serviceLines.map(({ line, outcome, play, Icon }, index) => (
                  <div
                    key={line}
                    className="grid gap-4 border-b px-5 py-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-6 md:px-6 md:py-6"
                    style={{ borderColor: "var(--v2-rule)" }}
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-md border"
                        style={{
                          borderColor: index < 2 ? "rgba(72, 98, 230, 0.22)" : "var(--v2-rule)",
                          backgroundColor: index < 2 ? "var(--v2-blue-wash)" : "#F8FAFC",
                          color: index < 2 ? "var(--v2-blue)" : "var(--v2-ink-faint)",
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em] md:hidden"
                          style={{ color: "var(--v2-ink-faint)" }}
                        >
                          Business line
                        </p>
                        <p
                          className="mt-0.5 text-[15px] font-bold md:mt-0 md:text-[16px]"
                          style={{ color: "var(--v2-ink)" }}
                        >
                          {line}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 pl-[54px] md:pl-0">
                      <p
                        className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em] md:hidden"
                        style={{ color: "var(--v2-ink-faint)" }}
                      >
                        Outcome owned
                      </p>
                      <p className="v2-body mt-1 text-sm md:mt-0">{outcome}</p>
                    </div>

                    <div className="min-w-0 pl-[54px] md:pl-0">
                      <p
                        className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em] md:hidden"
                        style={{ color: "var(--v2-ink-faint)" }}
                      >
                        Example Growth Play
                      </p>
                      <p
                        className="mt-1 text-[12px] font-semibold md:mt-0 md:text-[13px]"
                        style={{ color: index < 2 ? "var(--v2-blue)" : "var(--v2-ink-soft)" }}
                      >
                        {play}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-3 bg-[#F8FAFC] px-5 py-4 md:items-center md:px-6">
                  <span
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-md border bg-white"
                    style={{ borderColor: "var(--v2-rule)", color: "var(--v2-verified)" }}
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--v2-ink-faint)" }}
                    >
                      Bank-wide control
                    </p>
                    <p className="mt-1 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
                      Financial stress pauses outreach before any play is activated.
                    </p>
                  </div>
                </div>
              </div>

              <p
                className="v2-mono mt-4 text-[10px]"
                style={{ color: "var(--v2-ink-faint)" }}
              >
                Growth Plays adapt to each bank&apos;s products, policies, and channels.
              </p>
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
