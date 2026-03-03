import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ────────────────────────────────────────────────────────────────────

const lifestyleProfile = {
  name: "Sarah M.",
  type: "Wellness Explorer",
  savings: "$325",
  pillars: [
    { name: "Travel", icon: "✈️", score: 87, detail: "3 cities visited, 2 countries" },
    { name: "Dining", icon: "🍽️", score: 82, detail: "5 new restaurants, Italian & Asian" },
    { name: "Wellness", icon: "💪", score: 91, detail: "4 fitness classes, 12 gym visits" },
    { name: "Pets", icon: "🐾", score: 74, detail: "2 grooming shops visited" },
  ],
};

const personalizedOffers = [
  { brand: "REI Co-op", offer: "Get 10% back on outdoor gear", tag: "Outdoor", match: 96 },
  { brand: "Sweetgreen", offer: "$5 off your next order", tag: "Dining", match: 92 },
  { brand: "Equinox", offer: "First month free", tag: "Wellness", match: 89 },
];

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
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase">Customer Engagement Intelligence</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
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
            className="p-6 md:p-8 flex flex-col transition-all duration-700"
            style={{
              opacity: triggersVisible ? 1 : 0,
              visibility: triggersVisible ? "visible" : "hidden",
            }}
          >
            <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600 uppercase mb-5">Customer Experience</span>

            {/* Browser chrome frame */}
            <div className="rounded-xl border border-[#e2e8f0] overflow-hidden flex-1 flex flex-col" style={{ background: "#f8fafc" }}>
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e2e8f0]" style={{ background: "#f1f5f9" }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-[10px] text-gray-400 font-mono bg-white rounded px-3 py-0.5 border border-[#e2e8f0]">metrobank.com/app</span>
                </div>
              </div>

              {/* App content */}
              <div className="p-4 flex-1 flex flex-col gap-3 bg-white">
                {/* App header */}
                <div className="mb-1">
                  <p className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase">Metro Bank</p>
                  <p className="text-base font-bold text-gray-900">Good morning, Sarah</p>
                  <p className="text-[11px] text-gray-500">Your personalized banking experience</p>
                </div>

                {/* Section 1 — Lifestyle Profile Banner */}
                <div
                  className="rounded-lg p-4 relative overflow-hidden transition-all duration-500"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                    opacity: triggersVisible ? 1 : 0,
                    transform: triggersVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: "200ms",
                  }}
                >
                  <p className="text-[10px] font-bold tracking-[0.15em] text-white/70 uppercase mb-1">Your Lifestyle</p>
                  <p className="text-lg font-bold text-white">WELLNESS EXPLORER</p>
                  <p className="text-[11px] text-white/80 mt-1">You balanced fitness, healthy dining, and travel this quarter</p>
                  <p className="text-[9px] text-white/40 mt-2 text-right">Powered by Ventus AI</p>
                </div>

                {/* Section 2 — Personalized Offers */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-2">For You</p>
                  <div className="space-y-2">
                    {personalizedOffers.map((offer, i) => (
                      <div
                        key={offer.brand}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-500"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          opacity: triggersVisible ? 1 : 0,
                          transform: triggersVisible ? "translateY(0)" : "translateY(12px)",
                          transitionDelay: `${i * 150 + 400}ms`,
                        }}
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900">{offer.brand}</p>
                            <span className="text-[9px] text-gray-400 font-medium">{offer.match}% match</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">{offer.offer}</p>
                        </div>
                        <span
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                          style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb" }}
                        >
                          {offer.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3 — Contextual Nudge */}
                <div
                  className="rounded-lg px-3 py-2.5 transition-all duration-500"
                  style={{
                    background: "rgba(37,99,235,0.04)",
                    border: "1px solid rgba(37,99,235,0.15)",
                    opacity: triggersVisible ? 1 : 0,
                    transform: triggersVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: "850ms",
                  }}
                >
                  <p className="text-[11px] text-blue-700">
                    <span className="mr-1">✦</span>
                    Your Wellness spend is 28% higher this month — you're on track for your fitness goal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-center text-gray-400 italic text-[12px]">
            The bank app experience above is powered entirely by Ventus transaction intelligence — no manual configuration required.
          </p>
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
