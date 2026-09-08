import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import HueField from "@/components/HueField";

const rawTransactions = [
  "PAYPL *POTTRY BRN KDS 4829 $234.50",
  "TRAVELCARD *MARRIOTT HTL MIA $285.00",
  "TST* OLIVE GARDEN #2241 $58.20",
  "CHECKCARD WHLFDS MKT #1023 $87.40",
  "CHECKCARD KAPLAN EDU SERV $1,299.00",
  "TRAVELCARD DELTA AIR 0062139 $428.00",
  "SQ *CARTERS STORE 992 $124.50",
  "PAYPL *LA FITNESS DUE $45.00",

  "WIRE OUT PAYMENT COLLEGE COUNSELOR $850.00",
  "SQ *BUY BUY BABY 1120 $234.50",
  "CHECKCARD RIMOWA NYC FLAGSHIP $895.00",
  "PAYPL *COMMONAPP FEE $75.00",
  "APPLPAY GLOBAL ENTRY GOV $100.00",
  "DD *DOORDASH SF $34.10",
  "TARGET T-2847 $89.00",
  "CHECKCARD COSTCO WHSE #4821 $142.30",
  "APPLPAY STARBUCKS #9924 $6.45",
  "ZELLE TO MARIA G $50.00",
  "AMZN MKTP US*2K9F81 $67.80",
  "ACH CREDIT IRS REFUND $2,847.00",
  "SHELL OIL 57442389201 $48.20",
  "NETFLIX.COM 8883297631 $15.99",
  "WIRE OUT MORGAN STANLEY $5,000.00",
  "SQ *TRADER JOES #219 $93.10",
  "CVS/PHARMACY #4201 $24.50",
  "CHECK #1252 SAT PREP TUTOR $400.00",
  "PAYPL *GYMBOREE PLAY $89.00",
  "CHECKCARD VIATOR *PRVT TOUR $385.00",
  "ZELLE TO NANNY SERVICES $320.00",
  "CHECKCARD BABIES R US $156.00",
];

type Rail = "CARD" | "TRAVEL" | "ACH" | "CHECK" | "ZELLE" | "WIRE";

interface EnrichedRow {
  raw: string;
  merchant: string;
  category: string;
  categoryColor: string;
  rail: Rail;
  railLabel: string;
  railColor: string;
  persona?: "travel" | "parent" | "college";
}

const inferRail = (raw: string): { rail: Rail; railLabel: string; railColor: string } => {
  const r = raw.toUpperCase();
  if (/CHECK\s*#(\d+)/.test(r)) {
    const m = r.match(/CHECK\s*#(\d+)/);
    return { rail: "CHECK", railLabel: `Checking · Check #${m?.[1] ?? ""}`, railColor: "#f59e0b" };
  }
  if (r.startsWith("ZELLE") || r.includes(" ZELLE ")) {
    return { rail: "ZELLE", railLabel: "Checking · Zelle", railColor: "#a855f7" };
  }
  if (r.startsWith("WIRE")) {
    return { rail: "WIRE", railLabel: "Saving · Wire", railColor: "#ef4444" };
  }
  if (r.startsWith("ACH ")) {
    return { rail: "ACH", railLabel: "Checking · ACH", railColor: "#3b82f6" };
  }
  if (r.startsWith("TRAVELCARD")) {
    return { rail: "TRAVEL", railLabel: "Travel Card", railColor: "#0ea5e9" };
  }
  return { rail: "CARD", railLabel: "Cashback Card", railColor: "#94a3b8" };
};

const enrichedData: EnrichedRow[] = rawTransactions.map((raw) => {
  const r = raw.toUpperCase();
  const railInfo = inferRail(raw);
  const base = { raw, ...railInfo };

  if (r.includes("POTTRY BRN") || r.includes("POTTERY BARN"))
    return { ...base, merchant: "Pottery Barn Kids", category: "Home & Kids", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("MARRIOTT"))
    return { ...base, merchant: "Marriott Miami", category: "Hotel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("OLIVE GARDEN"))
    return { ...base, merchant: "Olive Garden", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("WHLFDS") || r.includes("WHOLE FOODS"))
    return { ...base, merchant: "Whole Foods Market", category: "Grocery", categoryColor: "#22c55e" };
  if (r.includes("KAPLAN"))
    return { ...base, merchant: "Kaplan", category: "Books", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("DELTA AIR"))
    return { ...base, merchant: "Delta Air Lines", category: "Airlines", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("CARTER"))
    return { ...base, merchant: "Carter's", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("LA FITNESS"))
    return { ...base, merchant: "LA Fitness", category: "Health", categoryColor: "#8b5cf6" };
  if (r.includes("COLLEGE COUNSELOR"))
    return { ...base, merchant: "College Counselor", category: "Edu Service", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("BUY BUY BABY"))
    return { ...base, merchant: "Buy Buy Baby", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("RIMOWA"))
    return { ...base, merchant: "Rimowa", category: "Luggage", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("COMMONAPP"))
    return { ...base, merchant: "Common App Fee", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("GLOBAL ENTRY"))
    return { ...base, merchant: "Global Entry", category: "Gov Service", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("DOORDASH")) return { ...base, merchant: "DoorDash", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("TARGET")) return { ...base, merchant: "Target", category: "Retail", categoryColor: "#ef4444" };
  if (r.includes("COSTCO")) return { ...base, merchant: "Costco", category: "Wholesale", categoryColor: "#ef4444" };
  if (r.includes("STARBUCKS")) return { ...base, merchant: "Starbucks", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("ZELLE") && r.includes("MARIA"))
    return { ...base, merchant: "Zelle — Maria G.", category: "Transfer", categoryColor: "#6b7280" };
  if (r.includes("AMZN")) return { ...base, merchant: "Amazon", category: "Shopping", categoryColor: "#ef4444" };
  if (r.includes("IRS REFUND"))
    return { ...base, merchant: "IRS Refund", category: "Income", categoryColor: "#10b981" };
  if (r.includes("SHELL")) return { ...base, merchant: "Shell Oil", category: "Auto", categoryColor: "#6b7280" };
  if (r.includes("NETFLIX"))
    return { ...base, merchant: "Netflix", category: "Entertainment", categoryColor: "#8b5cf6" };
  if (r.includes("MORGAN STANLEY"))
    return { ...base, merchant: "Morgan Stanley", category: "Investment", categoryColor: "#6366f1" };
  if (r.includes("TRADER JOE"))
    return { ...base, merchant: "Trader Joe's", category: "Grocery", categoryColor: "#22c55e" };
  if (r.includes("CVS")) return { ...base, merchant: "CVS Pharmacy", category: "Health", categoryColor: "#8b5cf6" };
  if (r.includes("SAT PREP"))
    return { ...base, merchant: "SAT Prep Tutor", category: "Edu Service", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("GYMBOREE"))
    return { ...base, merchant: "Gymboree Play", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("VIATOR"))
    return { ...base, merchant: "Viator", category: "Travel Agency", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("NANNY"))
    return { ...base, merchant: "Nanny Services", category: "Childcare", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("BABIES R US"))
    return { ...base, merchant: "Babies R Us", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  return { ...base, merchant: raw.split("$")[0].trim(), category: "Other", categoryColor: "#6b7280" };
});

const stripAmount = (raw: string) => raw.replace(/\s*\$[\d,]+\.\d{2}\s*$/, "").trim();

const personaCounts = {
  travel: enrichedData.filter((r) => r.persona === "travel").length,
  parent: enrichedData.filter((r) => r.persona === "parent").length,
  college: enrichedData.filter((r) => r.persona === "college").length,
};

const personas = [
  {
    id: "travel" as const,
    label: "Frequent Traveler",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    count: personaCounts.travel,
    outputs: [
      { label: "OFFER", text: "Delta SkyMiles card matched" },
      { label: "OFFER", text: "Away Luggage deal surfaced" },
      { label: "SIGNAL", text: "Travel rewards upgrade queued" },
    ],
    orchestrationAction: "Curate travel deal collection",
  },
  {
    id: "parent" as const,
    label: "Young Parent",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    count: personaCounts.parent,
    outputs: [
      { label: "PRODUCT", text: "529 Plan recommendation triggered" },
      { label: "OFFER", text: "Family rewards card matched" },
      { label: "OFFER", text: "Baby monitors & strollers deal surfaced" },
    ],
    orchestrationAction: "Activate family planning flow",
  },
  {
    id: "college" as const,
    label: "College-Bound Child",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    count: personaCounts.college,
    outputs: [
      { label: "ALERT", text: "Advisor briefing compiled" },
      { label: "PRODUCT", text: "College savings consultation triggered" },
      { label: "OFFER", text: "Student loan pre-approval queued" },
    ],
    orchestrationAction: "Trigger college savings outreach",
  },
];

const STAGE_LABELS = ["Raw Stream", "Categorize", "Detect", "Orchestrate"];
const STAGE_RANGES: [number, number][] = [
  [0, 0.1],
  [0.1, 0.22],
  [0.22, 0.5],
  [0.5, 1],
];

const ScrollDrivenHero = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrolled = -rect.top;
      const totalScrollable = containerHeight - viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4 stages: Raw Stream / Categorize / Detect / Orchestrate
  // <0.1 = 1, <0.22 = 2, <0.5 = 3 (Detect), >=0.5 = 4 (Orchestrate)
  const stage = scrollProgress < 0.1 ? 1 : scrollProgress < 0.22 ? 2 : scrollProgress < 0.5 ? 3 : 4;
  const activeStageIdx = stage - 1;

  // Detect stage: progressively reveal pills 0..3
  const detectProgress = stage >= 3 ? Math.min(1, Math.max(0, (scrollProgress - 0.22) / 0.28)) : 0;
  const pillsRevealed = stage >= 4 ? 3 : Math.min(3, Math.floor(detectProgress * 3) + 1);

  // Orchestrate: cycle 3 personas
  const orchestrateProgress = stage === 4 ? Math.min(1, Math.max(0, (scrollProgress - 0.5) / 0.5)) : 0;
  const activePersonaIndex = Math.min(2, Math.floor(orchestrateProgress * 3));
  const activePersona = stage === 4 ? personas[activePersonaIndex] : null;

  // Sub-progress within the active persona window — drives output card stagger
  const personaWindowProgress = stage === 4 ? (orchestrateProgress * 3) - activePersonaIndex : 0;

  // For Detect: highlight evidence rows for the most recently revealed pill
  const detectHighlightPersona =
    stage === 3 && pillsRevealed > 0 ? personas[pillsRevealed - 1].id : null;

  const enrichedSorted = useMemo(() => {
    const withPersona = enrichedData.filter((r) => r.persona);
    const without = enrichedData.filter((r) => !r.persona);
    const base = [...withPersona, ...without].slice(0, 14);
    if (activePersona) {
      const active = base.filter((r) => r.persona === activePersona.id);
      const rest = base.filter((r) => r.persona !== activePersona.id);
      return [...active, ...rest];
    }
    return base;
  }, [activePersona]);

  const scrollOffset = useMemo(() => scrollProgress * 200, [scrollProgress]);

  // Status dot color/label per stage
  const statusColor = stage === 1 ? "#94a3b8" : stage === 2 ? "#f59e0b" : "#22c55e";
  const statusLabel = stage === 1 ? "Analyzing..." : stage === 2 ? "Categorizing" : stage === 3 ? "Detected" : "Orchestrating";

  return (
    <div ref={containerRef} className="relative" style={{ height: "360vh", minHeight: "100vh", background: "radial-gradient(ellipse 75% 95% at 100% 0%, #BFDBFE 0%, #DBEAFE 30%, #EFF6FF 50%, #FFFFFF 68%)" }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-screen overflow-hidden" aria-hidden>
        <HueField
          blobs={[
            { hue: "violet", size: 720, top: "4%", left: "-10%", opacity: 0.4 },
            { hue: "sky", size: 640, top: "28%", left: "34%", opacity: 0.35 },
          ]}
        />
      </div>

      <div className="sticky top-0 xl:h-screen min-h-screen flex items-start justify-center overflow-visible pt-24 md:pt-28 xl:pt-16 pb-10">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col xl:flex-row items-center xl:items-center gap-6 xl:gap-6">
          {/* LEFT COLUMN — on mobile, children flatten into outer flex so card can sit between headline and subtext */}
          <div className="contents xl:flex xl:flex-col xl:w-[62%] xl:items-start w-full">
            <h1
              className="order-1 xl:order-none font-bold tracking-tight text-gray-900 leading-[1.15] text-center xl:text-left transition-all duration-700 ease-out text-[44px] sm:text-5xl md:text-6xl xl:text-[68px]"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(24px)",
              }}
            >
              Turn behavioral intelligence into <br className="hidden xl:block" />
              <span className="italic text-blue-600">growth opportunities</span>
            </h1>

            <p
              className="order-3 xl:order-none mt-6 text-base md:text-lg text-gray-500 max-w-xl text-center xl:text-left transition-all duration-700 ease-out xl:text-[18px]"
              style={{
                lineHeight: 1.7,
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "200ms",
              }}
            >
              Ventus AI orchestrates a hyper-personalized banking experience for every customer with your existing stack
            </p>

            <div className="order-4 xl:order-none mt-6 xl:mt-7 flex flex-col sm:flex-row items-center gap-3 transition-all duration-700 ease-out"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "300ms",
              }}
            >
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-10 text-base gap-2"
                onClick={() => navigate("/contact")}
              >
                Schedule Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 px-10 text-base border-slate-300 text-gray-700 hover:bg-slate-50 hover:text-gray-900"
                onClick={() => document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="order-2 xl:order-none w-full xl:w-[38%] flex justify-center xl:justify-end mt-2 xl:mt-0">
            <div className="relative flex flex-col items-stretch" style={{ width: 400, maxWidth: "calc(100vw - 48px)" }}>
              {/* Ventus Orchestrate panel — sits ABOVE the dark card (desktop only) */}
              <div
                className="relative transition-all duration-500 ease-out hidden xl:block text-gray-900"
                style={{
                  opacity: stage === 4 ? 1 : 0,
                  transform: stage === 4 ? "translateY(0)" : "translateY(8px)",
                  pointerEvents: stage === 4 ? "auto" : "none",
                  minHeight: 168,
                  marginBottom: 4,
                  overflow: "visible",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3 relative z-10">
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white font-black text-[14px] leading-none shadow-md" style={{ fontFamily: "'Horizon', 'Manrope', sans-serif" }}>
                    V
                  </span>
                  <span className="text-[15px] font-bold tracking-tight text-gray-900">
                    Orchestrate
                  </span>
                  {activePersona && (
                    <>
                      <span className="text-gray-500">·</span>
                      <span
                        className="text-[13px] font-bold tracking-tight"
                        style={{ color: activePersona.color }}
                      >
                        {activePersona.label}
                      </span>
                      <span
                        className="ml-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{
                          background: "#22c55e",
                          boxShadow: "0 0 8px #22c55e",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Three output cards */}
                <div className="grid grid-cols-3 gap-3 relative z-10">
                  {(activePersona?.outputs ?? [null, null, null]).map((output, oi) => {
                    const stagger = oi * 0.08;
                    const cardProgress = activePersona
                      ? Math.max(0, Math.min(1, (personaWindowProgress - stagger) / 0.2))
                      : 0;
                    const color = activePersona?.color ?? "#94a3b8";
                    return (
                      <div
                        key={oi}
                        className="ventus-glass"
                        style={{
                          borderRadius: 10,
                          minHeight: 100,
                          opacity: cardProgress,
                          transform: `translateY(${(1 - cardProgress) * -10}px) scale(${0.92 + cardProgress * 0.08})`,
                          transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        <div className="px-3 py-3">
                          <span
                            className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] mb-2 px-1.5 py-0.5 rounded"
                            style={{
                              color,
                              background: `${color}1f`,
                            }}
                          >
                            {output?.label ?? "—"}
                          </span>
                          <div className="text-[12px] font-semibold text-gray-900 leading-snug">
                            {output?.text ?? "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Animated dashed connecting lines */}
                {activePersona && (
                  <svg
                    className="absolute pointer-events-none"
                    style={{ bottom: -10, left: 0, width: "100%", height: 50, overflow: "visible", zIndex: 0 }}
                  >
                    {[0, 1, 2].map((oi) => {
                      const cardCenterPct = (oi + 0.5) / 3;
                      return (
                        <line
                          key={oi}
                          x1={`${cardCenterPct * 100}%`}
                          y1="0"
                          x2="50%"
                          y2="50"
                          stroke={activePersona.color}
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          opacity="0.5"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="-14"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </line>
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* The Card */}

              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-700 ease-out hero-dark-card"
                style={{
                  width: "100%",
                  maxWidth: "calc(100vw - 48px)",
                  background: "#0A1628",
                  paddingRight: 3,
                  marginTop: 6,
                  boxShadow: loaded ? "0 25px 60px -12px rgba(0,0,0,0.25)" : "0 10px 30px -8px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
                  transitionDelay: "200ms",
                  animation: loaded && stage === 1 ? "heroCardFloat 4s ease-in-out infinite" : "none",
                }}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-5 pt-4 pb-3 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <span className="font-mono text-xs text-slate-300">cust_013</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full transition-colors duration-[400ms]"
                      style={{
                        background: statusColor,
                        animation: stage === 1 ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" : "none",
                      }}
                    />
                    <span
                      className="text-[11px] font-mono transition-colors duration-[400ms]"
                      style={{ color: statusColor }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
                {/* Persona pills — Stage 3+ */}
                <div
                  className="relative flex gap-1.5 md:gap-2 px-3 md:px-5 pt-3 transition-all duration-[400ms]"
                  style={{
                    maxHeight: stage >= 3 ? 80 : 0,
                    opacity: stage >= 3 ? 1 : 0,
                    overflow: "visible",
                  }}
                >
                  {personas.map((p, i) => {
                    const isRevealed = stage >= 3 && i < pillsRevealed;
                    const isActive = stage === 4 && activePersona?.id === p.id;
                    const isPulsing = isActive && personaWindowProgress < 0.15;
                    return (
                      <span
                        key={p.id}
                        className="inline-flex items-center rounded-full px-2 md:px-2.5 py-0.5 text-[9px] md:text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.95)" : p.bg,
                          color: p.color,
                          border: isActive ? `2px solid ${p.color}` : "2px solid transparent",
                          opacity: isRevealed ? 1 : 0,
                          transform: isRevealed ? (isPulsing ? "scale(1.12)" : "scale(1)") : "scale(0.8)",
                          transition: "all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                          boxShadow: isPulsing ? `0 0 0 6px ${p.color}22` : "none",
                        }}
                      >
                        {p.label}
                        {isActive && <span className="ml-1 opacity-70">· {p.count} txns</span>}
                      </span>
                    );
                  })}
                </div>

                {/* Transaction list */}
                <div className="relative px-4 py-2 overflow-hidden hero-tx-list">
                  {stage === 1 ? (
                    <div className="space-y-0 transition-transform" style={{ transform: `translateY(-${scrollOffset}px)` }}>
                      {rawTransactions.map((tx, i) => (
                        <div
                          key={i}
                          className="font-mono text-[11px] leading-[22px] truncate"
                          style={{ color: "rgba(156,163,175,0.7)" }}
                        >
                          {tx}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {enrichedSorted.map((row) => {
                        const detectGlow = stage === 3 && detectHighlightPersona && row.persona === detectHighlightPersona;
                        const isHighlighted =
                          (stage === 4 && activePersona && row.persona === activePersona.id) || detectGlow;
                        const isDimmed =
                          (stage === 4 && activePersona && row.persona !== activePersona.id) ||
                          (stage === 3 && detectHighlightPersona && row.persona && row.persona !== detectHighlightPersona);
                        const persoColor =
                          (stage === 4 && activePersona) ? activePersona.color :
                          detectGlow ? personas.find(p => p.id === detectHighlightPersona)!.color : "transparent";
                        return (
                          <div
                            key={row.raw}
                            className="flex items-center justify-between gap-2 py-[3px] transition-all duration-[400ms]"
                            style={{
                              opacity: isDimmed ? 0.15 : 1,
                              borderLeft: isHighlighted ? `3px solid ${persoColor}` : "3px solid transparent",
                              paddingLeft: 8,
                              background: detectGlow ? `${persoColor}14` : "transparent",
                            }}
                          >
                            <div className="min-w-0 flex-1 flex items-baseline gap-1.5 overflow-hidden">
                              <span
                                className="text-[11px] font-semibold shrink-0 transition-colors duration-[400ms]"
                                style={{ color: isHighlighted ? "#ffffff" : "#e2e8f0" }}
                              >
                                {row.merchant}
                              </span>
                              <span
                                className="font-mono text-[9px] truncate min-w-0"
                                style={{ color: "rgba(148,163,184,0.55)" }}
                              >
                                {stripAmount(row.raw)}
                              </span>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              <span
                                className="text-[8.5px] font-mono font-semibold px-1.5 py-0.5 rounded"
                                style={{
                                  background: `${row.railColor}1f`,
                                  color: row.railColor,
                                  border: `1px solid ${row.railColor}33`,
                                }}
                              >
                                {row.railLabel}
                              </span>
                              <span
                                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${row.categoryColor}20`,
                                  color: row.categoryColor,
                                }}
                              >
                                {row.category}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                    style={{ background: "linear-gradient(to top, #0A1628, transparent)" }}
                  />
                </div>

                {/* Mobile/Tablet Ventus Orchestration card — bottom right INSIDE dark card */}
                <div
                  className="xl:hidden absolute pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    right: 10,
                    bottom: 10,
                    width: "min(260px, 70%)",
                    opacity: stage === 4 && activePersona ? 1 : 0,
                    transform: stage === 4 && activePersona ? "translateY(0)" : "translateY(8px)",
                    zIndex: 20,
                  }}
                >
                  <div
                    className="bg-white rounded-lg shadow-xl overflow-hidden"
                    style={{ border: "1px solid #E5E7EB", boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}
                  >
                    <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white font-black text-[9px] leading-none">V</span>
                        <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-700">Ventus Orchestration</span>
                      </div>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: activePersona?.color ?? "#22c55e", boxShadow: `0 0 6px ${activePersona?.color ?? "#22c55e"}` }}
                      />
                    </div>
                    <div className="px-3 pb-2.5 pt-0.5 border-t border-gray-100">
                      <div className="text-[12px] font-semibold text-gray-900 leading-snug">
                        {activePersona?.orchestrationAction ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage indicator below the dark card */}
              <div
                className="mt-3 xl:mt-6 w-full transition-all duration-700 ease-out"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: "400ms",
                }}
              >
                <div className="grid grid-cols-4 gap-1.5 xl:gap-3">
                  {STAGE_LABELS.map((label, i) => {
                    const [start, end] = STAGE_RANGES[i];
                    const fill = Math.max(0, Math.min(1, (scrollProgress - start) / (end - start)));
                    const isActive = i === activeStageIdx;
                    const isComplete = scrollProgress >= end;
                    return (
                      <div key={label} className="flex flex-col items-start">
                        <div
                          className="relative w-full rounded-full overflow-hidden"
                          style={{ height: 4, background: "#E5E7EB" }}
                        >
                          <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: `${(isComplete ? 1 : fill) * 100}%`,
                              background: "#2563EB",
                              transition: "width 120ms linear",
                            }}
                          />
                        </div>
                        <span
                          className="mt-1.5 xl:mt-2 uppercase tracking-[0.08em] xl:tracking-[0.12em] whitespace-nowrap text-[9px] xl:text-[12px]"
                          style={{
                            color: isActive || isComplete ? "#111827" : "#9CA3AF",
                            fontWeight: isActive ? 800 : 500,
                            transition: "color 300ms ease, font-weight 300ms ease",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollDrivenHero;
