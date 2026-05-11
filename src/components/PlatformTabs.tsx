import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Pause, Play, ArrowRight, Trophy, Lightbulb } from "lucide-react";
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
    label: "Customer Experience",
    heading: "Customer Experience",
    href: "/engagement",
    description:
      "Power a next-gen banking UX that adapts to every customer. Transaction intelligence drives personalized home screens, lifestyle-aware budgeting, and contextual nudges — making your app feel built for each individual.",
    capabilities: [
      "Lifestyle-aware interfaces — dynamically adapt app content, budgeting views, and product highlights based on each customer's spending pillars",
      "Contextual nudges — surface timely insights like over-budget alerts and spending shifts at the moment they matter, inside the banking experience",
      "Life stage personalization — detect new parents, movers, and retirees from transaction patterns and tailor the entire UX to their current reality",
    ],
  },
  {
    label: "Travel Experience",
    heading: "Travel Experience",
    href: "/travel",
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
    { label: "Travel", pct: 20.4, accounts: "24.5M", leakage: 4.2, color: "#3b82f6" },
    { label: "Dining", pct: 18.2, accounts: "21.8M", leakage: 6.1, color: "#f97316" },
    { label: "Wellness", pct: 14.1, accounts: "16.9M", leakage: 3.8, color: "#10b981" },
    { label: "Shopping", pct: 12.3, accounts: "14.8M", leakage: 5.5, color: "#8b5cf6" },
  ];
  const products = [
    { name: "Travel Rewards", pen: "34.2%", active: "82%", spend: "$18.4K", color: "bg-blue-400" },
    { name: "Cashback Plus", pen: "28.7%", active: "71%", spend: "$12.1K", color: "bg-emerald-400" },
    { name: "Premium Elite", pen: "8.1%", active: "94%", spend: "$42.8K", color: "bg-purple-400" },
  ];
  return (
    <div className="space-y-3 min-w-0 max-w-full">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-w-0">
        {[
          { label: "Total Accounts", value: "120M" },
          { label: "Total Annual Spend", value: "$385B" },
          { label: "Active Account Rate", value: "78.5%" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-gray-100 bg-gray-50 p-1.5 sm:p-3 text-center min-w-0">
            <p className="text-xs sm:text-lg font-bold text-gray-900 tabular-nums">{m.value}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight break-words hyphens-auto">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5 min-w-0">
        {pillars.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-gray-500 w-11 sm:w-14 shrink-0 truncate">{p.label}</span>
            <div className="flex-1 min-w-0 h-3.5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="h-full rounded-l-full shrink-0" style={{ width: `${(p.pct - p.leakage) * 3}%`, backgroundColor: p.color }} />
              <div className="h-full bg-red-300 shrink-0" style={{ width: `${p.leakage * 3}%` }} />
            </div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 w-10 sm:w-12 shrink-0 text-right tabular-nums">{p.accounts}</span>
            <span className="text-[8px] sm:text-[9px] text-red-400 w-8 sm:w-10 text-right shrink-0 tabular-nums">-{p.leakage}%</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg border-l-[3px] border-l-blue-500 border border-gray-100 p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-900">Cross-Sell Gap Detected</p>
          <p className="text-[10px] text-gray-500 break-words">Travel cardholders missing Dining rewards — <span className="font-semibold text-blue-600">23% gap</span></p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">12.4K accounts</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-700 mb-1.5">Card Product Performance</p>
        <div className="space-y-1">
          {products.map((p) => (
            <div
              key={p.name}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] gap-x-1.5 gap-y-0.5 items-center text-[9px] sm:text-[10px] rounded-md border border-gray-100 px-2 py-1.5 min-w-0"
            >
              <span className={`w-2 h-2 rounded-full ${p.color} shrink-0`} />
              <span className="font-medium text-gray-800 min-w-0 truncate">{p.name}</span>
              <span className="text-gray-500 tabular-nums shrink-0">{p.pen}</span>
              <span className={`tabular-nums shrink-0 font-semibold ${p.active === "94%" ? "text-green-600" : "text-gray-700"}`}>{p.active}</span>
              <span className="text-gray-600 font-medium tabular-nums text-right shrink-0">{p.spend}</span>
            </div>
          ))}
        </div>
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
      { name: "REI", msg: "Your weekend trail runs deserve gear rewards", match: "96%" },
      { name: "Patagonia", msg: "Adventure-ready styles picked for you", match: "94%" },
      { name: "Delta Miles", msg: "Your next mountain getaway, on us", match: "91%" },
    ].map((o) => (
      <div key={o.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{o.name}</p>
          <p className="text-[11px] text-gray-500 italic">{o.msg}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">AI Personalized</span>
          <span className="text-xs font-bold text-gray-700">{o.match}</span>
        </div>
      </div>
    ))}
  </div>
);

const EngagementPreview = () => {
  const pillars: { name: string; icon: string; spend: number; budget: number; subcategories?: { label: string; amount: number }[] }[] = [
    { name: "Food", icon: "🍽️", spend: 620, budget: 700, subcategories: [{ label: "Groceries", amount: 340 }, { label: "Cafes", amount: 180 }, { label: "Delivery", amount: 100 }] },
    { name: "Travel", icon: "✈️", spend: 1240, budget: 1500, subcategories: [{ label: "Trip to New York", amount: 520 }, { label: "Trip to Rome", amount: 480 }, { label: "Trip to Banff", amount: 240 }] },
    { name: "Active Living", icon: "🏃", spend: 280, budget: 350 },
    { name: "Wellness", icon: "💆", spend: 320, budget: 250 },
  ];

  return (
    <div className="space-y-3">
      {/* Greeting */}
      <div>
        <p className="text-sm font-bold text-slate-900">Good morning, Sarah</p>
        <p className="text-[10px] text-slate-400">Your personalized banking experience</p>
      </div>

      {/* Lifestyle Banner */}
      <div className="rounded-lg px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
        <p className="text-[8px] font-bold tracking-[0.15em] uppercase text-white/60">Your Lifestyle</p>
        <p className="text-sm font-bold text-white uppercase">Culinary Traveler</p>
        <p className="text-[10px] text-white/70 mt-0.5">Top spending: Food & Travel</p>
      </div>

      {/* Lifestyle Spending 2×2 */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase mb-2">Your Lifestyle Spending</p>
        <div className="grid grid-cols-2 gap-1.5">
          {pillars.map((p) => {
            const pct = Math.min((p.spend / p.budget) * 100, 100);
            const isOver = p.spend > p.budget;
            const barColor = isOver ? "#ef4444" : pct > 80 ? "#f59e0b" : "#22c55e";
            return (
              <div key={p.name} className="rounded-lg px-2.5 py-2 bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{p.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-900 flex-1">{p.name}</span>
                  {p.name === "Travel" && (
                    <div className="flex items-center gap-1">
                      <span className="text-[7px] text-slate-400">Trip View</span>
                      <div className="w-5 h-3 rounded-full bg-blue-500 flex items-center justify-end px-0.5">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 mb-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <p className="text-[8px] text-slate-400">${p.spend.toLocaleString()} / ${p.budget.toLocaleString()}</p>
                {p.subcategories && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200 space-y-0.5">
                    {p.subcategories.map((sub) => (
                      <div key={sub.label} className="flex items-center justify-between text-[8px]">
                        <span className="text-slate-500 truncate mr-1">{sub.label}</span>
                        <span className="text-slate-400 whitespace-nowrap">${sub.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {/* Savings Streak Card */}
        <div className="rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-2">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-3 h-3 text-amber-600" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Achievement</span>
          </div>
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[10px] font-bold text-slate-900">Savings Streak</p>
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Saver Pro</span>
          </div>
          <p className="text-[8px] text-slate-500 mb-1.5">12/16 weeks of saving $50+</p>
          <div className="w-full h-1.5 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-amber-400" style={{ width: "75%" }} />
          </div>
        </div>

        {/* Emergency Fund Card */}
        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-2">
          <div className="flex items-center gap-1 mb-1">
            <Lightbulb className="w-3 h-3 text-blue-600" />
            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">On Track</span>
          </div>
          <p className="text-[10px] font-bold text-slate-900 mb-0.5">Emergency Fund</p>
          <p className="text-[8px] text-slate-500 leading-snug mb-1.5">68% to your 3-month safety net. Auto-save $25/wk to hit it by August.</p>
          <div className="w-full h-1.5 rounded-full bg-slate-200 mb-1">
            <div className="h-full rounded-full bg-blue-500" style={{ width: "68%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const TravelLocalPreview = () => (
  <div className="space-y-3">
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Detected Trip</span>
        <span className="text-sm font-semibold text-gray-900">Miami, FL</span>
      </div>
      <p className="text-[13px] font-bold text-slate-800">Hi John, welcome to Miami!</p>
      <p className="text-[11px] text-slate-500 mb-2">Your Ventus Bank Membership gets you the following deals:</p>
      <p className="text-[9px] text-gray-400 flex items-center gap-1">
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
    <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-3 flex items-center justify-between cursor-pointer">
      <div>
        <p className="text-[12px] font-bold text-blue-700">Explore National Deals</p>
        <p className="text-[10px] text-blue-600/80">200+ deals available nationwide</p>
      </div>
      <span className="text-blue-400 text-lg">→</span>
    </div>
  </div>
);

const WealthPreview = () => {
  const clients = [
    {
      name: "Margaret Chen", aum: "$4.2M", event: "Retirement Planning", urgency: "91%", timeline: "Q1 2026",
      txns: [
        { merchant: "Fidelity Rollover", amount: "$45,000", source: "Premium Card", color: "bg-purple-500", note: "401k consolidation" },
        { merchant: "AARP Membership", amount: "$48", source: "Checking", color: "bg-slate-400", note: "membership activation" },
        { merchant: "Schwab Advisory", amount: "$2,400", source: "Travel Card", color: "bg-blue-500", note: "annual fee payment" },
        { merchant: "Medicare Supplement", amount: "$312", source: "HSA", color: "bg-amber-500", note: "coverage upgrade" },
      ],
    },
    {
      name: "David Park", aum: "$1.8M", event: "Home Purchase", urgency: "87%", timeline: "Q1 2026",
      txns: [
        { merchant: "Zillow Premium", amount: "$35", source: "Checking", color: "bg-slate-400", note: "active home search" },
        { merchant: "Home Depot", amount: "$1,280", source: "Cashback Card", color: "bg-green-500", note: "renovation planning" },
        { merchant: "First American Title", amount: "$450", source: "Premium Card", color: "bg-purple-500", note: "title search initiated" },
        { merchant: "Lowe's Pro Services", amount: "$890", source: "Travel Card", color: "bg-blue-500", note: "contractor materials" },
      ],
    },
  ];
  return (
    <div className="space-y-3">
      {clients.map((c) => (
        <div key={c.name} className="rounded-lg border border-gray-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
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
          <div className="border-t border-gray-100 pt-1.5 space-y-1">
            {c.txns.map((t) => (
              <div key={t.merchant} className="flex items-center gap-2 text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${t.color} shrink-0`} />
                <span className="font-medium text-gray-700">{t.merchant}</span>
                <span className="text-gray-400">{t.amount}</span>
                <span className="text-gray-400 italic">— {t.note}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const TabPreview = ({ index }: { index: number }) => {
  const previews = [<AnalyticsPreview />, <RewardsPreview />, <EngagementPreview />, <TravelLocalPreview />, <WealthPreview />];
  return previews[index] || null;
};

const ROTATE_INTERVAL = 10000;

const PlatformTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>();
  const pausedElapsedRef = useRef(0);

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

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      if (!prev) {
        // Pausing — save elapsed time
        pausedElapsedRef.current = Date.now() - startTimeRef.current;
      } else {
        // Resuming — restore start time so progress continues
        startTimeRef.current = Date.now() - pausedElapsedRef.current;
      }
      return !prev;
    });
  }, []);

  // Auto-rotate
  useEffect(() => {
    const tick = () => {
      if (!paused) {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / ROTATE_INTERVAL) * 100, 100);
        setProgress(pct);

        if (elapsed >= ROTATE_INTERVAL) {
          setActiveIndex((prev) => (prev + 1) % tabs.length);
          startTimeRef.current = Date.now();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused]);

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
          Every team in your bank. One Multi-rail Enrichment engine underneath.
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
        <div className="border border-gray-200 rounded-2xl overflow-hidden min-w-0 max-w-full">
          <div className="grid md:grid-cols-5 min-h-[420px] min-w-0">
            {/* Left Column — 2/5 */}
            <div className="md:col-span-2 p-6 sm:p-8 md:p-10 flex flex-col justify-between min-w-0">
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
              <div className="mt-8">
                <Link to={tab.href}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column — 3/5: Browser Mockup */}
            <div className="md:col-span-3 bg-white p-4 sm:p-6 md:p-8 flex items-center justify-center min-w-0">
              <div className="w-full max-w-full min-w-0 rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
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
                <div className="p-4 sm:p-5 bg-white min-h-[300px] min-w-0 max-w-full overflow-x-auto">
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

        {/* Dot indicators with pause button — hidden on mobile */}
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
          <button
            onClick={togglePause}
            className="ml-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label={paused ? "Resume auto-rotate" : "Pause auto-rotate"}
          >
            {paused ? (
              <Play className="w-3.5 h-3.5 text-gray-600 ml-0.5" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PlatformTabs;
