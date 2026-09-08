import { useEffect, useRef, useState } from "react";
import { PRODUCT_FLOWS, type FlowCategory } from "@/lib/productAutomatedFlows";

const BEATS = [
  {
    eyebrow: "The catalogue",
    copy: "Your whole product shelf, mapped to the signals that make each one relevant. 76 products across Wealth, Lending, Deposits, Cards and Insurance.",
  },
  {
    eyebrow: "Zoom into one",
    copy: "Take one. The 529 College Savings Plan fires on three triggers, each named in plain English.",
  },
  {
    eyebrow: "Your rules",
    copy: "Risk and compliance own these switches. Turn one off and it stops matching, immediately and everywhere.",
  },
  {
    eyebrow: "Where it lands",
    copy: "What matches flows to wherever your teams already work. Nothing sends without a person approving it.",
  },
];

const CATEGORY_TONE: Record<FlowCategory, string> = {
  Wealth: "border-violet-200 bg-violet-50 text-violet-800",
  Lending: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Deposits: "border-sky-200 bg-sky-50 text-sky-800",
  Cards: "border-amber-200 bg-amber-50 text-amber-800",
  Insurance: "border-rose-200 bg-rose-50 text-rose-800",
};

const CATEGORY_DOT: Record<FlowCategory, string> = {
  Wealth: "bg-violet-500",
  Lending: "bg-emerald-500",
  Deposits: "bg-sky-500",
  Cards: "bg-amber-500",
  Insurance: "bg-rose-500",
};

const CATEGORY_ORDER: FlowCategory[] = ["Wealth", "Lending", "Deposits", "Cards", "Insurance"];

const TILES = [...PRODUCT_FLOWS].sort(
  (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
);

const FLOW_529 = {
  name: "529 College Savings Plan",
  category: "Wealth" as FlowCategory,
  status: "Active",
  matched: 7_700_000,
  triggers: [
    { label: "New baby in the household", family: "Life event", weight: 2_600_000 },
    { label: "Has a child heading to college", family: "Life event", weight: 3_300_000 },
    { label: "Paying for education outside tuition", family: "Behavioral", weight: 1_800_000 },
  ],
};

const DESTINATIONS = [
  { name: "Personalized Deals", facing: "Consumer-facing" },
  { name: "Personalized Product", facing: "Consumer-facing" },
  { name: "Personalized Relationship", facing: "Consumer-facing" },
  { name: "AI Coworker", facing: "Bank-facing" },
  { name: "Automated Flows", facing: "Bank-facing" },
];

const formatM = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

const Toggle = ({ on }: { on: boolean }) => (
  <span
    className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-500 ${
      on ? "bg-blue-600" : "bg-slate-300"
    }`}
  >
    <span
      className={`h-3 w-3 rounded-full bg-white shadow transition-transform duration-500 ${
        on ? "translate-x-3.5" : "translate-x-0.5"
      }`}
    />
  </span>
);

const CatalogueGrid = ({ dim }: { dim: boolean }) => (
  <div
    className={`grid grid-cols-4 gap-1.5 transition-all duration-700 sm:grid-cols-6 ${
      dim ? "scale-[0.98] opacity-25 blur-[1px]" : "opacity-100"
    }`}
  >
    {TILES.map((flow, index) => (
      <div
        key={flow.id}
        className={`rounded-md border px-1.5 py-1.5 ${CATEGORY_TONE[flow.category]}`}
        style={{ transitionDelay: `${index * 6}ms` }}
      >
        <p className="truncate text-[8.5px] font-medium leading-tight">{flow.name}</p>
        <p className="mt-0.5 text-[8px] opacity-70">{flow.signals.length} triggers</p>
      </div>
    ))}
  </div>
);

const FlowCard = ({ thirdOn, matched }: { thirdOn: boolean; matched: number }) => (
  <div className="w-full max-w-sm rounded-lg border border-slate-300 bg-white shadow-lg">
    <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Automated flow
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{FLOW_529.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[FLOW_529.category]}`} />
          {FLOW_529.category} · {FLOW_529.status}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Matched</p>
        <p className="text-lg font-bold tabular-nums text-slate-900 transition-colors duration-500">
          {formatM(matched)}
        </p>
      </div>
    </div>
    <div className="divide-y divide-slate-200">
      {FLOW_529.triggers.map((trigger, index) => {
        const on = index < 2 || thirdOn;
        return (
          <div
            key={trigger.label}
            className={`flex items-center justify-between gap-3 px-4 py-2.5 transition-all duration-500 ${
              on ? "opacity-100" : "opacity-45 grayscale"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-slate-700">{trigger.label}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{trigger.family}</p>
            </div>
            <Toggle on={on} />
          </div>
        );
      })}
    </div>
  </div>
);

const Destinations = ({ show }: { show: boolean }) => (
  <div
    className={`mt-4 w-full max-w-sm transition-all duration-700 ${
      show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
    }`}
  >
    <div className="mx-auto h-5 w-px bg-slate-300" />
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {DESTINATIONS.map((dest, index) => {
        const consumer = dest.facing === "Consumer-facing";
        return (
          <div
            key={dest.name}
            className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 transition-all duration-500 ${
              consumer
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-slate-50 text-slate-600"
            } ${show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            style={{ transitionDelay: `${index * 90}ms` }}
          >
            <span className="text-[11px] font-medium">{dest.name}</span>
            <span className="text-[9px] uppercase tracking-wide opacity-70">{dest.facing}</span>
          </div>
        );
      })}
    </div>
    <p className="mt-2 text-center text-[10px] text-slate-400">
      Customer-facing outreach is drafted, never sent automatically.
    </p>
  </div>
);

const BeatVisual = ({
  beat,
  thirdOn,
  matched,
}: {
  beat: number;
  thirdOn: boolean;
  matched: number;
}) => (
  <div className="relative flex min-h-[440px] w-full items-center justify-center">
    <div
      className={`absolute inset-x-0 transition-opacity duration-700 ${
        beat === 0 ? "opacity-100" : "opacity-100"
      }`}
    >
      <CatalogueGrid dim={beat >= 1} />
    </div>

    <div
      className={`absolute flex w-full flex-col items-center transition-all duration-700 ${
        beat >= 1 ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
      }`}
    >
      <FlowCard thirdOn={thirdOn} matched={matched} />
      <Destinations show={beat >= 3} />
    </div>
  </div>
);

const AutomatedFlowsSection = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [thirdOn, setThirdOn] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(media.matches && !motion.matches);
    update();
    media.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        setBeat(Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pinned]);

  // Beat 3 demonstration: switch the third trigger off, then back on.
  useEffect(() => {
    if (beat !== 2) {
      setThirdOn(true);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const loop = () => {
      if (cancelled) return;
      setThirdOn(false);
      timers.push(window.setTimeout(() => !cancelled && setThirdOn(true), 2200));
      timers.push(window.setTimeout(loop, 4600));
    };
    timers.push(window.setTimeout(loop, 700));
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [beat]);

  const matched = thirdOn
    ? FLOW_529.matched
    : FLOW_529.matched - FLOW_529.triggers[2].weight;

  const framing = (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
        Automated flows
      </p>
      <h2 className="mt-3 max-w-md text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
        76 products. 233 triggers. Every one switchable.
      </h2>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {CATEGORY_ORDER.map((category) => (
          <span key={category} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[category]}`} />
            {category}
          </span>
        ))}
      </div>
    </div>
  );

  if (!pinned) {
    return (
      <section id="flows" className="scroll-mt-24 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-8">
          {framing}
          {BEATS.map((item, index) => (
            <div key={item.eyebrow} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
                {item.eyebrow}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              <div className="mt-5 flex justify-center">
                <BeatVisual
                  beat={index}
                  thirdOn={index !== 2}
                  matched={index === 2 ? FLOW_529.matched - FLOW_529.triggers[2].weight : FLOW_529.matched}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="flows" className="scroll-mt-24 bg-white">
      <div ref={trackRef} className="relative h-[450vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-2">
            <div>
              {framing}
              <div className="relative mt-8 h-32">
                {BEATS.map((item, index) => (
                  <div
                    key={item.eyebrow}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      beat === index ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {String(index + 1).padStart(2, "0")} · {item.eyebrow}
                    </p>
                    <p className="mt-2 max-w-md text-base leading-relaxed text-slate-600">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-1.5">
                {BEATS.map((item, index) => (
                  <span
                    key={item.eyebrow}
                    className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                      beat >= index ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <BeatVisual beat={beat} thirdOn={thirdOn} matched={matched} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutomatedFlowsSection;
