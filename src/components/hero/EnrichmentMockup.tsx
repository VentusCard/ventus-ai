import { useEffect, useState, useCallback } from "react";

const CYCLE_DURATION = 6000;
const FILL_DURATION = 1500;
const FADE_IN_DELAY = 300;

const EnrichmentMockup = () => {
  const [cardVisible, setCardVisible] = useState(false);
  const [phase, setPhase] = useState<"filling" | "visible" | "fading">("filling");
  const [barWidth, setBarWidth] = useState(0);
  const [pillsVisible, setPillsVisible] = useState(false);

  // Initial card fade-in
  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Cycle loop
  const startCycle = useCallback(() => {
    setPhase("filling");
    setBarWidth(0);
    setPillsVisible(false);

    // Fade in pills
    const t1 = setTimeout(() => setPillsVisible(true), FADE_IN_DELAY);
    // Start bar fill
    const t2 = setTimeout(() => setBarWidth(94), FADE_IN_DELAY + 50);
    // Mark visible
    const t3 = setTimeout(() => setPhase("visible"), FILL_DURATION + FADE_IN_DELAY);
    // Start fade out before next cycle
    const t4 = setTimeout(() => {
      setPhase("fading");
      setPillsVisible(false);
      setBarWidth(0);
    }, CYCLE_DURATION - 800);

    return [t1, t2, t3, t4];
  }, []);

  useEffect(() => {
    if (!cardVisible) return;
    let timers = startCycle();
    const interval = setInterval(() => {
      timers = startCycle();
    }, CYCLE_DURATION);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [cardVisible, startCycle]);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden animate-float"
        style={{
          background: "#0a0f1e",
          border: "1px solid #1e2d4a",
          transform: "rotate(-2deg)",
          maxWidth: 420,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-[#1e2d4a]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-white text-xs font-medium tracking-wide">
            Transaction Enrichment Engine
          </span>
          <span className="ml-auto text-[10px] text-emerald-400 font-mono">Live</span>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Raw input */}
          <div>
            <span className="text-[10px] font-mono font-semibold text-blue-400 tracking-widest uppercase">
              Raw Input
            </span>
            <div
              className="mt-1.5 rounded-lg px-3 py-2 font-mono text-sm text-gray-300"
              style={{ background: "#111827" }}
            >
              REI&nbsp;&bull;&nbsp;$127.43&nbsp;&bull;&nbsp;March&nbsp;14
            </div>
          </div>

          {/* Pipeline connector with traveling dot */}
          <div className="flex justify-center">
            <div className="relative w-px h-12" style={{ background: "#1e2d4a" }}>
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-pipeline-dot"
                style={{
                  background: "#3b82f6",
                  boxShadow: "0 0 8px 3px rgba(59,130,246,0.6), 0 0 16px 6px rgba(59,130,246,0.3)",
                }}
              />
            </div>
          </div>

          {/* Enriched output */}
          <div>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase">
              Enriched Output
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { color: "blue", label: "Outdoor & Adventure" },
                { color: "purple", label: "Pre-Summer Trip Planning" },
                { color: "orange", label: "Loyalty Decay Detected" },
                { color: "teal", label: "Life Event: Vacation Upcoming" },
              ].map((pill, i) => (
                <Pill
                  key={pill.label}
                  color={pill.color}
                  visible={pillsVisible}
                  delay={i * 100}
                >
                  {pill.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Confidence score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Confidence Score</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                {barWidth > 0 ? "94%" : "0%"}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full" style={{ background: "#1a2332" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barWidth}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  transition: barWidth > 0
                    ? `width ${FILL_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`
                    : "width 400ms ease-in",
                }}
              />
            </div>
          </div>

          {/* Recommendation */}
          <div
            className="rounded-lg px-3 py-2 text-[11px] text-blue-200 leading-relaxed transition-opacity duration-500"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              opacity: pillsVisible ? 1 : 0,
            }}
          >
            <span className="font-semibold text-blue-400">Recommended Action:</span>{" "}
            Serve Delta miles offer + REI cashback deal today
          </div>
        </div>
      </div>
    </div>
  );
};

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  purple: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  orange: { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  teal: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
};

const Pill = ({
  color,
  children,
  visible,
  delay,
}: {
  color: string;
  children: React.ReactNode;
  visible: boolean;
  delay: number;
}) => {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{
        background: c.bg,
        color: c.text,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </span>
  );
};

export default EnrichmentMockup;
