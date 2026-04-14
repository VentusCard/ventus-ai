import Hero from "@/components/Hero";
import IntegrationSection from "@/components/IntegrationSection";
import CTA from "@/components/CTA";
import ScrollReveal from "@/components/ScrollReveal";
import VentusTransactionEnrichment from "@/components/technology/demos/VentusTransactionEnrichment";
import { Layers, Heart, Activity, Search } from "lucide-react";

const signalLayers = [
  { icon: Layers, title: "Lifestyle Pillars", desc: "12 behavioral categories extracted from spending patterns. From Travel & Adventure to Financial Planning." },
  { icon: Heart, title: "Life Event Detection", desc: "20+ life events detected in real time. New baby, home purchase, retirement, relocation, and more." },
  { icon: Activity, title: "Well-being Signals", desc: "Financial wellness indicators surfaced from transaction behavior — stress, stability, and momentum." },
  { icon: Search, title: "Purchase Cycle Intel", desc: "Detect what customers are planning next. We surface intent signals before they become transactions." },
];

const proofStats = [
  { value: "500M+", label: "Transactions processed" },
  { value: "<200ms", label: "Enrichment latency" },
  { value: "99.9%", label: "Uptime SLA" },
];

const Index = () => {
  return (
    <div>
      <main className="flex flex-col">
        <Hero />

        {/* Social Proof — Minimal Stats */}
        <section className="py-14 bg-gray-50/60 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              {proofStats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  <div className="rounded-xl p-6 shadow-sm min-h-[140px]" style={{ background: "#f0f6ff" }}>
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
                Watch how Ventus builds a behavioral profile from a real customer's transaction history.
              </p>
            </ScrollReveal>
            <VentusTransactionEnrichment />
          </div>
        </section>

        <IntegrationSection />
        <CTA />
      </main>
    </div>
  );
};

export default Index;
