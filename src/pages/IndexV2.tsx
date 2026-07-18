import SEO from "@/components/SEO";
import ScrollDrivenHeroV2 from "@/components/ScrollDrivenHeroV2";
import ScrollReveal from "@/components/ScrollReveal";
import PipelineConsole from "@/components/home/PipelineConsole";
import DeviceDuo from "@/components/home/DeviceDuo";
import IntegrationProof from "@/components/home/IntegrationProof";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";

// Home V2 — design-review candidate. Language: "ruled ledger paper" —
// warm paper with faint ruling, ink-only display type, mono for machine
// truth, Ventus blue for action, and green for verified outcomes. Benchmarked against Modern
// Treasury / Taktile / Mercury; see src/styles/v2-theme.css. Compare with "/".

const detectionSignals = [
  "LIFE_EVENT",
  "PURCHASE_INTENT",
  "TRAVEL_WINDOW",
  "SEASONAL_RHYTHM",
  "FINANCIAL_STRESS",
];

function V2Nav() {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ borderColor: "var(--v2-rule)", backgroundColor: "rgba(250,249,246,0.9)", backdropFilter: "blur(8px)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link to="/" className="flex items-center">
          <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {[
            ["How it works", "#loop"],
            ["Solutions", "/wealth"],
            ["Integration", "#integration"],
          ].map(([label, href]) =>
            href.startsWith("#") ? (
              <a key={label} href={href} className="v2-mono text-[12px] font-medium tracking-[0.08em] uppercase transition-colors hover:opacity-100" style={{ color: "var(--v2-ink-soft)" }}>
                {label}
              </a>
            ) : (
              <Link key={label} to={href} className="v2-mono text-[12px] font-medium tracking-[0.08em] uppercase" style={{ color: "var(--v2-ink-soft)" }}>
                {label}
              </Link>
            ),
          )}
        </nav>
        <Link to="/contact" className="v2-btn !px-4 !py-2.5 !text-[13px]">
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
              ["Product", [["Platform", "/platform"], ["Enterprise demo", "/demo/enterprise"], ["POC brief", "/ventus-poc-brief.html"]]],
              ["Company", [["Contact", "/contact"]]],
            ].map(([group, links]) => (
              <div key={group as string}>
                <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-console-faint)" }}>{group as string}</p>
                <ul className="mt-3 space-y-2">
                  {(links as string[][]).map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith("/") && !href.endsWith(".html") ? (
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

        {/* The gap — one editorial statement, then the page gets out of the way. */}
        <section className="v2-ruled v2-rule-t" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <ScrollReveal>
              <h2 className="v2-display max-w-4xl text-3xl md:text-5xl">
                Your bank knows what a customer spent.{" "}
                <span style={{ color: "var(--v2-ink-faint)" }}>Not what it's worth to act.</span>
              </h2>
              <div className="mt-10 flex flex-wrap gap-2.5">
                {detectionSignals.map((chip) => (
                  <span key={chip} className="v2-chip">{chip}</span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* The loop — shown as a live console, not four text cards. */}
        <PipelineConsole />

        {/* The play at aggregate and employee-workflow levels. */}
        <DeviceDuo />

        <IntegrationProof />

        {/* Close — positive differentiation with a direct product proof path. */}
        <section className="v2-ruled v2-rule-t" style={{ paddingTop: 104, paddingBottom: 104 }}>
          <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
            <ScrollReveal>
              <h2 className="v2-display mx-auto max-w-3xl text-4xl md:text-6xl">
                Enrichment explains the transaction.
                <br />
                Ventus proves the next best action.
              </h2>
              <p className="v2-body mx-auto mt-6 max-w-xl text-lg">
                Connect one sanctioned data stream. Run one governed Growth Play. Measure the lift.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact" className="v2-btn">
                  Schedule a demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/demo/enterprise" className="v2-btn-ghost">
                  <PlayCircle className="h-4 w-4" /> See the operating loop
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
