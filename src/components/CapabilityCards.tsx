import { Layers, Heart, Activity, Gift, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const CapabilityCards = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 1 — Lifestyle Pillars */}
      <ScrollReveal>
        <div className="rounded-xl p-6 min-h-[220px]" style={{ background: "#F3F4F6" }}>
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
      <ScrollReveal delay={0.1}>
        <div className="rounded-xl p-6 min-h-[220px]" style={{ background: "#F3F4F6" }}>
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

      {/* 3 — Well-being Signals */}
      <ScrollReveal delay={0.2}>
        <div className="rounded-xl p-6 min-h-[220px]" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide">Well-being Signals</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Financial Stability", status: "green", value: "Strong" },
              { label: "Spending Momentum", status: "yellow", value: "Moderate" },
              { label: "Stress Indicator", status: "green", value: "Low" },
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
          <p className="text-xs mt-4" style={{ color: "#6B7280" }}>Financial wellness indicators surfaced from transaction behavior.</p>
        </div>
      </ScrollReveal>

      {/* 4 — Purchase Cycle Intel */}
      <ScrollReveal delay={0.3}>
        <div className="rounded-xl p-6 min-h-[220px]" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide">Purchase Cycle Intel</h3>
          </div>
          <div className="space-y-3">
            {[
              { intent: "Auto Purchase", progress: 78, timeframe: "Next 30 days" },
              { intent: "Vacation Booking", progress: 62, timeframe: "Next 60 days" },
              { intent: "Insurance Renewal", progress: 45, timeframe: "Next 90 days" },
            ].map((item) => (
              <div key={item.intent}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "#111827" }}>{item.intent}</span>
                  <span className="text-[10px]" style={{ color: "#6B7280" }}>{item.timeframe}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.progress}%`, background: "#f97316" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#6B7280" }}>Surface intent signals before they become transactions.</p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default CapabilityCards;
