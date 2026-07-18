import ScrollReveal from "@/components/ScrollReveal";
import {
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  MonitorSmartphone,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { GrowthPlayScenario } from "@/components/home/growthPlayScenarios";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import salesforceLogo from "@/assets/salesforce-logo.png";

const chartSeries = {
  deposit: [
    { period: "W1", treatment: 51, holdout: 51 },
    { period: "W2", treatment: 54, holdout: 53 },
    { period: "W3", treatment: 59, holdout: 55 },
    { period: "W4", treatment: 65, holdout: 58 },
    { period: "W5", treatment: 72, holdout: 61 },
    { period: "W6", treatment: 80, holdout: 64 },
  ],
  wealth: [
    { period: "W1", treatment: 49, holdout: 49 },
    { period: "W2", treatment: 52, holdout: 51 },
    { period: "W3", treatment: 57, holdout: 53 },
    { period: "W4", treatment: 63, holdout: 56 },
    { period: "W5", treatment: 69, holdout: 59 },
    { period: "W6", treatment: 76, holdout: 62 },
  ],
};

const ImpactDeliveryConsole = ({ scenario }: { scenario: GrowthPlayScenario }) => {
  const deposit = scenario.id === "deposit";
  const qualified = scenario.funnel[0];
  const activated = scenario.funnel[2];
  const lift = scenario.funnel[3];
  const action = deposit
    ? "Review the primary-banking relationship"
    : "Open a qualified wealth conversation";
  const rationale = deposit
    ? "Payroll remains while external transfers accelerate."
    : "Cash accumulation and investment outflows meet the qualified threshold.";

  return (
    <section
      id="impact"
      className="v2-rule-t relative z-10 w-full scroll-mt-16"
      style={{ paddingTop: 104, paddingBottom: 104, backgroundColor: "var(--v2-paper)" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-12 max-w-3xl">
            <p className="v2-label mb-4">Impact & activation</p>
            <h2 className="v2-display text-3xl md:text-5xl">
              Measure the lift. Deliver the action.
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="overflow-hidden rounded-lg border bg-white shadow-[0_20px_55px_rgba(15,23,42,0.09)]" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-5 py-3 md:px-7" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center gap-3">
                <img src={ventusLogo} alt="Ventus AI" className="h-4 w-auto" />
                <span className="h-4 w-px" style={{ backgroundColor: "var(--v2-rule)" }} />
                <span className="text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Growth Intelligence</span>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-semibold" style={{ color: "var(--v2-ink-faint)" }}>
                <span>Portfolio overview</span>
                <span>Last 30 days</span>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-b px-5 py-5 md:px-7" style={{ borderColor: "var(--v2-rule)" }}>
              <div>
                <p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Active objective</p>
                <h3 className="mt-1 text-xl font-semibold" style={{ color: "var(--v2-ink)" }}>{scenario.label}</h3>
              </div>
              <span className="rounded border px-2 py-1 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}>
                Pilot view
              </span>
            </div>

            <div className="grid grid-cols-3 border-b" style={{ borderColor: "var(--v2-rule)" }}>
              {[qualified, activated, lift].map((metric, index) => (
                <div
                  key={metric.label}
                  className={`min-w-0 px-4 py-4 md:px-7 ${index > 0 ? "border-l" : ""}`}
                  style={{ borderColor: "var(--v2-rule)" }}
                >
                  <p className="v2-mono text-[8px] uppercase leading-4" style={{ color: "var(--v2-ink-faint)" }}>{metric.label}</p>
                  <p className="v2-display mt-1 whitespace-nowrap text-lg sm:text-xl md:text-2xl" style={{ color: metric.verified ? "var(--v2-verified)" : "var(--v2-ink)" }}>{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1.16fr_0.84fr]">
              <div className="min-w-0 border-b p-5 md:p-7 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--v2-rule)" }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: "var(--v2-ink)" }}>Incremental outcome</p>
                    <p className="mt-1 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>Treatment compared with holdout</p>
                  </div>
                  <div className="flex items-center gap-3 text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                    <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: "var(--v2-blue)" }} /> Treatment</span>
                    <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-gray-300" /> Holdout</span>
                  </div>
                </div>

                <div className="mt-4 h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartSeries[scenario.id]} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 9 }} />
                      <YAxis domain={[40, 90]} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 9 }} />
                      <Line type="monotone" dataKey="holdout" stroke="#CBD5E1" strokeWidth={2.5} dot={false} isAnimationActive />
                      <Line type="monotone" dataKey="treatment" stroke="#5867E8" strokeWidth={3} dot={{ r: 3, fill: "#5867E8", strokeWidth: 0 }} isAnimationActive animationDuration={900} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--v2-rule)" }}>
                  <span className="flex items-center gap-2 text-[9px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Holdout preserved
                  </span>
                  <span className="text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>Decision receipt attached</span>
                </div>
              </div>

              <div className="min-w-0 bg-[#F8FAFC] p-5 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="v2-mono text-[8px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Latest qualified moment</p>
                  <span className="rounded-full border bg-white px-2 py-1 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-blue)" }}>
                    {deposit ? "91%" : "88%"} confidence
                  </span>
                </div>
                <p className="mt-3 text-[18px] font-semibold leading-snug" style={{ color: "var(--v2-ink)" }}>{scenario.workbench.title}</p>
                <p className="mt-2 text-[10px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>{rationale}</p>

                <div className="mt-5 flex items-center gap-2 border-y py-3 text-[9px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-verified)" }}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Eligibility, consent, and policy passed
                </div>

                <div className="mt-5">
                  <p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Primary workflow</p>
                  <div className="mt-2 rounded-md border bg-white p-4" style={{ borderColor: "var(--v2-rule)" }}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <img src={salesforceLogo} alt="Salesforce" className="h-7 w-10 object-contain" />
                        <div>
                          <p className="text-[11px] font-semibold" style={{ color: "var(--v2-ink)" }}>Salesforce FSC</p>
                          <p className="text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>Relationship manager task</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-none" style={{ color: "var(--v2-ink-faint)" }} />
                    </div>
                    <div className="mt-4 flex items-start gap-2 border-t pt-3" style={{ borderColor: "var(--v2-rule)" }}>
                      <CircleUserRound className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: "var(--v2-blue)" }} />
                      <p className="text-[10px] font-semibold leading-4" style={{ color: "var(--v2-ink-soft)" }}>{action}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Optional customer channels</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded border bg-white px-2.5 py-2 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>
                      <MonitorSmartphone className="h-3 w-3" /> Digital banking
                    </span>
                    <span className="flex items-center gap-1.5 rounded border bg-white px-2.5 py-2 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>
                      <Workflow className="h-3 w-3" /> Journey orchestration
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="border-t bg-[#F8FAFC] px-5 py-2.5 text-right v2-mono text-[8px]" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}>
              Illustrative values · pilot data replaces them
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ImpactDeliveryConsole;
