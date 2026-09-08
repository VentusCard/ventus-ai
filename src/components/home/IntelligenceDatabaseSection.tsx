import { useEffect, useRef, useState } from "react";

const BEATS = [
  {
    eyebrow: "One",
    copy: "Morgan is one profile. Seven signals, four families, every one traceable to the account activity that produced it.",
  },
  {
    eyebrow: "Zoom out",
    copy: "The same resolution runs across the whole book. 68.2 million customers, 95.2 percent of them enriched.",
  },
  {
    eyebrow: "The families resolve",
    copy: "Five families. 233 signals. Every profile scored on the same taxonomy, refreshed every 24 hours.",
  },
  {
    eyebrow: "It becomes queryable",
    copy: "Which turns the book into something you can ask questions of. Every audience you build resolves back to named customers and the signals behind them.",
  },
];

const COLS = 50;
const ROWS = 50;
const CELL_COUNT = COLS * ROWS;
const MORGAN_CELL = 22 * COLS + 19;

const FAMILIES = [
  { name: "Behavioral", share: 28, dot: "bg-sky-500", cell: "bg-sky-400" },
  { name: "Financial", share: 24, dot: "bg-emerald-500", cell: "bg-emerald-400" },
  { name: "Demographic", share: 20, dot: "bg-amber-500", cell: "bg-amber-400" },
  { name: "Life Event", share: 16, dot: "bg-violet-500", cell: "bg-violet-400" },
  { name: "Risk", share: 12, dot: "bg-rose-500", cell: "bg-rose-400" },
];

// Deterministic family assignment: contiguous row bands, Life Event band contains Morgan.
const familyForRow = (row: number) => {
  const order = [0, 1, 2, 3, 4]; // Behavioral, Financial, Demographic, Life Event, Risk
  let cursor = 0;
  for (const index of order) {
    const height = Math.round((FAMILIES[index].share / 100) * ROWS);
    if (row < cursor + height) return index;
    cursor += height;
  }
  return 4;
};

const RESULTS = [
  { name: "Morgan Ellis", location: "Austin, TX", signal: "New baby at home", band: "Strong" },
  { name: "Dana Whitfield", location: "Columbus, OH", signal: "New baby at home", band: "Strong" },
  { name: "Priya Raman", location: "Sacramento, CA", signal: "New baby at home", band: "Likely" },
  { name: "Marcus Vale", location: "Tampa, FL", signal: "New baby at home", band: "Likely" },
];

const formatCount = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const ProfileCard = () => (
  <div className="w-full rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]">
    <div className="border-b border-slate-200 px-6 py-5">
      <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">
        Enriched profile
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">Morgan Ellis</p>
      <p className="mt-1 text-[14px] font-medium text-slate-600">
        Austin, TX · Age 34-40 · Preferred tier
      </p>
    </div>
    <div className="space-y-2.5 px-6 py-5">
      {[
        ["Life Event", "New baby at home", "border-violet-300 bg-violet-50 text-violet-800"],
        ["Financial", "Auto loan servicing", "border-emerald-300 bg-emerald-50 text-emerald-800"],
        ["Behavioral", "Weeknight delivery habit", "border-sky-300 bg-sky-50 text-sky-800"],
        ["Demographic", "Dual-income household", "border-amber-300 bg-amber-50 text-amber-800"],
      ].map(([family, label, tone]) => (
        <div
          key={label}
          className={`flex items-center justify-between rounded-full border px-4 py-2.5 text-[15px] font-medium ${tone}`}
        >
          <span>{label}</span>
          <span className="text-[11px] uppercase tracking-wide opacity-80">{family}</span>
        </div>
      ))}
      <p className="pt-2 text-[14px] font-medium text-slate-600">7 signals across 4 families</p>
    </div>
  </div>
);

const QuerySurface = () => (
  <div className="w-full rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]">
    <div className="border-b border-slate-200 px-6 py-5">
      <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">
        Audience definition
      </p>
      <p className="mt-2 font-mono text-[14px] leading-[1.65] text-slate-700">
        family = Life Event · signal = "New baby at home" · confidence ≥ Likely
      </p>
      <p className="mt-3 text-[18px] font-semibold text-slate-900">
        1,284,600 customers <span className="font-normal text-slate-600">resolved</span>
      </p>
    </div>
    <div className="divide-y divide-slate-200">
      {RESULTS.map((row) => (
        <div key={row.name} className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-[16px] font-medium text-slate-900">{row.name}</p>
            <p className="text-[13px] text-slate-600">{row.location}</p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-medium text-violet-700">{row.signal}</p>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
              {row.band}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Grid = ({ beat }: { beat: number }) => (
  <div
    className="grid w-full gap-[2px]"
    style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: CELL_COUNT }, (_, index) => {
      const row = Math.floor(index / COLS);
      const isMorgan = index === MORGAN_CELL;
      const family = FAMILIES[familyForRow(row)];
      const colored = beat >= 2;
      return (
        <span
          key={index}
          className={`aspect-square rounded-[1px] transition-all duration-700 ${
            isMorgan
              ? "bg-blue-700 opacity-100 ring-2 ring-blue-300"
              : colored
                ? `${family.cell} opacity-100`
                : "bg-slate-400 opacity-80"
          }`}
          style={{ transitionDelay: `${(index % 37) * 8}ms` }}
        />
      );
    })}
  </div>
);

const BeatVisual = ({ beat, count, coverage }: { beat: number; count: number; coverage: number }) => (
  <div className="relative flex min-h-[70vh] w-full items-center justify-center">
    <div
      className={`absolute w-full transition-all duration-700 ${
        beat === 0 ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
      }`}
    >
      <ProfileCard />
    </div>

    <div
      className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-700 ${
        beat === 1 || beat === 2 ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-end justify-between pb-5">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">
            Customers
          </p>
          <p className="mt-1 text-[38px] font-bold leading-none tabular-nums text-slate-900">
            {formatCount(count)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">
            Enrichment coverage
          </p>
          <p className="mt-1 text-[38px] font-bold leading-none tabular-nums text-slate-900">
            {coverage.toFixed(1)}%
          </p>
        </div>
      </div>
      <Grid beat={beat} />
      <div
        className={`flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 transition-opacity duration-500 ${
          beat >= 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        {FAMILIES.map((family) => (
          <span
            key={family.name}
            className="flex items-center gap-2 text-[14px] font-medium text-slate-700"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${family.dot}`} />
            {family.name} <span className="text-slate-500">{family.share}%</span>
          </span>
        ))}
      </div>
    </div>

    <div
      className={`absolute w-full transition-all duration-700 ${
        beat === 3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <QuerySurface />
    </div>
  </div>
);

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
};

const IntelligenceDatabaseSection = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [count, setCount] = useState(0);
  const [coverage, setCoverage] = useState(0);
  const isMobile = useMobile();

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(!motion.matches && !isMobile);
    update();
    motion.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
    };
  }, [isMobile]);

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

  useEffect(() => {
    if (beat < 1) {
      setCount(0);
      setCoverage(0);
      return;
    }
    if (count === 68_200_000) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(68_200_000 * eased));
      setCoverage(95.2 * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat >= 1]);

  const framing = (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
        Intelligence database
      </p>
      <h2 className="mt-3 max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-[40px]">
        The same thing, across every account you hold.
      </h2>
      <p className="mt-4 max-w-xl text-base leading-[1.65] text-slate-700">
        One customer proves the idea. What matters is that it runs on all of them, on the same
        taxonomy, refreshed daily, and that every number it gives you breaks back down into named
        people.
      </p>
      <p className="mt-3 max-w-xl text-[15px] font-medium leading-[1.65] text-slate-600">
        68,200,000 customers · 95.2% enrichment coverage · 64,900,000 enriched profiles · 5 signal
        families · 233 signals
      </p>
    </div>
  );

  const RevealCard = ({ item, index }: { item: (typeof BEATS)[number]; index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible(true);
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);
    return (
      <div
        ref={ref}
        className={`rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.12)] transition-all duration-500 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
          {item.eyebrow}
        </p>
        <p className="mt-2 text-base leading-[1.65] text-slate-700">{item.copy}</p>
        <div className="mt-6 flex justify-center">
          <BeatVisual beat={index} count={68_200_000} coverage={95.2} />
        </div>
      </div>
    );
  };

  if (!pinned) {
    return (
      <section id="intelligence-database" className="scroll-mt-[96px] bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl space-y-10 px-6 md:px-8">
          {framing}
          {BEATS.map((item, index) => (
            <RevealCard key={item.eyebrow} item={item} index={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="intelligence-database" className="scroll-mt-[96px] bg-white">
      <div ref={trackRef} className="relative h-[420vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-white pt-20">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-12 px-6 md:px-8 lg:grid-cols-2">
            <div className="pt-2">
              {framing}
              <div className="relative mt-8 h-36">
                {BEATS.map((item, index) => (
                  <div
                    key={item.eyebrow}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      beat === index ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <p className="text-[12px] font-bold uppercase tracking-widest text-slate-700">
                      {String(index + 1).padStart(2, "0")} · {item.eyebrow}
                    </p>
                    <p className="mt-2.5 max-w-xl text-base leading-[1.65] text-slate-700">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                {BEATS.map((item, index) => (
                  <span
                    key={item.eyebrow}
                    className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${
                      beat >= index ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <BeatVisual beat={beat} count={count} coverage={coverage} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntelligenceDatabaseSection;
