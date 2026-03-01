import { useEffect, useState } from "react";

const EnrichmentMockup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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

          {/* Pipeline connector */}
          <div className="flex justify-center">
            <div className="relative w-px h-10" style={{ background: "#1e2d4a" }}>
              <div className="absolute inset-x-0 w-full h-4 rounded-full bg-blue-500/60 blur-sm animate-pipeline-glow" />
            </div>
          </div>

          {/* Enriched output */}
          <div>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase">
              Enriched Output
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill color="blue">Outdoor &amp; Adventure</Pill>
              <Pill color="purple">Pre-Summer Trip Planning</Pill>
              <Pill color="orange">Loyalty Decay Detected</Pill>
              <Pill color="teal">Life Event: Vacation Upcoming</Pill>
            </div>
          </div>

          {/* Confidence score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Confidence Score</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">94%</span>
            </div>
            <div className="h-1.5 w-full rounded-full" style={{ background: "#1a2332" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: "94%",
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                }}
              />
            </div>
          </div>

          {/* Recommendation */}
          <div
            className="rounded-lg px-3 py-2 text-[11px] text-blue-200 leading-relaxed"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
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

const Pill = ({ color, children }: { color: string; children: React.ReactNode }) => {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
};

export default EnrichmentMockup;
