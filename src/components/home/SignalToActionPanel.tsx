import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  Building2,
  Gift,
  Globe2,
  Megaphone,
  MessageSquare,
  PieChart,
  Smartphone,
} from "lucide-react";

type Source = {
  id: string;
  group: string;
  label: string;
  sublabel: string;
  icon: typeof Activity;
};

const SOURCES: Source[] = [
  {
    id: "banking-core",
    group: "Internal signals",
    label: "Banking Core",
    sublabel: "accounts · transactions · ledger",
    icon: Building2,
  },
  {
    id: "digital-banking",
    group: "Internal signals",
    label: "Digital Banking",
    sublabel: "app + web telemetry",
    icon: Smartphone,
  },
  {
    id: "external-1",
    group: "External signals",
    label: "External Intelligence 1",
    sublabel: "national data partnership",
    icon: Globe2,
  },
  {
    id: "external-2",
    group: "External signals",
    label: "External Intelligence 2",
    sublabel: "national data partnership",
    icon: Globe2,
  },
];

const SOURCE_GROUPS = ["Internal signals", "External signals"];

const FAMILIES = [
  { id: "behavioral", label: "Behavioral", dot: "bg-sky-400" },
  { id: "life-event", label: "Life Event", dot: "bg-amber-400" },
  { id: "financial", label: "Financial", dot: "bg-emerald-400" },
  { id: "demographic", label: "Demographic", dot: "bg-violet-400" },
  { id: "risk", label: "Risk", dot: "bg-rose-400" },
];

const DESTINATIONS = [
  { id: "next-offer", label: "Next Offer", href: "/solutions/next-offer", icon: Gift },
  { id: "next-product", label: "Next Product", href: "/solutions/next-product", icon: BadgeCheck },
  { id: "next-conversation", label: "Next Conversation", href: "/solutions/next-conversation", icon: MessageSquare },
  { id: "portfolio-intelligence", label: "Portfolio Intelligence", href: "/solutions/portfolio-intelligence", icon: PieChart },
  { id: "campaign-intelligence", label: "Campaign Intelligence", href: "/solutions/campaign-intelligence", icon: Megaphone },
];

const CAPTIONS = [
  "Read the data you already hold.",
  "Resolve it into signals your institution approved.",
  "Route each decision to the system that already owns it.",
];

type Geometry = {
  width: number;
  height: number;
  left: { x1: number; y1: number; x2: number; y2: number }[];
  right: { x1: number; y1: number; x2: number; y2: number }[];
};

const SignalToActionPanel = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const destRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const measure = useCallback(() => {
    const grid = gridRef.current;
    const core = coreRef.current;
    if (!grid || !core) return;
    const g = grid.getBoundingClientRect();
    if (g.width === 0) return;
    const c = core.getBoundingClientRect();
    const coreLeft = c.left - g.left;
    const coreRight = c.right - g.left;
    const coreMid = c.top - g.top + c.height / 2;

    const left = SOURCES.map((_, i) => {
      const el = sourceRefs.current[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x1: r.right - g.left,
        y1: r.top - g.top + r.height / 2,
        x2: coreLeft,
        y2: coreMid + (i - (SOURCES.length - 1) / 2) * 10,
      };
    }).filter(Boolean) as Geometry["left"];

    const right = DESTINATIONS.map((_, i) => {
      const el = destRefs.current[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x1: coreRight,
        y1: coreMid + (i - (DESTINATIONS.length - 1) / 2) * 10,
        x2: r.left - g.left,
        y2: r.top - g.top + r.height / 2,
      };
    }).filter(Boolean) as Geometry["right"];

    setGeometry({ width: g.width, height: g.height, left, right });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (gridRef.current) ro.observe(gridRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el = stageRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) {
          setProgress(1);
          return;
        }
        const raw = -rect.top / total;
        setProgress(Math.min(1, Math.max(0, raw)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const stage = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

  const colStyle = (index: number) => {
    const lit = index <= stage;
    const dip = index < stage;
    return {
      opacity: lit ? (dip ? 0.88 : 1) : 0.4,
      filter: lit ? "saturate(1)" : "saturate(0.25)",
    } as React.CSSProperties;
  };

  const leftDraw = stage >= 1;
  const rightDraw = stage >= 2;

  return (
    <div ref={stageRef} className="relative lg:h-[320vh]">
      <div className="lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0B1730] shadow-[0_30px_80px_-40px_rgba(2,6,23,0.9)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: "radial-gradient(rgba(148,197,255,0.35) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative border-b border-white/10 bg-white/[0.04] px-5 py-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Source to action
            </span>
          </div>

          <div className="relative px-4 py-6 md:px-6 md:py-8">
            <div
              ref={gridRef}
              className="relative grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_52px_minmax(0,1.3fr)_52px_minmax(0,1fr)] lg:gap-0"
            >
              {/* connectors */}
              {geometry && (
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
                  viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                  preserveAspectRatio="none"
                >
                  {geometry.left.map((p, i) => (
                    <path
                      key={`l-${i}`}
                      d={`M ${p.x1} ${p.y1} C ${p.x1 + (p.x2 - p.x1) * 0.65} ${p.y1}, ${p.x2 - (p.x2 - p.x1) * 0.65} ${p.y2}, ${p.x2} ${p.y2}`}
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="1"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={leftDraw ? 0 : 1}
                      opacity={leftDraw ? 0.75 : 0}
                      style={{ transition: "stroke-dashoffset 700ms ease-out, opacity 400ms ease-out" }}
                    />
                  ))}
                  {geometry.right.map((p, i) => (
                    <path
                      key={`r-${i}`}
                      d={`M ${p.x1} ${p.y1} C ${p.x1 + (p.x2 - p.x1) * 0.65} ${p.y1}, ${p.x2 - (p.x2 - p.x1) * 0.65} ${p.y2}, ${p.x2} ${p.y2}`}
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="1"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={rightDraw ? 0 : 1}
                      opacity={rightDraw ? 0.75 : 0}
                      style={{ transition: "stroke-dashoffset 700ms ease-out, opacity 400ms ease-out" }}
                    />
                  ))}
                </svg>
              )}

              {/* COLUMN 1 */}
              <div
                className="relative z-10 flex flex-col justify-center pr-0 transition-all duration-700 lg:pr-2"
                style={colStyle(0)}
              >
                <span className="mb-4 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Data sources
                </span>
                <div className="flex flex-col gap-5">
                  {SOURCE_GROUPS.map((group) => (
                    <div key={group}>
                      <span className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {group}
                      </span>
                      <div className="flex flex-col gap-2.5">
                        {SOURCES.filter((s) => s.group === group).map((source) => {
                          const Icon = source.icon;
                          const index = SOURCES.findIndex((s) => s.id === source.id);
                          return (
                            <div
                              key={source.id}
                              ref={(el) => (sourceRefs.current[index] = el)}
                              className="flex w-full items-start gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.05] px-2.5 py-2"
                            >
                              <Icon size={14} className="mt-0.5 shrink-0 text-slate-300" />
                              <span className="min-w-0">
                                <span className="block text-[12.5px] font-medium leading-tight text-white">
                                  {source.label}
                                </span>
                                <span className="mt-0.5 block font-mono text-[10px] leading-tight text-slate-500">
                                  {source.sublabel}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div aria-hidden className="hidden lg:block" />

              {/* COLUMN 2 */}
              <div
                className="relative z-10 flex flex-col justify-center transition-all duration-700"
                style={colStyle(1)}
              >
                <div
                  ref={coreRef}
                  className="rounded-[14px] border border-white/12 bg-white/[0.06] p-3.5"
                >
                  <div className="mb-3">
                    <span className="block text-[12.5px] font-semibold text-white">
                      Customer Intelligence Core
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-slate-500">
                      5 families · 233 signals · 24h
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {FAMILIES.map((family) => (
                      <div
                        key={family.id}
                        className="flex w-full items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.05] px-3 py-2"
                      >
                        <span className={`h-2 w-2 shrink-0 rounded-full ${family.dot}`} />
                        <span className="text-[12.5px] font-medium text-slate-100">{family.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div aria-hidden className="hidden lg:block" />

              {/* COLUMN 3 */}
              <div
                className="relative z-10 flex flex-col justify-center pl-0 transition-all duration-700 lg:pl-2"
                style={colStyle(2)}
              >
                <span className="mb-4 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Activation
                </span>
                <div className="flex flex-col gap-2.5">
                  {DESTINATIONS.map((dest, index) => {
                    const Icon = dest.icon;
                    return (
                      <Link
                        key={dest.id}
                        to={dest.href}
                        ref={(el) => (destRefs.current[index] = el)}
                        className="flex w-full items-center gap-2.5 rounded-[10px] border border-white/20 bg-white/[0.12] px-2.5 py-2 transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Icon size={14} className="shrink-0 text-sky-200" />
                        <span className="text-[12.5px] font-medium leading-tight text-white">{dest.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-4 h-6">
          {CAPTIONS.map((caption, index) => (
            <p
              key={caption}
              className="absolute inset-x-0 text-center text-[13px] text-slate-600 transition-opacity duration-500"
              style={{ opacity: (reducedMotion ? 2 : stage) === index ? 1 : 0 }}
            >
              {caption}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignalToActionPanel;
