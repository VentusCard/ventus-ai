import { Lock } from "lucide-react";

const TRIGGERS = [
  { label: "New baby in the household", type: "Life event" },
  { label: "Has a child heading to college", type: "Life event" },
  { label: "Paying for education outside tuition", type: "Behavioral" },
];

const AutomatedFlowsSection = () => (
  <section
    id="flows"
    className="scroll-mt-24 border-y border-blue-500/20 bg-[#08111F] py-24 md:py-28"
  >
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Automated flows
      </p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
        76 products. 233 triggers. All editable in plain English.
      </h2>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/60">
        One customer is a story. Your whole book needs rules. Automated Flows match customers to
        products on signals your own teams define, across Wealth, Lending, Deposits, Cards, and
        Insurance.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-5 text-[15px] leading-relaxed text-white/65">
          <p>
            Every product runs on its own triggers. A 529 plan fires on a new baby in the household,
            on a child heading to college, or on education spending outside of tuition. A home
            equity line looks for a renovation already underway, a long-time homeowner, or home
            projects funded from somewhere else.
          </p>
          <p>
            Your growth and product teams edit any trigger in plain language. Your risk team sets
            exclusions and guardrails for when a flow should never run. Nothing fires that nobody
            approved.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0D1B30] to-[#0A1628]">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-base font-semibold text-white">529 College Savings Plan</p>
              <p className="mt-1 text-xs text-white/45">Wealth · 3 triggers</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>

          <div className="divide-y divide-white/[0.07]">
            {TRIGGERS.map((t) => (
              <div key={t.label} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{t.label}</p>
                  <p className="mt-0.5 text-xs text-white/45">{t.type}</p>
                </div>
                <span
                  className="flex h-5 w-9 shrink-0 items-center rounded-full bg-emerald-500/70 px-0.5"
                  role="img"
                  aria-label="Trigger enabled"
                >
                  <span className="ml-auto h-4 w-4 rounded-full bg-white" />
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 border-t border-white/10 px-5 py-4">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45" />
            <p className="text-xs leading-relaxed text-white/50">
              Any trigger can be turned off. Nothing runs that your team has not approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AutomatedFlowsSection;
