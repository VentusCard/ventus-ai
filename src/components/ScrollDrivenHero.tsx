import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    return {
      ...base,
      merchant: "Pottery Barn Kids",
      category: "Home & Kids",
      categoryColor: "#22c55e",
      persona: "parent",
    };
  if (r.includes("MARRIOTT"))
    return { ...base, merchant: "Marriott Miami", category: "Hotel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("OLIVE GARDEN"))
    return { ...base, merchant: "Olive Garden", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("WHLFDS") || r.includes("WHOLE FOODS"))
    return { ...base, merchant: "Whole Foods Market", category: "Grocery", categoryColor: "#22c55e" };
  if (r.includes("KAPLAN"))
    return {
      ...base,
      merchant: "Kaplan",
      category: "Books",
      categoryColor: "#f59e0b",
      persona: "college",
    };
  if (r.includes("DELTA AIR"))
    return { ...base, merchant: "Delta Air Lines", category: "Airlines", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("CARTER"))
    return { ...base, merchant: "Carter's", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("LA FITNESS"))
    return { ...base, merchant: "LA Fitness", category: "Health", categoryColor: "#8b5cf6" };
  if (r.includes("COLLEGE COUNSELOR"))
    return {
      ...base,
      merchant: "College Counselor",
      category: "Edu Service",
      categoryColor: "#f59e0b",
      persona: "college",
    };
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
    return {
      ...base,
      merchant: "SAT Prep Tutor",
      category: "Edu Service",
      categoryColor: "#f59e0b",
      persona: "college",
    };
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

// Strip trailing "$amount" from raw descriptor for display
const stripAmount = (raw: string) => raw.replace(/\s*\$[\d,]+\.\d{2}\s*$/, "").trim();

// Persona transaction counts (computed from data)
const personaCounts = {
  travel: enrichedData.filter((r) => r.persona === "travel").length,
  parent: enrichedData.filter((r) => r.persona === "parent").length,
  college: enrichedData.filter((r) => r.persona === "college").length,
};

const personas = [
  {
    id: "travel" as const,
    label: "Leisure Traveler",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    count: personaCounts.travel,
    callout: `${personaCounts.travel} transactions · Flights, lodging, premium luggage, Global Entry, tours`,
  },
  {
    id: "parent" as const,
    label: "Young Parent",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    count: personaCounts.parent,
    callout: `${personaCounts.parent} transactions · Childcare, baby gear, kids clothing`,
  },
  {
    id: "college" as const,
    label: "College-Bound Child",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    count: personaCounts.college,
    callout: `${personaCounts.college} transactions · Test prep, apps, counseling`,
  },
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

  // Stage logic — Stage 2 arrives earlier; Stage 3 splits its window evenly across 3 personas
  const stage = scrollProgress < 0.1 ? 1 : scrollProgress < 0.2 ? 2 : 3;
  const stage2Progress = stage >= 2 ? Math.min(1, (scrollProgress - 0.1) / 0.1) : 0;

  // Stage 3 spans 0.2 → 1.0 (80% of total scroll), split evenly across 3 personas
  const personaProgress = stage === 3 ? (scrollProgress - 0.2) / 0.8 : 0;
  const activePersonaIndex =
    personaProgress < 1 / 3 ? 0 : personaProgress < 2 / 3 ? 1 : 2;
  const activePersona = stage === 3 ? personas[activePersonaIndex] : null;

  // Sort enriched data: persona-tagged rows first, then others — show more evidence.
  // In stage 3, float the active persona's rows to the very top.
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

  // Scroll offset for raw text
  const scrollOffset = useMemo(() => scrollProgress * 200, [scrollProgress]);

  return (
    <div ref={containerRef} className="relative" style={{ height: "360vh", minHeight: "100vh", background: "#FFFFFF" }}>
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-28 md:pt-36 overflow-visible">
        {/* Centered Headline */}
        <h1
          className="font-bold tracking-tight text-gray-900 leading-[1.1] text-center mb-6 md:mb-10 px-6 max-w-4xl transition-all duration-700 ease-out text-4xl md:text-6xl"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
          }}
        >
          Turn transaction data into <span className="italic text-blue-600">behavioral intelligence</span>
        </h1>

        {/* Card + Callout wrapper */}
        <div className="relative flex items-start justify-center gap-6">
          {/* Floating callouts — only visible when persona is active in stage 3 */}
          {personas.map((p) => {
            const isActive = stage === 3 && activePersona?.id === p.id;
            const pos =
              p.id === "travel"
                ? { right: "calc(50% + 228px)", top: 20, side: "left" as const }
                : p.id === "parent"
                  ? { right: "calc(50% + 228px)", top: 230, side: "left" as const }
                  : { left: "calc(50% + 228px)", top: 60, side: "right" as const };

            const emoji = p.id === "travel" ? "✈" : p.id === "parent" ? "👶" : "🎓";

            const action =
              p.id === "travel"
                ? "Curate leisure travel deal collection: noise-cancelling headphones, lounge pass, premium rental car..."
                : p.id === "parent"
                  ? "Activate family planning flow: Financial planning nudge, life insurance review, wealth management invite..."
                  : "Standard clients: automated 529 / HYSA flow. Wealth clients: automated flow + Advisor notified with AI-assisted meeting prep";

            const Stack = (
              <div className="flex flex-col items-stretch" style={{ width: 210 }}>
                {/* Label bubble */}
                <div
                  className="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
                  style={{
                    background: `${p.color}0a`,
                    border: `1px solid ${p.color}25`,
                  }}
                >
                  <div className="font-semibold text-[13px]" style={{ color: p.color }}>
                    {emoji} {p.label}
                  </div>
                </div>

                {/* Vertical dashed connector */}
                <svg width="2" height="16" className="self-center" style={{ overflow: "visible" }}>
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="16"
                    stroke={p.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-12"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </line>
                </svg>

                {/* Action sub-bubble */}
                <div
                  className="rounded-xl px-3 py-2.5"
                  style={{
                    background: `${p.color}08`,
                    border: `1px dashed ${p.color}55`,
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wide mb-1"
                    style={{ color: p.color }}
                  >
                    <span className="flex items-center justify-center w-3.5 h-3.5 rounded-[3px] bg-blue-600 text-white font-black text-[9px] leading-none">
                      V
                    </span>
                    <span>Orchestration</span>
                  </div>
                  <div className="text-[11px] leading-snug text-gray-700">{action}</div>
                </div>
              </div>
            );

            return (
              <div
                key={p.id}
                className="hidden lg:flex absolute items-start pointer-events-none"
                style={{
                  ...pos,
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateX(0) scale(1)"
                    : pos.side === "left"
                      ? "translateX(16px) scale(0.95)"
                      : "translateX(-16px) scale(0.95)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {pos.side === "left" && (
                  <>
                    {Stack}
                    <svg width="48" height="2" className="shrink-0 mt-5" style={{ overflow: "visible" }}>
                      <line
                        x1="0"
                        y1="1"
                        x2="40"
                        y2="1"
                        stroke={p.color}
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
                      <circle cx="43" cy="1" r="3" fill={p.color} opacity="0.7">
                        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </>
                )}
                {pos.side === "right" && (
                  <>
                    <svg width="48" height="2" className="shrink-0 mt-5" style={{ overflow: "visible" }}>
                      <circle cx="5" cy="1" r="3" fill={p.color} opacity="0.7">
                        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <line
                        x1="8"
                        y1="1"
                        x2="48"
                        y2="1"
                        stroke={p.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.5"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="0"
                          to="14"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </line>
                    </svg>
                    {Stack}
                  </>
                )}
              </div>
            );
          })}

          {/* The Card */}
          <div
            className="rounded-2xl overflow-hidden transition-all duration-700 ease-out"
            style={{
              width: 520,
              maxWidth: "calc(100vw - 48px)",
              background: "#0A1628",
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
              <span className="font-mono text-xs text-gray-500">cust_013</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full transition-colors duration-[400ms]"
                  style={{
                    background: stage >= 2 ? "#22c55e" : "#6b7280",
                    animation: stage === 1 ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" : "none",
                  }}
                />
                <span
                  className="text-[11px] font-mono transition-colors duration-[400ms]"
                  style={{ color: stage >= 2 ? "#22c55e" : "#6b7280" }}
                >
                  {stage >= 2 ? "Profile Built" : "Analyzing..."}
                </span>
              </div>
            </div>

            {/* Persona pills — Stage 2+ */}
            <div
              className="flex gap-1.5 px-5 pt-3 transition-all duration-[400ms]"
              style={{
                maxHeight: stage >= 2 ? 80 : 0,
                opacity: stage >= 2 ? 1 : 0,
                overflow: "hidden",
              }}
            >
              {personas.map((p, i) => {
                const isActive = stage === 3 && activePersona?.id === p.id;
                const isRevealed = stage === 3 && activePersonaIndex >= i;
                return (
                  <span
                    key={p.id}
                    className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-[400ms]"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.95)" : p.bg,
                      color: p.color,
                      border: isActive ? `2px solid ${p.color}` : "2px solid transparent",
                      opacity: isRevealed ? 1 : 0,
                      transform: isRevealed ? "translateY(0)" : "translateY(8px)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.label}
                    {isActive && <span className="ml-1 opacity-70">· {p.count} txns</span>}
                  </span>
                );
              })}
            </div>

            {/* Transaction list with gradient fade */}
            <div className="relative px-4 py-2 overflow-hidden" style={{ height: 255 }}>
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
                    const isHighlighted = stage === 3 && activePersona && row.persona === activePersona.id;
                    const isDimmed = stage === 3 && activePersona && row.persona !== activePersona.id;
                    return (
                      <div
                        // Stable key on raw so the row physically reorders (with transition) instead of remounting
                        key={row.raw}
                        className="flex items-center justify-between gap-2 py-[3px] transition-all duration-[400ms]"
                        style={{
                          opacity: isDimmed ? 0.08 : 1,
                          borderLeft: isHighlighted ? `3px solid ${activePersona!.color}` : "3px solid transparent",
                          paddingLeft: 8,
                        }}
                      >
                        {/* Left: clean merchant + faint raw descriptor */}
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

                        {/* Right: rail pill + category pill */}
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
              {/* Bottom gradient fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                style={{ background: "linear-gradient(to top, #0A1628, transparent)" }}
              />
            </div>
          </div>
        </div>

        <div
          className="mt-5 md:mt-6 flex flex-col items-center pb-6 transition-all duration-700 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "450ms",
          }}
        >
          <p className="text-sm md:text-base text-gray-500 max-w-xl text-center leading-relaxed px-6">
            Understand customers through dynamic personas, behavioral signals, and real-time life events.
          </p>

          {/* Schedule a Demo button */}
          <Button
            size="lg"
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/contact")}
          >
            Schedule a Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScrollDrivenHero;
