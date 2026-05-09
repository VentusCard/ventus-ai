import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Users, ArrowRight, Sparkles, Mail, Smartphone, MessageSquare, Bell, User, Plane, CreditCard } from "lucide-react";

const segments = [
  {
    name: "Wellness Explorers",
    users: "4.2M",
    pillars: ["Health & Wellness", "Food & Dining", "Fitness"],
    crossSell: "Premium Rewards Card",
    matchRate: "73%",
    color: "#14b8a6",
  },
  {
    name: "Travel Enthusiasts",
    users: "6.8M",
    pillars: ["Travel & Exploration", "Dining", "Entertainment"],
    crossSell: "Co-Branded Travel Card",
    matchRate: "81%",
    color: "#3b82f6",
  },
  {
    name: "Affluent Investors",
    users: "2.1M",
    pillars: ["Financial & Aspirational", "Luxury", "Travel"],
    crossSell: "Wealth Management Suite",
    matchRate: "68%",
    color: "#8b5cf6",
  },
];

const heatmapProducts = ["Standard Card", "Rewards Card", "Travel Card", "Premium Card"];
const heatmapData = [
  [null, "$1.2B", "$0.8B", "$2.4B"],
  ["$0.6B", null, "$1.5B", "$3.1B"],
  ["$0.4B", "$0.9B", null, "$2.8B"],
  ["$0.2B", "$0.3B", "$0.5B", null],
];
const heatmapIntensity = [
  [0, 0.4, 0.25, 0.8],
  [0.2, 0, 0.5, 1],
  [0.12, 0.3, 0, 0.9],
  [0.05, 0.1, 0.15, 0],
];

const campaignSteps = [
  {
    label: "Detect",
    desc: "Identify Travel+Dining overlap segment",
    detail: "12.3M users · 3.2x engagement lift",
  },
  {
    label: "Match",
    desc: "AI selects optimal cross-sell product",
    detail: "Co-branded Travel Card · 81% propensity",
  },
  {
    label: "Activate",
    desc: "Generate personalized campaign brief",
    detail: "4 channels · A/B tested copy",
  },
];

const channels = [
  { icon: Mail, label: "Email", preview: "Your travel spending unlocked a special offer…" },
  { icon: Bell, label: "Push", preview: "🌍 New: 3x points on your next trip" },
  { icon: MessageSquare, label: "SMS", preview: "Travel more, earn more. Upgrade today →" },
  { icon: Smartphone, label: "In-App", preview: "Personalized banner with trip history" },
];

const CrossSellTargetingSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="cross-sell-targeting" ref={sectionRef} className="py-24 bg-white scroll-mt-20 min-w-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 min-w-0 max-w-full">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
            SEE IT IN ACTION
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Turn spending patterns into revenue.
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-2xl">
            Ventus automatically detects behavioral segments, sizes cross-sell opportunities, and generates personalized campaigns — all from transaction data.
          </p>
        </ScrollReveal>

        {/* ── 1. Behavioral Segments ── */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-5">
            Behavioral Segmentation
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {segments.map((seg, i) => (
              <div
                key={seg.name}
                className="rounded-xl border border-gray-200 p-5 transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: seg.color }} />
                  <span className="text-gray-900 font-bold text-sm">{seg.name}</span>
                  <span className="ml-auto text-gray-400 text-xs font-semibold">{seg.users} users</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {seg.pillars.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Recommended</p>
                    <p className="text-xs font-semibold text-gray-900">{seg.crossSell}</p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${seg.color}15`, color: seg.color }}
                  >
                    {seg.matchRate} match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Cross-Sell Heatmap ── */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">
            Cross-Sell Opportunity Matrix
          </p>
          <p className="text-gray-400 text-xs mb-5">
            Revenue opportunity when upgrading customers from current product (row) to target product (column)
          </p>
          <div
            className="rounded-xl border border-gray-200 overflow-hidden transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "500ms",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium">From ↓ / To →</th>
                    {heatmapProducts.map((p) => (
                      <th key={p} className="px-4 py-3 text-gray-500 text-xs font-medium text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapProducts.map((rowProduct, ri) => (
                    <tr key={rowProduct} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700 text-xs font-medium">{rowProduct}</td>
                      {heatmapData[ri].map((val, ci) => (
                        <td key={ci} className="px-4 py-3 text-center">
                          {val ? (
                            <span
                              className="inline-block px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-1000"
                              style={{
                                background: visible
                                  ? `rgba(59,130,246,${heatmapIntensity[ri][ci] * 0.2})`
                                  : "transparent",
                                color: visible ? "#1e40af" : "transparent",
                                transitionDelay: `${(ri * 4 + ci) * 80 + 600}ms`,
                              }}
                            >
                              {val}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* AI insight callout */}
          <div
            className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg transition-all duration-700"
            style={{
              background: "#f0f6ff",
              opacity: visible ? 1 : 0,
              transitionDelay: "1200ms",
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-bold text-blue-600">12.3M users</span> show Travel + Dining overlap — ideal for co-branded card upsell with an estimated <span className="font-bold text-gray-900">$3.1B</span> revenue opportunity.
            </p>
          </div>
        </div>

        {/* ── 3. Campaign Activation Flow ── */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">
            AI-Powered Campaign Activation
          </p>
          <p className="text-gray-400 text-xs mb-6">
            From behavioral detection to personalized outreach in seconds
          </p>

          {/* 3-step flow */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {campaignSteps.map((step, i) => (
              <div key={step.label} className="relative">
                <div
                  className="rounded-xl border border-gray-200 p-5 h-full transition-all duration-700"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(16px)",
                    transitionDelay: `${i * 200 + 800}ms`,
                  }}
                >
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                    {`0${i + 1}`} {step.label}
                  </p>
                  <p className="text-gray-900 text-sm font-semibold mb-1">{step.desc}</p>
                  <p className="text-gray-400 text-xs">{step.detail}</p>
                </div>
                {i < 2 && (
                  <ArrowRight
                    className="hidden md:block absolute top-1/2 -right-3 w-5 h-5 text-gray-300 -translate-y-1/2 z-10"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Channel previews */}
          <div
            className="rounded-xl border border-gray-200 p-5 transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transitionDelay: "1500ms",
            }}
          >
            <p className="text-gray-900 text-sm font-bold mb-4">Generated Campaign — 4 Channels</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {channels.map((ch, i) => (
                <div
                  key={ch.label}
                  className="rounded-lg p-3 transition-all duration-500"
                  style={{
                    background: "#f8fafc",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: `${i * 120 + 1600}ms`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ch.icon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">{ch.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{ch.preview}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Deep Personalization ── */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Hyper-Personalized Messaging
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
              <CreditCard className="w-3 h-3" /> Example: Travel Card Cross-Sale
            </span>
          </div>
          <p className="text-gray-900 text-lg font-semibold mb-1">
            Same product. Three completely different stories.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Ventus AI crafts unique messaging for each customer based on their actual spending behavior — not generic segments.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Sarah M.",
                tags: ["European Travel", "Fine Dining"],
                signals: ["4 Paris flights this year", "12 Michelin-rated restaurants"],
                message: "Reward your next European summer getaway — 3x points on flights & fine dining across the continent.",
                color: "#3b82f6",
                emoji: "🇫🇷",
              },
              {
                name: "James T.",
                tags: ["Hawaii Enthusiast", "Family"],
                signals: ["3 Honolulu trips in 18 months", "Resort & family dining bookings"],
                message: "Alohas from Hawaii are sweeter with 5x points on island stays & oceanfront dining.",
                color: "#f59e0b",
                emoji: "🌺",
              },
              {
                name: "Priya K.",
                tags: ["Business Travel", "Wellness"],
                signals: ["22 domestic flights this quarter", "Airport lounge & spa visits"],
                message: "Turn every business trip into first-class rewards — complimentary lounge access included.",
                color: "#8b5cf6",
                emoji: "✈️",
              },
            ].map((profile, i) => (
              <div
                key={profile.name}
                className="rounded-xl border border-gray-200 overflow-hidden transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * 180 + 1800}ms`,
                }}
              >
                {/* Profile header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: profile.color }}
                    >
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{profile.name}</p>
                      <div className="flex gap-1.5 mt-0.5">
                        {profile.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                            style={{ background: `${profile.color}12`, color: profile.color }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Behavioral signals */}
                  <div className="space-y-1 mb-3">
                    {profile.signals.map((s) => (
                      <div key={s} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Plane className="w-3 h-3 text-gray-400 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalized message */}
                <div
                  className="mx-3 mb-4 p-3.5 rounded-lg border"
                  style={{
                    background: `linear-gradient(135deg, ${profile.color}08, ${profile.color}04)`,
                    borderColor: `${profile.color}20`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3 h-3" style={{ color: profile.color }} />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      AI-Generated Message
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    <span className="mr-1">{profile.emoji}</span>
                    "{profile.message}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion insight */}
          <div
            className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-lg transition-all duration-700"
            style={{
              background: "#f0f6ff",
              opacity: visible ? 1 : 0,
              transitionDelay: "2400ms",
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-bold text-blue-600">3.2x higher conversion</span> when messaging is personalized from transaction signals vs. generic segment-level campaigns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrossSellTargetingSection;
