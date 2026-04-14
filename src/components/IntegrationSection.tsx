import { useState, useEffect, useRef } from "react";

const steps = [
  { step: "01", title: "Connect", desc: "Banks and vendors securely share transaction data via API. No changes to core banking systems required." },
  { step: "02", title: "Enrich", desc: "Ventus AI analyzes every transaction to detect lifestyle pillars, intent signals, and life events in real time." },
  { step: "03", title: "Orchestrate", desc: "Enriched intelligence flows into personalized rewards, behavioral analytics, and wealth advisor tools automatically." },
];

const stats = [
  { target: 3000, suffix: "+", label: "Dynamic labels", widthClass: "min-w-[6ch]" },
  { target: 50, suffix: "+", label: "Lifestyle dimensions", widthClass: "min-w-[4ch]" },
  { target: 20, suffix: "+", label: "Life events detected", widthClass: "min-w-[4ch]" },
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

import salesforceLogo from "@/assets/salesforce-logo.png";
import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";

const partners = [
  { name: "Salesforce", src: salesforceLogo, height: "h-12" },
  { name: "FIS", src: fisLogo, height: "h-8" },
  { name: "Fiserv", src: fiservLogo, height: "h-10" },
  { name: "Jack Henry", src: jackHenryLogo, height: "h-8" },
  { name: "Databricks", src: databricksLogo, height: "h-8" },
  { name: "Snowflake", src: snowflakeLogo, height: "h-8" },
];

const IntegrationSection = () => {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
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
        <h2 className="mb-14 text-3xl font-bold text-gray-900 md:text-4xl">
          A modular intelligence layer that works with your existing stack.
        </h2>

        <div ref={sectionRef} className="grid items-stretch gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.45s ease ${index * 120}ms, transform 0.45s ease ${index * 120}ms`,
              }}
            >
              <p className="mb-3 text-3xl font-bold text-blue-600">{step.step}</p>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>

        <div ref={statsRef} className="mt-16 grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex flex-col items-center">
              <p
                className={`inline-block ${stat.widthClass} tabular-nums text-3xl font-bold text-gray-900 md:text-5xl`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {statsVisible ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm text-gray-500 md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-center gap-12 md:gap-20 flex-nowrap overflow-x-auto">
            {partners.map(({ name, src, height }) => (
              <div key={name} className="flex-shrink-0 flex items-center justify-center px-4 py-4">
                <img src={src} alt={name} className={`${height} w-auto`} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default IntegrationSection;
