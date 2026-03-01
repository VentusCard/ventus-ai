import Hero from "@/components/Hero";
import PlatformTabs from "@/components/PlatformTabs";
import BeforeAfterAnimation from "@/components/BeforeAfterAnimation";
import IntegrationSection from "@/components/IntegrationSection";
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
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                Traditional enrichment tells you what happened.{" "}
                <span className="text-blue-600">Ventus tells you what it means.</span>
              </h2>
              <p className="text-gray-500 mt-4 text-lg">
                Banks are sitting on the most predictive dataset in the world. Most are doing almost nothing with it.
              </p>
            </div>
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
          </div>
        </section>

        <PlatformTabs />

        {/* Differentiation Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                We don't label transactions.{" "}
                <span className="text-blue-600">We understand them.</span>
              </h2>
            </div>
            <BeforeAfterAnimation />
          </div>
        </section>

        <IntegrationSection />


        {/* FAQ */}
        <section id="faq" className="py-24 scroll-mt-20" style={{ background: "#f8f9fa" }}>
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {[
                { q: "What is Ventus AI?", a: "Ventus AI is a transaction intelligence platform for financial institutions. We go beyond basic enrichment, using AI to interpret transaction data and reveal consumer intent, behavior, and life events." },
                { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data and receive enriched intelligence through a simple API." },
                { q: "Is our data secure?", a: "Yes. Ventus operates on SOC 2 compliant infrastructure with VPC isolation, end-to-end encryption, and full audit logging." },
                { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
                { q: "How is Ventus different from MX or Plaid?", a: "MX and Plaid clean and categorize transactions. Ventus understands them. We operate at the intent and life event layer, not the merchant-label layer." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-lg px-4 border border-gray-200 transition-colors hover:bg-blue-50/50">
                  <AccordionTrigger className="text-left text-base text-gray-900">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-500">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a3a6e, #0f2456)" }}>
          {/* Floating orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full bg-blue-400/10 blur-3xl animate-[float-orb_8s_ease-in-out_infinite]" style={{ top: "10%", left: "10%" }} />
            <div className="absolute w-48 h-48 rounded-full bg-blue-300/10 blur-3xl animate-[float-orb_10s_ease-in-out_infinite_1s]" style={{ bottom: "10%", right: "15%" }} />
            <div className="absolute w-32 h-32 rounded-full bg-blue-500/10 blur-2xl animate-[float-orb_7s_ease-in-out_infinite_2s]" style={{ top: "50%", left: "60%" }} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
              Your transactions are already telling a story.
            </h2>
            <p className="text-xl text-blue-100 mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
              Ventus helps you listen.
            </p>
            <div className="opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-[#0f2456] hover:bg-gray-100 font-semibold">
                  Schedule a Demo
                </Button>
              </Link>
              <p className="text-blue-200/70 text-sm mt-4">
                No commitment. 30-minute walkthrough.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
