import { useState, useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";

import salesforceLogo from "@/assets/salesforce-logo.png";
import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";

const partners = [
  { name: "Salesforce", src: salesforceLogo, height: "h-8" },
  { name: "FIS", src: fisLogo, height: "h-6" },
  { name: "Fiserv", src: fiservLogo, height: "h-7" },
  { name: "Jack Henry", src: jackHenryLogo, height: "h-6" },
  { name: "Databricks", src: databricksLogo, height: "h-6" },
  { name: "Snowflake", src: snowflakeLogo, height: "h-6" },
];

const statsData = [
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

const useInView = (threshold = 0.25) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const IntegrationSection = () => {
  const sectionRef = useInView(0.15);

  const count0 = useCountUp(statsData[0].target, sectionRef.inView);
  const count1 = useCountUp(statsData[1].target, sectionRef.inView);
  const count2 = useCountUp(statsData[2].target, sectionRef.inView);
  const counts = [count0, count1, count2];

  return (
    <section id="integration" className="bg-white py-16 md:py-20 scroll-mt-20">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Integration</p>
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl max-w-2xl">
          A modular intelligence layer that works with your existing stack.
        </h2>
      </div>

      {/* Three-column layout */}
      <div ref={sectionRef.ref} className="max-w-7xl mx-auto px-6 md:px-8">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-0"
          style={{
            opacity: sectionRef.inView ? 1 : 0,
            transform: sectionRef.inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Column 1 — Connect */}
          <div className="relative px-6 md:px-8 py-8">
            <span
              className="absolute top-2 left-6 md:left-8 text-[80px] font-bold leading-none select-none pointer-events-none"
              style={{ color: "rgba(37, 99, 235, 0.07)" }}
            >
              01
            </span>
            <div className="relative z-10 pt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
              <p className="text-sm leading-relaxed text-gray-500 mb-6">
                Banks securely share transaction data via API. No changes to core banking systems required.
              </p>
              <div className="grid grid-cols-2 gap-4 items-center justify-items-center">
                {partners.map(({ name, src, height }) => (
                  <div key={name} className="flex items-center justify-center p-1">
                    <img src={src} alt={name} className={`${height} w-auto`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-px bg-gray-200" style={{ position: "relative", width: 0, borderLeft: "1px solid #E5E7EB", padding: 0, margin: 0 }} />

          {/* Column 2 — Enrich */}
          <div className="relative px-6 md:px-8 py-8 border-t md:border-t-0 md:border-l border-gray-200">
            <span
              className="absolute top-2 left-6 md:left-8 text-[80px] font-bold leading-none select-none pointer-events-none"
              style={{ color: "rgba(37, 99, 235, 0.07)" }}
            >
              02
            </span>
            <div className="relative z-10 pt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enrich</h3>
              <p className="text-sm leading-relaxed text-gray-500 mb-6">
                Ventus analyzes every transaction to detect lifestyle pillars, life events, and purchase signals in real time.
              </p>
              <div className="space-y-4">
                {statsData.map((stat, index) => (
                  <div key={stat.label} className="flex items-baseline gap-3">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {sectionRef.inView ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                      {stat.suffix}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 — Orchestrate */}
          <div className="relative px-6 md:px-8 py-8 border-t md:border-t-0 md:border-l border-gray-200">
            <span
              className="absolute top-2 left-6 md:left-8 text-[80px] font-bold leading-none select-none pointer-events-none"
              style={{ color: "rgba(37, 99, 235, 0.07)" }}
            >
              03
            </span>
            <div className="relative z-10 pt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Orchestrate</h3>
              <p className="text-sm leading-relaxed text-gray-500 mb-6">
                Enriched intelligence flows into personalized rewards, advisor tools, and customer experiences automatically.
              </p>
              <div className="space-y-4">
                {["Retention Rate", "Customer LTV", "AUM Growth"].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-blue-600" strokeWidth={2.5} />
                    <p className="text-sm text-gray-700 font-medium">{label}</p>
                  </div>
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
