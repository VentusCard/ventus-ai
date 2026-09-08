import { COMPANY_FAQS } from "@/lib/faqContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeFAQSection = () => (
  <section id="faq" className="scroll-mt-[96px] bg-white py-16 md:py-20">
    <div className="mx-auto max-w-2xl px-6 md:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">FAQ</p>
      <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="mt-8 w-full">
        {COMPANY_FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`home-faq-${i}`} className="border-b border-gray-200">
            <AccordionTrigger className="py-4 text-left text-base text-gray-900">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-gray-500">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default HomeFAQSection;
