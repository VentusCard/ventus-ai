import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import HeroAnalyticsCard from "@/components/hero/HeroAnalyticsCard";
import { Layers, Search, TrendingUp, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const capabilities = [
  { icon: Layers, title: "Customer Segmentation", desc: "Automatically cluster your entire customer base into dynamic behavioral segments — updated with every transaction, not every quarter." },
  { icon: Search, title: "Spend Gap Detection", desc: "See exactly where your customers are spending outside your ecosystem. Size the opportunity and build a strategy to capture it." },
  { icon: TrendingUp, title: "Trend Detection", desc: "Identify category-level spending shifts before they become obvious. Track seasonal patterns, emerging merchants, and wallet-share migration in real time." },
  { icon: LayoutDashboard, title: "Executive Dashboards", desc: "Real-time institution-wide health metrics, segment growth trends, and revenue opportunity sizing — built for leadership decisions, not just analyst exploration." },
];

const integrationSteps = [
  { step: "01", title: "Connect", desc: "Banks securely send transaction data through a simple integration. No changes to core banking systems." },
  { step: "02", title: "Enrich", desc: "Ventus AI detects lifestyle pillars, intent signals, and life events across 20+ categories in real time." },
  { step: "03", title: "Activate", desc: "Intelligence flows automatically into rewards personalization, analytics, and advisor relationship tools." },
];

const pillars = [
  { label: "Travel & Exploration", pct: 20.4, color: "#3b82f6" },
  { label: "Food & Dining", pct: 18.2, color: "#8b5cf6" },
  { label: "Health & Wellness", pct: 14.1, color: "#14b8a6" },
  { label: "Shopping & Retail", pct: 12.3, color: "#f59e0b" },
  { label: "Financial & Aspirational", pct: 9.8, color: "#22c55e" },
];

const BankWideAnalytics = () => {
  const [integrationVisible, setIntegrationVisible] = useState(false);
  const [demoVisible, setDemoVisible] = useState(false);
  const integrationRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = demoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setDemoVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      <main>
        {/* SECTION 1 — HERO */}
        <section className="min-h-screen flex items-center pt-16" style={{ background: "#0a0f1e" }}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Bank-Wide Analytics</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-tight mb-2">
                See what your entire customer base is doing.
              </h1>
              <p className="text-2xl md:text-3xl font-bold italic text-blue-400 mb-6">
                And why.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                Ventus layers behavioral intelligence across every transaction in your institution — surfacing spending trends, customer segments, and revenue opportunities that traditional BI tools simply cannot see.
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
                  onClick={() => document.getElementById("analytics-demo")?.scrollIntoView({ behavior: "smooth" })}
                >
                  See It Work ↓
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <HeroAnalyticsCard />
            </div>
          </div>
        </section>

        {/* SECTION 2 — THE PROBLEM */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-3xl mb-12">
                Your BI tools tell you what happened.{" "}
                <span className="text-blue-600">Ventus tells you what it means.</span>
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "Traditional dashboards show you transaction volumes and category totals. They cannot tell you that 14% of your customer base is quietly shifting spend to a competitor.",
                "Your marketing team is building campaigns on demographic data from two years ago. Ventus builds segments from what customers did last Tuesday.",
                "A new product launch is coming. Your leadership team has no idea which customer segments are most likely to adopt it — or how large the opportunity actually is.",
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
        <section id="analytics-demo" className="py-16 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">See It In Action</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Institution-wide intelligence at scale.</h2>
              <p className="text-gray-500 text-lg mb-6 max-w-2xl">
                The same enrichment engine that powers individual transaction intelligence — applied across your entire customer base.
              </p>
            </ScrollReveal>

            {/* Demo panel */}
            <div ref={demoRef} className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between px-6 md:px-8 pt-5 pb-3 border-b border-gray-200">
                <h3 className="text-gray-900 text-lg font-bold">Institution Intelligence Dashboard</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Live Demo
                </span>
              </div>
              <div className="p-6 md:p-8">

                {/* 6 Metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  {[
                    { label: "Total Accounts", value: "120.0M", sub: "Across all products" },
                    { label: "Unique Users", value: "75.0M", sub: "1.60 avg accounts/user" },
                    { label: "Total Annual Spend", value: "$385.0B", sub: "$3,208 per account" },
                    { label: "Active Account Rate", value: "78.5%", sub: "Transacted in last 30 days" },
                    { label: "Avg Spending per Year", value: "$5,133", sub: "Per user annually" },
                    { label: "Avg Transactions", value: "42", sub: "Per account/month" },
                  ].map((m, i) => (
                    <div
                      key={m.label}
                      className="rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-700 border border-gray-200"
                      style={{
                        background: "#f8fafc",
                        opacity: demoVisible ? 1 : 0,
                        transform: demoVisible ? "translateY(0)" : "translateY(16px)",
                        transitionDelay: `${i * 120}ms`,
                      }}
                    >
                      <p className="text-gray-500 text-[11px] mb-0.5">{m.label}</p>
                      <p className="text-gray-900 text-xl sm:text-2xl font-bold">{m.value}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{m.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-6" />

                {/* Spending by pillar */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-900 text-sm font-bold">Spending Distribution by Lifestyle Pillar</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">Click any pillar to explore detailed breakdown</p>
                  </div>
                  <div
                    className="text-right transition-all duration-700"
                    style={{ opacity: demoVisible ? 1 : 0, transitionDelay: "600ms" }}
                  >
                    <p className="text-gray-900 text-lg font-bold">$525.7B</p>
                    <p className="text-gray-400 text-[10px]">Total Spend</p>
                  </div>
                </div>
                <div className="space-y-3.5 mb-6">
                  {pillars.map((p, i) => (
                    <div key={p.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 text-sm">{p.label}</span>
                        <span className="text-gray-500 text-sm font-semibold">{p.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: demoVisible ? `${(p.pct / 25) * 100}%` : "0%",
                            background: p.color,
                            transitionDelay: `${i * 120 + 500}ms`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  className="text-gray-500 text-xs mb-8 transition-all duration-700"
                  style={{ opacity: demoVisible ? 1 : 0, transitionDelay: "1100ms" }}
                >
                  <span className="text-blue-600 font-semibold">Travel & Exploration</span> leads at 20.4% of spend. Top 3 pillars = <span className="font-bold text-gray-700">54%</span> of total. <span className="text-orange-500 font-semibold">Financial & Aspirational</span> underperforms — expansion opportunity.
                </p>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-6" />

                {/* Revenue opportunity */}
                <div className="flex items-center justify-between">
                  <div
                    className="transition-all duration-700"
                    style={{
                      opacity: demoVisible ? 1 : 0,
                      transform: demoVisible ? "translateY(0)" : "translateY(12px)",
                      transitionDelay: "1200ms",
                    }}
                  >
                    <p className="text-gray-900 text-sm font-bold mb-1">Revenue Opportunities & Partner Insights</p>
                    <p className="text-gray-500 text-xs">
                      <span className="text-blue-600 font-bold">$17.1B</span> total opportunity with <span className="font-bold text-gray-700">17 merchant partnership pitches</span> ready for negotiation.
                    </p>
                  </div>
                  <div
                    className="text-right transition-all duration-700"
                    style={{ opacity: demoVisible ? 1 : 0, transitionDelay: "1300ms" }}
                  >
                    <p className="text-gray-900 text-lg font-bold">$38.2B</p>
                    <p className="text-gray-400 text-[10px]">Cross-Sell Potential</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — CAPABILITIES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                Intelligence at every level of your institution.
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
                Your transaction data is already telling you where the opportunities are.
              </h2>
              <p className="text-lg text-gray-500 mb-8">Ventus helps you hear it.</p>
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

export default BankWideAnalytics;
