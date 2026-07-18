import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import ScrollDrivenHeroV2 from "@/components/ScrollDrivenHeroV2";
import ScrollReveal from "@/components/ScrollReveal";
import PipelineConsole from "@/components/home/PipelineConsole";
import IntegrationProof from "@/components/home/IntegrationProof";
import CapabilityProofStrip from "@/components/home/CapabilityProofStrip";
import { GROWTH_PLAY_SCENARIOS, type GrowthPlayId } from "@/components/home/growthPlayScenarios";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";

import ImpactDeliveryConsole from "@/components/home/ImpactDeliveryConsole";

// Home V2 — design-review candidate. Language: "ruled ledger paper" —
// warm paper with faint ruling, ink-only display type, mono for machine
// truth, Ventus blue for action, and green for verified outcomes. Benchmarked against Modern
// Treasury / Taktile / Mercury; see src/styles/v2-theme.css. Compare with "/".

// The section is the land-and-expand map: rows are service lines (how banks
// budget and buy), two carry live example plays, the rest are honestly staged.
// After a pilot, the Status column starts filling with verified lift — the
// same artifact ages from roadmap into track record.
const serviceLines: Array<{ line: string; metric: string; play: string | null; playId?: GrowthPlayId }> = [
  { line: "Consumer Banking", metric: "Primary deposits retained", play: "Deposit Primacy Defense", playId: "deposit" },
  { line: "Wealth Management", metric: "Advised net new assets", play: "Relationship Growth", playId: "wealth" },
  { line: "Small Business", metric: "Operating relationships deepened", play: null },
  { line: "Cards & Payments", metric: "Engaged spend", play: null },
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

        {/* Service-line ledger: buyers are line executives — each finds their own
            P&L in a row, while the drawn handoff between lines carries the
            One-Bank vision no single team can own. Ages into a proof table. */}
        <section id="growth-plays" className="v2-ruled v2-rule-t scroll-mt-16" style={{ paddingTop: 112, paddingBottom: 112 }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <ScrollReveal>
              <h2 className="v2-display max-w-4xl text-3xl md:text-[56px]">
                One decision loop.{" "}
                <span style={{ color: "var(--v2-ink-faint)" }}>Every line of business.</span>
              </h2>
              <p className="v2-body mt-5 max-w-2xl text-base md:text-lg">
                Land it in one P&amp;L. Extend it across the bank — including the
                handoffs no single team owns.
              </p>

              <div className="mt-10">
                <div className="hidden gap-4 border-b pb-2.5 sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(150px,auto)]" style={{ borderColor: "var(--v2-rule)" }}>
                  {["Line of business", "The number they own", "Growth play", "Status"].map((col) => (
                    <span key={col} className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>{col}</span>
                  ))}
                </div>

                {serviceLines.map((row, index) => {
                  const rowInner = (
                    <>
                      <span className="text-[16px] font-bold" style={{ color: "var(--v2-ink)" }}>{row.line}</span>
                      <span className="v2-body text-sm">{row.metric}</span>
                      <span className="v2-mono text-[11px] font-medium" style={{ color: row.playId ? "var(--v2-ink)" : "var(--v2-ink-faint)" }}>
                        {row.play ?? "—"}
                      </span>
                      {row.playId ? (
                        <span className="text-[13px] font-semibold sm:text-right" style={{ color: "var(--v2-blue)" }}>
                          See the play ↓
                        </span>
                      ) : (
                        <span className="v2-mono text-[10px] font-semibold uppercase tracking-[0.1em] sm:text-right" style={{ color: "var(--v2-ink-faint)" }}>
                          In design · founding partner
                        </span>
                      )}
                    </>
                  );
                  const rowClass = "grid grid-cols-1 gap-1.5 border-b py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(150px,auto)] sm:items-baseline sm:gap-4";
                  return (
                    <div key={row.line}>
                      {row.playId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePlayId(row.playId!);
                            document.getElementById("loop")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={`${rowClass} w-full text-left transition-colors hover:bg-white`}
                          style={{ borderColor: "var(--v2-rule)" }}
                        >
                          {rowInner}
                        </button>
                      ) : (
                        <div className={rowClass} style={{ borderColor: "var(--v2-rule)" }}>
                          {rowInner}
                        </div>
                      )}

                      {/* The seam is the vision: a drawn edge from Consumer Banking
                          into Wealth Management — the cross-line handoff. */}
                      {index === 0 && (
                        <div className="relative flex items-start gap-3 border-b py-4 pl-8 sm:pl-14" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-blue-wash)" }}>
                          <svg width="14" height="46" viewBox="0 0 14 46" className="absolute left-3 top-0 sm:left-7" aria-hidden="true">
                            <path d="M7 0 V34" stroke="var(--v2-blue)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                            <path d="M3 30 L7 37 L11 30" fill="none" stroke="var(--v2-blue)" strokeWidth="1.5" />
                          </svg>
                          <div className="min-w-0">
                            <span className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-blue)" }}>
                              The handoff
                            </span>
                            <p className="v2-body mt-1 text-sm">
                              A consumer signal becomes an advisor action — the play no
                              single line can run alone.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Financial health is a guardrail, not a campaign — the sentence a
                  bank risk officer remembers. */}
              <div className="mt-7 flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" style={{ color: "var(--v2-verified)" }} />
                <p className="v2-body max-w-2xl text-sm">
                  Financial health is a control, not a campaign: stress and vulnerability
                  signals <span className="font-semibold" style={{ color: "var(--v2-ink)" }}>suppress</span> plays
                  — they never trigger offers.
                </p>
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
