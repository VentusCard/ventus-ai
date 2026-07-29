import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ────────────────────────────────────────────────────────────────────

const lifestyleProfile = {
  name: "Sarah M.",
  type: "Wellness Explorer",
  savings: "$325",
  pillars: [
    { name: "Travel", icon: "✈️", score: 56, detail: "$1,240 this month" },
    { name: "Dining", icon: "🍽️", score: 22, detail: "$480 this month" },
    { name: "Wellness", icon: "💪", score: 14, detail: "$320 this month" },
    { name: "Shopping", icon: "🛍️", score: 8, detail: "$180 this month" },
  ],
};

const personalizedOffers = [
  { brand: "REI Co-op", offer: "Get 10% back on outdoor gear", tag: "Outdoor", match: 96 },
  { brand: "Sweetgreen", offer: "$5 off your next order", tag: "Dining", match: 92 },
  { brand: "Equinox", offer: "First month free", tag: "Wellness", match: 89 },
];

const pillarBudgets = [
  { name: "Travel", icon: "✈️", spend: 1240, budget: 1500, status: "near" as const },
  { name: "Dining", icon: "🍽️", spend: 480, budget: 500, status: "near" as const },
  { name: "Wellness", icon: "💪", spend: 320, budget: 250, status: "over" as const },
  { name: "Shopping", icon: "🛍️", spend: 180, budget: 400, status: "under" as const },
];

const budgetColors = {
  near: { bar: "#f59e0b", bg: "rgba(245,158,11,0.08)", text: "#b45309", label: "Near Limit" },
  over: { bar: "#ef4444", bg: "rgba(239,68,68,0.08)", text: "#dc2626", label: "Over Budget" },
  under: { bar: "#22c55e", bg: "rgba(34,197,94,0.08)", text: "#16a34a", label: "Under Budget" },
};

const TX_INTERVAL = 1200;
const TRIGGER_COUNT = 3;

const VentusEngagementDemo = () => {
  const [visiblePillars, setVisiblePillars] = useState(0);
  const [profileRevealed, setProfileRevealed] = useState(false);
  const [triggersVisible, setTriggersVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setVisiblePillars(0);
    setProfileRevealed(false);
    setTriggersVisible(false);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (visiblePillars < lifestyleProfile.pillars.length) {
      intervalRef.current = setTimeout(() => {
        const next = visiblePillars + 1;
        setVisiblePillars(next);

        if (next >= TRIGGER_COUNT && !profileRevealed) {
          setProfileRevealed(true);
          setTimeout(() => setTriggersVisible(true), 400);
        }
      }, TX_INTERVAL);
    } else if (!profileRevealed) {
      setProfileRevealed(true);
      setTimeout(() => setTriggersVisible(true), 400);
    } else {
      intervalRef.current = setTimeout(() => reset(), 5000);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [visiblePillars, isRunning, profileRevealed, reset]);

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-[#e2e8f0] bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0]">
          <h3 className="text-gray-900 text-lg font-bold">Engagement Intelligence</h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden lg:inline-block" style={{ animation: "liveDotPulse 2s ease-in-out infinite" }} />
            Live Demo
          </span>
        </div>

        <div className="grid md:grid-cols-2 min-h-[480px]">
          {/* LEFT — Customer Profile */}
          <div className="p-6 md:p-8 flex flex-col md:border-r border-b md:border-b-0 border-[#e2e8f0]">
            <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase mb-5">Customer Profile</span>

            <div className="flex items-center gap-3 mb-5 rounded-lg px-4 py-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">SM</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{lifestyleProfile.name}</p>
                <p className="text-xs text-gray-500">Premium Banking · New York, NY</p>
              </div>
            </div>

            <p className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-3">Lifestyle Pillars</p>
            <div className="flex-1 space-y-2.5">
              {lifestyleProfile.pillars.slice(0, visiblePillars).map((pillar) => (
                <div
                  key={pillar.name}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-500 animate-fade-in"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{pillar.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pillar.name}</p>
                      <p className="text-[11px] text-gray-500">{pillar.detail}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">{pillar.score}%</span>
                </div>
              ))}

              {visiblePillars === 0 && (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  Analyzing transactions…
                </div>
              )}
            </div>

            <div
              className="mt-4 rounded-lg px-4 py-3 transition-all duration-700"
              style={{
                border: profileRevealed ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent",
                background: profileRevealed ? "rgba(37,99,235,0.04)" : "transparent",
                opacity: profileRevealed ? 1 : 0,
                transform: profileRevealed ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600 text-sm font-bold">✨</span>
                <span className="text-sm font-bold text-blue-700">Profile: {lifestyleProfile.type}</span>
              </div>
              <p className="text-[11px] text-gray-500">Saved {lifestyleProfile.savings} this quarter through personalized rewards</p>
            </div>
          </div>

          {/* RIGHT — Bank App Mockup */}
          <div
            className="p-4 md:p-5 flex flex-col transition-all duration-700"
            style={{
              opacity: triggersVisible ? 1 : 0,
              visibility: triggersVisible ? "visible" : "hidden",
            }}
          >
            <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase mb-3">Customer Experience</span>

            {/* Browser chrome frame */}
            <div className="rounded-xl border border-[#e2e8f0] overflow-hidden flex-1 flex flex-col" style={{ background: "#f8fafc" }}>
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#e2e8f0]" style={{ background: "#f1f5f9" }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-[9px] text-gray-400 font-mono bg-white rounded px-2.5 py-0.5 border border-[#e2e8f0]">yourbank.com/app</span>
                </div>
              </div>

              {/* App content */}
              <div className="p-3 flex flex-col gap-2 bg-white flex-1">
                {/* App header */}
                <div>
                  <p className="text-base font-bold text-gray-900 leading-tight">Good morning, Sarah</p>
                  <p className="text-[10px] text-gray-500">Your personalized banking experience</p>
                </div>

                {/* Section 1 — Lifestyle Profile Banner */}
                <div
                  className="rounded-lg px-3 py-2.5 relative overflow-hidden transition-all duration-500"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                    opacity: triggersVisible ? 1 : 0,
                    transform: triggersVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: "200ms",
                  }}
                >
                  <p className="text-[9px] font-bold tracking-[0.15em] text-white/60 uppercase">Your Lifestyle</p>
                  <p className="text-sm font-bold text-white leading-tight">WELLNESS EXPLORER</p>
                  <p className="text-[10px] text-white/80 mt-0.5">You balanced fitness, healthy dining, and travel this quarter</p>
                  <p className="text-[8px] text-white/35 mt-1 text-right">Powered by Ventus AI</p>
                </div>

                {/* Section 2 — Personalized Offers */}
                <div>
                  <p className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-1.5">For You</p>
                  <div className="space-y-1.5">
                    {personalizedOffers.map((offer, i) => (
                      <div
                        key={offer.brand}
                        className="flex items-center justify-between rounded-md px-2.5 py-2 transition-all duration-500"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          opacity: triggersVisible ? 1 : 0,
                          transform: triggersVisible ? "translateY(0)" : "translateY(12px)",
                          transitionDelay: `${i * 150 + 400}ms`,
                        }}
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12px] font-semibold text-gray-900">{offer.brand}</p>
                            <span className="text-[8px] text-gray-400">{offer.match}%</span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{offer.offer}</p>
                        </div>
                        <span
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb" }}
                        >
                          {offer.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3 — Lifestyle Spending */}
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: triggersVisible ? 1 : 0,
                    transform: triggersVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: "1000ms",
                  }}
                >
                  <p className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-1.5">Your Lifestyle Spending</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {pillarBudgets.map((p) => {
                      const c = budgetColors[p.status];
                      const pct = Math.min((p.spend / p.budget) * 100, 100);
                      return (
                        <div
                          key={p.name}
                          className="rounded-md px-2.5 py-2"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{p.icon}</span>
                              <span className="text-[10px] font-semibold text-gray-900">{p.name}</span>
                            </div>
                            <span
                              className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: c.bg, color: c.text }}
                            >
                              {c.label}
                            </span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-gray-100 mb-0.5">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: c.bar }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-500">
                            ${p.spend.toLocaleString()} / ${p.budget.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1.5">Wellness spending is 28% over budget this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Replay Button */}
        <div className="flex justify-center py-4 border-t border-[#e2e8f0]">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Replay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VentusEngagementDemo;
