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
  { q: "Is our data secure?", a: "Ventus is built on enterprise-grade cloud infrastructure with end-to-end encryption and complete data isolation between institutions. We never store PII — only anonymized transaction signals. SOC 2 certification is in progress." },
  { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
  { q: "How is Ventus different from traditional enrichment providers?", a: "Traditional enrichment platforms clean and categorize transactions. Ventus understands them. We operate at the intent and life event layer, not the merchant-label layer." },
];

const FAQ = () => {
  return (
    <div>
      <main>
        {/* Hero */}
        <section className="pt-40 pb-16 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-4">FAQ</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Frequently Asked{"\n"}Questions
              </h1>
              <p className="mt-5 text-gray-500 text-lg max-w-xl mx-auto">
                Here are the questions operators ask most often before getting started with Ventus.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Accordion */}
        <section className="pb-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <ScrollReveal delay={0.15}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-lg text-gray-900 py-5">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-gray-500 text-base pb-5">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FAQ;
