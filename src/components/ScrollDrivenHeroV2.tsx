import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Landmark,
  Radar,
  RotateCcw,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";

const nativeInputs = [
  {
    rail: "ACH",
    description: "ACH CREDIT ACME PAYROLL 0829",
    value: "+6,240.00",
    enrichment: "Payroll income",
  },
  {
    rail: "WIRE",
    description: "WIRE OUT MORGAN STANLEY",
    value: "-4,800.00",
    enrichment: "Investment transfer",
  },
  {
    rail: "CARD",
    description: "CHECKCARD WHOLE FOODS #1023",
    value: "-87.40",
    enrichment: "Grocery",
  },
  {
    rail: "ACH",
    description: "ACH DEBIT RENT PAYMENT",
    value: "-2,850.00",
    enrichment: "Housing",
  },
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

const ENRICH_DELAY_MS = 650;
const EVENTS_DELAY_MS = 1700;

const ScrollDrivenHeroV2 = () => {
  const [phase, setPhase] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      setPhase(2);
      return;
    }

    setPhase(0);
    const enrichmentTimer = window.setTimeout(() => setPhase(1), ENRICH_DELAY_MS);
    const eventsTimer = window.setTimeout(() => setPhase(2), EVENTS_DELAY_MS);

    return () => {
      window.clearTimeout(enrichmentTimer);
      window.clearTimeout(eventsTimer);
    };
  }, [runId]);

  return (
    <section
      data-hero-scroll
      className="v2-ruled flex min-h-[calc(100svh-64px)] items-center"
      style={{ backgroundColor: "var(--v2-paper)" }}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:px-8 md:py-20 xl:grid-cols-[0.82fr_1.18fr] xl:items-center xl:gap-16">
        <div className="max-w-2xl">
          <h1 className="v2-display text-[42px] sm:text-5xl md:text-6xl xl:text-[84px]">
            Turn transactions into{" "}
            <span style={{ color: "var(--v2-blue)" }}>measured growth</span>
          </h1>
          <p className="v2-body mt-7 max-w-xl text-base leading-7 md:text-lg">
            Ventus finds the moment, applies your policy, and places the next
            action where your bankers already work.
          </p>
          <div className="mt-9">
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
            className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b px-5 py-3"
            style={{ borderColor: "var(--v2-rule)" }}
          >
            <div className="flex items-center gap-3">
              <img src={ventusLogo} alt="Ventus AI" className="h-4 w-auto" />
              <span className="h-4 w-px" style={{ backgroundColor: "var(--v2-rule)" }} />
              <span className="text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
                Enrichment engine
              </span>
            </div>
            <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
              EXAMPLE STREAM / 42 RECORDS
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] items-stretch gap-2 bg-[#F8FAFC] p-3 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] sm:gap-3 sm:p-5 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:p-6">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  NATIVE INPUTS
                </span>
                <span
                  className="text-[10px] font-semibold transition-colors duration-300"
                  style={{ color: phase >= 1 ? "var(--v2-blue)" : "var(--v2-ink-faint)" }}
                >
                  {phase >= 1 ? "Enriched" : "Unstructured"}
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded border bg-white" style={{ borderColor: "var(--v2-rule)" }}>
                {nativeInputs.map((record, index) => (
                  <div
                    key={record.description}
                    className="grid grid-cols-[minmax(0,1fr)] items-center gap-2 border-b px-2 py-2.5 last:border-0 sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:px-3"
                    style={{ borderColor: "var(--v2-rule-soft)" }}
                  >
                    <span className="v2-mono hidden text-[10px] sm:block" style={{ color: "var(--v2-ink-faint)" }}>
                      {record.rail}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold" style={{ color: "var(--v2-ink)" }}>
                        {record.description}
                      </p>
                      <p
                        className="mt-0.5 truncate text-[10px] font-semibold"
                        style={{
                          color: "var(--v2-blue)",
                          opacity: phase >= 1 ? 1 : 0,
                          transform: phase >= 1 ? "translateY(0)" : "translateY(3px)",
                          transition: "opacity 260ms ease, transform 260ms ease",
                          transitionDelay: phase >= 1 ? `${index * 90}ms` : "0ms",
                        }}
                        aria-hidden={phase < 1}
                      >
                        {record.enrichment}
                      </p>
                    </div>
                    <span className="v2-mono hidden text-[10px] sm:block" style={{ color: "var(--v2-ink-soft)" }}>
                      {record.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <span
                className="v2-mono hidden whitespace-nowrap text-[9px] font-semibold sm:block"
                style={{ color: phase >= 2 ? "var(--v2-verified)" : "var(--v2-blue)" }}
              >
                {phase === 0 ? "Reading" : phase === 1 ? "Connecting" : "Ready"}
              </span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white transition-colors duration-300"
                style={{
                  borderColor: phase >= 2 ? "var(--v2-verified)" : "var(--v2-blue-soft)",
                  color: phase >= 2 ? "var(--v2-verified)" : "var(--v2-blue)",
                }}
              >
                {phase >= 2 ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </span>
              <ArrowRight className="h-4 w-4" style={{ color: "var(--v2-blue)" }} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  KEY EVENTS
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] font-semibold transition-colors duration-300"
                  style={{ color: phase >= 2 ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}
                >
                  <Radar className="h-3 w-3" />
                  <span className="hidden sm:inline">{phase >= 2 ? "3 extracted" : "Finding patterns"}</span>
                  <span className="sm:hidden">{phase >= 2 ? "3" : "..."}</span>
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {keyEvents.map((event, index) => {
                  const Icon = event.icon;
                  const isVisible = phase >= 2;

                  return (
                    <div
                      key={event.label}
                      className="relative min-h-[54px] overflow-hidden rounded border bg-white p-2 sm:min-h-[62px] sm:p-3"
                      style={{ borderColor: "var(--v2-rule)" }}
                    >
                      <div
                        className="absolute inset-0 flex items-center gap-2 px-2 transition-opacity duration-200 sm:gap-3 sm:px-3"
                        style={{ opacity: isVisible ? 0 : 1 }}
                        aria-hidden={isVisible}
                      >
                        <span className="h-6 w-6 rounded sm:h-7 sm:w-7" style={{ backgroundColor: "var(--v2-blue-wash)" }} />
                        <span className="flex-1 space-y-2">
                          <span className="block h-1.5 w-4/5 rounded bg-slate-200" />
                          <span className="block h-1.5 w-3/5 rounded bg-slate-100" />
                        </span>
                      </div>

                      <div
                        className="flex items-start gap-2 sm:gap-3"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible ? "translateX(0)" : "translateX(-6px)",
                          transition: "opacity 320ms ease, transform 320ms ease",
                          transitionDelay: isVisible ? `${index * 130}ms` : "0ms",
                        }}
                        aria-hidden={!isVisible}
                      >
                        <span
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded sm:h-7 sm:w-7"
                          style={{ backgroundColor: "var(--v2-blue-wash)", color: "var(--v2-blue)" }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold leading-3 sm:text-[10px] sm:leading-4" style={{ color: "var(--v2-ink)" }}>
                            {event.label}
                          </p>
                          <p className="hidden text-[10px] leading-4 sm:block" style={{ color: "var(--v2-ink-soft)" }}>
                            {event.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="flex min-h-10 items-center justify-between gap-3 border-t bg-white px-5 py-2"
            style={{ borderColor: "var(--v2-rule)" }}
          >
            <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
              {phase >= 2 ? "42 records / 3 key events" : "Analyzing transaction context"}
            </span>
            {phase >= 2 && (
              <button
                type="button"
                onClick={() => setRunId((id) => id + 1)}
                className="flex h-7 w-7 items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
                aria-label="Replay enrichment"
                title="Replay enrichment"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollDrivenHeroV2;
