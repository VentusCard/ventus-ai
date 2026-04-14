import Hero from "@/components/Hero";
import IntegrationSection from "@/components/IntegrationSection";
import ScrollReveal from "@/components/ScrollReveal";
import VentusTransactionEnrichment from "@/components/technology/demos/VentusTransactionEnrichment";
import { Layers, Heart, Activity, Search } from "lucide-react";

const signalLayers = [
  { icon: Layers, title: "Lifestyle Pillars", desc: "12 behavioral categories extracted from spending patterns. From Travel & Adventure to Financial Planning." },
  { icon: Heart, title: "Life Event Detection", desc: "20+ life events detected in real time. New baby, home purchase, retirement, relocation, and more." },
  { icon: Activity, title: "Travel Detection", desc: "Destinations, loyalty programs, hotel patterns, and travel frequency tracked across every transaction." },
  { icon: Search, title: "Intent Signals", desc: "What is this customer planning to do next? We detect purchase intent before it becomes a transaction." },
];

const Index = () => {
  return (
    <div>
      <main className="flex flex-col">
        <Hero />

        {/* Capabilities — Four Signal Layers */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                Four signal layers. Built from your transaction history.
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              {signalLayers.map((cap, i) => (
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

        {/* How It Works — Enrichment Engine Demo */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">See the engine in action.</h2>
              <p className="text-gray-500 text-lg mb-10 max-w-2xl">
                We run the enrichment engine on those signals — watch how Ventus builds a behavioral profile from a real customer's transaction history.
              </p>
            </ScrollReveal>
            <VentusTransactionEnrichment />
          </div>
        </section>

        <IntegrationSection />
      </main>
    </div>
  );
};

export default Index;
