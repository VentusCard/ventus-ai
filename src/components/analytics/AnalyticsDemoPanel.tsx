import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Sparkles, ArrowRight, Pause, Play, RotateCcw, Users, MapPin, BarChart3 } from "lucide-react";

/* ── DATA ── */
const metrics = [
  { label: "Travel Spend", value: "$78.4B", trend: "+18%", period: "QoQ", up: true },
  { label: "Active Users", value: "75.0M", trend: "+3.2%", period: "QoQ", up: true },
  { label: "Avg Spend/User", value: "$5,133", trend: "+7.1%", period: "YoY", up: true },
  { label: "Wallet Share", value: "34.2%", trend: "+2.4pp", period: "QoQ", up: true },
];

const trendInsights = [
  { icon: TrendingUp, accent: "#3b82f6", title: "Travel Surge", text: "Travel spending surged 18% this quarter — driven by 2.1M users booking international flights." },
  { icon: MapPin, accent: "#8b5cf6", title: "Southeast Growth", text: "Southeast region showing 22% growth in Dining & Entertainment — outpacing national average by 3x." },
  { icon: Users, accent: "#14b8a6", title: "Millennial Shift", text: "Millennials increasing Financial & Aspirational spend by 31% YoY — largest shift across any demographic." },
];

const pillars = [
  { label: "Travel & Exploration", pct: 20.4, change: "+18%", up: true, color: "#3b82f6" },
  { label: "Food & Dining", pct: 18.2, change: "+8%", up: true, color: "#8b5cf6" },
  { label: "Health & Wellness", pct: 14.1, change: "+12%", up: true, color: "#14b8a6" },
  { label: "Shopping & Retail", pct: 12.3, change: "-3%", up: false, color: "#f59e0b" },
  { label: "Financial & Aspirational", pct: 9.8, change: "+31%", up: true, color: "#22c55e" },
];

const profiles = [
  { name: "Sarah M.", tag: "Travel Explorer", tagColor: "#3b82f6", message: "You spent $4,200 on European flights last quarter — earn 5x points on your next international booking.", conversion: "4.1%" },
  { name: "James T.", tag: "Wellness Enthusiast", tagColor: "#14b8a6", message: "Your Equinox & Whole Foods spend qualifies you for our Wellness Rewards tier — unlock $120 in credits.", conversion: "3.8%" },
  { name: "Priya K.", tag: "Business Traveler", tagColor: "#8b5cf6", message: "12 hotel stays this quarter — upgrade to our Business Travel Card for complimentary lounge access.", conversion: "4.3%" },
];

/* ── COMPONENT ── */
const AnalyticsDemoPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tabKey, setTabKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActiveTab(prev => {
        const next = (prev + 1) % 2;
        setTabKey(k => k + 1);
        return next;
      });
    }, 8000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  const switchTab = useCallback((idx: number) => {
    setActiveTab(idx);
    setTabKey(k => k + 1);
  }, []);

  const replay = useCallback(() => {
    switchTab(0);
  }, [switchTab]);

  const tabs = ["Insights & Trends", "Deep Personalization"];

  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-lg"
      style={{ background: "#111827", border: "1px solid #1e2d4a" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2" style={{ borderBottom: "1px solid #1e2d4a" }}>
        <div className="flex items-center gap-2">
          <h3 className="text-white text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Analytics Intelligence</h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-400 border border-emerald-700/50" style={{ background: "rgba(16,185,129,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Demo
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex" style={{ borderBottom: "1px solid #1e2d4a" }}>
        {tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => switchTab(i)}
            className="relative px-4 py-2.5 text-xs font-medium transition-colors"
            style={{ color: activeTab === i ? "#e2e8f0" : "#475569" }}
          >
            {label}
            {activeTab === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="p-5 min-h-[340px]">
        {activeTab === 0 ? (
          <InsightsTab key={`insights-${tabKey}`} />
        ) : (
          <PersonalizationTab key={`personalize-${tabKey}`} />
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between px-5 py-2.5" style={{ borderTop: "1px solid #1e2d4a" }}>
        <button
          onClick={() => setPaused(p => !p)}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={replay}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Replay
        </button>
      </div>
    </div>
  );
};

/* ── TAB 1: INSIGHTS & TRENDS ── */
const InsightsTab = () => (
  <div>
    {/* Metrics row */}
    <div className="grid grid-cols-2 gap-2 mb-4">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className="rounded-lg px-2.5 py-2 transition-all duration-700"
          style={{
            background: "#0a0f1e",
            opacity: 0,
            transform: "translateY(12px)",
            animation: `fadeSlideUp 0.5s ease ${i * 80}ms forwards`,
          }}
        >
          <p className="text-gray-500 text-[9px] mb-0.5">{m.label}</p>
          <p className="text-white text-base font-bold">{m.value}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {m.up ? (
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5 text-red-400" />
            )}
            <span className={`text-[9px] font-semibold ${m.up ? "text-emerald-400" : "text-red-400"}`}>
              {m.trend}
            </span>
            <span className="text-gray-600 text-[9px]">{m.period}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Trend insight cards */}
    <div className="space-y-2 mb-4">
      {trendInsights.map((t, i) => (
        <div
          key={t.title}
          className="flex items-start gap-2.5 rounded-lg p-3 transition-all duration-700"
          style={{
            background: "#0d1424",
            border: "1px solid #1e2d4a",
            opacity: 0,
            transform: "translateX(-16px)",
            animation: `fadeSlideRight 0.5s ease ${300 + i * 150}ms forwards`,
          }}
        >
          <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${t.accent}20` }}>
            <t.icon className="w-3 h-3" style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-gray-200 text-[11px] font-semibold mb-0.5">{t.title}</p>
            <p className="text-gray-500 text-[10px] leading-relaxed">{t.text}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Pillar bars */}
    <div className="mb-4">
      <p className="text-gray-300 text-[10px] font-bold mb-2">Lifestyle Pillar Distribution</p>
      <div className="space-y-1.5">
        {pillars.map((p, i) => (
          <div key={p.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-gray-400 text-[10px]">{p.label}</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-[9px] font-semibold">{p.pct}%</span>
                <span className={`text-[8px] font-semibold flex items-center gap-0.5 ${p.up ? "text-emerald-400" : "text-red-400"}`}>
                  {p.up ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                  {p.change}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2d4a" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: "0%",
                  background: p.color,
                  animation: `barFill 0.8s ease ${800 + i * 100}ms forwards`,
                  // @ts-expect-error custom CSS property is not in CSSProperties
                  "--bar-width": `${(p.pct / 25) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* AI summary */}
    <div
      className="flex items-start gap-2 rounded-lg p-2.5"
      style={{
        background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.15)",
        opacity: 0,
        animation: "fadeIn 0.5s ease 1400ms forwards",
      }}
    >
      <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
      <p className="text-gray-400 text-[10px] leading-relaxed">
        <span className="font-semibold text-blue-400">AI Insight:</span> Travel leads growth at 18% QoQ among 25-44 year olds. Southeast is your fastest-growing market. Millennials shifting into Financial & Aspirational — 31% YoY signals cross-sell opportunity.
      </p>
    </div>
  </div>
);

/* ── TAB 2: DEEP PERSONALIZATION ── */
const PersonalizationTab = () => (
  <div>
    {/* Generic card */}
    <div
      className="rounded-lg p-4 mb-3"
      style={{
        background: "#0a0f1e",
        border: "1px solid #1e2d4a",
        opacity: 0,
        animation: "fadeSlideUp 0.5s ease forwards",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#1e2d4a" }}>
            <BarChart3 className="w-3 h-3 text-gray-500" />
          </div>
          <div>
            <p className="text-gray-200 text-xs font-bold">Travel Rewards Card</p>
            <p className="text-gray-600 text-[9px]">Generic Campaign</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-red-400 text-base font-bold">0.8%</p>
          <p className="text-gray-600 text-[9px]">Conversion</p>
        </div>
      </div>
      <p className="text-gray-500 text-[10px] italic mb-1">
        "Upgrade to our Travel Rewards Card today. Earn points on every purchase."
      </p>
      <p className="text-gray-600 text-[9px]">One message → 12.3M customers</p>
    </div>

    {/* Transformation divider */}
    <div
      className="flex items-center gap-2 my-3"
      style={{ opacity: 0, animation: "fadeIn 0.5s ease 300ms forwards" }}
    >
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #1e3a5f, transparent)" }} />
      <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
        <Sparkles className="w-2.5 h-2.5 text-blue-400" />
        <span className="text-[8px] font-semibold text-blue-400">Powered by transaction intelligence</span>
        <ArrowRight className="w-2.5 h-2.5 text-blue-500" />
      </div>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #1e3a5f, transparent)" }} />
    </div>

    {/* Profile cards */}
    <div className="space-y-2 mb-4">
      {profiles.map((p, i) => (
        <div
          key={p.name}
          className="rounded-lg p-3"
          style={{
            background: "#0d1424",
            border: "1px solid #1e2d4a",
            opacity: 0,
            animation: `fadeSlideUp 0.5s ease ${500 + i * 150}ms forwards`,
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: p.tagColor }}>
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="text-gray-200 text-[11px] font-semibold">{p.name}</p>
                <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: p.tagColor, background: `${p.tagColor}18` }}>
                  {p.tag}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-sm font-bold">{p.conversion}</p>
              <p className="text-gray-600 text-[8px]">Conversion</p>
            </div>
          </div>
          <p className="text-gray-500 text-[10px] leading-relaxed">{p.message}</p>
        </div>
      ))}
    </div>

    {/* Footer insight */}
    <div
      className="flex items-start gap-2 rounded-lg p-2.5"
      style={{
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.15)",
        opacity: 0,
        animation: "fadeIn 0.5s ease 1000ms forwards",
      }}
    >
      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
      <p className="text-gray-400 text-[10px] leading-relaxed">
        <span className="font-semibold text-emerald-400">Result:</span> Personalized messaging drives <span className="font-bold text-gray-200">3.2x higher conversion</span> vs. generic campaigns.
      </p>
    </div>
  </div>
);

export default AnalyticsDemoPanel;
