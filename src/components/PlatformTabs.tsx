import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  {
    label: "Bank-Wide Analytics",
    heading: "Bank-Wide Analytics",
    href: "/analytics",
    description:
      "See your entire portfolio through 12 lifestyle pillars — not legacy merchant codes. Spot cross-sell gaps between card products, identify revenue leaking to competitors, and personalize product recommendations at portfolio scale.",
    capabilities: [
      "Cross-sell intelligence — see which customers hold Travel cards but lack Dining rewards, and target the gap with personalized offers",
      "Revenue leakage detection — quantify wallet share lost to competitors by pillar and surface merchant partnership opportunities",
      "Card product performance matrix — compare penetration rates, activation, and spend velocity across every product in your portfolio",
    ],
  },
  {
    label: "Consumer Rewards",
    heading: "Consumer Rewards",
    href: "/smartrewards",
    description:
      "Generic cashback catalogs get ignored. Ventus builds a real-time purchase persona for each customer — lifestyle pillars, spending velocity, purchase cycle — then matches offers that feel hand-picked, not mass-blasted.",
    capabilities: [
      "Hyper-personalized offer matching — relevance scores based on actual behavior, not demographics, so every notification feels curated",
      "Spending gap detection — identify where customers spend outside your ecosystem and recapture wallet share with targeted incentives",
      "Purchase cycle prediction — time offers to when customers are most likely to buy, increasing redemption rates and reducing offer fatigue",
    ],
  },
  {
    label: "Customer Engagement",
    heading: "Customer Engagement",
    href: "/engagement",
    description:
      "Move beyond batch-and-blast. Build micro-segments from behavioral dimensions no one else has — lifestyle pillars, predicted life events, product ownership gaps — then deliver messages that land because they're relevant, not just personalized.",
    capabilities: [
      "Life event triggers — detect new parents, movers, retirees from spending patterns and activate campaigns at exactly the right moment",
      "Lifestyle pillar targeting — reach the 'Wellness Enthusiasts' or 'Pet Parents' in your portfolio with messaging that speaks to how they actually live",
      "AI-generated campaign briefs — describe your audience in plain English and get channel strategy, copy, and audience sizing in seconds",
    ],
  },
  {
    label: "Travel & Local",
    heading: "Travel & Local Experiences",
    href: "/smartrewards",
    description:
      "Detect trips from transaction patterns alone — no GPS, no permissions, no privacy concerns. Then position your bank as a holistic travel companion with curated deals and experiences across dining, arts, shopping, and entertainment — wherever your customers go.",
    capabilities: [
      "Privacy-first trip detection — infer destination, dates, and spend from transactions alone, building trust while delivering value",
      "Holistic travel companion — surface curated local experiences across dining, arts, shopping, and entertainment so your bank is part of every trip",
      "Home-city activation — the same intelligence powers local deal targeting, turning everyday spending into engagement opportunities year-round",
    ],
  },
  {
    label: "Wealth Management",
    heading: "Wealth Management",
    href: "/wealth",
    description:
      "Give every advisor a transaction-powered copilot. Detect life events — retirement, home purchase, new baby — before clients mention them. Walk into every meeting prepared with talking points, psychological insights, and proactive recommendations.",
    capabilities: [
      "AI life event detection — spot retirement planning, relocations, and family changes from spending signals with urgency scoring",
      "One-click meeting prep — auto-generated talking points, client psychology profile, and action items so advisors spend time advising, not researching",
      "Proactive relationship management — surface standout transactions and behavioral shifts before they become surprises in client conversations",
    ],
  },
];

const AnalyticsPreview = () => {
  const pillars = [
    { label: "Travel", pct: 20.4 },
    { label: "Dining", pct: 18.2 },
    { label: "Wellness", pct: 14.1 },
    { label: "Shopping", pct: 12.3 },
    { label: "Auto", pct: 9.8 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total Accounts", value: "120M" },
          { label: "Total Annual Spend", value: "$385B" },
          { label: "Active Account Rate", value: "78.5%" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-gray-100 bg-gray-50 p-2 sm:p-3 text-center">
            <p className="text-sm sm:text-lg font-bold text-gray-900">{m.value}</p>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {pillars.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-16 shrink-0">{p.label}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.pct * 3}%` }} />
            </div>
            <span className="text-[11px] font-medium text-gray-700 w-10 text-right">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RewardsPreview = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">SM</div>
      <span className="text-sm font-semibold text-gray-900">Sarah M.</span>
      <span className="ml-auto text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Outdoor Enthusiast</span>
    </div>
    {[
      { name: "REI", offer: "10% back", match: "96%" },
      { name: "Patagonia", offer: "15% back", match: "94%" },
      { name: "Delta Miles", offer: "2x miles", match: "91%" },
    ].map((o) => (
      <div key={o.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{o.name}</p>
          <p className="text-[11px] text-gray-500">{o.offer}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Matched</span>
          <span className="text-xs font-bold text-gray-700">{o.match}</span>
        </div>
      </div>
    ))}
  </div>
);

const EngagementPreview = () => (
  <div className="space-y-3">
    <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-3">
      <p className="text-[10px] text-gray-400 mb-0.5">Good morning</p>
      <p className="text-sm font-semibold text-gray-900">Wellness Explorer</p>
      <p className="text-[11px] text-gray-500">You've saved $325 this quarter through personalized rewards.</p>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Travel", detail: "3 cities visited", bg: "bg-orange-50" },
        { label: "Dining", detail: "5 new restaurants", bg: "bg-red-50" },
        { label: "Wellness", detail: "12 gym visits", bg: "bg-emerald-50" },
        { label: "Pets", detail: "2 grooming visits", bg: "bg-sky-50" },
      ].map((t) => (
        <div key={t.label} className={`${t.bg} rounded-lg p-2.5`}>
          <p className="text-xs font-semibold text-gray-900">{t.label}</p>
          <p className="text-[10px] text-gray-500">{t.detail}</p>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
      <div>
        <p className="text-xs font-semibold text-gray-900">REI Co-op</p>
        <p className="text-[10px] text-gray-500">10% back on outdoor gear</p>
      </div>
      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">For You</span>
    </div>
  </div>
);

const TravelLocalPreview = () => (
  <div className="space-y-3">
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Detected Trip</span>
          <span className="text-sm font-semibold text-gray-900">Miami, FL</span>
        </div>
        <span className="text-[10px] text-gray-400">Mar 12 – Mar 17</span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span>14 transactions</span>
        <span>$4,280 total spend</span>
      </div>
      <p className="text-[9px] text-gray-400 mt-1.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        Inferred from spending patterns — no location tracking
      </p>
    </div>
    {[
      { name: "Perez Art Museum", deal: "15% off admission", category: "Arts", bg: "bg-purple-50", text: "text-purple-700" },
      { name: "Zuma Miami", deal: "$50 dining credit", category: "Dining", bg: "bg-orange-50", text: "text-orange-700" },
      { name: "Bayside Marketplace", deal: "10% back on purchases", category: "Shopping", bg: "bg-emerald-50", text: "text-emerald-700" },
    ].map((e) => (
      <div key={e.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{e.name}</p>
          <p className="text-[11px] text-gray-500">{e.deal}</p>
        </div>
        <span className={`text-[10px] ${e.bg} ${e.text} px-2 py-0.5 rounded-full font-medium`}>{e.category}</span>
      </div>
    ))}
  </div>
);

const WealthPreview = () => (
  <div className="space-y-3">
    {[
      { name: "Margaret Chen", aum: "$4.2M", event: "Retirement Planning", urgency: "91%", timeline: "Q1 2026" },
      { name: "David Park", aum: "$1.8M", event: "Home Purchase", urgency: "87%", timeline: "Q1 2026" },
    ].map((c) => (
      <div key={c.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
            <span className="text-[10px] text-gray-500">{c.aum}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">URGENT</span>
            <span className="text-[11px] text-gray-600">{c.event}</span>
            <span className="hidden sm:inline text-[10px] text-gray-400">{c.urgency} • {c.timeline}</span>
          </div>
        </div>
        <button className="hidden sm:block text-[11px] font-medium text-blue-600 border border-blue-200 rounded-md px-3 py-1 hover:bg-blue-50 transition-colors shrink-0">
          Prepare
        </button>
      </div>
    ))}
  </div>
);

const TabPreview = ({ index }: { index: number }) => {
  const previews = [<AnalyticsPreview />, <RewardsPreview />, <EngagementPreview />, <TravelLocalPreview />, <WealthPreview />];
  return previews[index] || null;
};

const ROTATE_INTERVAL = 5000;

const PlatformTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>();

  const resetTimer = useCallback(() => {
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const handleTabClick = useCallback(
    (i: number) => {
      setActiveIndex(i);
      resetTimer();
    },
    [resetTimer]
  );

  // Auto-rotate
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / ROTATE_INTERVAL) * 100, 100);
      setProgress(pct);

      if (elapsed >= ROTATE_INTERVAL) {
        setActiveIndex((prev) => (prev + 1) % tabs.length);
        startTimeRef.current = Date.now();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tab = tabs[activeIndex];

  return (
    <section id="platform" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
          The Platform
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          One Tech Core. Five Insight Tools.
        </h2>
        <p className="text-gray-500 text-lg mb-10">
          Every team in your bank. One enrichment engine underneath.
        </p>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-8">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => handleTabClick(i)}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                i === activeIndex
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-5 min-h-[420px]">
            {/* Left Column — 2/5 */}
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tab.heading}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {tab.description}
                </p>
                <ul className="space-y-3">
                  {tab.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                      <span className="text-gray-600 text-sm leading-relaxed">
                        {cap}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <Link to="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Schedule Demo
                  </Button>
                </Link>
                <Link to={tab.href} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Right Column — 3/5: Browser Mockup */}
            <div className="md:col-span-3 bg-gray-50 p-6 md:p-8 flex items-center justify-center">
              <div className="w-full rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
                {/* Title bar */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-gray-400 font-mono">
                    ventusai.com/dashboard
                  </span>
                </div>
                {/* Dashboard content */}
                <div className="p-5 bg-white min-h-[300px]">
                  <TabPreview index={activeIndex} />
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dot indicators — hidden on mobile */}
        <div className="hidden md:flex items-center justify-center gap-2 mt-6">
          {tabs.map((_, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-3 h-3 bg-blue-600"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to tab ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformTabs;
