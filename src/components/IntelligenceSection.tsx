import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Wallet,
  Globe,
  Users,
  Brain,
  ExternalLink,
  UserCircle,
} from "lucide-react";

const STAGES = [
  {
    id: "collect",
    num: "01",
    label: "Collect",
    body: "Organize approved context into one view of the relationship.",
  },
  {
    id: "enrich",
    num: "02",
    label: "Enrich",
    body: "Turn raw data into real, agnostic behavioral signals.",
  },
  {
    id: "complement",
    num: "03",
    label: "Complement",
    body: "Layer in external intelligence to fill the gaps.",
  },
  {
    id: "synthesize",
    num: "04",
    label: "Synthesize",
    body: "Build a holistic understanding of each customer.",
  },
];

const SOURCES = [
  { icon: ArrowLeftRight, label: "Transactions" },
  { icon: Wallet, label: "Portfolio" },
  { icon: Globe, label: "Digital Banking" },
  { icon: Users, label: "CRM" },
];

const ENRICHED_SIGNALS = [
  { label: "Behavioral", color: "bg-blue-400", width: "92%" },
  { label: "Life Event", color: "bg-amber-400", width: "74%" },
  { label: "Financial", color: "bg-emerald-400", width: "60%" },
  { label: "Demographic", color: "bg-violet-400", width: "48%" },
  { label: "Risk", color: "bg-rose-400", width: "36%" },
];

const EXTERNAL_SOURCES = [
  "Bureau tradelines",
  "Property records",
  "Auto data",
  "Demographics",
  "Life events",
];

const HOLISTIC_PILLS = [
  { label: "Behavioral", color: "bg-blue-400/20 text-blue-300 border-blue-400/40" },
  { label: "Life Events", color: "bg-amber-400/20 text-amber-300 border-amber-400/40" },
  { label: "Demographics", color: "bg-violet-400/20 text-violet-300 border-violet-400/40" },
  { label: "Financial", color: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40" },
  { label: "Risk", color: "bg-rose-400/20 text-rose-300 border-rose-400/40" },
];

const IntelligenceSection = () => {
  const [stage, setStage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll-driven: pin the section and walk through stages as the user scrolls.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = track.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        if (scrollable <= 0) return;
        const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
        setStage(Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="intelligence" ref={trackRef} className="bg-white scroll-mt-28 relative h-[340vh]">
      <div className="sticky top-0 flex min-h-screen flex-col justify-center max-w-[1400px] mx-auto px-6 md:px-10 pt-20 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-3">
          Intelligence
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.08]">
            A shared understanding of the customer.
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Customer context is spread across transactions, product relationships, digital behavior,
            and teams. Ventus organizes what the bank has approved into one view, so every decision
            starts from the whole relationship.
          </p>
        </div>

        {/* Context plane */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0A1628] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Context plane
            </span>
            <div className="flex items-center gap-4">
              {STAGES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStage(i)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    i === stage ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === stage ? "bg-blue-400" : "bg-white/25"
                    }`}
                  />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="relative grid grid-cols-2 items-stretch gap-4 p-4 md:grid-cols-4 md:gap-6 md:p-8 min-h-[300px] md:min-h-[340px]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), radial-gradient(ellipse 60% 70% at 50% 55%, rgba(59,130,246,0.14), transparent)",
              backgroundSize: "22px 22px, 100% 100%",
            }}
          >
            {/* Sources */}
            <div
              className={`flex flex-col justify-center gap-3 rounded-xl border px-4 py-5 transition-all duration-700 ${
                stage >= 0
                  ? "border-blue-400/30 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="text-sm font-medium text-white">Sources</p>
              {SOURCES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#0A1628]/80 px-3 py-2 text-sm text-white/70"
                >
                  <Icon className="h-4 w-4 text-blue-400" />
                  {label}
                </div>
              ))}
            </div>

            {/* Behavior enrichment */}
            <div
              className={`flex flex-col justify-center gap-3 rounded-xl border px-4 py-5 transition-all duration-700 ${
                stage >= 1
                  ? "border-blue-400/30 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-medium text-white">
                <Brain className="h-4 w-4 text-blue-400" />
                Real agnostic behavior enrichment
              </p>
              <div className="space-y-2.5">
                {ENRICHED_SIGNALS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-[72px] shrink-0 text-[10px] uppercase tracking-wider text-white/45">
                      {s.label}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className={`block h-full rounded-full ${s.color} transition-all duration-1000`}
                        style={{ width: s.width }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* External intelligence */}
            <div
              className={`flex flex-col justify-center gap-3 rounded-xl border px-4 py-5 transition-all duration-700 ${
                stage >= 2
                  ? "border-blue-400/40 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-medium text-white">
                <ExternalLink className="h-4 w-4 text-blue-400" />
                External intelligence
              </p>
              <div className="flex flex-col gap-2">
                {EXTERNAL_SOURCES.map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm text-white/80"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Holistic understanding */}
            <div
              className={`flex flex-col justify-center gap-3 rounded-xl border px-4 py-5 transition-all duration-700 ${
                stage >= 3
                  ? "border-emerald-400/30 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-medium text-white">
                <UserCircle className="h-4 w-4 text-emerald-400" />
                Holistic understanding of each customer
              </p>
              <div className="flex flex-wrap gap-2">
                {HOLISTIC_PILLS.map((pill) => (
                  <span
                    key={pill.label}
                    className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${pill.color}`}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-white/50">
                Every signal converges into one view of the customer.
              </p>
            </div>
          </div>
        </div>

        {/* Stage captions */}
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-4">
          {STAGES.map((s, i) => (
            <button key={s.id} onClick={() => setStage(i)} className="group text-left">
              <span
                className={`block h-[2px] w-full rounded-full transition-colors duration-500 ${
                  i === stage ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-[11px] font-semibold text-blue-600">{s.num}</span>
                <h3 className="text-xl font-bold text-gray-900">{s.label}</h3>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{s.body}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntelligenceSection;
