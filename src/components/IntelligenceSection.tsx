import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Share2, Globe, Users, Briefcase } from "lucide-react";

const STAGES = [
  {
    id: "understand",
    num: "01",
    label: "Understand",
    body: "Organize approved context into one view of the relationship.",
  },
  {
    id: "decide",
    num: "02",
    label: "Decide",
    body: "Prioritize the next relevant action for this customer, within bank policy.",
  },
  {
    id: "activate",
    num: "03",
    label: "Activate",
    body: "Route the decision into the workflow that already owns it.",
  },
];

const SOURCES = [
  { icon: ArrowLeftRight, label: "Transactions" },
  { icon: Share2, label: "Relationships" },
  { icon: Globe, label: "Digital" },
  { icon: Users, label: "Teams" },
];

const IntelligenceSection = () => {
  const [stage, setStage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);

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
        <div
          ref={ref}
          className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0A1628] shadow-xl"
        >
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
            className="relative grid grid-cols-2 items-center gap-4 p-4 md:grid-cols-4 md:gap-6 md:p-8 min-h-[300px] md:min-h-[340px]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), radial-gradient(ellipse 60% 70% at 50% 55%, rgba(59,130,246,0.14), transparent)",
              backgroundSize: "22px 22px, 100% 100%",
            }}
          >
            {/* Sources */}
            <div className="flex flex-col justify-center gap-3">
              {SOURCES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#0A1628]/80 px-4 py-2.5 text-sm text-white/70"
                >
                  <Icon className="h-4 w-4 text-blue-400" />
                  {label}
                </div>
              ))}
            </div>

            {/* Relationship view */}
            <div
              className={`rounded-xl border transition-all duration-700 ${
                stage >= 0
                  ? "border-blue-400/30 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="border-b border-white/10 px-4 py-3 text-sm font-medium text-white">
                Relationship view
              </p>
              <div className="space-y-3 p-4">
                {SOURCES.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-[84px] shrink-0 text-[10px] uppercase tracking-wider text-white/45">
                      {s.label}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-blue-400/60 transition-all duration-1000"
                        style={{ width: `${[92, 74, 60, 48][i]}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next action */}
            <div
              className={`rounded-xl border transition-all duration-700 ${
                stage >= 1
                  ? "border-blue-400/40 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="border-b border-white/10 px-4 py-3 text-sm font-medium text-white">
                Next action
              </p>
              <div className="p-4">
                <div className="rounded-lg border-l-2 border-blue-400 bg-blue-500/10 px-3 py-2.5">
                  <p className="text-sm text-white">Wealth conversation</p>
                  <span className="mt-1.5 inline-block rounded border border-blue-400/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-blue-300">
                    Within policy
                  </span>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div
              className={`rounded-xl border transition-all duration-700 ${
                stage >= 2
                  ? "border-emerald-400/30 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-white/[0.02] opacity-40"
              }`}
            >
              <p className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-medium text-white">
                <Briefcase className="h-3.5 w-3.5 text-white/60" />
                Advisor queue
              </p>
              <div className="space-y-2.5 p-4">
                <p className="rounded bg-white/[0.06] px-2.5 py-1.5 text-sm text-white/80">
                  Wealth conversation
                </p>
                <span className="inline-block rounded border border-emerald-400/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300">
                  Filed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage captions */}
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStage(i)}
              className="group text-left"
            >
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
