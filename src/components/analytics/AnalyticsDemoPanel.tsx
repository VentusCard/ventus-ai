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
  { icon: TrendingUp, accent: "#3b82f6", title: "Travel Surge", text: "Travel spending surged 18% this quarter — driven by 2.1M users booking international flights, concentrated in 25-44 age group." },
  { icon: MapPin, accent: "#8b5cf6", title: "Southeast Growth", text: "Southeast region showing 22% growth in Dining & Entertainment — outpacing national average by 3x." },
  { icon: Users, accent: "#14b8a6", title: "Millennial Shift", text: "Millennials (25-34) increasing Financial & Aspirational spend by 31% YoY — largest shift across any demographic." },
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
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tabKey, setTabKey] = useState(0); // forces re-mount for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Intersection observer for initial visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!visible || paused) return;
    timerRef.current = setInterval(() => {
      setActiveTab(prev => {
        const next = (prev + 1) % 2;
        setTabKey(k => k + 1);
        return next;
      });
    }, 8000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, paused]);

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
      ref={containerRef}
      className="rounded-2xl overflow-hidden border border-gray-200 bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-8 pt-5 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-gray-900 text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Analytics Intelligence</h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Demo
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-6 md:px-8">
        {tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => switchTab(i)}
            className="relative px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: activeTab === i ? "#1e293b" : "#94a3b8" }}
          >
            {label}
            {activeTab === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="p-6 md:p-8 min-h-[420px]">
        {activeTab === 0 ? (
          <InsightsTab key={`insights-${tabKey}`} visible={visible} />
        ) : (
          <PersonalizationTab key={`personalize-${tabKey}`} visible={visible} />
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between px-6 md:px-8 py-3 border-t border-gray-100">
        <button
          onClick={() => setPaused(p => !p)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={replay}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </button>
      </div>
    </div>
  );
};

/* ── TAB 1: INSIGHTS & TRENDS ── */
const InsightsTab = ({ visible }: { visible: boolean }) => (
  <div>
    {/* Metrics row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className="rounded-xl px-3 py-3 border border-gray-200 transition-all duration-700"
          style={{
            background: "#f8fafc",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: `${i * 100}ms`,
          }}
        >
          <p className="text-gray-500 text-[11px] mb-0.5">{m.label}</p>
          <p className="text-gray-900 text-xl font-bold">{m.value}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {m.up ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-[10px] font-semibold ${m.up ? "text-emerald-600" : "text-red-500"}`}>
              {m.trend}
            </span>
            <span className="text-gray-400 text-[10px]">{m.period}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Trend insight cards */}
    <div className="space-y-3 mb-6">
      {trendInsights.map((t, i) => (
        <div
          key={t.title}
          className="flex items-start gap-3 rounded-xl p-4 border border-gray-100 transition-all duration-700"
          style={{
            background: "#fafbfc",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-20px)",
            transitionDelay: `${400 + i * 200}ms`,
          }}
        >
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${t.accent}15` }}>
            <t.icon className="w-4 h-4" style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-gray-900 text-sm font-semibold mb-0.5">{t.title}</p>
            <p className="text-gray-500 text-xs leading-relaxed">{t.text}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Pillar bars */}
    <div className="mb-5">
      <p className="text-gray-900 text-sm font-bold mb-3">Lifestyle Pillar Distribution</p>
      <div className="space-y-2.5">
        {pillars.map((p, i) => (
          <div key={p.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-700 text-xs">{p.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-xs font-semibold">{p.pct}%</span>
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${p.up ? "text-emerald-600" : "text-red-500"}`}>
                  {p.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {p.change}
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: visible ? `${(p.pct / 25) * 100}%` : "0%",
                  background: p.color,
                  transitionDelay: `${1000 + i * 120}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* AI summary */}
    <div
      className="flex items-start gap-2 rounded-lg p-3 transition-all duration-700"
      style={{
        background: "#eff6ff",
        opacity: visible ? 1 : 0,
        transitionDelay: "1600ms",
      }}
    >
      <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <p className="text-gray-600 text-xs leading-relaxed">
        <span className="font-semibold text-blue-600">AI Insight:</span> Travel & Exploration leads spending growth at 18% QoQ, primarily among 25-44 year olds. Southeast region is your fastest-growing market. Millennials are shifting heavily into Financial & Aspirational categories — a 31% YoY jump signals cross-sell opportunity.
      </p>
    </div>
  </div>
);

/* ── TAB 2: DEEP PERSONALIZATION ── */
const PersonalizationTab = ({ visible }: { visible: boolean }) => (
  <div>
    {/* Generic card */}
    <div
      className="rounded-xl border border-gray-200 p-5 mb-4 transition-all duration-700"
      style={{
        background: "#f8fafc",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-900 text-sm font-bold">Travel Rewards Card</p>
            <p className="text-gray-400 text-[10px]">Generic Campaign</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-red-400 text-lg font-bold">0.8%</p>
          <p className="text-gray-400 text-[10px]">Conversion</p>
        </div>
      </div>
      <p className="text-gray-500 text-xs italic mb-2">
        "Upgrade to our Travel Rewards Card today. Earn points on every purchase."
      </p>
      <p className="text-gray-400 text-[10px]">One message → 12.3M customers</p>
    </div>

    {/* Transformation divider */}
    <div
      className="flex items-center gap-3 my-4 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transitionDelay: "400ms",
      }}
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
        <Sparkles className="w-3 h-3 text-blue-500" />
        <span className="text-[10px] font-semibold text-blue-600">Powered by transaction intelligence</span>
        <ArrowRight className="w-3 h-3 text-blue-400" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
    </div>

    {/* Profile cards */}
    <div className="space-y-3 mb-5">
      {profiles.map((p, i) => (
        <div
          key={p.name}
          className="rounded-xl border border-gray-200 p-4 transition-all duration-700"
          style={{
            background: "#fff",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: `${600 + i * 200}ms`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: p.tagColor }}>
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="text-gray-900 text-sm font-semibold">{p.name}</p>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: p.tagColor, background: `${p.tagColor}15` }}>
                  {p.tag}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-500 text-lg font-bold">{p.conversion}</p>
              <p className="text-gray-400 text-[10px]">Conversion</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">{p.message}</p>
        </div>
      ))}
    </div>

    {/* Footer insight */}
    <div
      className="flex items-start gap-2 rounded-lg p-3 transition-all duration-700"
      style={{
        background: "#f0fdf4",
        opacity: visible ? 1 : 0,
        transitionDelay: "1200ms",
      }}
    >
      <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
      <p className="text-gray-600 text-xs leading-relaxed">
        <span className="font-semibold text-emerald-600">Result:</span> Personalized messaging drives <span className="font-bold text-gray-800">3.2x higher conversion</span> vs. generic campaigns — without changing the product, only the story.
      </p>
    </div>
  </div>
);

export default AnalyticsDemoPanel;
