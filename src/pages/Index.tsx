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
import { COMPANY_FAQS } from "@/lib/faqContent";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


const Index = ({ noindex = false }: { noindex?: boolean }) => {
  return (
    <div>
      <SEO
        title="Ventus AI — Behavioral Intelligence & Personalization for Banks"
        description="Ventus AI is a behavioral intelligence and personalization engine for financial institutions — spending, financial, and life-event signals from multi-rail bank data plus national data partnerships, orchestrated into the systems banks already run."
        path={noindex ? "/classic" : "/"}
        noindex={noindex}
        keywords="behavioral intelligence, personalization engine for financial institutions, behavioral enrichment, multi-rail transaction data, life event detection banking, personalized rewards for banks, next best offer banking, card linked offer redemption, interchange growth"
        jsonLd={noindex ? undefined : [organizationSchema, websiteSchema, softwareApplicationSchema, faqSchema(COMPANY_FAQS)]}
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
                    What Ventus AI does, where the signal comes from, how it plugs into the systems you already run, and what it moves.
                  </p>
                </ScrollReveal>
              </div>
              <div className="lg:col-span-3">
                <ScrollReveal delay={0.1}>
                  <Accordion type="single" collapsible className="w-full">
                    {COMPANY_FAQS.map((faq, i) => (
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
