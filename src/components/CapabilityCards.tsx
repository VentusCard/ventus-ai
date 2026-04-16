import { Layers, Heart, Activity, Search } from "lucide-react";
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

      {/* 4 — Next-Best Rewards */}
      <ScrollReveal delay={0.3}>
        <div className="rounded-xl p-6 min-h-[220px]" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide">Next-Best Rewards</h3>
          </div>

          {/* Behavioral context */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#dbeafe", color: "#2563eb" }}>Frequent Traveler</span>
            <span className="text-[10px]" style={{ color: "#9CA3AF" }}>·</span>
            <span className="text-[10px]" style={{ color: "#6B7280" }}>Flights, Hotels, Dining detected</span>
          </div>

          {/* Deals */}
          <div className="space-y-2">
            {[
              { merchant: "Bose", product: "QuietComfort Headphones", reward: "20% Back", reason: "Complements travel routine" },
              { merchant: "Away", product: "Carry-On Suitcase", reward: "15% Off", reason: "No luggage spend detected" },
              { merchant: "Global Entry", product: "TSA PreCheck", reward: "$25 Credit", reason: "Frequent flyer gap" },
            ].map((deal) => (
              <div key={deal.merchant} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: "#111827" }}>{deal.merchant}</span>
                    <span className="text-[10px]" style={{ color: "#6B7280" }}>· {deal.product}</span>
                  </div>
                  <span className="text-[9px]" style={{ color: "#10b981" }}>↑ {deal.reason}</span>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>{deal.reward}</span>
              </div>
            ))}
          </div>

          <p className="text-xs mt-3" style={{ color: "#6B7280" }}>AI-matched deals that complete your lifestyle — not just your cart.</p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default CapabilityCards;
