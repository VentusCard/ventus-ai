import { useState, useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";

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
  const step1 = useInView(0.2);
  const step2 = useInView(0.2);
  const step3 = useInView(0.2);

  const count0 = useCountUp(statsData[0].target, step2.inView);
  const count1 = useCountUp(statsData[1].target, step2.inView);
  const count2 = useCountUp(statsData[2].target, step2.inView);
  const counts = [count0, count1, count2];

  return (
    <section id="integration" className="bg-white py-24 scroll-mt-20">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Integration</p>
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl max-w-2xl">
          A modular intelligence layer that works with your existing stack.
        </h2>
      </div>

      {/* Step 01 — Connect */}
      <div ref={step1.ref} className="relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left */}
            <div
              className="relative"
              style={{
                opacity: step1.inView ? 1 : 0,
                transform: step1.inView ? "translateX(0)" : "translateX(-40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <span
                className="absolute -top-8 -left-2 text-[120px] font-bold leading-none select-none pointer-events-none"
                style={{ color: "rgba(37, 99, 235, 0.08)" }}
              >
                01
              </span>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Connect</h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-500 max-w-md">
                  Banks securely share transaction data via API. No changes to core banking systems required.
                </p>
              </div>
            </div>
            {/* Right */}
            <div
              style={{
                opacity: step1.inView ? 1 : 0,
                transform: step1.inView ? "translateX(0)" : "translateX(40px)",
                transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
              }}
            >
              <div className="grid grid-cols-3 gap-8 items-center justify-items-center">
                {partners.map(({ name, src, height }) => (
                  <div key={name} className="flex items-center justify-center p-2">
                    <img src={src} alt={name} className={`${height} w-auto`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-gray-100 w-full" />
      </div>

      {/* Step 02 — Enrich */}
      <div ref={step2.ref} className="relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left */}
            <div
              className="relative"
              style={{
                opacity: step2.inView ? 1 : 0,
                transform: step2.inView ? "translateX(0)" : "translateX(-40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <span
                className="absolute -top-8 -left-2 text-[120px] font-bold leading-none select-none pointer-events-none"
                style={{ color: "rgba(37, 99, 235, 0.08)" }}
              >
                02
              </span>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Enrich</h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-500 max-w-md">
                  Ventus analyzes every transaction to detect lifestyle pillars, life events, and purchase signals in real time.
                </p>
              </div>
            </div>
            {/* Right */}
            <div
              style={{
                opacity: step2.inView ? 1 : 0,
                transform: step2.inView ? "translateX(0)" : "translateX(40px)",
                transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
              }}
            >
              <div className="grid grid-cols-3 gap-6">
                {statsData.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <p
                      className="text-3xl md:text-4xl font-bold text-gray-900 tabular-nums"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {step2.inView ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                      {stat.suffix}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-gray-100 w-full" />
      </div>

      {/* Step 03 — Orchestrate */}
      <div ref={step3.ref} className="relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left */}
            <div
              className="relative"
              style={{
                opacity: step3.inView ? 1 : 0,
                transform: step3.inView ? "translateX(0)" : "translateX(-40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <span
                className="absolute -top-8 -left-2 text-[120px] font-bold leading-none select-none pointer-events-none"
                style={{ color: "rgba(37, 99, 235, 0.08)" }}
              >
                03
              </span>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Orchestrate</h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-500 max-w-md">
                  Enriched intelligence flows into personalized rewards, advisor tools, and customer experiences automatically.
                </p>
              </div>
            </div>
            {/* Right */}
            <div
              style={{
                opacity: step3.inView ? 1 : 0,
                transform: step3.inView ? "translateX(0)" : "translateX(40px)",
                transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
              }}
            >
              <div className="grid grid-cols-3 gap-6">
                {["Retention Rate", "Customer LTV", "AUM Growth"].map((label) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <TrendingUp size={36} className="text-blue-600 mb-2" strokeWidth={2.5} />
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
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
