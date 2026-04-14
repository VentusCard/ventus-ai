import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

const rawTransactions = [
  "SQ *POTTERY BARN KIDS 4829 $234.50",
  "MARRIOTT HOTELS 4829 $285.00",
  "APPLPAY MCDONALD'S F3421 $9.75",
  "CHECKCARD WHOLE FOODS #123 $87.40",
  "PRINCETON REVIEW $1299.00",
  "DELTA AIR LINES $428.00",
  "CARTER'S $124.50",
  "PAYPAL *LA FITNESS $45.00",
  "YALE ADMISSIONS OFFICE $32.00",
  "COLLEGE ESSAY ADVISOR $850.00",
  "BUY BUY BABY $234.50",
  "STANFORD GUEST HOUSE $210.00",
  "COMMON APP FEE $75.00",
  "SOUTHWEST AIRLINES $312.00",
  "TARGET $89.00",
  "CHECKCARD COSTCO #4821 $142.30",
  "APPLPAY STARBUCKS $6.45",
  "VENMO PAYMENT $50.00",
  "AMAZON MARKETPLACE $67.80",
  "SHELL OIL #3892 $48.20",
  "NETFLIX.COM $15.99",
  "SPOTIFY USA $9.99",
  "TRADER JOE'S #219 $93.10",
  "CVS PHARMACY #4201 $24.50",
  "UBER *TRIP $18.40",
  "SQ *POTTERY BARN KIDS 4829 $234.50",
  "MARRIOTT HOTELS 4829 $285.00",
  "APPLPAY MCDONALD'S F3421 $9.75",
  "CHECKCARD WHOLE FOODS #123 $87.40",
  "PRINCETON REVIEW $1299.00",
  "DELTA AIR LINES $428.00",
  "CARTER'S $124.50",
  "PAYPAL *LA FITNESS $45.00",
  "YALE ADMISSIONS OFFICE $32.00",
  "COLLEGE ESSAY ADVISOR $850.00",
  "BUY BUY BABY $234.50",
  "STANFORD GUEST HOUSE $210.00",
  "COMMON APP FEE $75.00",
  "SOUTHWEST AIRLINES $312.00",
  "TARGET $89.00",
  "CHECKCARD COSTCO #4821 $142.30",
  "APPLPAY STARBUCKS $6.45",
  "VENMO PAYMENT $50.00",
  "AMAZON MARKETPLACE $67.80",
  "SHELL OIL #3892 $48.20",
  "NETFLIX.COM $15.99",
  "SPOTIFY USA $9.99",
  "TRADER JOE'S #219 $93.10",
  "CVS PHARMACY #4201 $24.50",
  "UBER *TRIP $18.40",
];

interface EnrichedRow {
  raw: string;
  merchant: string;
  category: string;
  categoryColor: string;
  persona?: "travel" | "parent" | "college";
}

const enrichedData: EnrichedRow[] = rawTransactions.map((raw) => {
  const r = raw.toUpperCase();
  if (r.includes("POTTERY BARN KIDS"))
    return { raw, merchant: "Pottery Barn Kids", category: "Home & Kids", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("MARRIOTT"))
    return { raw, merchant: "Marriott Hotels", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("MCDONALD"))
    return { raw, merchant: "McDonald's", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("WHOLE FOODS"))
    return { raw, merchant: "Whole Foods Market", category: "Grocery", categoryColor: "#22c55e" };
  if (r.includes("PRINCETON"))
    return { raw, merchant: "Princeton Review", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("DELTA AIR"))
    return { raw, merchant: "Delta Air Lines", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("CARTER"))
    return { raw, merchant: "Carter's", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("LA FITNESS"))
    return { raw, merchant: "LA Fitness", category: "Health", categoryColor: "#8b5cf6" };
  if (r.includes("YALE"))
    return { raw, merchant: "Yale Admissions Office", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("COLLEGE ESSAY"))
    return { raw, merchant: "College Essay Advisor", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("BUY BUY BABY"))
    return { raw, merchant: "Buy Buy Baby", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("STANFORD GUEST"))
    return { raw, merchant: "Stanford Guest House", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("COMMON APP"))
    return { raw, merchant: "Common App Fee", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("SOUTHWEST"))
    return { raw, merchant: "Southwest Airlines", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("TARGET"))
    return { raw, merchant: "Target", category: "Retail", categoryColor: "#ef4444" };
  if (r.includes("COSTCO"))
    return { raw, merchant: "Costco", category: "Retail", categoryColor: "#ef4444" };
  if (r.includes("STARBUCKS"))
    return { raw, merchant: "Starbucks", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("VENMO"))
    return { raw, merchant: "Venmo Payment", category: "Transfer", categoryColor: "#6b7280" };
  if (r.includes("AMAZON"))
    return { raw, merchant: "Amazon", category: "Shopping", categoryColor: "#ef4444" };
  if (r.includes("SHELL"))
    return { raw, merchant: "Shell Oil", category: "Auto", categoryColor: "#6b7280" };
  if (r.includes("NETFLIX"))
    return { raw, merchant: "Netflix", category: "Entertainment", categoryColor: "#8b5cf6" };
  if (r.includes("SPOTIFY"))
    return { raw, merchant: "Spotify", category: "Entertainment", categoryColor: "#8b5cf6" };
  if (r.includes("TRADER JOE"))
    return { raw, merchant: "Trader Joe's", category: "Grocery", categoryColor: "#22c55e" };
  if (r.includes("CVS"))
    return { raw, merchant: "CVS Pharmacy", category: "Health", categoryColor: "#8b5cf6" };
  if (r.includes("UBER"))
    return { raw, merchant: "Uber", category: "Transport", categoryColor: "#6b7280" };
  return { raw, merchant: raw.split("$")[0].trim(), category: "Other", categoryColor: "#6b7280" };
});

const personas = [
  { id: "travel" as const, label: "Frequent Traveler", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", callout: "14 travel transactions · $1,338 total spend" },
  { id: "parent" as const, label: "New Parent", color: "#22c55e", bg: "rgba(34,197,94,0.15)", callout: "8 transactions · $889 spend · 95% confidence" },
  { id: "college" as const, label: "College-Bound Child", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", callout: "12 transactions · $2,456 spend · 91% confidence" },
];

const ScrollDrivenHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Stage logic
  const stage = scrollProgress < 0.2 ? 1 : scrollProgress < 0.4 ? 2 : 3;
  const stage2Progress = stage >= 2 ? Math.min(1, (scrollProgress - 0.2) / 0.15) : 0;

  // Stage 3: persona highlight index
  const personaProgress = stage === 3 ? (scrollProgress - 0.4) / 0.6 : 0;
  const activePersonaIndex = personaProgress < 0.33 ? 0 : personaProgress < 0.66 ? 1 : 2;
  const activePersona = stage === 3 ? personas[activePersonaIndex] : null;

  // Card bg transition
  const cardBg = stage === 1 ? "#1C1C1E" : "#0A1628";

  // Scroll offset for raw text
  const scrollOffset = useMemo(() => scrollProgress * 200, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "250vh", background: "#0A1628" }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-32 md:pt-40 overflow-hidden">
        {/* Centered Headline */}
        <h1 className="text-3xl md:text-[2.75rem] lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.15] text-center mb-4 px-6 max-w-4xl">
          Turn transaction data into{" "}
          <span className="italic text-blue-400">behavioral intelligence</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl text-center leading-relaxed mb-10 px-6">
          A modular AI layer that turns transaction data into lifestyle profiles, life event detection, and purchase intelligence — automatically.
        </p>

        {/* Card + Callout wrapper */}
        <div className="relative flex items-start justify-center gap-6">
          {/* The Card */}
          <div
            className="rounded-2xl overflow-hidden transition-colors duration-[400ms] ease-in-out"
            style={{
              width: 440,
              maxWidth: "calc(100vw - 48px)",
              background: cardBg,
              boxShadow: "0 25px 60px -12px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Customer Profile — top 1/3 */}
            <div
              className="px-4 pt-4 pb-3 border-b transition-all duration-[400ms]"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-[400ms]"
                    style={{
                      background: stage >= 2 ? "rgba(59,130,246,0.2)" : "rgba(107,114,128,0.2)",
                      color: stage >= 2 ? "#60a5fa" : "#9ca3af",
                    }}
                  >
                    MR
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Michael R.</div>
                    <div className="text-[11px] text-gray-500 font-mono">cust_013</div>
                  </div>
                </div>
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

              {/* Profile details */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">Household</div>
                  <div className="text-[12px] text-gray-300 font-medium">Family of 4</div>
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">Location</div>
                  <div className="text-[12px] text-gray-300 font-medium">Wellesley, MA</div>
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">Segment</div>
                  <div className="text-[12px] text-gray-300 font-medium">High Income</div>
                </div>
              </div>

              {/* Persona pills — Stage 2+ */}
              <div
                className="flex flex-wrap gap-2 mt-3 transition-all duration-[400ms]"
                style={{
                  maxHeight: stage >= 2 ? 48 : 0,
                  opacity: stage >= 2 ? 1 : 0,
                  overflow: "hidden",
                }}
              >
                {personas.map((p, i) => {
                  const isActive = stage === 3 && activePersona?.id === p.id;
                  return (
                    <span
                      key={p.id}
                      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-[400ms]"
                      style={{
                        background: isActive ? "rgba(255,255,255,0.95)" : p.bg,
                        color: p.color,
                        border: isActive ? `2px solid ${p.color}` : "2px solid transparent",
                        opacity: stage2Progress > (i * 0.3) ? 1 : 0,
                        transform: stage2Progress > (i * 0.3) ? "translateY(0)" : "translateY(8px)",
                        transitionDelay: `${i * 200}ms`,
                      }}
                    >
                      {p.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Transaction list — bottom 2/3 */}
            <div className="px-4 py-2 overflow-hidden" style={{ height: 180 }}>
              {stage === 1 ? (
                <div
                  className="space-y-0 transition-transform"
                  style={{ transform: `translateY(-${scrollOffset}px)` }}
                >
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
                  {enrichedData.slice(0, 20).map((row, i) => {
                    const isHighlighted = stage === 3 && activePersona && row.persona === activePersona.id;
                    const isDimmed = stage === 3 && activePersona && row.persona !== activePersona.id;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-[3px] transition-all duration-[400ms]"
                        style={{
                          opacity: isDimmed ? 0.1 : 1,
                          borderLeft: isHighlighted ? `3px solid ${activePersona!.color}` : "3px solid transparent",
                          paddingLeft: 8,
                        }}
                      >
                        <span
                          className="text-[11px] truncate mr-3 transition-colors duration-[400ms]"
                          style={{ color: isHighlighted ? "#e2e8f0" : "rgba(203,213,225,0.8)" }}
                        >
                          {row.merchant}
                        </span>
                        <span
                          className="shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${row.categoryColor}20`,
                            color: row.categoryColor,
                          }}
                        >
                          {row.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Floating callout — Stage 3 */}
          <div
            className="hidden lg:block absolute -right-[280px] top-[140px] w-[240px] transition-all duration-[400ms]"
            style={{
              opacity: stage === 3 ? 1 : 0,
              transform: stage === 3 ? "translateX(0)" : "translateX(-12px)",
            }}
          >
            {activePersona && (
              <div
                className="rounded-xl px-4 py-3 text-[12px] leading-relaxed transition-all duration-[400ms]"
                style={{
                  background: `${activePersona.color}10`,
                  borderLeft: `4px solid ${activePersona.color}`,
                  color: activePersona.color,
                }}
              >
                <div className="font-semibold mb-1 text-[13px]" style={{ color: activePersona.color }}>
                  {activePersona.label}
                </div>
                <div style={{ color: "#6b7280" }}>{activePersona.callout}</div>
              </div>
            )}
          </div>
        </div>

        {/* Learn More button below card */}
        <Button
          variant="outline"
          size="lg"
          className="mt-8 border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white"
          onClick={() => {
            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default ScrollDrivenHero;
