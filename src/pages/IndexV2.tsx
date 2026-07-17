import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import ScrollDrivenHeroV2 from "@/components/ScrollDrivenHeroV2";
import ScrollReveal from "@/components/ScrollReveal";
import ClosedLoopCircuit from "@/components/ClosedLoopCircuit";
import LedgerBand from "@/components/LedgerBand";
import SolutionSectionsV2 from "@/components/SolutionSectionsV2";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/v2-theme.css";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Home V2 — design-review candidate. Language: "ruled ledger paper" —
// warm paper with faint ruling, ink-only display type, mono for machine
// truth, one deep verify-green accent. Benchmarked against Modern
// Treasury / Taktile / Mercury; see src/styles/v2-theme.css. Compare with "/".

const faqs = [
  { q: "What is Ventus AI?", a: "Ventus turns raw transactions into governed Growth Plays — qualified customer moments that trigger controlled actions inside your existing workflows. Unlike enrichment vendors that stop at clean labels, Ventus measures the incremental outcome of every play against a holdout and records it in a Decision Ledger." },
  { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data and receive qualified moments, plays, and measured outcomes through a simple API." },
  { q: "Is our data secure?", a: "Ventus is built on enterprise-grade cloud infrastructure with end-to-end encryption and complete data isolation between institutions. We never store PII — only anonymized transaction signals. SOC 2 certification is in progress." },
  { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
];

const proofRows = [
  { capability: "Transaction → decision pipeline", status: "Demonstrated", live: true },
  { capability: "Plaid sandbox ingestion", status: "Live sandbox", live: true },
  { capability: "Salesforce Task delivery", status: "Live sandbox", live: true },
  { capability: "Outcome measurement vs. holdout", status: "Pilot-ready", live: false },
];

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
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded" style={{ backgroundColor: "var(--v2-ink)" }}>
            <span className="text-[13px] font-black leading-none text-white">V</span>
          </span>
          <span className="v2-display text-[17px] tracking-tight">Ventus</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {[
            ["Platform", "/platform"],
            ["Solutions", "/wealth"],
            ["Evidence", "#evidence"],
            ["FAQ", "#faq"],
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
        <Link to="/demo/enterprise" className="v2-btn !px-4 !py-2.5 !text-[13px]">
          Run the demo <ArrowRight className="h-3.5 w-3.5" />
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
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-white">
                <span className="text-[13px] font-black leading-none" style={{ color: "var(--v2-console)" }}>V</span>
              </span>
              <span className="v2-display text-[17px] text-white">Ventus</span>
            </div>
            <p className="v2-mono mt-4 max-w-sm text-[11px] leading-5" style={{ color: "var(--v2-console-faint)" }}>
              governed growth plays · measured lift · decision ledger
            </p>
          </div>
          <div className="flex gap-14">
            {[
              ["Product", [["Executive demo", "/demo/enterprise"], ["POC brief", "/ventus-poc-brief.html"], ["Platform", "/platform"]]],
              ["Company", [["Contact", "/contact"], ["Current home", "/"]]],
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
        path="/v2"
        noindex
      />
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Reviewer aid: this is the proposed redesign; the current page stays at "/". */}
      <div className="fixed bottom-4 left-4 z-50">
        <Link to="/" className="v2-mono flex items-center gap-2 rounded border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] shadow-lg backdrop-blur transition"
          style={{ borderColor: "rgba(154,100,0,0.35)", backgroundColor: "rgba(251,243,224,0.95)", color: "var(--v2-amber)" }}>
          Design preview · compare current <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <V2Nav />

      <main className="flex flex-col">
        <ScrollDrivenHeroV2 />

        {/* The gap — editorial statement on ruled paper. */}
        <section className="v2-ruled v2-rule-t" style={{ paddingTop: 104, paddingBottom: 104 }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <ScrollReveal>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]">
                <p className="v2-label">01 — The gap</p>
                <div>
                  <h2 className="v2-display text-3xl md:text-5xl">
                    Your bank knows what a customer spent.<br />
                    <span style={{ color: "var(--v2-ink-faint)" }}>Not why — and not what it's worth to act.</span>
                  </h2>
                  <p className="v2-body mt-6 max-w-2xl text-lg">
                    Enrichment vendors clean the label. Engagement platforms send the nudge.
                    Nobody closes the loop: detect the moment, take one governed action, and
                    prove the incremental dollars against a holdout. That loop is Ventus.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Detection — rail chips, mono, like clearing rails. */}
        <section className="v2-rule-t" style={{ paddingTop: 88, paddingBottom: 88, backgroundColor: "var(--v2-paper-raised)" }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <ScrollReveal>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]">
                <p className="v2-label">02 — Detection</p>
                <div>
                  <h2 className="v2-display text-3xl md:text-4xl">
                    Signals your transaction history already carries.
                  </h2>
                  <div className="mt-8 flex flex-wrap gap-2.5">
                    {detectionSignals.map((chip) => (
                      <span key={chip} className="v2-chip">{chip}</span>
                    ))}
                  </div>
                  <p className="v2-mono mt-5 text-[11px]" style={{ color: "var(--v2-ink-faint)" }}>
                    detected from permitted bank data · not clicks, not cookies
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ClosedLoopCircuit />
        <LedgerBand />
        <SolutionSectionsV2 />

        {/* Evidence — the honesty table as a ruled ledger. */}
        <section id="evidence" className="v2-ruled v2-rule-t" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <ScrollReveal>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
                <div>
                  <p className="v2-label">07 — Evidence</p>
                  <h2 className="v2-display mt-4 text-3xl md:text-4xl">
                    We label everything — live, demo, or pending a bank partner.
                  </h2>
                  <p className="v2-body mt-5 text-base">
                    Every number on this site and in our demo carries its truth state.
                    Ask us which is which — or read the evidence map yourself.
                  </p>
                  <a href="/ventus-poc-brief.html" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: "var(--v2-green)" }}>
                    Read the POC brief <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
                <div>
                  {proofRows.map((row) => (
                    <div key={row.capability} className="v2-row flex items-center justify-between gap-4 pb-5">
                      <span className="text-[15px] font-semibold" style={{ color: "var(--v2-ink)" }}>{row.capability}</span>
                      <span
                        className="v2-mono flex-none text-[11px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: row.live ? "var(--v2-green)" : "var(--v2-amber)" }}
                      >
                        {row.live ? "● " : "○ "}{row.status}
                      </span>
                    </div>
                  ))}
                  <div className="v2-rule-t" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="v2-rule-t scroll-mt-20" style={{ paddingTop: 88, paddingBottom: 88, backgroundColor: "var(--v2-paper-raised)" }}>
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
              <div className="lg:col-span-2">
                <ScrollReveal>
                  <p className="v2-label">08 — FAQ</p>
                  <h2 className="v2-display mt-4 text-3xl md:text-4xl">
                    Questions operators ask first.
                  </h2>
                </ScrollReveal>
              </div>
              <div className="lg:col-span-3">
                <ScrollReveal delay={0.1}>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} style={{ borderColor: "var(--v2-rule)" }}>
                        <AccordionTrigger className="py-5 text-left text-base font-semibold" style={{ color: "var(--v2-ink)" }}>{faq.q}</AccordionTrigger>
                        <AccordionContent className="v2-body pb-5 text-sm">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Close — proof-first. */}
        <section className="v2-ruled v2-rule-t" style={{ paddingTop: 112, paddingBottom: 112 }}>
          <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
            <ScrollReveal>
              <p className="v2-label">09 — Next step</p>
              <h2 className="v2-display mx-auto mt-5 max-w-3xl text-4xl md:text-6xl">
                Watch a transaction become a governed, measured action.
              </h2>
              <p className="v2-body mx-auto mt-6 max-w-xl text-lg">
                Four minutes, no deck. The demo runs the same pipeline, policy gates,
                and ledger we'd deploy in your perimeter.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link to="/demo/enterprise" className="v2-btn">
                  Run the demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="v2-btn-ghost">
                  Talk to us
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
