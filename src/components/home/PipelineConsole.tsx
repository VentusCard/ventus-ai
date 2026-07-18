import ScrollReveal from "@/components/ScrollReveal";
import {
  Check,
  Radar,
  Send,
  ShieldCheck,
  Split,
  TrendingUp,
} from "lucide-react";
import {
  GROWTH_PLAY_SCENARIOS,
  type GrowthPlayId,
  type GrowthPlayScenario,
} from "@/components/home/growthPlayScenarios";

type PipelineConsoleProps = {
  scenario: GrowthPlayScenario;
  activePlayId: GrowthPlayId;
  onPlayChange: (id: GrowthPlayId) => void;
};

const stageIcons = {
  moment: Radar,
  gate: ShieldCheck,
  play: Send,
  holdout: Split,
  lift: TrendingUp,
};

const PipelineConsole = ({ scenario, activePlayId, onPlayChange }: PipelineConsoleProps) => {
  const traceStages = scenario.stages.filter((stage) => stage.key !== "ledger");

  return (
    <section
      id="loop"
      className="v2-rule-t relative z-10 w-full scroll-mt-16"
      style={{ paddingTop: 112, paddingBottom: 112, backgroundColor: "var(--v2-console)" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="v2-mono mb-4 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-blue-soft)" }}>
                Growth Plays
              </p>
              <h2 className="v2-display text-3xl text-white md:text-[56px]">
                Watch a decision happen.
              </h2>
            </div>
            <div className="inline-flex w-fit rounded-md border p-1" role="group" aria-label="Growth Play objective" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.03)" }}>
              {(Object.keys(GROWTH_PLAY_SCENARIOS) as GrowthPlayId[]).map((id) => {
                const selected = activePlayId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onPlayChange(id)}
                    className="rounded px-3 py-2 text-[10px] font-semibold transition-colors sm:px-4 sm:text-[11px]"
                    style={{
                      color: selected ? "#ffffff" : "var(--v2-console-soft)",
                      backgroundColor: selected ? "var(--v2-blue)" : "transparent",
                    }}
                  >
                    {GROWTH_PLAY_SCENARIOS[id].line}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "#0d1826" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <span className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-console-faint)" }}>
                Decision trace
              </span>
              <span className="text-[11px] font-semibold text-white">{scenario.label}</span>
            </div>

            <div className="px-5 py-7 md:px-8 md:py-9">
              <div key={scenario.id} className="relative grid grid-cols-1 gap-3 sm:grid-cols-5 sm:gap-4">
                <div className="absolute left-[9%] right-[9%] top-[19px] hidden h-px bg-white/10 sm:block">
                  <div className="h-full origin-left bg-[#7fa4f2]" style={{ animation: "v2-trace 1.2s ease both" }} />
                </div>

                {traceStages.map((stage, index) => {
                  const Icon = stageIcons[stage.key as keyof typeof stageIcons];
                  return (
                    <div
                      key={stage.key}
                      className="relative flex min-w-0 items-center gap-3 border-b border-white/10 py-3 last:border-b-0 sm:flex-col sm:items-start sm:border-b-0 sm:py-0"
                      style={{ animation: "ventus-append 0.35s ease both", animationDelay: `${index * 110}ms` }}
                    >
                      <span className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[rgba(127,164,242,0.35)] bg-[#13233a] text-[#7fa4f2]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 sm:mt-2">
                        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--v2-blue-soft)" }}>{stage.label}</p>
                        <p className="mt-1 text-[11px] font-semibold leading-4 text-white">{stage.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 grid grid-cols-2 border-y md:grid-cols-4" style={{ borderColor: "var(--v2-console-line)" }}>
                {[
                  "Policy passed",
                  "10% holdout",
                  "Receipt attached",
                  "Ledger chained",
                ].map((item, index) => (
                  <div
                    key={item}
                    className={[
                      "flex min-h-12 items-center gap-2 px-3 py-3",
                      index % 2 === 1 ? "border-l" : "",
                      index > 1 ? "border-t md:border-t-0" : "",
                      index > 0 ? "md:border-l" : "md:border-l-0",
                    ].join(" ")}
                    style={{ borderColor: "var(--v2-console-line)" }}
                  >
                    <Check className="h-3.5 w-3.5 flex-none text-emerald-400" />
                    <span className="v2-mono text-[10px] uppercase" style={{ color: "var(--v2-console-soft)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="v2-mono mt-4 text-center text-[10px]" style={{ color: "var(--v2-console-faint)" }}>
            Illustrative numbers — your pilot replaces them.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PipelineConsole;
