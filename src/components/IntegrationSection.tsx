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

const SalesforceLogo = () => (
  <svg viewBox="0 0 320 100" role="img" aria-label="Salesforce" className="h-10 w-auto">
    <g fill="#00A1E0">
      <circle cx="90" cy="58" r="28" />
      <circle cx="122" cy="38" r="30" />
      <circle cx="162" cy="44" r="34" />
      <circle cx="206" cy="54" r="28" />
      <circle cx="238" cy="58" r="24" />
      <rect x="76" y="38" width="150" height="48" rx="24" />
    </g>
    <text
      x="156"
      y="66"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="28"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      letterSpacing="-0.5"
    >
      salesforce
    </text>
  </svg>
);

const FisLogo = () => (
  <div className="text-[2.5rem] font-black uppercase tracking-[-0.08em] leading-none text-[#4BCD3E]">
    FIS
  </div>
);

const FiservLogo = () => (
  <svg viewBox="0 0 200 40" role="img" aria-label="Fiserv" className="h-10 w-auto">
    <g fill="#ff6600">
      <path d="M20.5 8.2h-7.1v23.6h7.1c6.8 0 11.6-5.2 11.6-11.8S27.3 8.2 20.5 8.2zm-1.2 18.4h-3.6v-12.7h3.6c4.4 0 7.5 2.8 7.5 6.4s-3.1 6.3-7.5 6.3z"/>
      <path d="M37.3 8.2h6.2v23.6h-6.2z"/>
      <path d="M48.4 20c0-7.1 5.1-12.2 12.1-12.2 3.8 0 7.1 1.7 9.1 4.4l-4.2 3.8c-1.2-1.4-2.9-2.2-4.9-2.2-3.6 0-6.1 2.6-6.1 6.1 0 3.5 2.5 6.1 6.1 6.1 2 0 3.7-.8 4.9-2.2l4.2 3.8c-2 2.7-5.3 4.4-9.1 4.4-7 0-12.1-5.1-12.1-12z"/>
      <path d="M73.8 8.2h6.2v23.6h-6.2z"/>
      <path d="M85.3 20c0-7.1 5.3-12.2 12.6-12.2 7.3 0 12.6 5.1 12.6 12.2s-5.3 12.2-12.6 12.2c-7.3 0-12.6-5.1-12.6-12.2zm18.9 0c0-3.7-2.6-6.4-6.3-6.4-3.7 0-6.3 2.7-6.3 6.4s2.6 6.4 6.3 6.4c3.7 0 6.3-2.7 6.3-6.4z"/>
      <path d="M116.7 20c0-7.1 5.3-12.2 12.6-12.2 4.1 0 7.6 1.8 9.7 4.8l-5 3.3c-1.2-1.7-3-2.6-4.7-2.6-3.7 0-6.3 2.7-6.3 6.4s2.6 6.4 6.3 6.4c1.7 0 3.5-.9 4.7-2.6l5 3.3c-2.1 3-5.6 4.8-9.7 4.8-7.3 0-12.6-5.1-12.6-12.2z"/>
      <path d="M140.7 20c0-7.1 5.1-12.2 12.1-12.2 3.8 0 7.1 1.7 9.1 4.4l-4.2 3.8c-1.2-1.4-2.9-2.2-4.9-2.2-3.6 0-6.1 2.6-6.1 6.1 0 3.5 2.5 6.1 6.1 6.1 2 0 3.7-.8 4.9-2.2l4.2 3.8c-2 2.7-5.3 4.4-9.1 4.4-7 0-12.1-5.1-12.1-12z"/>
      <path d="M168.1 8.2h-7.1v23.6h7.1c6.8 0 11.6-5.2 11.6-11.8S175 8.2 168.1 8.2zm-1.2 18.4h-3.6v-12.7h3.6c4.4 0 7.5 2.8 7.5 6.4s-3.1 6.3-7.5 6.3z"/>
    </g>
  </svg>
);

const JackHenryLogo = () => (
  <svg viewBox="0 0 180 40" role="img" aria-label="Jack Henry" className="h-10 w-auto">
    <g>
      <circle cx="14" cy="20" r="10" fill="#e31837"/>
      <text
        x="30"
        y="26"
        fill="#1a1a1a"
        fontSize="16"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        Jack Henry
      </text>
    </g>
  </svg>
);

const DatabricksLogo = () => (
  <svg viewBox="0 0 200 50" role="img" aria-label="Databricks" className="h-10 w-auto">
    <g>
      <path fill="#FF3621" d="M16.3 8.5l16.9 9.8v19.5l-16.9-9.8V8.5z"/>
      <path fill="#FF3621" d="M16.3 8.5L0 18.2v19.6l16.3-9.7V8.5z"/>
      <path fill="#FF3621" d="M16.3 47.8l16.9-9.7V18.5l-16.9 9.7v19.6z"/>
      <text
        x="45"
        y="32"
        fill="#1B1B1B"
        fontSize="18"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        Databricks
      </text>
    </g>
  </svg>
);

const SnowflakeLogo = () => (
  <svg viewBox="0 0 200 50" role="img" aria-label="Snowflake" className="h-10 w-auto">
    <g>
      <path fill="#29B5E8" d="M25 5L21.5 11l-6.5-2 2 6.5L10 18l6.5 2.5-2 6.5 6.5-2L21.5 32l3.5-6.5 6.5 2-2-6.5L40 18l-6.5-2.5 2-6.5-6.5 2L25 5z"/>
      <text
        x="50"
        y="32"
        fill="#29B5E8"
        fontSize="20"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        Snowflake
      </text>
    </g>
  </svg>
);

const partners = [
  { name: "Salesforce", Logo: SalesforceLogo },
  { name: "FIS", Logo: FisLogo },
  { name: "Fiserv", Logo: FiservLogo },
  { name: "Jack Henry", Logo: JackHenryLogo },
  { name: "Databricks", Logo: DatabricksLogo },
  { name: "Snowflake", Logo: SnowflakeLogo },
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
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Integration Partners
          </p>
          <div className="flex items-center justify-center gap-16 md:gap-24 flex-wrap">
            {partners.map(({ name, Logo }) => (
              <div key={name} className="flex items-center justify-center px-4 py-4">
                <Logo />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <a href="/contact">
            <button className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Schedule a Demo
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
