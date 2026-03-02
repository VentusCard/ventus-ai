import { useState, useEffect, useRef, useCallback } from "react";

const steps = [
  { step: "01", title: "Connect", desc: "Banks and vendors securely share transaction data via API. No changes to core banking systems required." },
  { step: "02", title: "Enrich", desc: "Ventus AI analyzes every transaction to detect lifestyle pillars, intent signals, and life events in real time." },
  { step: "03", title: "Orchestrate", desc: "Enriched intelligence flows into personalized rewards, behavioral analytics, and wealth advisor tools automatically." },
];

const stats = [
  { target: 20, suffix: "+", label: "Life events detected" },
  { target: 50, suffix: "+", label: "Lifestyle dimensions" },
  { target: null, text: "Real-time", label: "Processing" },
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const count0 = useCountUp(stats[0].target, statsVisible);
  const count1 = useCountUp(stats[1].target, statsVisible);

  return (
    <section className="py-24" style={{ background: "#0a0f1e" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">How It Works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-14">A modular intelligence layer that works with your existing stack.</h2>

        {/* Steps with connector */}
        <div ref={sectionRef} className="relative grid md:grid-cols-3 gap-8">
          {/* Horizontal connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px bg-[#1e2d4a] -translate-y-1/2 z-0">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] z-10"
              style={{ animation: "connector-dot 3s ease-in-out infinite" }}
            />
          </div>

          {steps.map((s, i) => (
            <div
              key={s.step}
              className="relative z-10 rounded-xl p-6 transition-all duration-700"
              style={{
                background: "#111827",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 200}ms`,
              }}
            >
              <p className="text-3xl font-bold text-blue-500 mb-3">{s.step}</p>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div ref={statsRef} className="mt-20 grid grid-cols-3 gap-4 md:gap-8 text-center -ml-2 md:ml-0">
          <div>
            <p className="text-2xl md:text-5xl font-bold text-white">{statsVisible ? count0 : 0}{stats[0].suffix}</p>
            <p className="text-gray-400 mt-1 text-xs md:text-base">{stats[0].label}</p>
          </div>
          <div>
            <p className="text-2xl md:text-5xl font-bold text-white">{statsVisible ? count1 : 0}</p>
            <p className="text-gray-400 mt-1 text-xs md:text-base">{stats[1].label}</p>
          </div>
          <div>
            <p className="text-2xl md:text-5xl font-bold text-white whitespace-nowrap">Real-time</p>
            <p className="text-gray-400 mt-1 text-xs md:text-base">{stats[2].label}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
