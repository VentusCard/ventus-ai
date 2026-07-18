import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  CheckCircle2,
  CloudCog,
  DatabaseZap,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import type { GrowthPlayScenario } from "@/components/home/growthPlayScenarios";

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

const DeviceDuo = ({ scenario }: { scenario: GrowthPlayScenario }) => {
  const [destination, setDestination] = useState<DestinationId>("salesforce");
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAnimate(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setAnimate(true)),
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const deposit = scenario.id === "deposit";
  const recommendation = deposit
    ? "Review the primary-banking relationship"
    : "Open a qualified wealth conversation";
  const customerMessage = deposit
    ? "Offer a relationship review before the next payroll cycle"
    : "Invite the customer to a goal-based planning conversation";

  const destinations = {
    salesforce: {
      eyebrow: "Salesforce FSC · Task",
      title: scenario.workbench.title,
      rows: [
        ["Assigned to", "Relationship owner"],
        ["Recommended action", recommendation],
        ["Evidence", "Decision receipt attached"],
      ],
      status: "Sandbox delivery demonstrated",
      proven: true,
    },
    digital: {
      eyebrow: "Digital banking · Next-best-action API",
      title: customerMessage,
      rows: [
        ["Surface", "Authenticated mobile or web"],
        ["Control", "Eligibility and consent passed"],
        ["Response", "Action + evidence reference"],
      ],
      status: "Institution API pattern",
      proven: false,
    },
    journey: {
      eyebrow: "Journey orchestration · Audience",
      title: `${scenario.label} · eligible cohort`,
      rows: [
        ["Destination", "Adobe Journey Optimizer or Braze"],
        ["Suppression", "10% holdout preserved"],
        ["Trigger", "Qualified moment"],
      ],
      status: "Adapter roadmap",
      proven: false,
    },
  } satisfies Record<
    DestinationId,
    {
      eyebrow: string;
      title: string;
      rows: Array<[string, string]>;
      status: string;
      proven: boolean;
    }
  >;

  const activeDestination = destinations[destination];
  const qualified = scenario.funnel[0];
  const activated = scenario.funnel[2];
  const lift = scenario.funnel[3];

  return (
    <section
      ref={ref}
      className="v2-rule-t relative z-10 w-full"
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
          <div className="overflow-hidden rounded-lg border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.1)]" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper-raised)" }}>
              <div className="flex items-center gap-3">
                <span className="v2-mono text-[10px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Ventus Growth Command</span>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "var(--v2-rule-strong)" }} />
                <span className="text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>{scenario.label}</span>
              </div>
              <span className="v2-chip-amber">illustrative pilot</span>
            </div>

            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="min-w-0 p-5 md:p-7 lg:border-r" style={{ borderColor: "var(--v2-rule)" }}>
                <div className="grid grid-cols-3 border-y" style={{ borderColor: "var(--v2-rule)" }}>
                  {[qualified, activated, lift].map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`min-w-0 py-4 ${index > 0 ? "border-l pl-4 md:pl-6" : "pr-4 md:pr-6"}`}
                      style={{ borderColor: "var(--v2-rule)" }}
                    >
                      <p className="v2-mono text-[8px] uppercase leading-4" style={{ color: "var(--v2-ink-faint)" }}>{metric.label}</p>
                      <p className="v2-display mt-1 text-xl md:text-2xl" style={{ color: metric.verified ? "var(--v2-verified)" : "var(--v2-ink)" }}>{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[12px] font-semibold" style={{ color: "var(--v2-ink)" }}>Treatment vs holdout</p>
                    <div className="flex items-center gap-4 v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                      <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: "var(--v2-blue)" }} /> Treatment</span>
                      <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-gray-300" /> Holdout</span>
                    </div>
                  </div>
                  <div className="mt-3 h-[190px] w-full">
                    <svg viewBox="0 0 560 190" className="h-full w-full" role="img" aria-label="Illustrative treatment and holdout outcome trend">
                      {[35, 80, 125, 170].map((y) => (
                        <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#E5E7EB" strokeWidth="1" />
                      ))}
                      <path
                        d="M0 153 C90 149 135 139 205 126 S325 96 390 73 S490 39 560 27"
                        fill="none"
                        stroke="#5867E8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 800,
                          strokeDashoffset: animate ? 0 : 800,
                          transition: "stroke-dashoffset 1.2s ease",
                        }}
                      />
                      <path d="M0 153 C95 151 155 143 220 136 S350 119 420 110 S500 101 560 94" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="560" cy="27" r="5" fill="#5867E8" />
                      <circle cx="560" cy="94" r="4" fill="#CBD5E1" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--v2-rule)" }}>
                    <span className="flex items-center gap-2 text-[10px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Holdout preserved
                    </span>
                    <span className="v2-mono text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>Decision receipt · chain verified</span>
                  </div>
                </div>
              </div>

              <div className="min-w-0 bg-white">
                <div className="border-b px-5 pt-5 md:px-7" style={{ borderColor: "var(--v2-rule)" }}>
                  <p className="v2-mono text-[9px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Delivery preview</p>
                  <div className="mt-4 grid grid-cols-3 gap-1" role="tablist" aria-label="Delivery destination">
                    {destinationOptions.map(({ id, label, Icon }) => {
                      const selected = destination === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => setDestination(id)}
                          className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 border-b-2 px-1 text-[9px] font-semibold transition-colors sm:px-2 sm:text-[10px]"
                          style={{
                            color: selected ? "var(--v2-blue)" : "var(--v2-ink-faint)",
                            borderColor: selected ? "var(--v2-blue)" : "transparent",
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="min-w-0 text-center leading-tight">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 py-6 md:px-7">
                  <p className="v2-mono text-[9px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>{activeDestination.eyebrow}</p>
                  <p className="mt-2 text-[18px] font-semibold leading-snug" style={{ color: "var(--v2-ink)" }}>{activeDestination.title}</p>
                  <div className="mt-6 border-y" style={{ borderColor: "var(--v2-rule)" }}>
                    {activeDestination.rows.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[100px_1fr] gap-4 border-b py-3 last:border-b-0" style={{ borderColor: "var(--v2-rule)" }}>
                        <span className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>{label}</span>
                        <span className="text-[11px] font-semibold leading-4" style={{ color: "var(--v2-ink-soft)" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" style={{ color: activeDestination.proven ? "var(--v2-verified)" : "var(--v2-ink-faint)" }} />
                    <span className="text-[10px] font-semibold" style={{ color: activeDestination.proven ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}>{activeDestination.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DeviceDuo;
