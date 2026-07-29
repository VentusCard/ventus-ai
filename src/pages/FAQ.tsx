import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
        description="How Ventus AI extracts spending, financial, and life-event signals from multi-rail bank data and national data partnerships — and what interchange, redemption, product growth, and retention gains to expect."
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
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-40 pb-16 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-4">FAQ</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Frequently Asked Questions
              </h1>
              <p className="mt-5 text-gray-500 text-lg max-w-xl mx-auto">
                What Ventus AI does, where the signal comes from, how it plugs into the systems you
                already run, and what it moves.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Accordion */}
        <section className="pb-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <ScrollReveal delay={0.15}>
              <Accordion type="single" collapsible className="w-full">
                {COMPANY_FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-lg text-gray-900 py-5">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-gray-500 text-base pb-5 leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
