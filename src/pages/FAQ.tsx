import ScrollReveal from "@/components/ScrollReveal";
import SEO from "@/components/SEO";
import { faqSchema, breadcrumbSchema } from "@/lib/seoSchema";
import { COMPANY_FAQS } from "@/lib/faqContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="bg-white">
      <SEO
        title="Ventus AI FAQ — Behavioral Intelligence for Financial Institutions"
        description="How Ventus AI extracts spending, financial, and life-event signals from bank data — and the interchange, redemption, and retention gains to expect."
        path="/faq"
        keywords="behavioral intelligence banking FAQ, bank personalization engine, life event detection banking, transaction data enrichment, interchange lift, card linked offer redemption"
        jsonLd={[
          faqSchema(COMPANY_FAQS),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
      <main>
        <section className="pt-44 md:pt-48 pb-16 md:pb-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-20">
              <div>
                <div className="lg:sticky lg:top-32 lg:self-start">
                  <p className="animate-fade-in-down text-xs font-semibold tracking-widest text-blue-600 uppercase mb-4" style={{ animationDelay: "0ms", animationFillMode: "backwards" }}>FAQ</p>
                  <h1 className="animate-fade-in-down text-4xl md:text-5xl font-bold text-gray-900 leading-tight" style={{ animationDelay: "80ms", animationFillMode: "backwards" }}>
                    Frequently Asked Questions
                  </h1>
                  <p className="animate-fade-in-down mt-5 text-gray-500 text-lg max-w-md" style={{ animationDelay: "160ms", animationFillMode: "backwards" }}>
                    What Ventus AI does, where the signal comes from, how it plugs into the systems you
                    already run, and what it moves.
                  </p>
                </div>
              </div>

              <div>
                <Accordion type="single" collapsible className="animate-fade-in-down w-full" style={{ animationDelay: "240ms", animationFillMode: "backwards" }}>
                  {COMPANY_FAQS.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-200">
                      <AccordionTrigger className="text-left text-lg text-gray-900 py-5">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-gray-500 text-base pb-5 leading-relaxed">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FAQ;
