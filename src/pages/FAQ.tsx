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

const FAQ = () => {
  return (
    <div>
      <main>
        <section className="pt-32 pb-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-5 gap-16">
            <ScrollReveal className="md:col-span-2">
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">FAQ</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">Frequently Asked Questions</h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="md:col-span-3">
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
