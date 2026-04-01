import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { Monitor, Users } from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-blue.png";

const TOTAL_BEATS = 7;

const BEAT_SUMMARIES = [
  "AI-powered banking personalization engine.",
  "Banking personalization doesn't work.",
  "The root cause is three letters: MCC.",
  "One MCC code. Countless possible meanings. Zero clarity.",
  "Blind MCCs Hide purchase patterns(behavorial insights).",
  "Signal + demographics activates full personalization.",
  "Ventus: next-gen banking experience infra built on deep customer intelligence.",
];

export default function DemoPasswordGate({ children }: { children: ReactNode }) {
  const [granted, setGranted] = useState(() => sessionStorage.getItem("demo_access") === "true");
  const [step, setStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [beat3Phase, setBeat3Phase] = useState(0);
  const [beat4Phase, setBeat4Phase] = useState(0);
  const [beat5Phase, setBeat5Phase] = useState(0);
  

  const advance = useCallback(() => {
    if (isTransitioning) return;
    setStep((s) => {
      if (s === 3) {
        if (beat3Phase < 1) {
          setBeat3Phase((p) => p + 1);
          return s;
        }
        setBeat3Phase(0);
      }
      if (s === 4) {
        if (beat4Phase < 4) {
          setBeat4Phase((p) => p + 1);
          return s;
        }
        setBeat4Phase(0);
      }
      if (s === 5) {
        if (beat5Phase < 4) {
          setBeat5Phase((p) => p + 1);
          return s;
        }
        setBeat5Phase(0);
      }
      if (s === 6) {
        // Beat 6 is the last beat — don't advance further
        return s;
      }
      const next = s < TOTAL_BEATS - 1 ? s + 1 : s;
      if (next !== s) {
        setIsTransitioning(true);
        setTimeout(() => {
          setDisplayStep(next);
          setIsTransitioning(false);
        }, 150);
      }
      return next;
    });
  }, [beat3Phase, beat4Phase, beat5Phase, isTransitioning]);

  const goBack = useCallback(() => {
    if (isTransitioning) return;
    if (step === 4 && beat4Phase > 0) {
      setBeat4Phase((p) => p - 1);
      return;
    }
    if (step === 5 && beat5Phase > 0) {
      setBeat5Phase((p) => p - 1);
      return;
    }
    if (step > 0) {
      setIsTransitioning(true);
      const prev = step - 1;
      setStep(prev);
      setTimeout(() => {
        setDisplayStep(prev);
        setIsTransitioning(false);
      }, 150);
    }
    setBeat4Phase(0);
    setBeat5Phase(0);
  }, [step, beat4Phase, beat5Phase, isTransitioning]);

  useEffect(() => {
    if (granted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        goBack();
        return;
      }
      if (step === 6) {
        if (e.code === "ArrowRight" || e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          sessionStorage.setItem("demo_access", "true");
          setGranted(true);
        }
        return;
      }
      if (e.code === "Space" || e.code === "ArrowRight" || e.code === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [granted, step, advance, goBack, beat5Phase]);

  const isSmallScreen = useIsMobile() || useIsTablet();

  if (isSmallScreen) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center px-6"
        style={{
          fontFamily: "Manrope, sans-serif",
          background: "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #EFF6FF 100%)",
        }}
      >
        <div className="text-center max-w-sm">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: "#EFF6FF" }}
          >
            <Monitor className="h-8 w-8" style={{ color: "#3B82F6" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-3" style={{ color: "#0F172A" }}>
            Desktop Required
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#64748B" }}>
            This interactive demo is designed for larger screens. Please visit on a desktop or laptop for the best
            experience.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (granted) return <>{children}</>;

  return (
    <div
      className="h-screen w-screen overflow-hidden relative select-none flex flex-col"
      style={{
        fontFamily: "Manrope, sans-serif",
        background: "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #EFF6FF 100%)",
        backgroundSize: "400% 400%",
        animation: "ambientShift 20s ease infinite",
        cursor: step === 6 ? "default" : "pointer",
      }}
      onClick={() => !(step === 6) && advance()}
    >
      <style>{`
        @keyframes ambientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-12px) scale(0.98); }
        }
        @keyframes branchOut {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes mergeGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.2); }
          50% { box-shadow: 0 0 20px 4px rgba(59,130,246,0.15); }
        }
        .animate-fade-slide {
          animation: fadeSlideIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-slide-out {
          animation: fadeSlideOut 0.15s ease-out forwards;
        }
        .animate-branch {
          animation: branchOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Logo — top left (hidden on beat 0) */}
      {step > 0 && (
        <div className="absolute top-6 left-8 z-20">
          <img src={ventusLogo} alt="VentusAI" className="h-7" />
        </div>
      )}

      {/* Dot navigation — bottom center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              backgroundColor: i === step ? "#3B82F6" : i < step ? "#94A3B8" : "#CBD5E1",
            }}
          />
        ))}
      </div>

      {/* Tap hint */}
      {step < 7 && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs tracking-wide z-20"
          style={{ color: "#94A3B8", animation: "subtlePulse 2.5s ease infinite" }}
        >
          press left/right or space to navigate
        </div>
      )}

      {/* ── Stacked Card Layout ── */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden">
        <div className="w-full max-w-6xl relative" style={{ minHeight: 440 }}>
          {/* Previous beat cards — stacked behind */}
          {Array.from({ length: step }).map((_, i) => {
            if (i < 3) return null; // beats 0, 1 & 2 are cardless
            const distance = step - i;
            if (distance > 4) return null;
            const yOffset = -(distance * 28);
            const scaleVal = 1 - distance * 0.03;
            const opacityVal = Math.max(0.15, 0.65 - distance * 0.15);
            return (
              <div
                key={`stack-${i}`}
                className="absolute top-0 left-0 right-0 rounded-2xl border bg-white overflow-hidden"
                style={{
                  borderColor: "#E2E8F0",
                  boxShadow: `0 ${4 - distance}px ${12 - distance * 2}px rgba(0,0,0,${0.06 - distance * 0.01})`,
                  transform: `translateY(${yOffset}px) scale(${scaleVal})`,
                  opacity: opacityVal,
                  zIndex: i,
                  height: 90,
                  transformOrigin: "top center",
                  transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div className="px-8 py-5 flex items-center gap-3">
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                    {String(i - 2).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  <span className="text-sm font-medium truncate" style={{ color: "#64748B", maxWidth: "80%" }}>
                    {BEAT_SUMMARIES[i]}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Active beat card */}
          <div
            key={`beat-${displayStep}`}
            className={`relative ${isTransitioning ? "animate-fade-slide-out" : "animate-fade-slide"} ${displayStep >= 3 ? "rounded-2xl border bg-white shadow-lg" : ""}`}
            style={{
              ...(displayStep >= 3 ? { borderColor: "#E2E8F0", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" } : {}),
              zIndex: step + 1,
              marginTop: displayStep >= 3 ? Math.min(displayStep - 2, 4) * 4 : 0,
            }}
          >
            <div className={displayStep >= 3 ? "p-10 sm:p-12" : ""}>
              {/* Beat 0 — Intro */}
              {displayStep === 0 && (
                <div className="text-center py-12 flex flex-col items-center gap-8">
                  <img
                    src={ventusLogo}
                    alt="Ventus AI"
                    className="h-16 animate-fade-slide"
                    style={{ animationDelay: "0.2s", animationFillMode: "both" }}
                  />
                  <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-slide"
                    style={{ color: "#0F172A", animationDelay: "0.5s", animationFillMode: "both", lineHeight: 1.25 }}
                  >
                    AI Customer Intelligence Infra for Next-Gen Banking
                  </h1>
                </div>
              )}

              {/* Beat 1 */}
              {displayStep === 1 && (
                <div className="text-center py-8">
                  <h1
                    className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight text-primary-foreground lg:text-7xl"
                    style={{ color: "#0F172A" }}
                  >
                    Billions Spent in Banking Personalization Doesn't Work.
                  </h1>
                  <p className="mt-4 text-lg text-slate-400 font-medium">
                    Do you consider your banking experience as a truly personalized one?
                  </p>
                </div>
              )}

              {/* Beat 2 */}
              {displayStep === 2 && (
                <div className="text-center py-8">
                   <h1
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                    style={{ color: "#0F172A" }}
                  >
                    The answer is three letters:
                    <br />
                    <span style={{ color: "#3B82F6" }}>MCC</span>.
                  </h1>
                  <p className="mt-4 text-lg text-slate-400 font-medium">
                    Merchant Category Code: 
                    One Code Per Transaction, Taxonomy From the Last Century
                  </p>
                </div>
              )}

              {/* Beat 3 */}
              {displayStep === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                      01
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#0F172A" }}>
                    MCCs are blind.
                  </h2>
                  <div className="mt-8 flex flex-col items-center gap-6">
                    {/* Phase 0: MCC badge always visible */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="px-6 py-3 rounded-lg border-2 border-dashed"
                        style={{ borderColor: "#F59E0B", color: "#F59E0B" }}
                      >
                        <span className="text-lg font-bold tracking-wider">MCC 7922 · Entertainment</span>
                      </div>
                        <span className="text-base" style={{ color: "#94A3B8" }}>
                          This is what the banks use to personalize
                        </span>
                    </div>

                    {/* Phase 1: Fan out to reveal possibilities */}
                    <div
                      className="transition-all duration-700 ease-out"
                      style={{
                        opacity: beat3Phase >= 1 ? 1 : 0,
                        transform: beat3Phase >= 1 ? "translateY(0)" : "translateY(16px)",
                      }}
                    >
                      <svg
                        width="100%"
                        height="60"
                        viewBox="0 0 800 60"
                        preserveAspectRatio="none"
                        className="max-w-5xl mx-auto"
                      >
                        <line x1="400" y1="0" x2="67" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="400" y1="0" x2="200" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="400" y1="0" x2="333" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="400" y1="0" x2="467" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="400" y1="0" x2="600" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="400" y1="0" x2="733" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                      </svg>
                      <div className="flex items-center justify-center gap-3 w-full max-w-5xl mx-auto mt-2">
                        <span className="text-4xl font-bold tracking-widest text-slate-400 select-none">…</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-10 flex-1 max-w-4xl">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                              style={{ backgroundColor: "#F1F5F9" }}
                            >
                              🎵
                            </div>
                             <span className="text-sm font-medium text-center" style={{ color: "#64748B" }}>
                              Symphony
                              <br />
                              Orchestra
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                              style={{ backgroundColor: "#F1F5F9" }}
                            >
                              🏀
                            </div>
                             <span className="text-sm font-medium text-center" style={{ color: "#64748B" }}>
                              Celtics
                              <br />
                              Tickets
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                              style={{ backgroundColor: "#F1F5F9" }}
                            >
                              🚗
                            </div>
                             <span className="text-sm font-medium text-center" style={{ color: "#64748B" }}>
                              Monster
                              <br />
                              Jam
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                              style={{ backgroundColor: "#F1F5F9" }}
                            >
                              🎭
                            </div>
                             <span className="text-sm font-medium text-center" style={{ color: "#64748B" }}>
                              Broadway
                              <br />
                              Show
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                              style={{ backgroundColor: "#F1F5F9" }}
                            >
                              🎤
                            </div>
                             <span className="text-sm font-medium text-center" style={{ color: "#64748B" }}>
                              Stand-up
                              <br />
                              Comedy
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                              style={{ backgroundColor: "#F1F5F9" }}
                            >
                              🎪
                            </div>
                             <span className="text-sm font-medium text-center" style={{ color: "#64748B" }}>
                              Cirque du
                              <br />
                              Soleil
                            </span>
                          </div>
                        </div>
                        <span className="text-4xl font-bold tracking-widest text-slate-400 select-none">…</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Beat 4 — Baby life event pattern */}
              {displayStep === 4 && (
                <div className="flex flex-col" style={{ minHeight: "40vh" }}>
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                        02
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold transition-all duration-500" style={{ color: "#0F172A" }}>
                      {beat4Phase >= 3 ? "Ventus: Semantic Pattern Extraction without MCCs" : "Purchase Patterns Are Hidden by Blind MCCs"}
                    </h2>
                    <div className="mt-8">
                      <div className="space-y-3">
                        {[
                          {
                            merchant: "CVS Pharmacy",
                            mcc: "5912",
                            mccLabel: "Drug Stores & Pharmacies",
                            amount: "$48.70",
                            delay: "0.15s",
                          },
                          {
                            merchant: "Motherhood Maternity",
                            mcc: "5621",
                            mccLabel: "Women's Ready-to-Wear",
                            amount: "$127.00",
                            delay: "0.3s",
                          },
                          {
                            merchant: "Dr. Reyes OB/GYN Associates",
                            mcc: "N/A",
                            mccLabel: "Check #1087",
                            amount: "$1350.00",
                            delay: "0.45s",
                          },
                          {
                            merchant: "Pottery Barn",
                            mcc: "5712",
                            mccLabel: "Furniture & Home Furnishings",
                            amount: "$890.00",
                            delay: "0.6s",
                          },
                          {
                            merchant: "Babies R Us",
                            mcc: "5999",
                            mccLabel: "Miscellaneous Retail",
                            amount: "$156.75",
                            delay: "0.75s",
                          },
                        ].map((tx, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-6 py-4 rounded-lg border animate-fade-slide"
                            style={{
                              borderColor: "#E2E8F0",
                              backgroundColor: "#FAFBFC",
                              animationDelay: tx.delay,
                              animationFillMode: "both",
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className="px-3 py-1 rounded text-base font-mono transition-all duration-500"
                                style={{
                                  backgroundColor: "#FEF3C7",
                                  color: "#D97706",
                                  opacity: beat4Phase >= 3 ? 0 : 1,
                                  maxWidth: beat4Phase >= 3 ? 0 : "600px",
                                  padding: beat4Phase >= 3 ? "0" : undefined,
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                MCC {tx.mcc} · {tx.mccLabel}
                              </span>
                              <span
                                className="text-lg font-medium transition-all duration-500"
                                style={{
                                  color: beat4Phase >= 3 ? "#3B82F6" : "#0F172A",
                                  opacity: beat4Phase >= 1 ? 1 : 0,
                                  width: beat4Phase >= 1 ? "auto" : 0,
                                  transform: beat4Phase >= 1 ? "translateX(0)" : "translateX(-8px)",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {tx.merchant}
                              </span>
                            </div>
                             <span className="text-lg font-semibold" style={{ color: "#0F172A" }}>
                               {tx.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center transition-all duration-500 pt-1"
                    style={{
                      opacity: beat4Phase >= 2 ? 1 : 0,
                      transform: beat4Phase >= 2 ? "translateY(0)" : "translateY(8px)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                      <div
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                        style={{
                          backgroundColor: beat4Phase >= 4 ? "#3B82F6" : "#EFF6FF",
                          border: beat4Phase >= 4 ? "1px solid #3B82F6" : "1px solid #BFDBFE",
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path
                            d="M11 4C9.5 1.5 5 1 3.5 5C2 9 7 13 11 17C15 13 20 9 18.5 5C17 1 12.5 1.5 11 4Z"
                            fill={beat4Phase >= 4 ? "#FFFFFF" : "#3B82F6"}
                          />
                        </svg>
                          <span className="text-lg font-semibold" style={{ color: beat4Phase >= 4 ? "#FFFFFF" : "#3B82F6" }}>
                            {beat4Phase >= 4 ? "Semantically Similar Purchase Patterns = Behavioral Indicators" : "Expecting a Baby"}
                          </span>
                      </div>
                      <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Beat 5 — Signal Activation */}
              {displayStep === 5 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                      03
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#0F172A" }}>
                    Behavioral Signal + Demographics= Personalization
                  </h2>

                  {/* Phase 0: Signal + Demographics — top-left aligned */}
                  <div
                    className="mt-8 flex items-center gap-3 flex-wrap"
                    style={{ animation: "slideInLeft 0.5s ease-out both" }}
                  >
                    {/* Life event signal badge */}
                    <div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                      style={{
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                        <path
                          d="M11 4C9.5 1.5 5 1 3.5 5C2 9 7 13 11 17C15 13 20 9 18.5 5C17 1 12.5 1.5 11 4Z"
                          fill="#3B82F6"
                        />
                      </svg>
                       <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
                        Statistically Similar Multi-category Pattern: Expecting a Baby
                       </span>
                    </div>

                    <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>
                      +
                    </span>

                    {/* Demographics pill — matching style */}
                    <div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                      style={{
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        animation: "fadeIn 0.6s ease-out 0.3s both",
                      }}
                    >
                      <Users size={18} className="text-blue-500" />
                       <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
                        Demographic: Age, Income, ZIP Code, etc.
                       </span>
                    </div>
                  </div>

                   {/* Three vertically stacked action cards */}
                   <div className="flex flex-col gap-4 w-full mt-3">
                     {/* Personalized Rewards */}
                     <div
                       className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-5 transition-all duration-700"
                       style={{
                         opacity: beat5Phase >= 1 ? 1 : 0,
                         transform: beat5Phase >= 1 ? "translateY(0)" : "translateY(16px)",
                       }}
                     >
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-2xl">🎁</span>
                         <span className="text-base font-bold" style={{ color: "#0F172A" }}>
                           Personalized Rewards
                         </span>
                       </div>
                       <p className="text-sm text-slate-500 leading-relaxed">
                          Deliver deals and local resources that help this expecting mother — e.g. baby monitors or local classes — with heart-warming messages
                       </p>
                     </div>

                     {/* Personalized Relationship */}
                     <div
                       className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-5 transition-all duration-700"
                       style={{
                         opacity: beat5Phase >= 2 ? 1 : 0,
                         transform: beat5Phase >= 2 ? "translateY(0)" : "translateY(16px)",
                       }}
                     >
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-2xl">🤝</span>
                         <span className="text-base font-bold" style={{ color: "#0F172A" }}>
                           Personalized Relationship
                         </span>
                       </div>
                       <p className="text-sm text-slate-500 leading-relaxed">
                           Notify the local advisor, auto-draft a 529 plan, and trigger a financial planning review — all taken care of before the customer asks
                       </p>
                     </div>

                     {/* Personalized AI & UX */}
                     <div
                       className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-5 transition-all duration-700"
                       style={{
                         opacity: beat5Phase >= 3 ? 1 : 0,
                         transform: beat5Phase >= 3 ? "translateY(0)" : "translateY(16px)",
                       }}
                     >
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-2xl">📱</span>
                         <span className="text-base font-bold" style={{ color: "#0F172A" }}>
                           Personalized AI & UX
                         </span>
                       </div>
                       <p className="text-sm text-slate-500 leading-relaxed">
                         Surface a "Family & Foundation" pillar with a baby budget tracker, milestone alerts, and contextual AI that orchestrates it all
                       </p>
                     </div>
                   </div>

                </div>
              )}

              {/* Beat 6 — Ventus capstone */}
              {displayStep === 6 && (
                <div className={`${isTransitioning ? "animate-fade-slide-out" : "animate-fade-slide"}`}>
                  <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">04</div>
                  <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-slate-800">
                    Ventus is the next-gen banking experience infra built{" "}
                    <span style={{ color: "#3B82F6" }}>on top of</span>{" "}
                    <span style={{ color: "#3B82F6" }}>deep customer intelligence.</span>
                  </h2>
                  <p className="mt-6 text-lg text-slate-400">
                    Because banking should be an empowering experience for every customer.
                  </p>

                  {/* Enter Demo button */}
                  <div className="mt-10 flex justify-start" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        sessionStorage.setItem("demo_access", "true");
                        setGranted(true);
                      }}
                      className="h-11 px-10 rounded-full text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: "#3B82F6", animation: "fadeSlideIn 0.5s ease-out" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
                    >
                      Enter Demo →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
