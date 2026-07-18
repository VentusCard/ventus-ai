import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  MonitorSmartphone,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import type { GrowthPlayScenario } from "@/components/home/growthPlayScenarios";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import salesforceLogo from "@/assets/salesforce-logo.png";

// The signature moment of the page: treatment and holdout drawing together,
// then splitting — the company thesis as motion. Hand-rolled SVG so the draw
// is scroll-triggered, the lift counts up as the gap opens, and no charting
// library ships with the home page.

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

const HOLDOUT_STROKE = "#9aa3b2";

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function DivergenceChart({
  data,
  active,
}: {
  data: Array<{ period: string; treatment: number; holdout: number }>;
  active: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const start = performance.now();
    const duration = 1700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(easeInOut(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, data]);

  const W = 600;
  const H = 250;
  const PAD = { top: 16, right: 18, bottom: 26, left: 34 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const yMin = 40;
  const yMax = 90;
  const x = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const points = (key: "treatment" | "holdout") => data.map((d, i) => `${x(i)},${y(d[key])}`).join(" ");
  const last = data[data.length - 1];
  const settled = progress >= 0.99;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Treatment outcomes diverging above holdout outcomes over six weeks">
      {[40, 55, 70, 90].map((v) => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#E5E7EB" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#94A3B8">{v}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={d.period} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94A3B8">{d.period}</text>
      ))}

      <polyline
        points={points("holdout")}
        fill="none"
        stroke={HOLDOUT_STROKE}
        strokeWidth="2.5"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
      />
      <polyline
        points={points("treatment")}
        fill="none"
        stroke="var(--v2-blue)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
      />

      {settled && (
        <g style={{ animation: "ventus-append 0.4s ease both" }}>
          <circle cx={x(data.length - 1)} cy={y(last.treatment)} r="4.5" fill="var(--v2-blue)" />
          <circle cx={x(data.length - 1)} cy={y(last.holdout)} r="3" fill={HOLDOUT_STROKE} />
          {/* The gap is the product: draw it. */}
          <line
            x1={x(data.length - 1) + 9}
            x2={x(data.length - 1) + 9}
            y1={y(last.treatment)}
            y2={y(last.holdout)}
            stroke="var(--v2-verified)"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        </g>
      )}
    </svg>
  );
}

function CountUpStat({ value, active }: { value: string; active: boolean }) {
  const match = value.match(/^\+([\d.]+)(.*)$/);
  const target = match ? Number.parseFloat(match[1]) : null;
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    if (!active) {
      setDisplay(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    setDisplay(0);
    const start = performance.now();
    const delay = 700; // the count starts as the lines begin to split
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start - delay) / duration));
      setDisplay(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, value]);

  if (target === null) return <>{value}</>;
  return <>+{display.toFixed(1)}{match ? match[2] : ""}</>;
}

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

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setInView(true)),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="v2-rule-t relative z-10 w-full scroll-mt-16"
      style={{ paddingTop: 128, paddingBottom: 128, backgroundColor: "var(--v2-paper)" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-12 max-w-3xl">
            <h2 className="v2-display text-3xl md:text-[56px]">
              Deliver the action. Measure the lift.
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
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--v2-ink)" }}>{scenario.label}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b" style={{ borderColor: "var(--v2-rule)" }}>
              {[qualified, activated, lift].map((metric, index) => (
                <div
                  key={metric.label}
                  className={`min-w-0 px-4 py-4 md:px-7 ${index > 0 ? "border-l" : ""}`}
                  style={{ borderColor: "var(--v2-rule)" }}
                >
                  <p className="v2-mono text-[10px] uppercase leading-4" style={{ color: "var(--v2-ink-faint)" }}>{metric.label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="v2-display whitespace-nowrap text-lg sm:text-xl md:text-2xl" style={{ color: metric.verified ? "var(--v2-verified)" : "var(--v2-ink)" }}>
                      {metric.verified ? <CountUpStat value={metric.value} active={inView} /> : metric.value}
                    </p>
                    {/* Honesty placement scales with the number's prominence. */}
                    {metric.verified && <span className="v2-chip-amber">Illustrative</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1.16fr_0.84fr]">
              <div className="min-w-0 border-b p-5 md:p-7 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--v2-rule)" }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: "var(--v2-ink)" }}>Incremental outcome</p>
                    <p className="mt-1 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>Treatment compared with holdout</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                    <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: "var(--v2-blue)" }} /> Treatment</span>
                    <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: HOLDOUT_STROKE }} /> Holdout</span>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <DivergenceChart key={scenario.id} data={chartSeries[scenario.id]} active={inView} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--v2-rule)" }}>
                  <span className="flex items-center gap-2 text-[10px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Holdout preserved
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>Decision receipt attached</span>
                </div>
              </div>

              <div className="min-w-0 bg-[#F8FAFC] p-5 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="v2-mono text-[10px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Latest qualified moment</p>
                  <span className="rounded-full border bg-white px-2 py-1 text-[10px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-blue)" }}>
                    {deposit ? "91%" : "88%"} confidence
                  </span>
                </div>
                <p className="mt-3 text-[18px] font-semibold leading-snug" style={{ color: "var(--v2-ink)" }}>{scenario.workbench.title}</p>
                <p className="mt-2 text-[11px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>{rationale}</p>

                <div className="mt-5 flex items-center gap-2 border-y py-3 text-[10px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-verified)" }}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Eligibility, consent, and policy passed
                </div>

                <div className="mt-5">
                  <p className="v2-mono text-[10px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Primary workflow</p>
                  <div className="mt-2 rounded-md border bg-white p-4" style={{ borderColor: "var(--v2-rule)" }}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <img src={salesforceLogo} alt="Salesforce" className="h-7 w-10 object-contain" />
                        <div>
                          <p className="text-[11px] font-semibold" style={{ color: "var(--v2-ink)" }}>Salesforce FSC</p>
                          <p className="text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>Relationship manager task</p>
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
                  <p className="v2-mono text-[10px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Optional customer channels</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded border bg-white px-2.5 py-2 text-[10px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>
                      <MonitorSmartphone className="h-3 w-3" /> Digital banking
                    </span>
                    <span className="flex items-center gap-1.5 rounded border bg-white px-2.5 py-2 text-[10px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>
                      <Workflow className="h-3 w-3" /> Journey orchestration
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="border-t bg-[#F8FAFC] px-5 py-2.5 text-right v2-mono text-[10px]" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}>
              Illustrative numbers — your pilot replaces them.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ImpactDeliveryConsole;
