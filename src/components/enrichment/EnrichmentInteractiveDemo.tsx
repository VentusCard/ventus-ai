import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

const enrichmentMap: Record<string, { pills: string[]; action: string }> = {
  "whole foods": {
    pills: ["Health Conscious", "Premium Grocery", "Wellness Lifestyle", "High Disposable Income"],
    action: "Surface organic meal-kit partnership + wellness rewards tier upgrade",
  },
  rei: {
    pills: ["Outdoor Enthusiast", "Pre-Summer Trip Planning", "Loyalty Decay Detected"],
    action: "Serve Delta miles offer + REI cashback deal today",
  },
  "united airlines": {
    pills: ["Frequent Traveler", "Business Travel Pattern", "Miles Optimizer"],
    action: "Activate travel insurance cross-sell + lounge access offer",
  },
  delta: {
    pills: ["Frequent Traveler", "Business Travel Pattern", "Miles Optimizer"],
    action: "Activate travel insurance cross-sell + lounge access offer",
  },
  walgreens: {
    pills: ["Health Monitoring", "Pharmacy Regular", "Possible New Parent"],
    action: "Trigger baby care rewards + health savings account promo",
  },
  cvs: {
    pills: ["Health Monitoring", "Pharmacy Regular", "Possible New Parent"],
    action: "Trigger baby care rewards + health savings account promo",
  },
  zillow: {
    pills: ["Active Home Buyer", "Pre-Purchase Research", "Life Event: Home Purchase"],
    action: "Surface mortgage pre-approval + home insurance bundle",
  },
  aarp: {
    pills: ["Pre-Retiree", "Retirement Planning Active", "Benefits Research"],
    action: "Trigger retirement planning consultation + annuity product offer",
  },
};

const pillColors = [
  { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
];

const defaultResult = {
  pills: ["Consumer Spending Pattern", "Behavioral Signal Detected", "Lifestyle Profile Identified"],
  action: "Activate personalized engagement sequence based on detected patterns",
};

const exampleCards = [
  { before: "Walgreens • $47.20", pills: ["New Parent", "Baby Care Shopping", "Formula & Diapers Pattern", "Life Event: New Baby"], confidence: 97 },
  { before: "REI • $127.43", pills: ["Outdoor Enthusiast", "Pre-Summer Trip Planning", "Loyalty Decay Detected", "Life Event: Vacation Upcoming"], confidence: 94 },
  { before: "Zillow Premium • $49.99", pills: ["Home Buyer", "Active Property Search", "Pre-Purchase Research Phase", "Life Event: Home Purchase"], confidence: 96 },
  { before: "AARP • $18.00", pills: ["Pre-Retiree", "Retirement Planning Active", "Benefits Research", "Life Event: Approaching Retirement"], confidence: 93 },
  { before: "Whole Foods • $210.40", pills: ["Health Conscious", "Premium Grocery Shopper", "Wellness Lifestyle", "High Disposable Income"], confidence: 91 },
  { before: "United Airlines • $890.00", pills: ["Frequent Traveler", "Business Travel Pattern", "Miles Optimizer", "Life Event: Relocation Possible"], confidence: 95 },
];

const EnrichmentInteractiveDemo = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ pills: string[]; action: string; confidence: number } | null>(null);

  const handleEnrich = useCallback(() => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const lower = input.toLowerCase();
      const matched = Object.entries(enrichmentMap).find(([key]) => lower.includes(key));
      const data = matched ? matched[1] : defaultResult;
      const confidence = Math.floor(Math.random() * 10) + 88;
      setResult({ ...data, confidence });
      setLoading(false);
    }, 1500);
  }, [input]);

  const handleReset = () => {
    setInput("");
    setResult(null);
    setLoading(false);
  };

  return (
    <div>
      {/* Input area */}
      <div className="flex gap-3 max-w-2xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEnrich()}
          placeholder="e.g. Whole Foods • $210.40"
          className="flex-1 h-14 rounded-xl px-5 font-mono text-sm border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={handleEnrich}
          disabled={!input.trim() || loading}
          className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Enrich →
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 mt-8 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Analyzing transaction...</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          className="mt-8 max-w-2xl mx-auto rounded-2xl p-6 animate-fade-in"
          style={{ background: "#0a0f1e" }}
        >
          <p className="font-mono text-sm text-gray-400 mb-4">{input}</p>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-3">
            Enriched Output
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {result.pills.map((pill, i) => {
              const c = pillColors[i % pillColors.length];
              return (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: c.bg, color: c.text }}
                >
                  {pill}
                </span>
              );
            })}
          </div>

          {/* Confidence */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Confidence Score</span>
              <span className="text-[11px] font-bold text-emerald-400 font-mono">{result.confidence}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "#1a2332" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${result.confidence}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>

          {/* Action */}
          <div
            className="rounded-lg px-3 py-2 text-[11px] text-blue-200 leading-relaxed"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <span className="font-semibold text-blue-400">Recommended Action:</span>{" "}
            {result.action}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-[11px] text-gray-500">
              This is a simplified demo. Full enrichment runs 20+ detection models in under 100ms.
            </p>
            <button onClick={handleReset} className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* More Examples grid */}
      <div className="mt-16">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6 text-center">More Examples</p>
        <div className="grid md:grid-cols-3 gap-4">
          {exampleCards.map((card) => (
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
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${card.confidence}%` }}
                  />
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
