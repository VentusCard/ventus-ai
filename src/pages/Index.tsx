import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex flex-col">
        <Hero />

        {/* Problem Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-16 items-start">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              Traditional enrichment tells you what happened.{" "}
              <span className="text-blue-600">Ventus tells you what it means.</span>
            </h2>
            <div className="space-y-0">
              {[
                "Rewards catalogs show every customer the same deals. Redemption rates stay at 2%.",
                "Life events go undetected until customers tell you. By then someone else is already there.",
                "Wealth advisors walk into client meetings without knowing their client just put a deposit at a hospital.",
              ].map((pain, i) => (
                <p key={i} className={`text-gray-500 text-lg leading-relaxed py-5 ${i < 2 ? "border-b border-gray-200" : ""}`}>
                  {pain}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-14">One tech core. Four insight tools.</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Transaction Enrichment", desc: "Beyond merchant name cleaning. Ventus extracts lifestyle pillars, intent signals, and behavioral patterns from every transaction.", link: "/enrichment" },
                { title: "Smart Rewards", desc: "Stop showing everyone the same catalog. Ventus matches deals to customers based on actual behavior — life stage, spending velocity, and purchase cycle prediction.", link: "/smartrewards" },
                { title: "Customer Engagement", desc: "Hyper-targeted campaigns and micro-segments powered by real behavioral intelligence — not demographics.", link: "/engagement" },
                { title: "Wealth Management Copilot", desc: "AI-powered relationship intelligence for advisors. Detect life events before clients mention them and get AI-generated talking points before every meeting.", link: "/wealth" },
              ].map((card) => (
                <Link key={card.title} to={card.link} className="group">
                  <div className="border border-gray-200 rounded-2xl p-8 h-full transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{card.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiation Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-16 items-start">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              We don't label transactions.{" "}
              <span className="text-blue-600">We understand them.</span>
            </h2>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-6">
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Before</p>
                <p className="text-gray-500 text-lg">"This customer shops at REI"</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6">
                <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">After</p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  "Outdoor enthusiast approaching retirement, planning a summer trip, loyalty to their usual airline is decaying — serve the Delta miles offer today, the REI deal next week, and schedule a travel rewards card conversation this month."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Integration</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-14">Plug in. No infrastructure changes.</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { step: "01", title: "Connect", desc: "Bank drops transaction data via secure AWS S3. No changes to core banking systems." },
                { step: "02", title: "Enrich", desc: "Ventus AI detects lifestyle pillars, intent signals, and life events across 20+ categories in real time." },
                { step: "03", title: "Activate", desc: "Intelligence flows automatically into rewards personalization, analytics, and advisor relationship tools." },
              ].map((s) => (
                <div key={s.step}>
                  <p className="text-5xl font-bold text-gray-200 mb-4">{s.step}</p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {[
              { value: "20+", label: "Life events detected" },
              { value: "12", label: "Lifestyle pillars" },
              { value: "Real-time", label: "Enrichment" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "What is Ventus AI?", a: "Ventus AI is a transaction intelligence platform for financial institutions. We go beyond basic enrichment, using AI to interpret transaction data and reveal consumer intent, behavior, and life events." },
                { q: "How does it integrate with existing systems?", a: "Ventus requires no changes to your core banking infrastructure. Banks securely send transaction data to our AWS pipeline and receive enriched intelligence through a simple API." },
                { q: "Is our data secure?", a: "Yes. Ventus runs on AWS with SOC 2 compliant infrastructure, VPC isolation, end-to-end encryption, and full audit logging." },
                { q: "Who is Ventus for?", a: "Built for banks and financial institutions — specifically digital banking teams, rewards and loyalty teams, and wealth management divisions." },
                { q: "How is Ventus different from MX or Plaid?", a: "MX and Plaid clean and categorize transactions. Ventus understands them. We operate at the intent and life event layer, not the merchant-label layer." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base text-gray-900">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-500">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See it in action.</h2>
            <p className="text-lg text-gray-500 mb-8">
              Join the banks already using Ventus to turn transaction data into their most valuable asset.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Schedule a Demo
              </Button>
            </Link>
            <p className="text-sm text-gray-400 mt-6">
              Or explore the{" "}
              <Link to="/tepilot" className="text-blue-600 hover:underline">live demo</Link>
              {" "}at ventusai.com/tepilot
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
