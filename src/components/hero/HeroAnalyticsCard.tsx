import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, Users, Sparkles, ArrowRight, CreditCard, Target, BarChart3 } from "lucide-react";

/* ── STEP DATA ── */

// Step 1: Spending Trends
const pillars = [
  { label: "Travel & Exploration", pct: 20.4, change: "+18%", up: true, color: "#3b82f6" },
  { label: "Food & Dining", pct: 18.2, change: "+8%", up: true, color: "#8b5cf6" },
  { label: "Health & Wellness", pct: 14.1, change: "+12%", up: true, color: "#14b8a6" },
  { label: "Shopping & Retail", pct: 12.3, change: "-3%", up: false, color: "#f59e0b" },
  { label: "Financial & Aspirational", pct: 9.8, change: "+31%", up: true, color: "#22c55e" },
];

// Step 2: Segmentation
const segments = [
  { name: "Travel Enthusiasts", users: "6.8M", match: "81%", color: "#3b82f6", pillars: ["Travel", "Dining", "Entertainment"] },
  { name: "Wellness Explorers", users: "4.2M", match: "73%", color: "#14b8a6", pillars: ["Health", "Food", "Fitness"] },
  { name: "Affluent Investors", users: "2.1M", match: "68%", color: "#8b5cf6", pillars: ["Financial", "Luxury", "Travel"] },
];

// Step 3: Cross-Sell
const crossSellRows = [
  { from: "Standard", to: "Premium Card", opportunity: "$2.4B", intensity: 0.8 },
  { from: "Rewards", to: "Travel Card", opportunity: "$1.5B", intensity: 0.5 },
  { from: "Travel", to: "Premium Card", opportunity: "$2.8B", intensity: 0.9 },
];

// Step 4: Personalization
const profiles = [
  { name: "Sarah M.", tag: "European Travel", color: "#3b82f6", message: "3x points on flights & fine dining across Europe.", conversion: "4.1%" },
  { name: "James T.", tag: "Hawaii Enthusiast", color: "#f59e0b", message: "5x points on island stays & oceanfront dining.", conversion: "3.8%" },
  { name: "Priya K.", tag: "Business Travel", color: "#8b5cf6", message: "Complimentary lounge access on every trip.", conversion: "4.3%" },
];

const STEPS = [
  { label: "Trends", icon: TrendingUp },
  { label: "Segments", icon: Users },
  { label: "Cross-Sell", icon: Target },
  { label: "Personalize", icon: CreditCard },
];

const ROTATE_INTERVAL = 5000;

const HeroAnalyticsCard = () => {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);

  const goToStep = useCallback((s: number) => {
    setStep(s);
    setAnimKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setStep(prev => {
        const next = (prev + 1) % 4;
        setAnimKey(k => k + 1);
        return next;
      });
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="w-full max-w-md min-w-0 rounded-2xl overflow-hidden mx-auto"
      style={{ background: "#111827", border: "1px solid #1e2d4a" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2" style={{ borderBottom: "1px solid #1e2d4a" }}>
        <div className="flex items-center gap-2">
          <h3 className="text-white text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Analytics Intelligence
          </h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-400 border border-emerald-700/50" style={{ background: "rgba(16,185,129,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="grid grid-cols-4 min-w-0" style={{ borderBottom: "1px solid #1e2d4a" }}>
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => goToStep(i)}
            className="relative min-w-0 flex items-center justify-center gap-1 py-2.5 px-0.5 text-[9px] sm:text-[10px] font-medium transition-colors"
            style={{ color: step === i ? "#e2e8f0" : "#475569" }}
          >
            <s.icon className="w-3 h-3 shrink-0" />
            <span className="truncate">{s.label}</span>
            {step === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 min-h-[280px] sm:min-h-[310px] min-w-0 max-w-full overflow-x-auto">
        {step === 0 && <TrendsStep key={`t-${animKey}`} />}
        {step === 1 && <SegmentsStep key={`s-${animKey}`} />}
        {step === 2 && <CrossSellStep key={`c-${animKey}`} />}
        {step === 3 && <PersonalizeStep key={`p-${animKey}`} />}
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1e2d4a" }}>
              <div
                className="h-full rounded-full"
                style={{
                  background: i === step ? "#3b82f6" : i < step ? "#3b82f680" : "transparent",
                  width: i === step ? "100%" : i < step ? "100%" : "0%",
                  animation: i === step && !paused ? `progressFill ${ROTATE_INTERVAL}ms linear forwards` : undefined,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes progressFill { from { width: 0% } to { width: 100% } }
        @keyframes heroFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroFadeRight { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes heroBarGrow { from { width: 0%; } to { width: var(--bar-w); } }
      `}</style>
    </div>
  );
};

/* ── STEP 1: TRENDS ── */
const TrendsStep = () => (
  <div className="min-w-0 max-w-full">
    {/* Top metrics */}
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 min-w-0">
      {[
        { label: "Annual Spend", value: "$385B", trend: "+12%", up: true },
        { label: "Active Users", value: "75M", trend: "+3.2%", up: true },
        { label: "Wallet Share", value: "34.2%", trend: "+2.4pp", up: true },
      ].map((m, i) => (
        <div
          key={m.label}
          className="rounded-lg px-1 sm:px-2 py-2 text-center min-w-0"
          style={{
            background: "#0a0f1e",
            animation: `heroFadeUp 0.4s ease ${i * 60}ms both`,
          }}
        >
          <p className="text-white text-xs sm:text-sm font-bold tabular-nums">{m.value}</p>
          <p className="text-gray-500 text-[7px] sm:text-[8px] uppercase tracking-wider mt-0.5 leading-tight">{m.label}</p>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {m.up ? <TrendingUp className="w-2 h-2 text-emerald-400" /> : <TrendingDown className="w-2 h-2 text-red-400" />}
            <span className={`text-[8px] font-semibold ${m.up ? "text-emerald-400" : "text-red-400"}`}>{m.trend}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Pillar bars */}
    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Lifestyle Pillar Distribution</p>
    <div className="space-y-2">
      {pillars.map((p, i) => (
        <div key={p.label} style={{ animation: `heroFadeUp 0.4s ease ${200 + i * 60}ms both` }}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-300 text-[10px]">{p.label}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-[9px] font-semibold">{p.pct}%</span>
              <span className={`text-[8px] font-semibold ${p.up ? "text-emerald-400" : "text-red-400"}`}>{p.change}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2d4a" }}>
            <div
              className="h-full rounded-full"
              style={{
                background: p.color,
                // @ts-ignore
                "--bar-w": `${(p.pct / 25) * 100}%`,
                animation: `heroBarGrow 0.8s ease ${400 + i * 80}ms both`,
              }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* AI insight */}
    <div
      className="flex items-start gap-2 rounded-lg p-2.5 mt-4"
      style={{
        background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.15)",
        animation: "heroFadeUp 0.4s ease 900ms both",
      }}
    >
      <Sparkles className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-gray-400 text-[10px] leading-relaxed">
        <span className="font-semibold text-blue-400">AI:</span> Travel leads growth at 18% QoQ. Millennials shifting into Financial — 31% YoY signals cross-sell.
      </p>
    </div>
  </div>
);

/* ── STEP 2: SEGMENTS ── */
const SegmentsStep = () => (
  <div>
    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Behavioral Segments</p>
    <div className="space-y-2.5">
      {segments.map((seg, i) => (
        <div
          key={seg.name}
          className="rounded-lg p-3"
          style={{
            background: "#0d1424",
            border: "1px solid #1e2d4a",
            animation: `heroFadeRight 0.4s ease ${i * 120}ms both`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" style={{ color: seg.color }} />
              <span className="text-gray-200 text-[11px] font-bold">{seg.name}</span>
            </div>
            <span className="text-gray-500 text-[10px]">{seg.users}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {seg.pillars.map(p => (
              <span key={p} className="px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={{ background: `${seg.color}18`, color: seg.color }}>
                {p}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #1e2d4a" }}>
            <span className="text-gray-500 text-[9px]">Cross-sell propensity</span>
            <span className="text-[10px] font-bold" style={{ color: seg.color }}>{seg.match}</span>
          </div>
        </div>
      ))}
    </div>

    <div
      className="flex items-start gap-2 rounded-lg p-2.5 mt-3"
      style={{
        background: "rgba(20,184,166,0.08)",
        border: "1px solid rgba(20,184,166,0.15)",
        animation: "heroFadeUp 0.4s ease 500ms both",
      }}
    >
      <Sparkles className="w-3 h-3 text-teal-400 mt-0.5 shrink-0" />
      <p className="text-gray-400 text-[10px] leading-relaxed">
        <span className="font-semibold text-teal-400">AI:</span> Travel Enthusiasts show highest upsell propensity — 81% match to co-branded card.
      </p>
    </div>
  </div>
);

/* ── STEP 3: CROSS-SELL ── */
const CrossSellStep = () => (
  <div>
    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Cross-Sell Opportunities</p>
    
    <div className="space-y-2 mb-4">
      {crossSellRows.map((row, i) => (
        <div
          key={row.from}
          className="rounded-lg p-3 flex items-center justify-between"
          style={{
            background: "#0d1424",
            border: "1px solid #1e2d4a",
            animation: `heroFadeUp 0.4s ease ${i * 120}ms both`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[10px]">{row.from}</span>
            <ArrowRight className="w-3 h-3 text-gray-600" />
            <span className="text-gray-200 text-[11px] font-semibold">{row.to}</span>
          </div>
          <div className="text-right">
            <p className="text-blue-400 text-sm font-bold">{row.opportunity}</p>
            <p className="text-gray-600 text-[8px]">Revenue opp.</p>
          </div>
        </div>
      ))}
    </div>

    {/* Mini heatmap */}
    <div className="rounded-lg p-3 mb-3" style={{ background: "#0a0f1e" }}>
      <p className="text-gray-400 text-[9px] font-semibold mb-2">Opportunity Heatmap</p>
      <div className="grid grid-cols-4 gap-1">
        {[0.8, 0.4, 0.5, 0.9, 0.2, 0.6, 0.3, 1.0, 0.12, 0.7, 0.15, 0.45].map((v, i) => (
          <div
            key={i}
            className="h-6 rounded-sm flex items-center justify-center text-[7px] font-bold"
            style={{
              background: `rgba(59,130,246,${v * 0.3})`,
              color: v > 0.5 ? "#93c5fd" : "#475569",
              animation: `heroFadeUp 0.3s ease ${300 + i * 40}ms both`,
            }}
          >
            {v > 0.3 ? `$${(v * 3.1).toFixed(1)}B` : ""}
          </div>
        ))}
      </div>
    </div>

    <div
      className="flex items-start gap-2 rounded-lg p-2.5"
      style={{
        background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.15)",
        animation: "heroFadeUp 0.4s ease 700ms both",
      }}
    >
      <Target className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-gray-400 text-[10px] leading-relaxed">
        <span className="font-semibold text-blue-400">$6.7B</span> total cross-sell revenue opportunity identified across 12.3M eligible users.
      </p>
    </div>
  </div>
);

/* ── STEP 4: PERSONALIZE ── */
const PersonalizeStep = () => (
  <div>
    {/* Generic vs personalized */}
    <div
      className="rounded-lg p-3 mb-2"
      style={{
        background: "#0a0f1e",
        border: "1px solid #1e2d4a",
        animation: "heroFadeUp 0.4s ease both",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3 text-gray-500" />
          <span className="text-gray-400 text-[10px]">Generic Campaign</span>
        </div>
        <span className="text-red-400 text-sm font-bold">0.8%</span>
      </div>
      <p className="text-gray-600 text-[9px] italic">"Upgrade to our Travel Card today."</p>
    </div>

    {/* Divider */}
    <div className="flex items-center gap-2 my-2" style={{ animation: "heroFadeUp 0.3s ease 200ms both" }}>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #1e3a5f, transparent)" }} />
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
        <Sparkles className="w-2.5 h-2.5 text-blue-400" />
        <span className="text-[7px] font-semibold text-blue-400">Transaction Intelligence</span>
      </div>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #1e3a5f, transparent)" }} />
    </div>

    {/* Personalized profiles */}
    <div className="space-y-2 mb-3">
      {profiles.map((p, i) => (
        <div
          key={p.name}
          className="rounded-lg p-2.5"
          style={{
            background: "#0d1424",
            border: "1px solid #1e2d4a",
            animation: `heroFadeRight 0.4s ease ${300 + i * 120}ms both`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: p.color }}>
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="text-gray-200 text-[10px] font-semibold">{p.name}</p>
                <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: p.color, background: `${p.color}18` }}>
                  {p.tag}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-xs font-bold">{p.conversion}</p>
              <p className="text-gray-600 text-[7px]">Conv.</p>
            </div>
          </div>
          <p className="text-gray-500 text-[9px] leading-relaxed mt-1">{p.message}</p>
        </div>
      ))}
    </div>

    <div
      className="flex items-start gap-2 rounded-lg p-2.5"
      style={{
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.15)",
        animation: "heroFadeUp 0.4s ease 800ms both",
      }}
    >
      <TrendingUp className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
      <p className="text-gray-400 text-[10px] leading-relaxed">
        <span className="font-semibold text-emerald-400">3.2x higher conversion</span> with transaction-personalized messaging.
      </p>
    </div>
  </div>
);

export default HeroAnalyticsCard;
