import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { Plane, MapPin, Shield, Zap } from "lucide-react";
import TravelInteractiveDemo from "@/components/travel/TravelInteractiveDemo";
import { useEffect, useRef, useState } from "react";
import HeroTravelCard from "@/components/hero/HeroTravelCard";

const capabilities = [
  { icon: Plane, title: "Trip Detection", desc: "Ventus detects travel from transaction patterns alone — flights, hotels, and out-of-city spending trigger automatic trip recognition without GPS or app permissions." },
  { icon: MapPin, title: "Local Deal Matching", desc: "Once a trip is detected, curated local experiences surface instantly — dining, arts, shopping, and entertainment matched to the destination." },
  { icon: Shield, title: "Privacy-First Design", desc: "No location tracking. No GPS. No permissions. Everything is inferred from spending patterns, building trust while delivering value." },
  { icon: Zap, title: "Real-Time Activation", desc: "Deals and experiences appear the moment a customer arrives — not hours or days later. Your bank is part of the trip from the first transaction." },
];

const integrationSteps = [
  { step: "01", title: "Connect", desc: "Banks securely send transaction data through a simple integration. No changes to core banking systems." },
  { step: "02", title: "Enrich", desc: "Ventus AI detects lifestyle pillars, intent signals, and life events across 20+ categories in real time." },
  { step: "03", title: "Activate", desc: "Intelligence flows automatically into rewards personalization, analytics, and advisor relationship tools." },
];

const TravelExperience = () => {
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

  return (
    <div>
      <SEO title="Travel Experience — Ventus AI" description="Detect trips, fares, and travel intent from transaction data to power richer rewards and customer experiences." path="/travel" />
      <main>
        {/* SECTION 1 — HERO */}
        <section className="min-h-screen flex items-center pt-16" style={{ background: "#0a0f1e" }}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Travel Experience</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-tight mb-2">
                Your bank becomes a travel companion.
              </h1>
              <p className="text-2xl md:text-3xl font-bold italic text-blue-400 mb-6">
                Without tracking a single location.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                Ventus detects trips from spending patterns alone and surfaces curated local deals — dining, arts, shopping — wherever your customers go. No GPS. No permissions. Just intelligence.
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
                  onClick={() => document.getElementById("travel-demo")?.scrollIntoView({ behavior: "smooth" })}
                >
                  See It Work ↓
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <HeroTravelCard />
            </div>
          </div>
        </section>

        {/* SECTION 2 — THE PROBLEM */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-3xl mb-12">
                Banks miss the travel moment entirely.
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Your customer just landed in Miami. They'll spend $3,000 over five days — on dining, experiences, and shopping. Your bank won't surface a single relevant offer.",
                "Generic travel rewards don't feel like rewards. A 1% cashback notification while exploring a new city doesn't compete with a curated local dining credit.",
                "Every trip is a missed partnership opportunity. Local merchants want bank-driven traffic. Your customers want local deals. The connection doesn't exist yet.",
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

        {/* SECTION 3 — SEE IT IN ACTION */}
        <section id="travel-demo" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">See It In Action</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Trip detected. Deals delivered. No tracking required.</h2>
              <p className="text-gray-500 text-lg mb-10 max-w-2xl">
                See how Ventus turns transaction patterns into a curated travel companion experience.
              </p>
            </ScrollReveal>
            <TravelInteractiveDemo />
          </div>
        </section>

        {/* SECTION 4 — CAPABILITIES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                Turn every trip into a banking moment.
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

        {/* SECTION 5 — INTEGRATION */}
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

        {/* SECTION 6 — CTA */}
        <ScrollReveal>
          <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Experience Ventus AI?
              </h2>
              <p className="text-lg text-gray-500 mb-8">Ventus makes every trip a banking moment — without tracking a thing.</p>
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

export default TravelExperience;
