import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Users, Mail, Pause, Play } from "lucide-react";

type Segment = {
  id: string;
  label: string;
  reach: number;
  topCategory: string;
  secondCategory: string;
  subject: string;
  body: string;
  valueMath: string;
};

const SEGMENTS: Segment[] = [
  {
    id: "dining",
    label: "Dining-led households",
    reach: 18420,
    topCategory: "Dining",
    secondCategory: "Grocery",
    subject: "Your dining habit could earn you $237 more this year",
    body: "You spend most nights out — pick Dining as your 3% category and keep 2% on groceries and wholesale clubs. Everything else earns 1%. $0 annual fee.",
    valueMath: "~$280/mo dining + ~$650/mo grocery ≈ $237/yr vs a flat 1% card.",
  },
  {
    id: "grocery",
    label: "Grocery-led families",
    reach: 24310,
    topCategory: "Grocery",
    secondCategory: "Gas & Fuel",
    subject: "3% back on the aisle you visit every week",
    body: "Groceries are your #1 spend. Set 3% on Grocery, keep 2% on Gas & Fuel for the commute, and 1% on the rest. $0 annual fee.",
    valueMath: "~$850/mo grocery + ~$220/mo gas ≈ $359/yr vs a flat 1% card.",
  },
  {
    id: "commuter",
    label: "Commuter households",
    reach: 12180,
    topCategory: "Gas & Fuel",
    secondCategory: "Dining",
    subject: "3% at the pump, 2% on dinners out",
    body: "You're on the road daily. Choose Gas as your 3% category, keep Dining at 2%, and 1% everywhere else. Plus a $200 welcome bonus after $1,000 in 90 days.",
    valueMath: "~$320/mo gas + ~$180/mo dining ≈ $158/yr vs a flat 1% card.",
  },
  {
    id: "travel",
    label: "Frequent travelers",
    reach: 9640,
    topCategory: "Travel",
    secondCategory: "Dining",
    subject: "3% on every flight and hotel this year",
    body: "Your top spend lives on airlines and hotels. Set Travel as your 3% category and keep Dining at 2% for meals on the road. Everything else earns 1%.",
    valueMath: "~$540/mo travel + ~$210/mo dining ≈ $246/yr vs a flat 1% card.",
  },
  {
    id: "online",
    label: "Online shoppers",
    reach: 15780,
    topCategory: "Online Shopping",
    secondCategory: "Streaming",
    subject: "3% back on the cart you already fill every week",
    body: "Online marketplaces are your #1 spend. Pick Online Shopping as your 3% category and keep Streaming at 2%. No annual fee, no category caps.",
    valueMath: "~$620/mo online + ~$95/mo streaming ≈ $234/yr vs a flat 1% card.",
  },
  {
    id: "wholesale",
    label: "Wholesale-club shoppers",
    reach: 7420,
    topCategory: "Wholesale Clubs",
    secondCategory: "Grocery",
    subject: "3% on every warehouse run",
    body: "You buy in bulk. Set Wholesale Clubs as your 3% category, keep 2% on Grocery for the weekly top-up, and 1% on everything else.",
    valueMath: "~$480/mo wholesale + ~$310/mo grocery ≈ $209/yr vs a flat 1% card.",
  },
];

const MAX_REACH = Math.max(...SEGMENTS.map((s) => s.reach));

const ROTATE_MS = 5500;

const formatReach = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
};

const CampaignStudioPreview = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const hoveringRef = useRef(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (!hoveringRef.current) {
        setActiveIdx((i) => (i + 1) % SEGMENTS.length);
      }
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const totalReach = useMemo(
    () => SEGMENTS.reduce((sum, s) => sum + s.reach, 0),
    []
  );
  const active = SEGMENTS[activeIdx];

  return (
    <div
      className="rounded-2xl bg-white"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
        padding: 24,
      }}
      onMouseEnter={() => {
        hoveringRef.current = true;
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500">
            Campaign Studio · Powered by Ventus
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
          <Users className="w-3.5 h-3.5" />
          <span>Total reachable: {formatReach(totalReach)}</span>
        </div>
      </div>

      {/* Product band */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 mb-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-blue-600 mb-1">
              The Product
            </p>
            <p className="text-lg font-semibold text-gray-900">Cash Rewards Card</p>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              <span className="font-semibold text-blue-700">3%</span> on your top
              spending category ·{" "}
              <span className="font-semibold text-blue-700">2%</span> on your
              second · <span className="font-medium">1%</span> everything else.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-medium text-gray-700">
              $0 annual fee
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-medium text-gray-700">
              $200 welcome bonus
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-medium text-gray-700">
              After $1,000 in 90 days
            </span>
          </div>
        </div>
      </div>

      {/* Segment section */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          One product · Three segments
        </p>
        <button
          onClick={() => setPaused((p) => !p)}
          className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-800"
          aria-label={paused ? "Resume rotation" : "Pause rotation"}
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "Play" : "Pause"}
        </button>
      </div>

      {/* Segment tabs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {SEGMENTS.map((s, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveIdx(i);
                setPaused(true);
              }}
              className={`relative overflow-hidden rounded-lg border p-3 text-left transition-all ${
                isActive
                  ? "border-blue-300 bg-blue-50/60"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <p
                className={`text-[11px] uppercase tracking-wide ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                Segment {i + 1}
              </p>
              <p
                className={`text-sm font-semibold mt-0.5 ${
                  isActive ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {s.label}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {formatReach(s.reach)} reachable
              </p>
              {isActive && !paused && (
                <span
                  key={activeIdx}
                  className="absolute left-0 bottom-0 h-0.5 bg-blue-500"
                  style={{
                    animation: `ventus-progress ${ROTATE_MS}ms linear forwards`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Email draft card */}
      <div
        key={active.id}
        className="rounded-xl border border-gray-200 bg-white p-5 animate-in fade-in slide-in-from-bottom-1 duration-300"
        style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.03)" }}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-gray-900 leading-tight">
                Ventus AI Coworker
              </p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                Draft · to {active.label}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[11px] font-medium border border-green-100">
            {formatReach(active.reach)} reachable
          </span>
        </div>

        <p className="text-[13px] font-semibold text-gray-900 mb-2 leading-snug">
          {active.subject}
        </p>
        <p className="text-[13px] text-gray-700 leading-relaxed mb-3">
          {active.body}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold">
            3% · {active.topCategory}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-[11px] font-semibold">
            2% · {active.secondCategory}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium">
            1% · everything else
          </span>
        </div>

        <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-1.5 inline-block mb-3">
          {active.valueMath}
        </p>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Mail className="w-3 h-3 text-gray-400" />
          <div className="flex flex-wrap gap-1.5">
            {["Email", "Mobile Push", "In-App"].map((c) => (
              <span
                key={c}
                className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ventus-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CampaignStudioPreview;
