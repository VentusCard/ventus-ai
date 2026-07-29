import { useEffect, useRef, useState } from "react";

const agents = [
  { name: "Merchant Identifier", desc: "Resolves merchant identity beyond name cleaning. Chain, category, local vs national, online vs physical." },
  { name: "Category Classifier", desc: "Places every transaction into one of 12 lifestyle pillars with sub-category precision." },
  { name: "Intent Detector", desc: "Identifies what the customer is planning to do next based on behavioral sequences." },
  { name: "Life Event Analyzer", desc: "Detects 20+ life events in real time — new baby, home purchase, retirement, relocation and more." },
  { name: "Risk Scorer", desc: "Assigns confidence scores to every enriched output based on signal strength and data quality." },
  { name: "Confidence Validator", desc: "Final validation layer that ensures enrichment accuracy before downstream activation." },
];

const EnrichmentPipeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {/* Desktop: horizontal flow */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-0 items-stretch">
        {agents.map((agent, i) => (
          <div key={agent.name} className="flex items-stretch">
            <div
              className="flex-1 rounded-xl p-4 bg-white shadow-sm transition-all duration-700"
              style={{
                borderLeft: "3px solid #2563eb",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <p className="font-bold text-sm mb-2" style={{ color: "#0a0f1e" }}>{agent.name}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{agent.desc}</p>
            </div>
            {i < agents.length - 1 && (
              <div className="flex items-center px-1">
                <div className="relative w-6 h-px bg-blue-200">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{
                      background: "#3b82f6",
                      boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                      animation: `connector-dot 3s ease-in-out infinite ${i * 0.4}s`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile/tablet: vertical flow */}
      <div className="lg:hidden space-y-3">
        {agents.map((agent, i) => (
          <div key={agent.name}>
            <div
              className="rounded-xl p-5 bg-white shadow-sm transition-all duration-700"
              style={{
                borderLeft: "3px solid #2563eb",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <p className="font-bold text-sm mb-1" style={{ color: "#0a0f1e" }}>{agent.name}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{agent.desc}</p>
            </div>
            {i < agents.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="relative w-px h-6 bg-blue-200">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                    style={{
                      background: "#3b82f6",
                      boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                      animation: `pipeline-dot 1.5s ease-in-out infinite ${i * 0.3}s`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrichmentPipeline;
