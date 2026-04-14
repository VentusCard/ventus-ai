import ScrollDrivenHero from "@/components/ScrollDrivenHero";
import IntegrationSection from "@/components/IntegrationSection";
import CTA from "@/components/CTA";
import ScrollReveal from "@/components/ScrollReveal";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is Ventus AI?", a: "Ventus AI is a transaction intelligence platform for financial institutions. We go beyond basic enrichment, using AI to interpret transaction data and reveal consumer intent, behavior, and life events." },
  { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data and receive enriched intelligence through a simple API." },
  { q: "Is our data secure?", a: "Yes. Ventus operates on SOC 2 compliant infrastructure with VPC isolation, end-to-end encryption, and full audit logging." },
  { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
  { q: "How is Ventus different from traditional enrichment providers?", a: "Traditional enrichment platforms clean and categorize transactions. Ventus understands them. We operate at the intent and life event layer, not the merchant-label layer." },
];

const Index = () => {
  return (
    <div>
      <main className="flex flex-col">
        <ScrollDrivenHero />

        {/* Capabilities — Four Signal Layers */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                Four signal layers. Built from your transaction history.
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1 — Lifestyle Pillars */}
              <ScrollReveal>
                <div className="rounded-xl p-5 min-h-[200px]" style={{ background: "#0A1628" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-blue-400 mb-4">Lifestyle Pillars</p>
                  <div className="space-y-3 mb-4">
                    {[
                      { cat: "Travel & Exploration", amount: "$1,338", color: "#3b82f6" },
                      { cat: "Family & Community", amount: "$889", color: "#22c55e" },
                      { cat: "Sports & Fitness", amount: "$228", color: "#f59e0b" },
                    ].map(r => (
                      <div key={r.cat} className="flex items-center justify-between pl-3" style={{ borderLeft: `2px solid ${r.color}` }}>
                        <span className="text-white text-sm">{r.cat}</span>
                        <span className="text-white text-sm font-semibold">{r.amount}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">12 behavioral categories extracted from spending patterns</p>
                </div>
              </ScrollReveal>

              {/* Card 2 — Life Event Detection */}
              <ScrollReveal delay={0.1}>
                <div className="rounded-xl p-5 min-h-[200px]" style={{ background: "#0A1628" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 mb-4">Life Event Detection</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-white text-lg font-bold">● New Parent</span>
                    <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)" }}>95% confidence</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {["Buy Buy Baby   $234.50", "Pottery Barn Kids   $189.00", "Carter's   $124.50"].map(t => (
                      <p key={t} className="text-gray-500 text-xs font-mono">{t}</p>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">20+ life events detected in real time</p>
                </div>
              </ScrollReveal>

              {/* Card 3 — Well-being Signals */}
              <ScrollReveal delay={0.2}>
                <div className="rounded-xl p-5 min-h-[200px]" style={{ background: "#0A1628" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-purple-400 mb-4">Well-being Signals</p>
                  <div className="space-y-3 mb-4">
                    {[
                      { label: "Stable Income", dot: "#22c55e", prefix: "●" },
                      { label: "Building Emergency Fund", dot: "#3b82f6", prefix: "●" },
                      { label: "Increasing Discretionary Spend", dot: "#f59e0b", prefix: "↑" },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: r.dot }}>{r.prefix}</span>
                        <span className="text-white text-sm">{r.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">Financial wellness indicators from transaction behavior</p>
                </div>
              </ScrollReveal>

              {/* Card 4 — Purchase Cycle Intel */}
              <ScrollReveal delay={0.3}>
                <div className="rounded-xl p-5 min-h-[200px]" style={{ background: "#0A1628" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-orange-400 mb-4">Purchase Cycle Intel</p>
                  <p className="text-white text-lg font-bold mb-1">Next: Home Improvement</p>
                  <p className="text-gray-500 text-xs mb-3">78% confidence · within 30 days</p>
                  <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "#1e2d4a" }}>
                    <div className="h-full rounded-full" style={{ background: "#f97316", width: "78%" }} />
                  </div>
                  <p className="text-gray-500 text-xs">Surface intent signals before they become transactions</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>


        <IntegrationSection />

        {/* FAQ — Two Column */}
        <section id="faq" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Left column */}
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
              {/* Right column */}
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

export default Index;
