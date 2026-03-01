import Hero from "@/components/Hero";
import PlatformTabs from "@/components/PlatformTabs";
import BeforeAfterAnimation from "@/components/BeforeAfterAnimation";
import IntegrationSection from "@/components/IntegrationSection";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  return (
    <div>
      <main className="flex flex-col">
        <Hero />

        {/* Problem Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                Traditional enrichment tells you what happened.{" "}
                <span className="text-blue-600">Ventus tells you what it means.</span>
              </h2>
              <p className="text-gray-500 mt-4 text-lg">
                Banks are sitting on the most predictive dataset in the world. Most are doing almost nothing with it.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="space-y-4">
                {[
                  "Rewards catalogs show every customer the same deals. Redemption rates stay at 2%.",
                  "Life events go undetected until customers tell you. By then someone else is already there.",
                  "Wealth advisors walk into client meetings without knowing their client just put a deposit at a hospital.",
                ].map((pain, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl p-5 bg-white shadow-sm border border-gray-200"
                    style={{
                      opacity: 0,
                      animation: `slideInFromRight 0.5s ease-out ${i * 0.15}s forwards`,
                    }}
                  >
                    <span className="absolute top-3 left-3 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <p className="text-gray-600 leading-relaxed pl-4">{pain}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ScrollReveal>
          <PlatformTabs />
        </ScrollReveal>

        {/* Differentiation Section */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">How It Works</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                  We don't label transactions.{" "}
                  <span className="text-blue-600">We understand them.</span>
                </h2>
              </div>
            </ScrollReveal>
            <BeforeAfterAnimation />
          </div>
        </section>

        <IntegrationSection />

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-5 gap-16">
            <ScrollReveal className="md:col-span-2">
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">Frequently Asked Questions</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="md:col-span-3">
              <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
                {[
                  { q: "What is Ventus AI?", a: "Ventus AI is a transaction intelligence platform for financial institutions. We go beyond basic enrichment, using AI to interpret transaction data and reveal consumer intent, behavior, and life events." },
                  { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data and receive enriched intelligence through a simple API." },
                  { q: "Is our data secure?", a: "Yes. Ventus operates on SOC 2 compliant infrastructure with VPC isolation, end-to-end encryption, and full audit logging." },
                  { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
                  { q: "How is Ventus different from MX or Plaid?", a: "MX and Plaid clean and categorize transactions. Ventus understands them. We operate at the intent and life event layer, not the merchant-label layer." },
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-base text-gray-900 py-5">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-gray-500 pb-5">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <ScrollReveal>
          <section className="py-24" style={{ backgroundColor: '#f0f6ff' }}>
            <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your transactions are already telling a story.</h2>
              <p className="text-lg text-gray-500 mb-8">
                Built for forward-thinking financial institutions ready to turn data into their most valuable asset.
              </p>
              <p className="text-lg text-gray-500 mb-8">Ventus helps you listen.</p>
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Schedule a Demo
                </Button>
              </Link>
              <p className="text-sm text-gray-400 mt-4">No commitment. 30-minute walkthrough.</p>
            </div>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
};

export default Index;
