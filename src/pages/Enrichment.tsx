import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import EnrichmentHeroCard from "@/components/enrichment/EnrichmentHeroCard";
import VentusTransactionEnrichment from "@/components/technology/demos/VentusTransactionEnrichment";
import { Layers, Search, Heart, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const capabilities = [
  { icon: Layers, title: "Lifestyle Pillars", desc: "12 behavioral categories extracted from spending patterns. From Travel & Adventure to Financial Planning." },
  { icon: Heart, title: "Life Event Detection", desc: "20+ life events detected in real time. New baby, home purchase, retirement, relocation, and more." },
  { icon: Activity, title: "Travel Detection", desc: "Destinations, loyalty programs, hotel patterns, and travel frequency tracked across every transaction." },
  { icon: Search, title: "Intent Signals", desc: "What is this customer planning to do next? We detect purchase intent before it becomes a transaction." },
];

const integrationSteps = [
  { step: "01", title: "Connect", desc: "Banks securely send transaction data through a simple integration. No changes to core banking systems." },
  { step: "02", title: "Enrich", desc: "Ventus AI detects lifestyle pillars, intent signals, and life events across 20+ categories in real time." },
  { step: "03", title: "Activate", desc: "Intelligence flows automatically into rewards personalization, analytics, and advisor relationship tools." },
];

const Enrichment = () => {
  const [integrationVisible, setIntegrationVisible] = useState(false);
  const integrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = integrationRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIntegrationVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollToDemo = () => {
    document.getElementById("enrichment-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <main>
        {/* SECTION 1 — HERO */}
        <section className="min-h-screen flex items-center pt-16" style={{ background: "#0a0f1e" }}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Transaction Enrichment</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-tight mb-6">
                From raw transaction to consumer intelligence.{" "}
                <span className="text-blue-400">In milliseconds.</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                Ventus builds rich behavioral profiles from your customers' rolling transaction history — extracting lifestyle pillars, intent signals, and life events without touching your core infrastructure.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Schedule Demo
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-white/10 hover:text-white"
                  onClick={scrollToDemo}
                >
                  See It Work ↓
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <EnrichmentHeroCard />
            </div>
          </div>
        </section>

        {/* SECTION 2 — THE PROBLEM */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-3xl mb-12">
                Most banks are sitting on the world's most predictive dataset.{" "}
                <span className="text-blue-600">Almost none of them can read it.</span>
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Your rewards team is sending the same catalog to a 28-year-old planning a wedding and a 62-year-old planning retirement.",
                "A customer just made a $50k down payment. Your wealth advisor found out when they called to complain about fees.",
                "You can see that someone shops at REI. You cannot see that they are about to book a $4,000 Alaska trip and need travel insurance.",
              ].map((pain, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="relative rounded-xl p-6 bg-white shadow-md border border-gray-100 h-full">
                    <span className="absolute top-4 left-4 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <p className="text-gray-600 leading-relaxed pl-4 pt-2">{pain}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3 — INTERACTIVE DEMO (How It Works) */}
        <section id="enrichment-demo" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">See the engine in action.</h2>
              <p className="text-gray-500 text-lg mb-10 max-w-2xl">
                Watch how Ventus builds a behavioral profile from a real customer's transaction history — updated with every new purchase.
              </p>
            </ScrollReveal>
            <VentusTransactionEnrichment />
          </div>
        </section>

        {/* SECTION 5 — CAPABILITIES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                Four signal layers. Built from your transaction history.
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              {capabilities.map((cap, i) => (
                <ScrollReveal key={cap.title} delay={i * 0.1}>
                  <div className="rounded-xl p-6 shadow-sm" style={{ background: "#f0f6ff" }}>
                    <cap.icon className="w-6 h-6 text-blue-600 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cap.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{cap.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 — INTEGRATION */}
        <section className="py-24" style={{ background: "#0a0f1e" }}>
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Integration</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-14">Plug in. No infrastructure changes.</h2>
            <div ref={integrationRef} className="relative grid md:grid-cols-3 gap-8">
              <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px bg-[#1e2d4a] -translate-y-1/2 z-0">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] z-10"
                  style={{ animation: "connector-dot 3s ease-in-out infinite" }}
                />
              </div>
              {integrationSteps.map((s, i) => (
                <div
                  key={s.step}
                  className="relative z-10 rounded-xl p-6 transition-all duration-700"
                  style={{
                    background: "#111827",
                    opacity: integrationVisible ? 1 : 0,
                    transform: integrationVisible ? "translateY(0)" : "translateY(24px)",
                    transitionDelay: `${i * 200}ms`,
                  }}
                >
                  <p className="text-3xl font-bold text-blue-500 mb-3">{s.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6.5 — STATS */}
        <ScrollReveal>
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { value: "Dynamic", label: "Behavioral labels" },
                { value: "12", label: "Lifestyle categories" },
                { value: "20+", label: "Life events detected" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-bold text-gray-900 text-3xl sm:text-[52px]">{s.value}</p>
                  <p className="text-gray-500 mt-1 text-sm sm:text-lg">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* SECTION 7 — CTA */}
        <ScrollReveal>
          <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Experience Ventus AI?
              </h2>
              <p className="text-lg text-gray-500 mb-8">Everything else is built on top of this.</p>
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Schedule Demo
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

export default Enrichment;
