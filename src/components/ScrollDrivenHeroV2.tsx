import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Landmark,
  LoaderCircle,
  RotateCcw,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";

const nativeInputs = [
  {
    rail: "ACH",
    description: "ACH CREDIT ACME PAYROLL 0829",
    value: "+6,240.00",
    themeId: "income",
  },
  {
    rail: "CARD",
    description: "CHECKCARD DELTA AIR LINES",
    value: "-418.22",
    themeId: null,
  },
  {
    rail: "P2P",
    description: "P2P VENMO CASHOUT 4491",
    value: "-125.00",
    themeId: null,
  },
  {
    rail: "WIRE",
    description: "WIRE OUT MORGAN STANLEY",
    value: "-4,800.00",
    themeId: "assets",
  },
  {
    rail: "CARD",
    description: "CHECKCARD WHOLE FOODS #1023",
    value: "-87.40",
    themeId: "commitments",
  },
  {
    rail: "ACH",
    description: "ACH DEBIT RENT PAYMENT",
    value: "-2,850.00",
    themeId: "commitments",
  },
];

const transactionThemes = [
  {
    id: "income",
    icon: BriefcaseBusiness,
    label: "Income continuity",
    detail: "12 payroll credits",
    color: "#0F766E",
    background: "#ECFDF5",
  },
  {
    id: "assets",
    icon: Landmark,
    label: "External asset movement",
    detail: "3 investment transfers",
    color: "var(--v2-blue)",
    background: "var(--v2-blue-wash)",
  },
  {
    id: "commitments",
    icon: TrendingDown,
    label: "Household commitments",
    detail: "27 recurring outflows",
    color: "#B45309",
    background: "#FFFBEB",
  },
];

const keyEvents = [
  {
    icon: BriefcaseBusiness,
    label: "Stable payroll established",
    detail: "12 recurring credits · variance within 4%",
  },
  {
    icon: Landmark,
    label: "External investment outflow accelerating",
    detail: "Transfer velocity increased over 30 days",
  },
  {
    icon: TrendingDown,
    label: "Liquidity buffer tightening",
    detail: "Recurring commitments absorb 61% of inflows",
  },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const ScrollDrivenHeroV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame: number | null = null;

    const updateProgress = () => {
      animationFrame = null;

      if (reducedMotion.matches) {
        setScrollProgress(1);
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextProgress = clamp(-rect.top / scrollableDistance);

      setScrollProgress((currentProgress) =>
        Math.abs(currentProgress - nextProgress) > 0.002 ? nextProgress : currentProgress,
      );
    };

    const scheduleProgressUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateProgress);
      }
    };

    scheduleProgressUpdate();
    window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
    window.addEventListener("resize", scheduleProgressUpdate);
    reducedMotion.addEventListener("change", scheduleProgressUpdate);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("scroll", scheduleProgressUpdate);
      window.removeEventListener("resize", scheduleProgressUpdate);
      reducedMotion.removeEventListener("change", scheduleProgressUpdate);
    };
  }, []);

  const stage =
    scrollProgress < 0.05
      ? 0
      : scrollProgress < 0.38
        ? 1
        : scrollProgress < 0.68
          ? 2
          : 3;

  const isComplete = stage === 3;
  const flowLabel = ["Waiting", "Reading", "Curating", "Ready"][stage];

  return (
    <section
      ref={sectionRef}
      data-hero-scroll
      className="v2-ruled relative min-h-[400svh]"
      style={{ backgroundColor: "var(--v2-paper)" }}
    >
      <div className="xl:sticky xl:top-16 xl:flex xl:min-h-[calc(100svh-64px)] xl:items-center">
        <div className="mx-auto grid min-h-[400svh] w-full max-w-7xl content-start gap-10 px-6 py-14 md:px-8 md:py-20 xl:min-h-0 xl:grid-cols-[0.82fr_1.18fr] xl:content-normal xl:items-center xl:gap-16">
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
            ref={panelRef}
            className="sticky top-20 self-start overflow-hidden rounded-lg border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] xl:static xl:self-auto"
            style={{ borderColor: "var(--v2-rule)" }}
          >
            <div
              className="flex min-h-14 items-center justify-between gap-2 border-b px-3 py-3 sm:px-5"
              style={{ borderColor: "var(--v2-rule)" }}
            >
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <img src={ventusLogo} alt="Ventus AI" className="h-3.5 w-auto shrink-0 sm:h-4" />
                <span className="hidden h-4 w-px sm:block" style={{ backgroundColor: "var(--v2-rule)" }} />
                <span className="text-[10px] font-semibold sm:text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
                  <span className="sm:hidden">Engine</span>
                  <span className="hidden sm:inline">Enrichment engine</span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <span className="v2-mono text-[9px] sm:text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  {stage === 0 ? (
                    "AWAITING DATA"
                  ) : (
                    "42 RECORDS"
                  )}
                </span>
                {isComplete && (
                  <button
                    type="button"
                    onClick={() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-800 sm:h-7 sm:w-7"
                    aria-label="Replay enrichment"
                    title="Replay enrichment"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1.25fr)_32px_minmax(0,0.75fr)] items-stretch gap-1.5 bg-[#F8FAFC] p-3 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] sm:gap-3 sm:p-5 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:p-6">
              <div className="min-w-0">
                <div className="flex min-h-4 items-center">
                  <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                    NATIVE INPUTS
                  </span>
                </div>

                <div
                  className="mt-3 space-y-1 overflow-hidden rounded border bg-[#F8FAFC] p-1"
                  style={{ borderColor: "var(--v2-rule)" }}
                >
                  {nativeInputs.map((record, index) => {
                    const theme = transactionThemes.find((item) => item.id === record.themeId);
                    const isInputVisible = stage >= 1;
                    const isThemed = stage >= 2;
                    const isSelected = Boolean(theme);
                    const isThemeVisible = isThemed && isSelected;

                    return (
                      <div
                        key={record.description}
                        className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-1 rounded-sm px-1 py-2.5 sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:gap-2 sm:px-3"
                        style={{
                          backgroundColor: isThemed && theme ? theme.background : "transparent",
                          opacity: isInputVisible ? (isThemed && !isSelected ? 0.3 : 1) : 0,
                          transform: isInputVisible ? "translateY(0)" : "translateY(4px)",
                          transition:
                            "opacity 240ms ease, transform 240ms ease, background-color 240ms ease",
                          transitionDelay: isInputVisible ? `${index * 55}ms` : "0ms",
                        }}
                        aria-hidden={!isInputVisible}
                      >
                        <span
                          className="v2-mono text-[9px] transition-colors duration-200 sm:text-[10px]"
                          style={{
                            color: isThemed && theme ? theme.color : "var(--v2-ink-faint)",
                          }}
                        >
                          {record.rail}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold" style={{ color: "var(--v2-ink)" }}>
                            {record.description}
                          </p>
                          <p
                            className="mt-0.5 truncate text-[10px] font-semibold"
                            style={{
                              color: theme?.color || "var(--v2-blue)",
                              opacity: isThemeVisible ? 1 : 0,
                              transform: isThemeVisible ? "translateY(0)" : "translateY(3px)",
                              transition: "opacity 260ms ease, transform 260ms ease",
                              transitionDelay: isThemeVisible ? `${index * 55}ms` : "0ms",
                            }}
                            aria-hidden={!isThemeVisible}
                          >
                            {theme?.label}
                          </p>
                        </div>
                        <span className="v2-mono hidden text-[10px] sm:block" style={{ color: "var(--v2-ink-soft)" }}>
                          {record.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-2">
                <span
                  className="v2-mono whitespace-nowrap text-[8px] font-semibold sm:text-[9px]"
                  style={{
                    color:
                      stage === 0
                        ? "var(--v2-ink-faint)"
                        : isComplete
                          ? "var(--v2-verified)"
                          : "var(--v2-blue)",
                  }}
                >
                  {flowLabel}
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white transition-colors duration-300"
                  style={{
                    borderColor:
                      stage === 0
                        ? "var(--v2-rule)"
                        : isComplete
                          ? "var(--v2-verified)"
                          : "var(--v2-blue-soft)",
                    color:
                      stage === 0
                        ? "var(--v2-ink-faint)"
                        : isComplete
                          ? "var(--v2-verified)"
                          : "var(--v2-blue)",
                  }}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <LoaderCircle
                      className={`h-4 w-4 ${stage >= 1 ? "animate-spin" : ""}`}
                    />
                  )}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex min-h-4 items-center">
                  <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                    {stage === 3 ? "KEY EVENTS" : "SIGNAL THEMES"}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {keyEvents.map((event, index) => {
                    const EventIcon = event.icon;
                    const theme = transactionThemes[index];
                    const ThemeIcon = theme.icon;
                    const isOutputVisible = stage >= 2;

                    return (
                      <div
                        key={event.label}
                        className="relative min-h-[54px] overflow-hidden rounded border bg-white p-2 sm:min-h-[62px] sm:p-3"
                        style={{
                          borderColor: "var(--v2-rule)",
                          opacity: isOutputVisible ? 1 : 0,
                          transform: isOutputVisible ? "translateX(0)" : "translateX(-6px)",
                          transition:
                            "opacity 300ms ease, transform 300ms ease, border-color 300ms ease",
                          transitionDelay: isOutputVisible ? `${index * 70}ms` : "0ms",
                        }}
                        aria-hidden={!isOutputVisible}
                      >
                        <div
                          className="absolute inset-0 flex items-start gap-2 px-2 py-2 transition-all duration-300 sm:gap-3 sm:px-3 sm:py-3"
                          style={{
                            opacity: stage === 2 ? 1 : 0,
                            transform: stage === 2 ? "translateY(0)" : "translateY(-4px)",
                          }}
                          aria-hidden={stage !== 2}
                        >
                          <span
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded sm:h-7 sm:w-7"
                            style={{ backgroundColor: theme.background, color: theme.color }}
                          >
                            <ThemeIcon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9px] font-semibold leading-3 sm:text-[10px] sm:leading-4" style={{ color: "var(--v2-ink)" }}>
                              {theme.label}
                            </p>
                            <p className="hidden text-[10px] leading-4 sm:block" style={{ color: "var(--v2-ink-soft)" }}>
                              {theme.detail}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-start gap-2 sm:gap-3"
                          style={{
                            opacity: stage === 3 ? 1 : 0,
                            transform: stage === 3 ? "translateY(0)" : "translateY(4px)",
                            transition: "opacity 320ms ease, transform 320ms ease",
                          }}
                          aria-hidden={stage !== 3}
                        >
                          <span
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded sm:h-7 sm:w-7"
                            style={{ backgroundColor: "var(--v2-blue-wash)", color: "var(--v2-blue)" }}
                          >
                            <EventIcon className="h-3.5 w-3.5" />
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollDrivenHeroV2;
