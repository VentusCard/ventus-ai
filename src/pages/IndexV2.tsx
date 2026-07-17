import SEO from "@/components/SEO";
import ScrollDrivenHeroV2 from "@/components/ScrollDrivenHeroV2";
import IntegrationSection from "@/components/IntegrationSection";
import CTA from "@/components/CTA";
import ScrollReveal from "@/components/ScrollReveal";
import ClosedLoopCircuit from "@/components/ClosedLoopCircuit";
import LedgerBand from "@/components/LedgerBand";
import ProblemStatementSection from "@/components/ProblemStatementSection";
import SolutionSectionsV2 from "@/components/SolutionSectionsV2";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Home V2 — design-review candidate for the next ventusai.com home page.
// Repositioned around governed Growth Plays + measured lift, with the
// "governed console" language shared with the POC (src/lib/theme.ts):
// a live Decision Ledger band, an animated closed loop, and honesty chips
// on every illustrative number. Compare side by side with "/".

const faqs = [
  { q: "What is Ventus AI?", a: "Ventus turns raw transactions into governed Growth Plays — qualified customer moments that trigger controlled actions inside your existing workflows. Unlike enrichment vendors that stop at clean labels, Ventus measures the incremental outcome of every play against a holdout and records it in a Decision Ledger." },
  { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data and receive qualified moments, plays, and measured outcomes through a simple API." },
  { q: "Is our data secure?", a: "Ventus is built on enterprise-grade cloud infrastructure with end-to-end encryption and complete data isolation between institutions. We never store PII — only anonymized transaction signals. SOC 2 certification is in progress." },
  { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
];

// Radical honesty as social proof: we label what's live, demo, or pending —
// the one credibility move an incumbent can't copy without admitting what they fake.
const proofRows = [
  { capability: "Transaction → decision pipeline", status: "Demonstrated", tone: "live" },
  { capability: "Plaid sandbox ingestion", status: "Live sandbox", tone: "live" },
  { capability: "Salesforce Task delivery", status: "Live sandbox", tone: "live" },
  { capability: "Outcome measurement vs. holdout", status: "Pilot-ready", tone: "pending" },
] as const;

const IndexV2 = () => {
  return (
    <div>
      <SEO
        title="Ventus AI — Governed Growth Plays with Measured Incremental Lift"
        description="Ventus turns raw transactions into governed Growth Plays — with holdouts, measured incremental lift, and a Decision Ledger — so banks grow with proof, not dashboards."
        path="/v2"
        noindex
      />
      {/* Reviewer aid: this is the proposed redesign; the current page stays at "/". */}
      <div className="fixed bottom-4 left-4 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/95 px-3.5 py-2 text-[11px] font-bold text-amber-900 shadow-lg backdrop-blur transition hover:bg-amber-100"
        >
          Design preview · compare with current home <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <main className="flex flex-col">
        <ScrollDrivenHeroV2 />
        <ProblemStatementSection />

        {/* What Ventus detects — tight signal strip */}
        <section style={{ paddingTop: 64, paddingBottom: 64 }} className="bg-white relative z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Detection</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                What Ventus detects in your transaction history.
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "Life events",
                  "Purchase intent",
                  "Travel windows",
                  "Seasonal rhythms",
                  "Financial stress",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ClosedLoopCircuit />
        <LedgerBand />

        <SolutionSectionsV2 />
        <IntegrationSection />

        {/* What is proven today — honesty strip */}
        <section style={{ paddingTop: 64, paddingBottom: 64 }} className="bg-gray-50 relative z-10 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Evidence, not aspiration</p>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    We label everything — live, demo, or pending a bank partner.
                  </h2>
                  <p className="text-base text-gray-500 leading-relaxed">
                    Every number on this site and in our demo carries its truth state. Ask us
                    which is which — or read the evidence map yourself.{" "}
                    <a href="/ventus-poc-brief.html" className="font-semibold text-blue-600 hover:text-blue-700">
                      Read the POC brief →
                    </a>
                  </p>
                </div>
                <div className="grid gap-2">
                  {proofRows.map((row) => (
                    <div key={row.capability} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-gray-800">{row.capability}</span>
                      <span
                        className={`flex-none rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          row.tone === "live"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ — Two Column */}
        <section id="faq" style={{ paddingTop: 80, paddingBottom: 80 }} className="bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              <div className="lg:col-span-2">
                <ScrollReveal>
                  <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-4">FAQ</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed">
                    Here are the questions operators ask most often before getting started with Ventus.
                  </p>
                </ScrollReveal>
              </div>
              <div className="lg:col-span-3">
                <ScrollReveal delay={0.1}>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-200">
                        <AccordionTrigger className="text-left text-base text-gray-900 py-5">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-gray-500 text-sm pb-5">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        <CTA />
      </main>
    </div>
  );
};

export default IndexV2;
