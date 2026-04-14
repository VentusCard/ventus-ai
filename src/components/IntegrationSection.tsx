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
      { threshold: 0.2 }
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

  const steps = [
    {
      step: "01",
      title: "Connect",
      desc: "Banks and vendors securely share transaction data via API. No changes to core banking systems required.",
      extra: (
        <div className="mt-6 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
            {[...partners, ...partners].map(({ name, src, height }, i) => (
              <img key={`${name}-${i}`} src={src} alt={name} className={`${height} w-auto opacity-50 grayscale shrink-0`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Enrich",
      desc: "Ventus AI analyzes every transaction to detect lifestyle pillars, intent signals, and life events in real time.",
      extra: (
        <div ref={statsRef} className="mt-6 grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                {statsVisible ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                {stat.suffix}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      step: "03",
      title: "Orchestrate",
      desc: "Enriched intelligence flows into personalized rewards, behavioral analytics, and wealth advisor tools automatically.",
      extra: null,
    },
  ];

  return (
    <section id="integration" className="bg-white py-24 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Integration</p>
        <h2 className="mb-14 text-3xl font-bold text-gray-900 md:text-4xl">
          A modular intelligence layer that works with your existing stack.
        </h2>

        <div ref={sectionRef} className="flex flex-col gap-0">
          {steps.map((step, index) => (
            <div key={step.step}>
              <div
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.5s ease ${index * 150}ms, transform 0.5s ease ${index * 150}ms`,
                }}
              >
                <p className="mb-3 text-3xl font-bold text-blue-600">{step.step}</p>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
                {step.extra}
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="relative w-px h-10 bg-blue-200">
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{
                        background: "#3b82f6",
                        boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                        animation: `pipeline-dot 1.5s ease-in-out infinite ${index * 0.3}s`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
