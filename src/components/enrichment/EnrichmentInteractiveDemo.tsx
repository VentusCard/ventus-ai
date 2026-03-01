import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDown } from "lucide-react";

const pillColors = [
  { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
];

const examples = [
  { before: "Walgreens • $47.20", pills: ["New Parent", "Baby Care Shopping", "Formula & Diapers Pattern", "Life Event: New Baby"], confidence: 97 },
  { before: "REI • $127.43", pills: ["Outdoor Enthusiast", "Pre-Summer Trip Planning", "Loyalty Decay Detected", "Life Event: Vacation Upcoming"], confidence: 94 },
  { before: "Zillow Premium • $49.99", pills: ["Home Buyer", "Active Property Search", "Pre-Purchase Research Phase", "Life Event: Home Purchase"], confidence: 96 },
  { before: "AARP • $18.00", pills: ["Pre-Retiree", "Retirement Planning Active", "Benefits Research", "Life Event: Approaching Retirement"], confidence: 93 },
  { before: "Whole Foods • $210.40", pills: ["Health Conscious", "Premium Grocery Shopper", "Wellness Lifestyle", "High Disposable Income"], confidence: 91 },
  { before: "United Airlines • $890.00", pills: ["Frequent Traveler", "Business Travel Pattern", "Miles Optimizer", "Life Event: Relocation Possible"], confidence: 95 },
];

const CYCLE = 5000;

const EnrichmentInteractiveDemo = () => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "before" | "arrow" | "after" | "fading">("idle");
  const [barWidth, setBarWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runCycle = useCallback((i: number) => {
    clearTimeouts();
    setIndex(i);
    setPhase("idle");
    setBarWidth(0);

    schedule(() => setPhase("before"), 100);
    schedule(() => setPhase("arrow"), 800);
    schedule(() => {
      setPhase("after");
      setTimeout(() => setBarWidth(examples[i].confidence), 200);
    }, 1300);
    schedule(() => setPhase("fading"), CYCLE - 600);
    schedule(() => runCycle((i + 1) % examples.length), CYCLE);
  }, [clearTimeouts, schedule]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runCycle(0);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeouts(); };
  }, [runCycle, clearTimeouts]);

  const ex = examples[index];
  const showBefore = phase !== "idle" && phase !== "fading";
  const showArrow = phase === "arrow" || phase === "after";
  const showAfter = phase === "after";

  return (
    <div>
      {/* Cycling animation */}
      <div ref={sectionRef} className="relative max-w-2xl mx-auto" style={{ minHeight: 380 }}>
        <p className="text-xs text-gray-400 text-right mb-3">
          {index + 1} of {examples.length}
        </p>

        <div className="space-y-4">
          {/* BEFORE */}
          <div
            className="rounded-xl p-6 transition-all duration-500"
            style={{
              background: "#f8f9fa",
              opacity: showBefore ? 1 : 0,
              transform: showBefore ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase mb-2">Before</p>
            <p className="text-gray-700 text-lg font-mono">"{ex.before}"</p>
          </div>

          {/* Arrow */}
          <div
            className="flex justify-center transition-all duration-500"
            style={{
              opacity: showArrow ? 1 : 0,
              transform: showArrow ? "scaleY(1)" : "scaleY(0)",
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="w-px h-8 bg-blue-300 relative overflow-hidden">
                <div className="absolute inset-0 w-full h-4 bg-blue-500 blur-sm animate-[arrow-glow_1.5s_ease-in-out_infinite]" />
              </div>
              <ArrowDown className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          {/* AFTER */}
          <div
            className="rounded-xl p-6 transition-all duration-700"
            style={{
              background: "#0a0f1e",
              opacity: showAfter ? 1 : 0,
              transform: showAfter ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-3">After</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {ex.pills.map((pill, i) => {
                const c = pillColors[i % pillColors.length];
                return (
                  <span
                    key={pill}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-300"
                    style={{
                      background: c.bg,
                      color: c.text,
                      opacity: showAfter ? 1 : 0,
                      transitionDelay: `${i * 100}ms`,
                    }}
                  >
                    {pill}
                  </span>
                );
              })}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400">Confidence Score</span>
                <span className="text-[11px] font-bold text-emerald-400 font-mono">{ex.confidence}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#1a2332" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${barWidth}%`,
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                    transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Examples grid */}
      <div className="mt-16">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6 text-center">More Examples</p>
        <div className="grid md:grid-cols-3 gap-4">
          {examples.map((card) => (
            <div key={card.before} className="rounded-xl p-4 border border-gray-200 bg-white">
              <p className="text-xs font-bold tracking-widest text-red-500 uppercase mb-1">Before</p>
              <p className="text-gray-700 text-sm mb-3">"{card.before}"</p>
              <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-1">After</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {card.pills.map((pill, i) => {
                  const c = pillColors[i % pillColors.length];
                  return (
                    <span
                      key={pill}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {pill}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full" style={{ background: "#e5e7eb" }}>
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${card.confidence}%` }} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600">{card.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnrichmentInteractiveDemo;
