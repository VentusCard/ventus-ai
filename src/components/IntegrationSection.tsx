import { useState, useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import salesforceLogo from "@/assets/salesforce-logo.png";


import fisLogo from "@/assets/fis-logo.svg";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";

const partners = [
  
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
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
    <section id="integration" className="bg-white scroll-mt-20" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="mx-auto mb-10 max-w-7xl px-6 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Integration</p>
        <h2 className="max-w-2xl text-3xl font-bold text-gray-900 md:text-4xl">
          A modular intelligence layer that works with your existing stack.
        </h2>
      </div>

      <div ref={sectionRef.ref} className="mx-auto max-w-7xl px-6 md:px-8">
        <div
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{
            opacity: sectionRef.inView ? 1 : 0,
            transform: sectionRef.inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Column 1 — Connect */}
          <div className="relative min-w-0 px-5 py-16 lg:px-6">
            <span className="pointer-events-none absolute left-5 top-4 select-none text-[100px] font-bold leading-none lg:left-6 lg:text-[120px]" style={{ color: "rgba(37,99,235,0.08)" }}>
              01
            </span>
            <div className="relative z-10 pt-14">
              <h3 className="mb-2 text-[30px] font-bold text-gray-900">Ingest</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Banks securely share transaction data via API. No changes to core banking systems required.
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-x-5 gap-y-4">
                {partners.map(({ name, src, height }) => (
                  <div key={name} className="flex items-center justify-center p-1">
                    <img
                      src={src}
                      alt={name}
                      className={`${height} w-auto grayscale opacity-60`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 — Enrich */}
          <div className="relative min-w-0 border-t border-gray-200 px-5 py-16 lg:border-l lg:border-t-0 lg:px-6">
            <span className="pointer-events-none absolute left-5 top-4 select-none text-[100px] font-bold leading-none lg:left-6 lg:text-[120px]" style={{ color: "rgba(37,99,235,0.08)" }}>
              02
            </span>
            <div className="relative z-10 pt-14">
              <h3 className="mb-2 text-[30px] font-bold text-gray-900">Enrich</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Ventus enriches every transaction and returns behavioral intelligence via API — lifestyle profiles, life events, purchase signals, and travel patterns, all queryable in real time.
              </p>
              <div className="space-y-6">
                {statsData.map((stat, index) => (
                  <div key={stat.label}>
                    <p className="font-bold text-gray-900 tabular-nums" style={{ fontSize: "40px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                      {sectionRef.inView ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                      {stat.suffix}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 — Orchestrate */}
          <div className="relative min-w-0 border-t border-gray-200 px-5 py-16 lg:border-l lg:border-t-0 lg:px-6">
            <span className="pointer-events-none absolute left-5 top-4 select-none text-[100px] font-bold leading-none lg:left-6 lg:text-[120px]" style={{ color: "rgba(37,99,235,0.08)" }}>
              03
            </span>
            <div className="relative z-10 pt-14">
              <h3 className="mb-2 text-[30px] font-bold text-gray-900">Orchestrate</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Enriched intelligence flows into your existing CRM, rewards engine, and advisor tools — ready to act on.
              </p>
              <div className="space-y-4 mb-6">
                {["Retention Rate", "Customer LTV", "AUM Growth"].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-blue-600" strokeWidth={2.5} />
                    <p className="text-sm font-medium text-gray-700">{label}</p>
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
