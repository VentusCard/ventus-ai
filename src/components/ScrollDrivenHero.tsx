import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const rawTransactions = [
  "PAYPL *POTTERY BARN KD 4829 $234.50",
  "SQ *MARRIOTT HTL MIA 8821 $285.00",
  "APPLPAY MCDONALD'S F3421 $9.75",
  "CHECKCARD WHOLE FOODS #123 $87.40",
  "PAYPL *PRINCETON REVW $1,299.00",
  "DELTA AIR 0062139847221 $428.00",
  "SQ *CARTERS STORE 992 $124.50",
  "PAYPL *LA FITNESS DUE $45.00",
  "CHECK #1247 YALE UNIV $32.00",
  "ZELLE PAYMENT COLLEGE COUNSELOR $850.00",
  "SQ *BUY BUY BABY 1120 $234.50",
  "CHECKCARD STANFORD GST HS $210.00",
  "PAYPL *COMMONAPP FEE $75.00",
  "WN SOUTHWEST 5261849 $312.00",
  "TARGET T-2847 $89.00",
  "CHECKCARD COSTCO WHSE #4821 $142.30",
  "APPLPAY STARBUCKS #9924 $6.45",
  "ZELLE TO MARIA G $50.00",
  "AMZN MKTP US*2K9F81 $67.80",
  "SHELL OIL 57442389201 $48.20",
  "NETFLIX.COM 8883297631 $15.99",
  "SPOTIFY USA $9.99",
  "SQ *TRADER JOES #219 $93.10",
  "CVS/PHARMACY #4201 $24.50",
  "UBER *TRIP HLPN2 $18.40",
  "CHECK #1252 SAT PREP TUTOR $400.00",
  "PAYPL *GYMBOREE PLAY $89.00",
  "SQ *HILTON GARDEN INN $195.00",
  "ZELLE TO NANNY SERVICES $320.00",
  "CHECKCARD BABIES R US $156.00",
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
  if (r.includes("POTTERY BARN"))
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
    return { raw, merchant: "Yale University", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("COLLEGE COUNSELOR"))
    return { raw, merchant: "College Counselor", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("BUY BUY BABY"))
    return { raw, merchant: "Buy Buy Baby", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("STANFORD"))
    return { raw, merchant: "Stanford Guest House", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("COMMONAPP"))
    return { raw, merchant: "Common App Fee", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("SOUTHWEST"))
    return { raw, merchant: "Southwest Airlines", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("TARGET"))
    return { raw, merchant: "Target", category: "Retail", categoryColor: "#ef4444" };
  if (r.includes("COSTCO"))
    return { raw, merchant: "Costco", category: "Retail", categoryColor: "#ef4444" };
  if (r.includes("STARBUCKS"))
    return { raw, merchant: "Starbucks", category: "Dining", categoryColor: "#f59e0b" };
  if (r.includes("ZELLE") && r.includes("MARIA"))
    return { raw, merchant: "Zelle — Maria G.", category: "Transfer", categoryColor: "#6b7280" };
  if (r.includes("AMZN"))
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
  if (r.includes("SAT PREP"))
    return { raw, merchant: "SAT Prep Tutor", category: "Education", categoryColor: "#f59e0b", persona: "college" };
  if (r.includes("GYMBOREE"))
    return { raw, merchant: "Gymboree Play", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("HILTON"))
    return { raw, merchant: "Hilton Garden Inn", category: "Travel", categoryColor: "#3b82f6", persona: "travel" };
  if (r.includes("NANNY"))
    return { raw, merchant: "Nanny Services", category: "Childcare", categoryColor: "#22c55e", persona: "parent" };
  if (r.includes("BABIES R US"))
    return { raw, merchant: "Babies R Us", category: "Kids & Baby", categoryColor: "#22c55e", persona: "parent" };
  return { raw, merchant: raw.split("$")[0].trim(), category: "Other", categoryColor: "#6b7280" };
});

const personas = [
  { id: "travel" as const, label: "Frequent Traveler", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", callout: "5 travel transactions · Hotels, flights, campus visits" },
  { id: "parent" as const, label: "Young Parent", color: "#22c55e", bg: "rgba(34,197,94,0.15)", callout: "6 transactions · Childcare, baby gear, kids clothing" },
  { id: "college" as const, label: "College-Bound Child", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", callout: "5 transactions · Test prep, apps, counseling" },
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

  // Stage logic
  const stage = scrollProgress < 0.2 ? 1 : scrollProgress < 0.4 ? 2 : 3;
  const stage2Progress = stage >= 2 ? Math.min(1, (scrollProgress - 0.2) / 0.15) : 0;

  // Stage 3: persona highlight index
  const personaProgress = stage === 3 ? (scrollProgress - 0.4) / 0.6 : 0;
  const activePersonaIndex = personaProgress < 0.33 ? 0 : personaProgress < 0.66 ? 1 : 2;
  const activePersona = stage === 3 ? personas[activePersonaIndex] : null;

  // Sort enriched data: persona-tagged rows first, then others — show more evidence
  const enrichedSorted = useMemo(() => {
    const withPersona = enrichedData.filter(r => r.persona);
    const without = enrichedData.filter(r => !r.persona);
    return [...withPersona, ...without].slice(0, 14);
  }, []);

  // Scroll offset for raw text
  const scrollOffset = useMemo(() => scrollProgress * 200, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "360vh", background: "#FFFFFF" }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-28 md:pt-32 overflow-visible">
        {/* Centered Headline */}
        <h1
          className="text-3xl md:text-[2.75rem] lg:text-[3.25rem] font-bold tracking-tight text-gray-900 leading-[1.15] text-center mb-6 px-6 max-w-4xl transition-all duration-700 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
          }}
        >
          Turn transaction data into{" "}
          <span className="italic text-blue-600">behavioral intelligence</span>
        </h1>

        {/* Card + Callout wrapper */}
        <div className="relative flex items-start justify-center gap-6">
          {/* The Card */}
          <div
            className="rounded-2xl overflow-hidden transition-all duration-700 ease-out"
            style={{
              width: 440,
              maxWidth: "calc(100vw - 48px)",
              background: "#0A1628",
              boxShadow: loaded ? "0 25px 60px -12px rgba(0,0,0,0.25)" : "0 10px 30px -8px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.06)",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
              transitionDelay: "200ms",
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
              className="flex flex-wrap gap-2 px-5 pt-3 transition-all duration-[400ms]"
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

            {/* Transaction list with gradient fade */}
            <div className="relative px-4 py-2 overflow-hidden" style={{ height: 200 }}>
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
                  {enrichedSorted.map((row, i) => {
                    const isHighlighted = stage === 3 && activePersona && row.persona === activePersona.id;
                    const isDimmed = stage === 3 && activePersona && row.persona !== activePersona.id;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-[3px] transition-all duration-[400ms]"
                        style={{
                          opacity: isDimmed ? 0.08 : 1,
                          borderLeft: isHighlighted ? `3px solid ${activePersona!.color}` : "3px solid transparent",
                          paddingLeft: 8,
                        }}
                      >
                        <div className="min-w-0 mr-3">
                          <span
                            className="text-[11px] truncate block transition-colors duration-[400ms]"
                            style={{ color: isHighlighted ? "#e2e8f0" : "rgba(203,213,225,0.8)" }}
                          >
                            {row.merchant}
                          </span>
                        </div>
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
              {/* Bottom gradient fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                style={{ background: "linear-gradient(to top, #0A1628, transparent)" }}
              />
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

        <div className="mt-5 flex flex-col items-center pb-20 md:pb-28">
          <p className="text-sm md:text-base text-gray-500 max-w-2xl text-center leading-relaxed px-6">
            A modular AI layer that turns transaction data into lifestyle profiles, life event detection, and purchase intelligence — automatically.
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
