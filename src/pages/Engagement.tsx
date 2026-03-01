import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedDemo from "@/components/technology/AnimatedDemo";
import { engagementDemoHtml } from "@/components/technology/demos/engagement-demo";
import { Zap, BarChart3, Send, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const capabilities = [
  { icon: Zap, title: "Life Event Triggers", desc: "Campaigns fire automatically when Ventus detects a life event — new baby, home purchase, vacation planning, retirement." },
  { icon: BarChart3, title: "Micro-Segment Builder", desc: "Build audience segments from behavioral signals in real time. See exact customer counts update as you refine." },
  { icon: Send, title: "Multi-Channel Delivery", desc: "Reach customers across email, push notification, and SMS with channel preference detection." },
  { icon: Clock, title: "Purchase Cycle Timing", desc: "Serve offers when the customer is actively in a purchase cycle — not a week after they already bought elsewhere." },
];

const integrationSteps = [
  { step: "01", title: "Connect", desc: "Banks securely send transaction data through a simple integration. No changes to core banking systems." },
  { step: "02", title: "Enrich", desc: "Ventus AI detects lifestyle pillars, intent signals, and life events across 20+ categories in real time." },
  { step: "03", title: "Activate", desc: "Intelligence flows automatically into rewards personalization, analytics, and advisor relationship tools." },
];

const channelRows = [
  { channel: "Email", message: "Your flight deal to Cancún expires tonight" },
  { channel: "Push", message: "2x miles on travel purchases this week" },
  { channel: "SMS", message: "TSA PreCheck offer — save 20% today" },
];

const Engagement = () => {
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
    document.getElementById("engagement-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <main>
        {/* SECTION 1 — HERO */}
        <section className="pt-20 pb-16 md:py-0 md:min-h-screen flex items-center" style={{ background: "#0a0f1e" }}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Customer Engagement</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-tight mb-2">
                Reach the right customer.
              </h1>
              <p className="text-2xl md:text-3xl font-bold italic text-blue-400 mb-6">
                At the right life moment.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                Ventus powers hyper-targeted campaigns and micro-segments built from real behavioral intelligence — not demographics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Schedule Demo
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-white/10 hover:text-white"
                  onClick={scrollToDemo}
                >
                  See It Work ↓
                </Button>
              </div>
            </div>
            {/* Right column: Campaign preview card */}
            <div className="hidden md:flex justify-center">
              <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                <div className="mb-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Segment</p>
                  <p className="text-white font-semibold text-lg">Summer Travel Planners</p>
                  <p className="text-blue-400 text-sm font-medium mt-1">14,200 customers identified</p>
                </div>
                <div className="space-y-3">
                  {channelRows.map(row => (
                    <div key={row.channel} className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "#0a0f1e" }}>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">{row.channel}</p>
                        <p className="text-gray-500 text-xs truncate">{row.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — THE PROBLEM */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-3xl mb-12">
                Most bank campaigns target demographics.{" "}
                <span className="text-blue-600">Ventus targets life moments.</span>
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Sending a travel rewards push to every customer aged 25–45 is not targeting. It is guessing.",
                "A customer who just booked flights, rented a car, and bought luggage is planning a trip right now. Most banks miss this window entirely.",
                "Without behavioral triggers, you are always reacting — sending offers after the moment has already passed.",
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
        <section id="engagement-demo" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">See It In Action</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">A personalized banking experience powered by transaction intelligence.</h2>
              <p className="text-gray-500 text-lg mb-10 max-w-2xl">
                Explore how behavioral signals drive personalized customer engagement across every channel.
              </p>
            </ScrollReveal>
          </div>
          <AnimatedDemo htmlContent={engagementDemoHtml} animationDelay="0.45s" />
        </section>

        {/* SECTION 4 — CAPABILITIES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                How Ventus targets life moments.
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
                Your customers are in a life moment right now.
              </h2>
              <p className="text-lg text-gray-500 mb-8">Ventus tells you which one.</p>
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

export default Engagement;
