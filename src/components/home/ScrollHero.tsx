import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Family = "Behavioral" | "Life Event" | "Financial" | "Demographic";

const FAMILY_STYLE: Record<Family, string> = {
  Behavioral: "bg-blue-100 text-blue-800 border-blue-300",
  "Life Event": "bg-amber-100 text-amber-800 border-amber-300",
  Financial: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Demographic: "bg-violet-100 text-violet-800 border-violet-300",
};

const FAMILY_DOT: Record<Family, string> = {
  Behavioral: "bg-blue-500",
  "Life Event": "bg-amber-500",
  Financial: "bg-emerald-500",
  Demographic: "bg-violet-500",
};

const BAND_STYLE: Record<string, string> = {
  Strong: "text-slate-900",
  Likely: "text-slate-600",
  Emerging: "text-slate-400",
};

const SIGNALS: { family: Family; label: string; band: string }[] = [
  { family: "Life Event", label: "New Baby At Home", band: "Strong" },
  { family: "Life Event", label: "Household Move Planning", band: "Emerging" },
  { family: "Financial", label: "Auto Loan Servicing", band: "Strong" },
  { family: "Financial", label: "Retirement Contributions", band: "Likely" },
  { family: "Behavioral", label: "Weeknight Delivery Habit", band: "Strong" },
  { family: "Behavioral", label: "Warehouse Bulk Shopper", band: "Likely" },
  { family: "Demographic", label: "Dual-Income Household", band: "Strong" },
];

const FAMILY_ORDER: Family[] = ["Life Event", "Financial", "Behavioral", "Demographic"];

const STREAM: { family: Family; label: string; evidence: string; source: string }[] = [
  {
    family: "Life Event",
    label: "New Baby At Home",
    evidence: "Pediatric and nursery-category activity appearing steadily over the last quarter",
    source: "First-party",
  },
  {
    family: "Financial",
    label: "Auto Loan Servicing",
    evidence: "Consistent monthly servicer payment in the mid-hundreds band",
    source: "First-party",
  },
  {
    family: "Demographic",
    label: "Dual-Income Household",
    evidence: "Two distinct payroll rails on a matching cadence",
    source: "First-party",
  },
];

const ACTIONS = [
  "Position a family-tier rewards upgrade on the primary card",
  "Pre-approve an auto refinance ahead of the renewal window",
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SignalPill = ({
  signal,
  delay,
}: {
  signal: (typeof SIGNALS)[number];
  delay: number;
}) => (
  <span
    className={`ventus-hero-rise inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${FAMILY_STYLE[signal.family]}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {signal.label}
    <span
      className={`rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold ${BAND_STYLE[signal.band]}`}
    >
      {signal.band}
    </span>
  </span>
);

const ProfileCard = ({ compact = false }: { compact?: boolean }) => {
  const list = compact ? SIGNALS.filter((s) => s.band === "Strong") : SIGNALS;
  return (
    <div className="w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_40px_90px_-30px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
        <div>
          <p className="text-xl font-semibold text-slate-900">Morgan Ellis</p>
          <p className="mt-1 text-[14px] text-slate-500">Austin, TX · Age 34-40</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          <span className="ventus-pulse-halo h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-slate-100 px-7 py-5">
        {[
          ["Tier", "Preferred"],
          ["Tenure", "6 years"],
          ["Relationship", "$60k-$90k"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
            <p className="mt-1 text-[15px] font-semibold text-slate-800">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-7 py-5">
        {["Checking", "Rewards Card", "Auto Loan"].map((p) => (
          <span
            key={p}
            className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[13px] font-medium text-slate-700"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="px-7 py-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Signals</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {list.map((signal) => (
            <SignalPill
              key={signal.label}
              signal={signal}
              delay={400 + FAMILY_ORDER.indexOf(signal.family) * 100}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StreamCard = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % STREAM.length), 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_28px_60px_-28px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <span className="ventus-pulse-halo h-1.5 w-1.5 rounded-full bg-blue-500" />
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
          Signals · last 24h
        </p>
      </div>
      <div className="relative h-[104px]">
        {STREAM.map((row, i) => (
          <div
            key={row.label}
            className={`absolute inset-0 px-5 py-4 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${FAMILY_DOT[row.family]}`} />
              <p className="text-[14px] font-semibold text-slate-900">{row.label}</p>
              <span className="ml-auto rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {row.source}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-[1.6] text-slate-500">{row.evidence}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActionsCard = () => (
  <div className="w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_28px_60px_-28px_rgba(15,23,42,0.28)]">
    <div className="border-b border-slate-100 px-5 py-3.5">
      <p className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
        Suggested next actions
      </p>
    </div>
    <div className="divide-y divide-slate-100">
      {ACTIONS.map((action) => (
        <div key={action} className="flex items-start gap-3 px-5 py-3.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          <p className="text-[13px] leading-[1.6] text-slate-700">{action}</p>
        </div>
      ))}
    </div>
  </div>
);

const ScrollHero = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const node = stageRef.current;
    if (!node) return;
    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: px * 12, y: py * 12 });
    };
    node.addEventListener("mousemove", onMove);
    return () => node.removeEventListener("mousemove", onMove);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-28 md:pb-28 md:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[radial-gradient(60%_60%_at_75%_35%,rgba(37,99,235,0.14),transparent_70%),radial-gradient(45%_55%_at_92%_75%,rgba(139,92,246,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:px-8 lg:grid-cols-[45fr_55fr]">
        <div className="ventus-hero-rise">
          <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
            Customer intelligence for banks
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-[52px]">
            Turn behavioral intelligence into growth opportunities
          </h1>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full bg-blue-600 px-7 text-base font-semibold text-white hover:bg-blue-700"
              onClick={() => navigate("/contact")}
            >
              Schedule Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-slate-300 px-7 text-base font-semibold text-slate-700"
              onClick={() => scrollTo("one-customer")}
            >
              See the platform
            </Button>
          </div>
        </div>

        <div ref={stageRef} className="relative">
          {/* Mobile and tablet stack */}
          <div className="space-y-5 lg:hidden">
            <div className="md:hidden">
              <ProfileCard compact />
            </div>
            <div className="hidden md:block">
              <ProfileCard />
            </div>
            <div className="hidden md:block">
              <ActionsCard />
            </div>
          </div>

          {/* Desktop overlap composition */}
          <div
            className="relative hidden h-[760px] lg:block"
            style={{ transform: `translate3d(${tilt.x * 0.3}px, ${tilt.y * 0.3}px, 0)` }}
          >
            <div
              className="ventus-hero-rise absolute -left-16 top-0 z-10 w-[340px]"
              style={{ animationDelay: "120ms" }}
            >
              <div
                style={{
                  transform: `scale(0.96) translate3d(${tilt.x * 0.5}px, ${tilt.y * 0.5}px, 0)`,
                }}
              >
                <div className="ventus-hero-drift" style={{ animationDelay: "0.8s" }}>
                  <StreamCard />
                </div>
              </div>
            </div>

            <div
              className="ventus-hero-rise absolute right-0 top-20 z-20 w-[500px]"
              style={{ animationDelay: "0ms" }}
            >
              <div className="ventus-hero-drift" style={{ animationDuration: "12s" }}>
                <ProfileCard />
              </div>
            </div>

            <div
              className="ventus-hero-rise absolute right-0 top-[600px] z-30 w-[360px]"
              style={{ animationDelay: "240ms" }}
            >
              <div
                style={{
                  transform: `scale(0.96) translate3d(${tilt.x * 0.6}px, ${tilt.y * 0.6}px, 0)`,
                }}
              >
                <div
                  className="ventus-hero-drift"
                  style={{ animationDuration: "9s", animationDelay: "1.6s" }}
                >
                  <ActionsCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollHero;
