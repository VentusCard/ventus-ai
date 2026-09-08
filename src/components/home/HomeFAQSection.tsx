import { COMPANY_FAQS } from "@/lib/faqContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeFAQSection = () => (
  <section id="faq" className="scroll-mt-24 bg-white py-24 md:py-28">
    <div className="mx-auto max-w-3xl px-6 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">FAQ</p>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="mt-10 w-full">
        {COMPANY_FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`home-faq-${i}`} className="border-b border-gray-200">
            <AccordionTrigger className="py-5 text-left text-lg text-gray-900">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-gray-500">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default HomeFAQSection;
