import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Radar,
  TrendingUp,
  Workflow,
} from "lucide-react";
import type { GrowthPlayScenario } from "@/components/home/growthPlayScenarios";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import salesforceLogo from "@/assets/salesforce-logo.png";

const chartSeries = {
  deposit: [
    { period: "W1", treatment: 51, holdout: 51 },
    { period: "W2", treatment: 53.6, holdout: 53 },
    { period: "W3", treatment: 57.8, holdout: 55 },
    { period: "W4", treatment: 62.5, holdout: 58 },
    { period: "W5", treatment: 67.7, holdout: 61 },
    { period: "W6", treatment: 72.4, holdout: 64 },
  ],
  wealth: [
    { period: "W1", treatment: 49, holdout: 49 },
    { period: "W2", treatment: 51.8, holdout: 51 },
    { period: "W3", treatment: 55.2, holdout: 53 },
    { period: "W4", treatment: 59.9, holdout: 56 },
    { period: "W5", treatment: 64.8, holdout: 59 },
    { period: "W6", treatment: 68.2, holdout: 62 },
  ],
};

const HOLDOUT_STROKE = "#9AA3B2";

const easeInOut = (t: number) => (
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
);

type ChartPoint = {
  period: string;
  treatment: number;
  holdout: number;
};

function DivergenceChart({
  data,
  active,
  gapLabel,
  outcomeLabel,
}: {
  data: ChartPoint[];
  active: boolean;
  gapLabel: string;
  outcomeLabel: string;
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

  const width = 660;
  const height = 248;
  const padding = { top: 35, right: 92, bottom: 27, left: 38 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const yMin = 45;
  const yMax = 80;
  const x = (index: number) => padding.left + (index / (data.length - 1)) * plotWidth;
  const y = (value: number) => (
    padding.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight
  );
  const points = (key: "treatment" | "holdout") => (
    data.map((item, index) => `${x(index)},${y(item[key])}`).join(" ")
  );
  const lastIndex = data.length - 1;
  const last = data[lastIndex];
  const gapX = x(lastIndex) + 14;
  const gapMidY = (y(last.treatment) + y(last.holdout)) / 2;
  const settled = progress >= 0.99;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${outcomeLabel}: treatment finishes ${gapLabel} above holdout at week six`}
    >
      <text
        x={padding.left}
        y={13}
        fontSize="10"
        fontWeight="600"
        fill="#64748B"
      >
        {outcomeLabel}
      </text>

      {[45, 55, 65, 75].map((value) => (
        <g key={value}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y(value)}
            y2={y(value)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text
            x={padding.left - 8}
            y={y(value) + 3}
            textAnchor="end"
            fontSize="9"
            fill="#94A3B8"
          >
            {value}
          </text>
        </g>
      ))}

      {data.map((item, index) => (
        <text
          key={item.period}
          x={x(index)}
          y={height - 8}
          textAnchor="middle"
          fontSize="9"
          fill="#94A3B8"
        >
          {item.period}
        </text>
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
          <circle
            cx={x(lastIndex)}
            cy={y(last.treatment)}
            r="4.5"
            fill="var(--v2-blue)"
          />
          <circle
            cx={x(lastIndex)}
            cy={y(last.holdout)}
            r="3"
            fill={HOLDOUT_STROKE}
          />
          <line
            x1={gapX}
            x2={gapX}
            y1={y(last.treatment)}
            y2={y(last.holdout)}
            stroke="var(--v2-verified)"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <line
            x1={gapX - 4}
            x2={gapX + 4}
            y1={y(last.treatment)}
            y2={y(last.treatment)}
            stroke="var(--v2-verified)"
            strokeWidth="2"
          />
          <line
            x1={gapX - 4}
            x2={gapX + 4}
            y1={y(last.holdout)}
            y2={y(last.holdout)}
            stroke="var(--v2-verified)"
            strokeWidth="2"
          />
          <text
            x={gapX + 8}
            y={gapMidY + 3}
            fontSize="10"
            fontWeight="700"
            fill="var(--v2-verified)"
          >
            {gapLabel}
          </text>
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
    const delay = 700;
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

const FlowConnector = () => (
  <div
    aria-hidden="true"
    className="flex items-center justify-center py-2 md:py-0"
    style={{ color: "var(--v2-blue)" }}
  >
    <ArrowDown className="h-5 w-5 md:hidden" />
    <ArrowRight className="hidden h-5 w-5 md:block" />
  </div>
);

const ImpactDeliveryConsole = ({ scenario }: { scenario: GrowthPlayScenario }) => {
  const deposit = scenario.id === "deposit";
  const qualified = scenario.funnel[0];
  const activated = scenario.funnel[2];
  const lift = scenario.funnel[3];
  const rationale = deposit
    ? "Payroll remains while external transfers accelerate."
    : "Cash accumulation and investment outflows cross the qualified threshold.";
  const action = deposit
    ? "Banker retention review"
    : "Advisor wealth conversation";
  const outcomeLabel = deposit
    ? "Deposit retention rate (%)"
    : "Qualified conversion rate (%)";
  const treatment = deposit ? "72.4%" : "68.2%";
  const holdout = deposit ? "64.0%" : "62.0%";

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setInView(true)),
      { threshold: 0.28 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="v2-rule-t relative z-10 w-full scroll-mt-16"
      style={{
        paddingTop: 128,
        paddingBottom: 128,
        backgroundColor: "var(--v2-paper)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-10 max-w-4xl">
            <p
              className="v2-mono mb-4 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--v2-blue)" }}
            >
              Impact and activation
            </p>
            <h2 className="v2-display text-3xl md:text-[56px]">
              From qualified moment to measured outcome.
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div
            className="overflow-hidden rounded-lg border bg-white shadow-[0_20px_55px_rgba(15,23,42,0.09)]"
            style={{ borderColor: "var(--v2-rule)" }}
          >
            <div
              className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-5 py-3 md:px-7"
              style={{ borderColor: "var(--v2-rule)" }}
            >
              <div className="flex items-center gap-3">
                <img src={ventusLogo} alt="Ventus AI" className="h-4 w-auto" />
                <span
                  className="h-4 w-px"
                  style={{ backgroundColor: "var(--v2-rule)" }}
                />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--v2-ink-soft)" }}
                >
                  Growth Intelligence
                </span>
              </div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "var(--v2-ink)" }}
              >
                {scenario.label}
              </p>
            </div>

            <div className="p-5 md:p-7">
              <div className="grid items-stretch md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)]">
                <div className="min-w-0 py-2 md:py-3">
                  <div className="flex items-center gap-2">
                    <Radar className="h-4 w-4" style={{ color: "var(--v2-blue)" }} />
                    <p
                      className="v2-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--v2-ink-faint)" }}
                    >
                      1. Qualified
                    </p>
                  </div>
                  <p
                    className="mt-4 text-[18px] font-semibold leading-snug"
                    style={{ color: "var(--v2-ink)" }}
                  >
                    {scenario.workbench.title}
                  </p>
                  <p
                    className="mt-2 max-w-[17rem] text-[11px] leading-4"
                    style={{ color: "var(--v2-ink-soft)" }}
                  >
                    {rationale}
                  </p>
                  <p
                    className="v2-display mt-5 text-3xl"
                    style={{ color: "var(--v2-ink)" }}
                  >
                    {qualified.value}
                  </p>
                  <p
                    className="mt-1 text-[10px] font-semibold"
                    style={{ color: "var(--v2-ink-faint)" }}
                  >
                    {qualified.label.toLowerCase()}
                  </p>
                </div>

                <FlowConnector />

                <div
                  className="min-w-0 border-y py-5 md:border-x md:border-y-0 md:px-6 md:py-3"
                  style={{ borderColor: "var(--v2-rule)" }}
                >
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" style={{ color: "var(--v2-blue)" }} />
                    <p
                      className="v2-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--v2-ink-faint)" }}
                    >
                      2. Activated
                    </p>
                  </div>
                  <p
                    className="mt-4 text-[18px] font-semibold leading-snug"
                    style={{ color: "var(--v2-ink)" }}
                  >
                    {action}
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <img
                      src={salesforceLogo}
                      alt="Salesforce"
                      className="h-6 w-9 object-contain"
                    />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "var(--v2-ink-soft)" }}
                    >
                      Delivered to Salesforce FSC
                    </span>
                  </div>
                  <p
                    className="v2-display mt-5 text-3xl"
                    style={{ color: "var(--v2-ink)" }}
                  >
                    {activated.value}
                  </p>
                  <p
                    className="mt-1 text-[10px] font-semibold"
                    style={{ color: "var(--v2-ink-faint)" }}
                  >
                    {activated.label.toLowerCase()}
                  </p>
                </div>

                <FlowConnector />

                <div className="min-w-0 py-2 md:py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      className="h-4 w-4"
                      style={{ color: "var(--v2-verified)" }}
                    />
                    <p
                      className="v2-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--v2-ink-faint)" }}
                    >
                      3. Measured
                    </p>
                  </div>
                  <p
                    className="mt-4 text-[18px] font-semibold leading-snug"
                    style={{ color: "var(--v2-ink)" }}
                  >
                    {deposit ? "Retention vs holdout" : "Conversion vs holdout"}
                  </p>
                  <p
                    className="mt-2 text-[11px] leading-4"
                    style={{ color: "var(--v2-ink-soft)" }}
                  >
                    {treatment} treatment - {holdout} holdout
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <p
                      className="v2-display whitespace-nowrap text-3xl"
                      style={{ color: "var(--v2-verified)" }}
                    >
                      <CountUpStat value={lift.value} active={inView} />
                    </p>
                    <span className="v2-chip-amber">Illustrative</span>
                  </div>
                  <p
                    className="mt-1 text-[10px] font-semibold"
                    style={{ color: "var(--v2-ink-faint)" }}
                  >
                    incremental lift
                  </p>
                </div>
              </div>
            </div>

            <div
              className="border-t bg-[#F8FAFC] px-5 py-5 md:px-7 md:py-6"
              style={{ borderColor: "var(--v2-rule)" }}
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--v2-ink)" }}
                  >
                    Did the activated action improve the outcome?
                  </p>
                  <p
                    className="mt-1 text-[10px]"
                    style={{ color: "var(--v2-ink-faint)" }}
                  >
                    Weekly outcome rate for activated customers and the reserved 10% holdout
                  </p>
                </div>
                <div
                  className="flex items-center gap-4 text-[10px]"
                  style={{ color: "var(--v2-ink-faint)" }}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-0.5 w-4"
                      style={{ backgroundColor: "var(--v2-blue)" }}
                    />
                    Treatment
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-0.5 w-4"
                      style={{ backgroundColor: HOLDOUT_STROKE }}
                    />
                    Holdout
                  </span>
                </div>
              </div>

              <div className="mx-auto mt-3 w-full max-w-4xl">
                <DivergenceChart
                  key={scenario.id}
                  data={chartSeries[scenario.id]}
                  active={inView}
                  gapLabel={lift.value}
                  outcomeLabel={outcomeLabel}
                />
              </div>

              <div
                className="grid gap-3 border-t pt-4 text-[10px] font-semibold sm:grid-cols-3"
                style={{ borderColor: "var(--v2-rule)" }}
              >
                <span
                  className="flex items-center gap-2"
                  style={{ color: "var(--v2-verified)" }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Holdout preserved
                </span>
                <span
                  className="sm:text-center"
                  style={{ color: "var(--v2-ink-soft)" }}
                >
                  Week 6 gap: {lift.value}
                </span>
                <span
                  className="sm:text-right"
                  style={{ color: "var(--v2-ink-faint)" }}
                >
                  Decision receipt attached
                </span>
              </div>
            </div>

            <p
              className="border-t bg-white px-5 py-2.5 text-right v2-mono text-[10px] md:px-7"
              style={{
                borderColor: "var(--v2-rule)",
                color: "var(--v2-ink-faint)",
              }}
            >
              Illustrative pilot view. Bank data and outcomes replace these values.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ImpactDeliveryConsole;
