import { COMPANY_FAQS } from "@/lib/faqContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeFAQSection = () => (
  <section id="faq" className="scroll-mt-[96px] bg-white py-16 md:py-20">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:px-8 lg:grid-cols-2 lg:gap-16">
      <div className="lg:max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">FAQ</p>
        <h2 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-[42px]">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-600">
          What Ventus AI does, where the signal comes from, how it plugs into the systems you
          already run, and what it moves.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {COMPANY_FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`home-faq-${i}`} className="border-b border-slate-200">
            <AccordionTrigger className="py-4 text-left text-base font-medium text-slate-900 hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-600">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default HomeFAQSection;
