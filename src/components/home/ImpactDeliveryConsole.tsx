import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  BarChart3,
  CheckCircle2,
  CloudCog,
  DatabaseZap,
  LayoutDashboard,
  MonitorSmartphone,
  Plug,
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

type DestinationId = "salesforce" | "digital" | "journey";

const destinationOptions: Array<{
  id: DestinationId;
  label: string;
  Icon: typeof CloudCog;
}> = [
  { id: "salesforce", label: "Salesforce", Icon: CloudCog },
  { id: "digital", label: "Digital banking", Icon: MonitorSmartphone },
  { id: "journey", label: "Journey", Icon: DatabaseZap },
];

const productNavigation = [
  { label: "Overview", Icon: LayoutDashboard, active: true },
  { label: "Growth Plays", Icon: Workflow },
  { label: "Outcomes", Icon: BarChart3 },
  { label: "Connections", Icon: Plug },
];

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
  const [destination, setDestination] = useState<DestinationId>("salesforce");
  const deposit = scenario.id === "deposit";
  const recommendation = deposit
    ? "Review the primary-banking relationship"
    : "Open a qualified wealth conversation";

  const destinations = {
    salesforce: {
      eyebrow: "Salesforce FSC · Task",
      title: scenario.workbench.title,
      rows: [
        ["Owner", "Relationship manager"],
        ["Action", recommendation],
        ["Evidence", "Decision receipt attached"],
      ],
    },
    digital: {
      eyebrow: "Next-best-action API",
      title: deposit
        ? "Primary-banking check-in"
        : "Goal-based planning invitation",
      rows: [
        ["Surface", "Authenticated mobile or web"],
        ["Control", "Eligibility and consent passed"],
        ["Response", "Action + evidence reference"],
      ],
    },
    journey: {
      eyebrow: "Journey audience",
      title: `${scenario.label} · eligible cohort`,
      rows: [
        ["Destination", "Journey orchestration"],
        ["Suppression", "10% holdout preserved"],
        ["Trigger", "Qualified moment"],
      ],
    },
  } satisfies Record<
    DestinationId,
    {
      eyebrow: string;
      title: string;
      rows: Array<[string, string]>;
    }
  >;

  const activeDestination = destinations[destination];
  const qualified = scenario.funnel[0];
  const activated = scenario.funnel[2];
  const lift = scenario.funnel[3];

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
          <div className="overflow-hidden rounded-lg border bg-[#F5F7FA] shadow-[0_16px_45px_rgba(15,23,42,0.08)]" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b bg-white px-5 py-3" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center gap-3">
                <img src={ventusLogo} alt="Ventus AI" className="h-4 w-auto" />
                <span className="h-4 w-px" style={{ backgroundColor: "var(--v2-rule)" }} />
                <span className="text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Growth Intelligence</span>
              </div>
              <div className="flex items-center gap-2 v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                <span>PORTFOLIO VIEW</span>
                <span>·</span>
                <span>LAST 30 DAYS</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[170px_1fr]">
              <aside className="hidden border-r bg-white px-3 py-5 lg:flex lg:flex-col" style={{ borderColor: "var(--v2-rule)" }} aria-label="Product navigation preview">
                <div className="space-y-1">
                  {productNavigation.map(({ label, Icon, active }) => (
                    <div
                      key={label}
                      className="flex min-h-10 items-center gap-2.5 rounded px-3 text-[10px] font-semibold"
                      style={{
                        color: active ? "var(--v2-blue)" : "var(--v2-ink-faint)",
                        backgroundColor: active ? "rgba(88,103,232,0.08)" : "transparent",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                  ))}
                </div>
                <div className="mt-auto border-t pt-4" style={{ borderColor: "var(--v2-rule)" }}>
                  <span className="flex items-center gap-2 text-[9px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Ledger verified
                  </span>
                </div>
              </aside>

              <div className="min-w-0">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b bg-white px-5 py-5 md:px-7" style={{ borderColor: "var(--v2-rule)" }}>
                  <div>
                    <p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Portfolio performance</p>
                    <h3 className="mt-1 text-xl font-semibold" style={{ color: "var(--v2-ink)" }}>{scenario.label}</h3>
                  </div>
                  <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>PILOT VIEW</span>
                </div>

                <div className="grid grid-cols-3 border-b bg-white" style={{ borderColor: "var(--v2-rule)" }}>
                  {[qualified, activated, lift].map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`min-w-0 px-4 py-4 md:px-6 ${index > 0 ? "border-l" : ""}`}
                      style={{ borderColor: "var(--v2-rule)" }}
                    >
                      <p className="v2-mono text-[8px] uppercase leading-4" style={{ color: "var(--v2-ink-faint)" }}>{metric.label}</p>
                      <p className="v2-display mt-1 whitespace-nowrap text-lg sm:text-xl md:text-2xl" style={{ color: metric.verified ? "var(--v2-verified)" : "var(--v2-ink)" }}>{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid bg-white lg:grid-cols-[1.12fr_0.88fr]">
                  <div className="min-w-0 border-b p-5 md:p-7 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--v2-rule)" }}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: "var(--v2-ink)" }}>Incremental outcome index</p>
                        <p className="v2-mono mt-1 text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>TREATMENT VS HOLDOUT</p>
                      </div>
                      <div className="flex items-center gap-3 v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: "var(--v2-blue)" }} /> Treatment</span>
                        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-gray-300" /> Holdout</span>
                      </div>
                    </div>

                    <div className="mt-4 h-[245px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartSeries[scenario.id]} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                          <CartesianGrid stroke="#E5E7EB" vertical={false} />
                          <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 9 }} />
                          <YAxis domain={[40, 90]} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 9 }} />
                          <Line type="monotone" dataKey="holdout" stroke="#CBD5E1" strokeWidth={2.5} dot={false} isAnimationActive />
                          <Line type="monotone" dataKey="treatment" stroke="#5867E8" strokeWidth={3} dot={{ r: 3, fill: "#5867E8", strokeWidth: 0 }} isAnimationActive animationDuration={1100} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--v2-rule)" }}>
                      <span className="flex items-center gap-2 text-[9px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Holdout preserved
                      </span>
                      <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>Receipt attached · chain verified</span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="border-b px-5 pt-5 md:px-7" style={{ borderColor: "var(--v2-rule)" }}>
                      <p className="v2-mono text-[8px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Decision delivery</p>
                      <div className="mt-3 grid grid-cols-3 gap-1" role="tablist" aria-label="Delivery destination">
                        {destinationOptions.map(({ id, label, Icon }) => {
                          const selected = destination === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              role="tab"
                              aria-selected={selected}
                              onClick={() => setDestination(id)}
                              className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 border-b-2 px-1 text-[9px] font-semibold transition-colors"
                              style={{
                                color: selected ? "var(--v2-blue)" : "var(--v2-ink-faint)",
                                borderColor: selected ? "var(--v2-blue)" : "transparent",
                              }}
                            >
                              <Icon className="h-3.5 w-3.5 flex-none" />
                              <span className="min-w-0 text-center leading-tight">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="px-5 py-6 md:px-7">
                      <p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>{activeDestination.eyebrow}</p>
                      <p className="mt-2 text-[17px] font-semibold leading-snug" style={{ color: "var(--v2-ink)" }}>{activeDestination.title}</p>
                      <div className="mt-5 border-y" style={{ borderColor: "var(--v2-rule)" }}>
                        {activeDestination.rows.map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[82px_1fr] gap-3 border-b py-3 last:border-b-0" style={{ borderColor: "var(--v2-rule)" }}>
                            <span className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>{label}</span>
                            <span className="text-[10px] font-semibold leading-4" style={{ color: "var(--v2-ink-soft)" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="border-t bg-[#F8FAFC] px-5 py-2.5 text-right v2-mono text-[8px]" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}>
                  Illustrative values · pilot data replaces them
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ImpactDeliveryConsole;
