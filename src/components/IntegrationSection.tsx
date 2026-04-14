import { useState, useEffect, useRef } from "react";

import salesforceLogo from "@/assets/salesforce-logo.png";
import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";

const partners = [
  { name: "Salesforce", src: salesforceLogo, height: "h-10" },
  { name: "FIS", src: fisLogo, height: "h-7" },
  { name: "Fiserv", src: fiservLogo, height: "h-8" },
  { name: "Jack Henry", src: jackHenryLogo, height: "h-7" },
  { name: "Databricks", src: databricksLogo, height: "h-7" },
  { name: "Snowflake", src: snowflakeLogo, height: "h-7" },
];

const stats = [
  { target: 3000, suffix: "+", label: "Dynamic labels" },
  { target: 50, suffix: "+", label: "Lifestyle dimensions" },
  { target: 20, suffix: "+", label: "Life events detected" },
];

const outcomes = ["Higher Retention", "Higher LTV", "Higher AUM"];

const useCountUp = (target: number | null, active: boolean, duration = 1500) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === null) return;
    setValue(0);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return value;
};

const IntegrationSection = () => {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const count0 = useCountUp(stats[0].target, statsVisible);
  const count1 = useCountUp(stats[1].target, statsVisible);
  const count2 = useCountUp(stats[2].target, statsVisible);
  const counts = [count0, count1, count2];

  return (
    <section id="integration" className="bg-white py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Integration</p>
        <h2 className="mb-16 text-3xl font-bold text-gray-900 md:text-4xl">
          A modular intelligence layer that works with your existing stack.
        </h2>

        <div ref={sectionRef} className="flex flex-col gap-0">
          {/* 01 — Connect */}
          <div
            className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease 0ms, transform 0.5s ease 0ms",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">01</p>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Connect</h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-500">
                  Banks securely share transaction data via API. No changes to core banking systems required.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 items-center justify-items-center">
                {partners.map(({ name, src, height }) => (
                  <div key={name} className="flex items-center justify-center">
                    <img src={src} alt={name} className={`${height} w-auto`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-1">
            <div className="relative w-px h-10 bg-blue-200">
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                style={{
                  background: "#3b82f6",
                  boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                  animation: "pipeline-dot 1.5s ease-in-out infinite 0s",
                }}
              />
            </div>
          </div>

          {/* 02 — Enrich */}
          <div
            ref={statsRef}
            className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease 150ms, transform 0.5s ease 150ms",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">02</p>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Enrich</h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-500">
                  Ventus analyzes every transaction to detect lifestyle pillars, life events, and purchase signals in real time.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {statsVisible ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                      {stat.suffix}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-1">
            <div className="relative w-px h-10 bg-blue-200">
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                style={{
                  background: "#3b82f6",
                  boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                  animation: "pipeline-dot 1.5s ease-in-out infinite 0.3s",
                }}
              />
            </div>
          </div>

          {/* 03 — Orchestrate */}
          <div
            className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease 300ms, transform 0.5s ease 300ms",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">03</p>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Orchestrate</h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-500">
                  Enriched intelligence flows into personalized rewards, advisor tools, and customer experiences automatically.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {outcomes.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
