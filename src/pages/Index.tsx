import SEO from "@/components/SEO";
import {
  faqSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/seoSchema";
import ScrollDrivenHero from "@/components/ScrollDrivenHero";
import IntegrationSection from "@/components/IntegrationSection";
import CTA from "@/components/CTA";
import ScrollReveal from "@/components/ScrollReveal";
import CapabilityCards from "@/components/CapabilityCards";
import ProblemStatementSection from "@/components/ProblemStatementSection";
import SolutionSections from "@/components/SolutionSections";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is Ventus AI?", a: "Ventus AI is an AI behavioral intelligence and personalization engine for financial institutions. It enriches transaction data and interprets it into five signal layers — spending habits, life events, financial signals, demographics, and risk — then activates them as personalized offers, products, rewards, and conversations." },
  { q: "What is behavioral intelligence in banking?", a: "Behavioral intelligence is the layer above transaction enrichment. Instead of labeling a single purchase, it interprets patterns across a customer's history to infer lifestyle, life events, financial obligations, and household context — the signals that determine what is relevant to that customer right now." },
  { q: "How is Ventus different from traditional enrichment providers?", a: "Traditional enrichment platforms clean and categorize transactions. Ventus understands them. We operate at the intent and life event layer, not the merchant-label layer, and every signal carries the transactions that justify it." },
  { q: "How does life event detection work?", a: "Ventus scores combinations of enriched transactions over time against life-event patterns such as home purchase, new child, college preparation, or relocation. Each detected event carries a confidence level and its underlying transaction evidence." },
  { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data and receive enriched intelligence through a simple API that routes into digital banking, CRM, campaign, rewards, and advisor workflows." },
  { q: "Is our data secure?", a: "Ventus is built on enterprise-grade cloud infrastructure with end-to-end encryption and complete data isolation between institutions. We never store PII — only anonymized transaction signals. SOC 2 certification is in progress." },
  { q: "Who is Ventus for?", a: "Built for banks and credit unions — specifically digital banking teams, rewards and loyalty teams, marketing and campaign teams, and wealth management divisions." },
];

const Index = ({ noindex = false }: { noindex?: boolean }) => {
  return (
    <div>
      <SEO
        title="Ventus AI — Behavioral Intelligence & Personalization for Banks"
        description="Ventus AI is an AI behavioral intelligence and personalization engine for banks and credit unions — transaction enrichment, life event detection, personalized rewards, and next-best offers."
        path={noindex ? "/classic" : "/"}
        noindex={noindex}
        keywords="AI behavioral intelligence, personalization engine for financial institutions, transaction data enrichment, life event detection banking, personalized rewards for banks, next best offer banking"
        jsonLd={noindex ? undefined : [organizationSchema, websiteSchema, softwareApplicationSchema, faqSchema(faqs)]}
      />
      <main className="flex flex-col">
        <ScrollDrivenHero />
        <ProblemStatementSection />

        {/* Capabilities — Four Signal Layers */}
        <section style={{ paddingTop: 80, paddingBottom: 80 }} className="bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                Five signal layers. Built from your transaction history.
              </h2>
            </ScrollReveal>
            <CapabilityCards />
          </div>
        </section>

        <SolutionSections />
        <IntegrationSection />

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

export default Index;
