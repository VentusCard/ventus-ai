import { useState, useEffect, useRef } from "react";
import logoSalesforce from "@/assets/logo-salesforce.png";
import logoFis from "@/assets/logo-fis.png";
import logoJackHenry from "@/assets/logo-jackhenry.png";

const steps = [
  { step: "01", title: "Connect", desc: "Banks and vendors securely share transaction data via API. No changes to core banking systems required." },
  { step: "02", title: "Enrich", desc: "Ventus AI analyzes every transaction to detect lifestyle pillars, intent signals, and life events in real time." },
  { step: "03", title: "Orchestrate", desc: "Enriched intelligence flows into personalized rewards, behavioral analytics, and wealth advisor tools automatically." },
];

const stats = [
  { target: 3000, suffix: "+", label: "Dynamic labels" },
  { target: 50, suffix: "+", label: "Lifestyle dimensions" },
  { target: 20, suffix: "+", label: "Life events detected" },
];

const partners = [
  { name: "Salesforce", logo: logoSalesforce },
  { name: "FIS", logo: logoFis },
  { name: "Jack Henry", logo: logoJackHenry },
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
  const count2 = useCountUp(stats[2].target, statsVisible);

  return (
    <section id="integration" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Integration</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-14">A modular intelligence layer that works with your existing stack.</h2>

        {/* Steps */}
        <div ref={sectionRef} className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 150}ms, transform 0.5s ease ${i * 150}ms`,
              }}
            >
              <p className="text-3xl font-bold text-blue-600 mb-3">{s.step}</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div ref={statsRef} className="mt-16 grid grid-cols-3 gap-4 md:gap-8 text-center">
          <div>
            <p className="text-2xl md:text-5xl font-bold text-gray-900">{statsVisible ? count0.toLocaleString() : 0}{stats[0].suffix}</p>
            <p className="text-gray-500 mt-1 text-xs md:text-base">{stats[0].label}</p>
          </div>
          <div>
            <p className="text-2xl md:text-5xl font-bold text-gray-900">{statsVisible ? count1 : 0}{stats[1].suffix}</p>
            <p className="text-gray-500 mt-1 text-xs md:text-base">{stats[1].label}</p>
          </div>
          <div>
            <p className="text-2xl md:text-5xl font-bold text-gray-900">{statsVisible ? count2 : 0}{stats[2].suffix}</p>
            <p className="text-gray-500 mt-1 text-xs md:text-base">{stats[2].label}</p>
          </div>
        </div>

        {/* Integration Partners */}
        <div className="mt-16 text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">Integration Partners</p>
          <div className="flex items-center justify-center gap-12 md:gap-20 flex-wrap">
            {partners.map((p) => (
              <div key={p.name} className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300">
                <img src={p.logo} alt={p.name} className="h-8 md:h-10 w-auto object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
