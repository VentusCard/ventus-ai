const STEPS = [
  {
    num: "01",
    title: "Approved context",
    body: "You choose which of the five signal families are in scope. Nothing outside that set reaches a decision.",
    status: "In scope",
    tone: "emerald",
  },
  {
    num: "02",
    title: "Editable policy",
    body: "All 233 triggers are named in plain English, editable, and switchable off by risk and compliance.",
    status: "Editable",
    tone: "emerald",
  },
  {
    num: "03",
    title: "Human threshold",
    body: "Customer-facing outreach is drafted, never sent. A person approves every message.",
    status: "Human review",
    tone: "neutral",
  },
  {
    num: "04",
    title: "Decision record",
    body: "Every figure carries the arithmetic that produced it. Every signal carries the activity it was inferred from.",
    status: "Retained",
    tone: "emerald",
  },
];


const GovernanceSection = () => (
  <section
    id="governance"
    className="scroll-mt-28 border-y border-blue-500/30 bg-[#08111F] py-16 md:py-20"
  >
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 md:px-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-blue-400">
          Governance
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-[1.15]">
          Personalization under the bank's rules.
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
          Governance is part of the decision, not a review after it. Every recommendation traces
          back to the signals you approved, the rules your teams set, and the activity that produced
          the number.
        </p>
        <p className="mt-4 max-w-md text-sm text-white/40">
          If a figure can't be substantiated, the system withholds it rather than estimating.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0D1B30] to-[#0A1628]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Decision control
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            <span className="ventus-pulse-halo h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Policy active
          </span>
        </div>

        <div className="divide-y divide-white/[0.07]">
          {STEPS.map((s) => (
            <div key={s.num} className="flex items-start gap-3 px-4 py-4">
              <span className="pt-0.5 text-[11px] font-semibold text-blue-400">{s.num}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="mt-0.5 text-sm text-white/55">{s.body}</p>
              </div>
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  s.tone === "emerald"
                    ? "border-emerald-400/40 text-emerald-300"
                    : "border-white/25 text-white/60"
                }`}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default GovernanceSection;
