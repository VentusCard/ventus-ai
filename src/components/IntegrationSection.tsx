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
    <section id="integration" className="bg-background py-16 md:py-20 scroll-mt-20">
      <div className="mx-auto mb-10 max-w-7xl px-6 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Integration</p>
        <h2 className="max-w-2xl text-3xl font-bold text-foreground md:text-4xl">
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
          <div className="relative min-w-0 px-5 py-8 lg:px-6">
            <span className="pointer-events-none absolute left-5 top-2 select-none text-[72px] font-bold leading-none text-primary/10 lg:left-6 lg:text-[80px]">
              01
            </span>
            <div className="relative z-10 pt-10">
              <h3 className="mb-2 text-xl font-bold text-foreground">Connect</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Banks securely share transaction data via API. No changes to core banking systems required.
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-x-5 gap-y-4">
                {partners.map(({ name, src, height }) => (
                  <div key={name} className="flex items-center justify-center p-1">
                    <img src={src} alt={name} className={`${height} w-auto`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 border-t border-border px-5 py-8 lg:border-l lg:border-t-0 lg:px-6">
            <span className="pointer-events-none absolute left-5 top-2 select-none text-[72px] font-bold leading-none text-primary/10 lg:left-6 lg:text-[80px]">
              02
            </span>
            <div className="relative z-10 pt-10">
              <h3 className="mb-2 text-xl font-bold text-foreground">Enrich</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Ventus analyzes every transaction to detect lifestyle pillars, life events, and purchase signals in real time.
              </p>
              <div className="space-y-4">
                {statsData.map((stat, index) => (
                  <div key={stat.label} className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold tabular-nums text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {sectionRef.inView ? (index === 0 ? counts[0].toLocaleString() : counts[index]) : 0}
                      {stat.suffix}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 border-t border-border px-5 py-8 lg:border-l lg:border-t-0 lg:px-6">
            <span className="pointer-events-none absolute left-5 top-2 select-none text-[72px] font-bold leading-none text-primary/10 lg:left-6 lg:text-[80px]">
              03
            </span>
            <div className="relative z-10 pt-10">
              <h3 className="mb-2 text-xl font-bold text-foreground">Orchestrate</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Enriched intelligence flows into personalized rewards, advisor tools, and customer experiences automatically.
              </p>
              <div className="space-y-4">
                {["Retention Rate", "Customer LTV", "AUM Growth"].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-primary" strokeWidth={2.5} />
                    <p className="text-sm font-medium text-foreground">{label}</p>
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
