import { Layers, Heart, Plane, Search } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const CapabilityCards = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
      {/* 1 — Lifestyle Pillars */}
      <ScrollReveal className="h-full">
        <div className="rounded-xl p-6 min-h-[220px] h-full flex flex-col" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Lifestyle Pillars</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Travel & Adventure", amount: "$4,280", pct: 72, color: "#3b82f6" },
              { label: "Food & Dining", amount: "$2,140", pct: 55, color: "#8b5cf6" },
              { label: "Health & Wellness", amount: "$1,390", pct: 40, color: "#14b8a6" },
              { label: "Financial Planning", amount: "$980", pct: 28, color: "#f59e0b" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: row.color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "#111827" }}>{row.label}</span>
                    <span className="text-xs font-semibold" style={{ color: "#111827" }}>{row.amount}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#6B7280" }}>12 behavioral categories extracted from spending patterns.</p>
        </div>
      </ScrollReveal>

      {/* 2 — Life Event Detection */}
      <ScrollReveal delay={0.1} className="h-full">
        <div className="rounded-xl p-6 min-h-[220px] h-full flex flex-col" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-bold text-green-600 uppercase tracking-wide">Life Event Detection</h3>
          </div>
          <div className="space-y-3">
            {[
              { event: "New Baby", confidence: "96%", detail: "8 transactions detected" },
              { event: "Home Purchase", confidence: "91%", detail: "12 transactions detected" },
              { event: "Retirement Planning", confidence: "87%", detail: "5 transactions detected" },
            ].map((item) => (
              <div key={item.event} className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold" style={{ color: "#111827" }}>{item.event}</span>
                  <p className="text-[10px]" style={{ color: "#6B7280" }}>{item.detail}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  {item.confidence}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#6B7280" }}>20+ life events detected in real time from transaction patterns.</p>
        </div>
      </ScrollReveal>

      {/* 3 — Travel Detection */}
      <ScrollReveal delay={0.2} className="h-full">
        <div className="rounded-xl p-6 min-h-[220px] h-full flex flex-col" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide">Travel Detection</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Trip Identified", status: "green", value: "Miami, FL" },
              { label: "Travel Window", status: "yellow", value: "Mar 12–18" },
              { label: "Spend Category", status: "green", value: "Leisure" },
            ].map((sig) => (
              <div key={sig.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: sig.status === "green" ? "#22c55e" : sig.status === "yellow" ? "#f59e0b" : "#ef4444",
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: "#111827" }}>{sig.label}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#111827" }}>{sig.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#6B7280" }}>Trips inferred from transaction location and timing patterns.</p>
        </div>
      </ScrollReveal>

      {/* 4 — Purchase Cycle Intel */}
      <ScrollReveal delay={0.3} className="h-full">
        <div className="rounded-xl p-6 min-h-[220px] h-full flex flex-col" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide">Purchase Cycle Intel</h3>
          </div>

          {/* Mini seasonal timeline */}
          <div className="space-y-3 mb-3">
            {[
              { label: "Travel & Adventure", months: [false, true, true, false, false, true, true, false, false, false, true, true], next: "May", delta: "+14%" },
              { label: "Kids & Baby", months: [true, true, false, true, false, false, true, false, true, false, true, false], next: "Jul", delta: "+294%" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold" style={{ color: "#111827" }}>{row.label}</span>
                  <span className="text-[9px] font-semibold" style={{ color: "#f97316" }}>↗ {row.delta}</span>
                </div>
                <div className="flex items-center gap-[3px]">
                  {row.months.map((active, i) => (
                    <div
                      key={i}
                      className="flex-1 h-[6px] rounded-sm transition-all"
                      style={{
                        background: active ? "#f97316" : "#e5e7eb",
                        opacity: active ? 0.85 : 0.5,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px]" style={{ color: "#9CA3AF" }}>Jan</span>
                  <span className="text-[8px]" style={{ color: "#9CA3AF" }}>Dec</span>
                </div>
              </div>
            ))}
          </div>

          {/* Predicted next purchases */}
          <div className="flex items-center gap-2 flex-wrap">
            {["Luggage", "Headphones", "SPF Skincare"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(249,115,22,0.1)", color: "#ea580c" }}>
                <span style={{ fontSize: 8 }}>↑</span> {item}
              </span>
            ))}
          </div>

          <p className="text-xs mt-3" style={{ color: "#6B7280" }}>Predict what customers need next from seasonal spending rhythms.</p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default CapabilityCards;
