import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  Landmark,
  Radar,
  ReceiptText,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";

const stages = [
  { label: "Raw", icon: Database },
  { label: "Enriched", icon: Sparkles },
  { label: "Key events", icon: Radar },
];

const rawRecords = [
  { rail: "ACH", description: "ACH CREDIT ACME PAYROLL 0829", value: "+6,240.00" },
  { rail: "WIRE", description: "WIRE OUT MORGAN STANLEY", value: "-4,800.00" },
  { rail: "CARD", description: "CHECKCARD WHOLE FOODS #1023", value: "-87.40" },
  { rail: "ACH", description: "ACH DEBIT RENT PAYMENT", value: "-2,850.00" },
];

const enrichedRecords = [
  { icon: BriefcaseBusiness, label: "Payroll income", rail: "ACH", value: "+$6,240" },
  { icon: Landmark, label: "Investment transfer", rail: "Wire", value: "-$4,800" },
  { icon: ReceiptText, label: "Grocery", rail: "Card", value: "-$87.40" },
  { icon: CheckCircle2, label: "Rent", rail: "ACH", value: "-$2,850" },
];

const keyEvents = [
  {
    icon: BriefcaseBusiness,
    label: "Stable payroll established",
    detail: "Recurring income cadence confirmed",
  },
  {
    icon: Landmark,
    label: "External investment outflow accelerating",
    detail: "Transfer velocity increased over 30 days",
  },
  {
    icon: TrendingDown,
    label: "Liquidity down 18%",
    detail: "Daily balance trajectory changed",
  },
];

const ScrollDrivenHeroV2 = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      setStage(2);
      return;
    }

    const interval = window.setInterval(() => {
      setStage((current) => (current + 1) % stages.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      data-hero-scroll
      className="v2-ruled flex min-h-[calc(100svh-64px)] items-center"
      style={{ backgroundColor: "var(--v2-paper)" }}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 md:px-8 md:py-20 xl:grid-cols-[0.82fr_1.18fr] xl:items-center xl:gap-16">
        <div className="max-w-2xl">
          <h1 className="v2-display text-[44px] leading-[1.02] sm:text-5xl md:text-6xl xl:text-[68px]">
            Turn transactions into{" "}
            <span style={{ color: "var(--v2-blue)" }}>measured growth</span>
          </h1>
          <p className="v2-body mt-6 max-w-xl text-base leading-7 md:text-lg">
            Ventus finds the moment, applies bank policy, and puts the next action
            inside the workflow your team already uses.
          </p>
          <div className="mt-8">
            <Link to="/contact" className="v2-btn">
              Schedule a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-lg border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
          style={{ borderColor: "var(--v2-rule)" }}
        >
          <div
            className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-5 py-3"
            style={{ borderColor: "var(--v2-rule)" }}
          >
            <div className="flex items-center gap-3">
              <img src={ventusLogo} alt="Ventus AI" className="h-4 w-auto" />
              <span className="h-4 w-px" style={{ backgroundColor: "var(--v2-rule)" }} />
              <span className="text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
                Enrichment engine
              </span>
            </div>
            <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
              EXAMPLE STREAM / 42 RECORDS
            </span>
          </div>

          <div className="border-b px-5 py-4 md:px-6" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="grid grid-cols-3">
              {stages.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === stage;
                const isComplete = index < stage;

                return (
                  <div
                    key={item.label}
                    className="relative flex min-w-0 items-center gap-2 pr-2 last:pr-0"
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span
                      className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white"
                      style={{
                        borderColor: isActive || isComplete ? "var(--v2-blue)" : "var(--v2-rule)",
                        color: isActive || isComplete ? "var(--v2-blue)" : "var(--v2-ink-faint)",
                      }}
                    >
                      {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </span>
                    <span
                      className="truncate text-[10px] font-semibold"
                      style={{ color: isActive ? "var(--v2-ink)" : "var(--v2-ink-faint)" }}
                    >
                      {item.label}
                    </span>
                    {index < stages.length - 1 && (
                      <span
                        className="absolute left-7 right-0 top-3.5 h-px"
                        style={{ backgroundColor: isComplete ? "var(--v2-blue)" : "var(--v2-rule)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-[340px] bg-[#F8FAFC] p-5 md:min-h-[356px] md:p-6">
            <div key={stage} style={{ animation: "ventus-append 0.35s ease both" }}>
              {stage === 0 && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                      BANK-NATIVE INPUT
                    </span>
                    <span className="text-[9px] font-semibold" style={{ color: "var(--v2-ink-faint)" }}>
                      Unstructured
                    </span>
                  </div>
                  <div className="mt-4 overflow-hidden rounded border bg-white" style={{ borderColor: "var(--v2-rule)" }}>
                    {rawRecords.map((record) => (
                      <div
                        key={record.description}
                        className="grid grid-cols-[42px_1fr_auto] items-center gap-3 border-b px-3 py-3 last:border-0"
                        style={{ borderColor: "var(--v2-rule-soft)" }}
                      >
                        <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                          {record.rail}
                        </span>
                        <span className="min-w-0 truncate text-[10px] font-medium" style={{ color: "var(--v2-ink)" }}>
                          {record.description}
                        </span>
                        <span className="v2-mono text-[9px]" style={{ color: "var(--v2-ink-soft)" }}>
                          {record.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {stage === 1 && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                      STRUCTURED ENRICHMENT
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: "var(--v2-blue)" }}>
                      <Sparkles className="h-3 w-3" /> Classified
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {enrichedRecords.map((record) => {
                      const Icon = record.icon;
                      return (
                        <div
                          key={record.label}
                          className="flex min-w-0 items-center gap-3 rounded border bg-white p-3"
                          style={{ borderColor: "var(--v2-rule)" }}
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                            style={{ backgroundColor: "rgba(24, 85, 242, 0.08)", color: "var(--v2-blue)" }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold" style={{ color: "var(--v2-ink)" }}>
                              {record.label}
                            </p>
                            <p className="mt-1 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>
                              {record.rail}
                            </p>
                          </div>
                          <span className="v2-mono shrink-0 text-[9px]" style={{ color: "var(--v2-ink-soft)" }}>
                            {record.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {stage === 2 && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
                      BEHAVIORAL SIGNALS
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                      <CheckCircle2 className="h-3 w-3" /> 3 extracted
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {keyEvents.map((event) => {
                      const Icon = event.icon;
                      return (
                        <div
                          key={event.label}
                          className="flex items-start gap-3 rounded border bg-white p-3.5"
                          style={{ borderColor: "var(--v2-rule)" }}
                        >
                          <span
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded"
                            style={{ backgroundColor: "rgba(24, 85, 242, 0.08)", color: "var(--v2-blue)" }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold leading-4" style={{ color: "var(--v2-ink)" }}>
                              {event.label}
                            </p>
                            <p className="mt-1 text-[9px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>
                              {event.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Radar className="h-3.5 w-3.5" style={{ color: "var(--v2-blue)" }} />
                    <span className="text-[9px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
                      3 key events extracted from 42 records
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollDrivenHeroV2;
