import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  Baby,
  BarChart3,
  Gift,
  Megaphone,
  MessageSquare,
  PieChart,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";

type Family = {
  id: string;
  label: string;
  dot: string;
  icon: typeof Activity;
  targets: string[];
};

const FAMILIES: Family[] = [
  { id: "behavioral", label: "Behavioral", dot: "bg-sky-400", icon: Activity, targets: ["next-offer", "campaign-intelligence"] },
  { id: "life-event", label: "Life Event", dot: "bg-amber-400", icon: Baby, targets: ["next-product", "next-conversation"] },
  { id: "financial", label: "Financial", dot: "bg-emerald-400", icon: Wallet, targets: ["next-product", "portfolio-intelligence"] },
  { id: "demographic", label: "Demographic", dot: "bg-violet-400", icon: Users, targets: ["campaign-intelligence"] },
  { id: "risk", label: "Risk", dot: "bg-rose-400", icon: ShieldAlert, targets: ["portfolio-intelligence"] },
];

type Destination = {
  id: string;
  label: string;
  href: string;
  icon: typeof Activity;
};

const DESTINATIONS: Destination[] = [
  { id: "next-offer", label: "Next Offer", href: "/solutions/next-offer", icon: Gift },
  { id: "next-product", label: "Next Product", href: "/solutions/next-product", icon: BadgeCheck },
  { id: "next-conversation", label: "Next Conversation", href: "/solutions/next-conversation", icon: MessageSquare },
  { id: "portfolio-intelligence", label: "Portfolio Intelligence", href: "/solutions/portfolio-intelligence", icon: PieChart },
  { id: "campaign-intelligence", label: "Campaign Intelligence", href: "/solutions/campaign-intelligence", icon: Megaphone },
];

const CYCLE_MS = 2500;

// Diagram geometry in a 100 x 100 viewBox.
const NODE_X = 50;
const NODE_Y = 50;
const LEFT_X = 8;
const RIGHT_X = 92;
const rowY = (index: number) => 12 + index * 19;

const leftPath = (index: number) =>
  `M ${LEFT_X} ${rowY(index)} C ${LEFT_X + 22} ${rowY(index)}, ${NODE_X - 22} ${NODE_Y}, ${NODE_X} ${NODE_Y}`;

const rightPath = (index: number) =>
  `M ${NODE_X} ${NODE_Y} C ${NODE_X + 22} ${NODE_Y}, ${RIGHT_X - 22} ${rowY(index)}, ${RIGHT_X} ${rowY(index)}`;

const SignalToActionPanel = () => {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"in" | "flare" | "out" | "rest">("rest");
  const [looping, setLooping] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setLooping(!motion.matches);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!looping) return;
    let timers: number[] = [];
    const run = () => {
      setPhase("in");
      timers.push(window.setTimeout(() => setPhase("flare"), 900));
      timers.push(window.setTimeout(() => setPhase("out"), 1200));
      timers.push(window.setTimeout(() => setPhase("rest"), 2100));
    };
    run();
    const interval = window.setInterval(() => {
      setActive((prev) => (prev + 1) % FAMILIES.length);
      run();
    }, CYCLE_MS);
    return () => {
      window.clearInterval(interval);
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
  }, [looping]);

  const activeFamily = FAMILIES[active];
  const inbound = looping ? phase === "in" || phase === "flare" : true;
  const outbound = looping ? phase === "out" : true;
  const nodeFlare = looping ? phase === "flare" || phase === "out" : true;

  const leftActive = (index: number) => !looping || (index === active && phase !== "rest");
  const rightActive = (id: string) =>
    !looping || (activeFamily.targets.includes(id) && (phase === "out" || phase === "flare"));

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0B1730] shadow-[0_30px_80px_-40px_rgba(2,6,23,0.9)]">
      {/* dotted grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(rgba(148,197,255,0.35) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* header bar */}
      <div className="relative border-b border-white/10 bg-white/[0.04] px-5 py-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
          Signal to action
        </span>
      </div>

      <div className="relative px-5 py-7 md:px-7 md:py-9">
        {/* column labels */}
        <div className="mb-4 flex items-center justify-between md:mb-5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Signals
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Activation
          </span>
        </div>

        <div className="relative">
          {/* connectors: desktop horizontal */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {FAMILIES.map((family, index) => (
              <path
                key={`l-${family.id}`}
                d={leftPath(index)}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
                className="transition-opacity duration-500"
                opacity={leftActive(index) && inbound ? 0.85 : 0.2}
              />
            ))}
            {DESTINATIONS.map((dest, index) => (
              <path
                key={`r-${dest.id}`}
                d={rightPath(index)}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
                className="transition-opacity duration-500"
                opacity={rightActive(dest.id) && outbound ? 0.85 : 0.2}
              />
            ))}
          </svg>

          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)]">
            {/* SIGNALS */}
            <div className="relative z-10 flex flex-col gap-2.5">
              {FAMILIES.map((family, index) => {
                const Icon = family.icon;
                const on = leftActive(index);
                return (
                  <div
                    key={family.id}
                    className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2 transition-all duration-500 ${
                      on
                        ? "border-white/25 bg-white/[0.10] opacity-100"
                        : "border-white/10 bg-white/[0.05] opacity-70"
                    }`}
                  >
                    <Icon size={14} className="shrink-0 text-slate-300" />
                    <span className="text-[13px] font-medium text-slate-100">{family.label}</span>
                    <span className={`ml-auto h-2 w-2 rounded-full ${family.dot}`} />
                  </div>
                );
              })}
            </div>

            {/* NODE */}
            <div className="relative z-10 hidden flex-col items-center justify-center gap-3 lg:flex">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span
                  className={`absolute h-9 w-9 rounded-full border border-sky-400/40 transition-all duration-500 ${
                    nodeFlare ? "scale-110 opacity-100" : "scale-90 opacity-50"
                  }`}
                />
                <span
                  className={`h-3 w-3 rounded-full bg-sky-400 transition-all duration-500 ${
                    nodeFlare
                      ? "scale-125 shadow-[0_0_24px_6px_rgba(56,189,248,0.55)]"
                      : "scale-100 shadow-[0_0_12px_2px_rgba(56,189,248,0.35)]"
                  }`}
                />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Ventus
              </span>
            </div>

            {/* ACTIVATION */}
            <div className="relative z-10 flex flex-col gap-2.5">
              {DESTINATIONS.map((dest) => {
                const Icon = dest.icon;
                const on = rightActive(dest.id);
                return (
                  <Link
                    key={dest.id}
                    to={dest.href}
                    className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.18] ${
                      on
                        ? "border-white/30 bg-white/[0.16] opacity-100"
                        : "border-white/15 bg-white/[0.09] opacity-75"
                    }`}
                  >
                    <Icon size={14} className="shrink-0 text-sky-200" />
                    <span className="text-[13px] font-medium text-white">{dest.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* node for tablet vertical layout */}
          <div className="my-5 hidden flex-col items-center gap-2 md:flex lg:hidden">
            <span className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute h-9 w-9 rounded-full border border-sky-400/40" />
              <span className="h-3 w-3 rounded-full bg-sky-400 shadow-[0_0_18px_4px_rgba(56,189,248,0.45)]" />
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Ventus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalToActionPanel;
