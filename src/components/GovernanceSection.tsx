import { useState } from "react";

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

const FLOW_529 = {
  name: "529 College Savings Plan",
  category: "Wealth",
  status: "Active",
  matched: 7_700_000,
  triggers: [
    { label: "New baby in the household", family: "Life event", weight: 2_600_000 },
    { label: "Has a child heading to college", family: "Life event", weight: 3_300_000 },
    { label: "Paying for education outside tuition", family: "Behavioral", weight: 1_800_000 },
  ],
};

const formatM = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

const Toggle = ({ on }: { on: boolean }) => (
  <span
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-500 ${
      on ? "bg-blue-600" : "bg-slate-300"
    }`}
  >
    <span
      className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-500 ${
        on ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </span>
);

const FlowCard = () => {
  const [enabled, setEnabled] = useState([true, true, true]);
  const matched = FLOW_529.triggers.reduce(
    (total, trigger, index) => (enabled[index] ? total : total - trigger.weight),
    FLOW_529.matched,
  );

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(2,8,23,0.55)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">
            Automated flow
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{FLOW_529.name}</p>
          <p className="mt-1 flex items-center gap-2 text-[14px] font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            {FLOW_529.category} · {FLOW_529.status}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600">Matched</p>
          <p className="mt-1 text-[34px] font-bold leading-none tabular-nums text-slate-900 transition-colors duration-500">
            {formatM(matched)}
          </p>
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {FLOW_529.triggers.map((trigger, index) => {
          const on = enabled[index];
          return (
            <button
              type="button"
              key={trigger.label}
              onClick={() =>
                setEnabled((current) =>
                  current.map((value, position) => (position === index ? !value : value)),
                )
              }
              className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-all duration-500 hover:bg-slate-50 ${
                on ? "opacity-100" : "opacity-55"
              }`}
            >
              <div className="min-w-0">
                <p className="text-[16px] font-medium text-slate-900">{trigger.label}</p>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
                  {trigger.family}
                </p>
              </div>
              <Toggle on={on} />
            </button>
          );
        })}
      </div>
      <p className="border-t border-slate-200 px-6 py-4 text-[14px] text-slate-600">
        Switch a trigger off and the matched population drops immediately, everywhere.
      </p>
    </div>
  );
};

const GovernanceSection = () => (
  <section
    id="governance"
    className="scroll-mt-[96px] border-y border-slate-200 bg-white py-20 md:py-24"
  >
    <div className="mx-auto max-w-7xl px-6 md:px-8">
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
      <div className="pt-2">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-blue-400">
          Governance
        </p>
        <h2 className="max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-white md:text-[40px]">
          Personalization under the bank's rules.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-[1.65] text-white/80">
          Governance is part of the decision, not a review after it. Every recommendation traces
          back to the signals you approved, the rules your teams set, and the activity that produced
          the number.
        </p>
        <p className="mt-4 max-w-xl text-base leading-[1.65] text-white/80">
          76 products carry 233 triggers, each named in plain English and each switchable by risk
          and compliance.
        </p>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-white/60">
          If a figure can't be substantiated, the system withholds it rather than estimating.
        </p>

      </div>

      <div className="pt-2">
        <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-white/70">
          The proof, one flow
        </p>
        <FlowCard />
      </div>
    </div>

    <div className="mt-14">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">
          Decision control
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-emerald-300">
          <span className="ventus-pulse-halo h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Policy active
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="rounded-[20px] border border-white/10 bg-gradient-to-br from-[#0D1B30] to-[#0A1628] p-6 shadow-[0_24px_60px_-24px_rgba(2,8,23,0.6)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-blue-400">{s.num}</span>
              <span
                className={`rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  s.tone === "emerald"
                    ? "border-emerald-400/40 text-emerald-300"
                    : "border-white/30 text-white/75"
                }`}
              >
                {s.status}
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold text-white">{s.title}</p>
            <p className="mt-2 text-base leading-[1.65] text-white/70">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  </section>
);

export default GovernanceSection;
