import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { Monitor, Users } from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-blue.png";

const TOTAL_BEATS = 7;

const BEAT_SUMMARIES = [
"Ventus AI — AI Customer Intelligence Layer that Powers Banking Personalization Across Functions.",
"Billions in personalization spend — zero customer understanding.",
"Built on MCC — a 1974 taxonomy for routing, not intelligence.",
"MCCs are blind — one code that could mean symphony, Celtics, or Monster Jam.",
"MCCs can't see patterns — three ski purchases, three generic codes.",
"One signal activates personalized rewards, relationship management, and analytics.",
"Disconnected data — no demographics, no actionable intelligence."];


export default function DemoPasswordGate({ children }: {children: ReactNode;}) {
  const [granted, setGranted] = useState(() => sessionStorage.getItem("demo_access") === "true");
  const [step, setStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [beat3Phase, setBeat3Phase] = useState(0);
  const [beat4Phase, setBeat4Phase] = useState(0);
  const [beat5Phase, setBeat5Phase] = useState(0);
  const [beat6Phase, setBeat6Phase] = useState(0);

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
        if (beat4Phase < 2) {
          setBeat4Phase((p) => p + 1);
          return s;
        }
        setBeat4Phase(0);
      }
      if (s === 5) {
        if (beat5Phase < 1) {
          setBeat5Phase((p) => p + 1);
          return s;
        }
        setBeat5Phase(0);
      }
      if (s === 6) {
        if (beat6Phase < 1) {
          setBeat6Phase((p) => p + 1);
          return s;
        }
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
  }, [beat3Phase, beat4Phase, beat5Phase, beat6Phase, isTransitioning]);

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
    if (step === 6 && beat6Phase > 0) {
      setBeat6Phase((p) => p - 1);
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
    setBeat6Phase(0);
  }, [step, beat4Phase, beat5Phase, beat6Phase, isTransitioning]);


  useEffect(() => {
    if (step === 6 && beat6Phase === 0) {
      const t = setTimeout(() => setBeat6Phase(1), 1800);
      return () => clearTimeout(t);
    }
  }, [step, beat6Phase]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        goBack();
        return;
      }
      if (step === 6 && beat6Phase >= 1) {
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
  }, [step, advance, goBack]);


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
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "#EFF6FF" }}>
            <Monitor className="h-8 w-8" style={{ color: "#3B82F6" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-3" style={{ color: "#0F172A" }}>
            Desktop Required
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#64748B" }}>
            This interactive demo is designed for larger screens. Please visit on a desktop or laptop for the best experience.
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
        cursor: (step === 6 && beat6Phase >= 1) ? "default" : "pointer"
      }}
      onClick={() => !(step === 6 && beat6Phase >= 1) && advance()}>
      
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
        {Array.from({ length: TOTAL_BEATS }).map((_, i) =>
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === step ? 24 : 8,
            height: 8,
            backgroundColor: i === step ? "#3B82F6" : i < step ? "#94A3B8" : "#CBD5E1"
          }} />

        )}
      </div>

      {/* Tap hint */}
      {step < 7 &&
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs tracking-wide z-20"
        style={{ color: "#94A3B8", animation: "subtlePulse 2.5s ease infinite" }}>
        
          press left/right or space to navigate
        </div>
      }

      {/* ── Stacked Card Layout ── */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden">
        <div className="w-full max-w-5xl relative" style={{ minHeight: 440 }}>
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
                  transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                <div className="px-8 py-5 flex items-center gap-3">
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                    {String(i - 2).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  <span className="text-sm font-medium truncate" style={{ color: "#64748B", maxWidth: "80%" }}>
                    {BEAT_SUMMARIES[i]}
                  </span>
                </div>
              </div>);

          })}

          {/* Active beat card */}
          <div
            key={`beat-${displayStep}`}
            className={`relative ${isTransitioning ? "animate-fade-slide-out" : "animate-fade-slide"} ${displayStep >= 3 ? "rounded-2xl border bg-white shadow-lg" : ""}`}
            style={{
              ...(displayStep >= 3 ? { borderColor: "#E2E8F0", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" } : {}),
              zIndex: step + 1,
              marginTop: displayStep >= 3 ? Math.min(displayStep - 2, 4) * 4 : 0
            }}>
            <div className={displayStep >= 3 ? "p-10 sm:p-12" : ""}>

              {/* Beat 0 — Intro */}
              {displayStep === 0 &&
              <div className="text-center py-12 flex flex-col items-center gap-8">
                  <img src={ventusLogo} alt="Ventus AI" className="h-16 animate-fade-slide" style={{ animationDelay: "0.2s", animationFillMode: "both" }} />
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-slide" style={{ color: "#0F172A", animationDelay: "0.5s", animationFillMode: "both", lineHeight: 1.25 }}>
                    AI Banking Personalization and<br />Customer Intelligence Engine
                  </h1>
                </div>
              }

              {/* Beat 1 */}
              {displayStep === 1 &&
              <div className="text-center py-8">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight" style={{ color: "#0F172A" }}>
                    Billions spent in personalized banking doesn't (truly) work.
                  </h1>
                  <p className="mt-6 text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#64748B" }}>
                    Your customers see irrelevant offers. Random campaigns. Wasted spend.
                    Everyone knows this. The question is <span className="font-semibold" style={{ color: "#0F172A" }}>why</span>.
                  </p>
                </div>
              }

              {/* Beat 2 */}
              {displayStep === 2 &&
              <div className="text-center py-8">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
                    The answer is three letters:{" "}
                    <span style={{ color: "#3B82F6" }}>MCC</span>.
                  </h1>
                  <p className="mt-6 text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#64748B" }}>
                    Every bank runs on Merchant Category Codes — a four-digit taxonomy from{" "}
                    <span className="font-semibold" style={{ color: "#0F172A" }}>1974</span>{" "}
                    designed for interchange routing, not customer understanding.
                  </p>
                </div>
              }

              {/* Beat 3 */}
              {displayStep === 3 &&
              <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>01</span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#0F172A" }}>MCCs are blind.</h2>
                  <p className="mt-3 text-lg sm:text-xl" style={{ color: "#64748B" }}>
                    A customer spends $120 on a ticket. The bank sees one code.
                    But what does it actually mean?
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-6">
                    {/* Phase 0: MCC badge always visible */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="px-6 py-3 rounded-lg border-2 border-dashed" style={{ borderColor: "#F59E0B", color: "#F59E0B" }}>
                        <span className="text-base font-bold tracking-wider">MCC 7922 · Entertainment</span>
                      </div>
                      <span className="text-sm" style={{ color: "#94A3B8" }}>This is all the bank sees</span>
                    </div>

                    {/* Phase 1: Fan out to reveal possibilities */}
                    <div className="transition-all duration-700 ease-out" style={{ opacity: beat3Phase >= 1 ? 1 : 0, transform: beat3Phase >= 1 ? 'translateY(0)' : 'translateY(16px)' }}>
                      <svg width="100%" height="60" viewBox="0 0 600 60" preserveAspectRatio="none" className="max-w-2xl mx-auto">
                        <line x1="300" y1="0" x2="50" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="300" y1="0" x2="150" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="300" y1="0" x2="250" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="300" y1="0" x2="350" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="300" y1="0" x2="450" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="300" y1="0" x2="550" y2="56" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                      </svg>
                      <div className="flex items-center justify-center gap-3 w-full max-w-4xl mx-auto mt-2">
                        <span className="text-3xl font-bold tracking-widest text-slate-400 select-none">…</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 flex-1 max-w-3xl">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "#F1F5F9" }}>🎵</div>
                            <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Symphony<br />Orchestra</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "#F1F5F9" }}>🏀</div>
                            <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Celtics<br />Tickets</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "#F1F5F9" }}>🚗</div>
                            <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Monster<br />Jam</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "#F1F5F9" }}>🎭</div>
                            <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Broadway<br />Show</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "#F1F5F9" }}>🎤</div>
                            <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Stand-up<br />Comedy</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "#F1F5F9" }}>🎪</div>
                            <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Cirque du<br />Soleil</span>
                          </div>
                        </div>
                        <span className="text-3xl font-bold tracking-widest text-slate-400 select-none">…</span>
                      </div>
                      
                    </div>
                  </div>
                </div>
              }

              {/* Beat 4 — Baby life event pattern */}
              {displayStep === 4 &&
              <div className="flex flex-col" style={{ minHeight: '40vh' }}>
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>02</span>
                      <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#0F172A" }}>Purchase Patterns Are Hidden by Blind MCCs</h2>
                    <p className="mt-3 text-lg sm:text-xl" style={{ color: "#64748B" }}>
                      Five transactions across five different MCC codes. To the bank, these are completely unrelated purchases.
                    </p>
                    <div className="mt-8">
                      <div className="space-y-3">
                        {[
                      { merchant: "CVS Pharmacy", mcc: "5912", mccLabel: "Drug Stores & Pharmacies", amount: "$48.70", delay: "0.15s" },
                      { merchant: "Motherhood Maternity", mcc: "5621", mccLabel: "Women's Ready-to-Wear", amount: "$127.00", delay: "0.3s" },
                      { merchant: "Dr. Reyes OB/GYN Associates", mcc: "N/A", mccLabel: "Check #1087", amount: "$1350.00", delay: "0.45s" },
                      { merchant: "Pottery Barn", mcc: "5712", mccLabel: "Furniture & Home Furnishings", amount: "$890.00", delay: "0.6s" },
                      { merchant: "Babies R Us", mcc: "5999", mccLabel: "Miscellaneous Retail", amount: "$156.75", delay: "0.75s" }].
                      map((tx, i) =>
                      <div
                        key={i}
                        className="flex items-center justify-between px-6 py-4 rounded-lg border animate-fade-slide"
                        style={{
                          borderColor: "#E2E8F0",
                          backgroundColor: "#FAFBFC",
                          animationDelay: tx.delay,
                          animationFillMode: "both"
                        }}>
                            <div className="flex items-center gap-4">
                              <span className="px-3 py-1 rounded text-sm font-mono" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
                                MCC {tx.mcc} · {tx.mccLabel}
                              </span>
                              <span
                            className="text-base font-medium transition-all duration-500"
                            style={{
                              color: "#0F172A",
                              opacity: beat4Phase >= 1 ? 1 : 0,
                              width: beat4Phase >= 1 ? 'auto' : 0,
                              transform: beat4Phase >= 1 ? 'translateX(0)' : 'translateX(-8px)',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                            
                                {tx.merchant}
                              </span>
                            </div>
                            <span className="text-base font-semibold" style={{ color: "#0F172A" }}>{tx.amount}</span>
                          </div>
                      )}
                      </div>
                    </div>
                  </div>
                  <div
                  className="flex items-center justify-center transition-all duration-500 pt-1"
                  style={{
                    opacity: beat4Phase >= 2 ? 1 : 0,
                    transform: beat4Phase >= 2 ? 'translateY(0)' : 'translateY(8px)'
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path d="M11 4C9.5 1.5 5 1 3.5 5C2 9 7 13 11 17C15 13 20 9 18.5 5C17 1 12.5 1.5 11 4Z" fill="#3B82F6" />
                        </svg>
                        <span className="text-base font-semibold" style={{ color: "#3B82F6" }}>Behavioral Pattern: Expecting a Baby</span>
                      </div>
                      <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                    </div>
                  </div>
                </div>
              }

              {/* Beat 5 — Signal Activation */}
              {displayStep === 5 &&
              <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>03</span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#0F172A" }}>Behavioral Signal + Demographics= Personalization</h2>
                  <p className="mt-3 text-lg sm:text-xl" style={{ color: "#64748B" }}>
                    Combine the behavioral pattern with the customer's demographics — every downstream system activates.
                  </p>

                  {/* Phase 0: Signal + Demographics — top-left aligned */}
                  <div className="mt-8 flex items-center gap-3 flex-wrap" style={{ animation: "slideInLeft 0.5s ease-out both" }}>
                    {/* Life event signal badge */}
                    <div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                      style={{
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                        <path d="M11 4C9.5 1.5 5 1 3.5 5C2 9 7 13 11 17C15 13 20 9 18.5 5C17 1 12.5 1.5 11 4Z" fill="#3B82F6" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>Behavioral Pattern: Expecting a Baby</span>
                    </div>

                    <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>+</span>

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
                      <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>Demographic: Age, Income, ZIP Code, etc.</span>
                    </div>
                  </div>

                  {/* Three vertically stacked action cards */}
                  <div
                    className="flex flex-col gap-4 w-full mt-3 transition-all duration-700"
                    style={{
                      opacity: beat5Phase >= 1 ? 1 : 0,
                      transform: beat5Phase >= 1 ? 'translateY(0)' : 'translateY(16px)'
                    }}
                  >
                    {/* Personalized Rewards */}
                    <div className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎁</span>
                        <span className="text-sm font-bold" style={{ color: "#0F172A" }}>Personalized Rewards</span>
                        <span className="text-[11px] text-slate-400">— Delivered within deals page with ranking, message, and CTA personalized</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Baby Monitors & Gear", "Pregnancy Books & Audiobooks", "Strollers & Car Seats", "Prenatal Classes & Services"].map((label) => (
                          <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center">
                            <span className="text-[10px] font-bold leading-tight" style={{ color: "#0F172A" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personalized Relationship */}
                    <div className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🤝</span>
                        <span className="text-sm font-bold" style={{ color: "#0F172A" }}>Personalized Relationship</span>
                        <span className="text-[11px] text-slate-400">— Triggers automation for regular customers and notification & automated prep for wealth managers</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["529 Plan Setup", "Home Space Planning", "Life Insurance Review", "Emergency Fund Boost"].map((label) => (
                          <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center">
                            <span className="text-[10px] font-bold leading-tight" style={{ color: "#0F172A" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personalized UX */}
                    <div className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📱</span>
                        <span className="text-sm font-bold" style={{ color: "#0F172A" }}>Personalized UX</span>
                        <span className="text-[11px] text-slate-400">— Supported by backend analytics and orchestrates other features</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["\"Family & Foundation\" Pillar", "Baby Budget Tracker", "Parenting Milestone Alerts", "Family Deal Highlights"].map((label) => (
                          <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center">
                            <span className="text-[10px] font-bold leading-tight" style={{ color: "#0F172A" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              }

              {/* Beat 6 — Disconnected data */}
              {displayStep === 6 &&
              <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>04</span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#0F172A" }}>
                    {beat6Phase === 0 ? "Siloed Transactions and Demographics" : "Ventus Innovates the Entire Stack"}
                  </h2>
                  <p className="mt-3 text-lg sm:text-xl" style={{ color: "#64748B" }}>
                    {beat6Phase === 0 ?
                  "Demographics and transaction data sit in separate silos. Downstream systems get generic, disconnected signals." :
                  "Dynamic Personas & Behavioral Insights brackets demographics and transactions into a single intelligence layer. Every downstream system upgrades."
                  }
                  </p>

                  {/* Horizontal flow diagram */}
                  <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 w-full">
                    <p className="text-sm font-bold tracking-widest uppercase text-center leading-relaxed transition-all duration-500 flex-1 min-w-0" style={{ color: beat6Phase >= 1 ? "#2563EB" : "#94A3B8", letterSpacing: "0.1em" }}>
                      {beat6Phase >= 1 ? "If we truly understand our customers" : "We don't really understand our customers"}
                    </p>
                    <div style={{ width: 44 }} />
                    <p className="text-sm font-bold tracking-widest uppercase text-center leading-relaxed transition-all duration-500 flex-1 min-w-0" style={{ color: beat6Phase >= 1 ? "#2563EB" : "#94A3B8", letterSpacing: "0.1em" }}>
                      {beat6Phase >= 1 ? "We can then provide a personalized banking experience" : "We provide a generic experience"}
                    </p>
                  </div>
                  <div className="mt-8 mb-5 flex items-center justify-center gap-4 sm:gap-6 w-full">

                    {/* LEFT — Input boxes */}
                    <div className="flex flex-col items-stretch gap-4 relative flex-1 min-w-0">
                      <div
                      className="absolute -inset-4 rounded-xl border-2 transition-all duration-500"
                      style={{
                        borderColor: "#3B82F6",
                        backgroundColor: "rgba(59,130,246,0.04)",
                        opacity: beat6Phase >= 1 ? 1 : 0,
                        transform: beat6Phase >= 1 ? "translateY(0)" : "translateY(8px)"
                      }}>
                        <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap"
                        style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}>
                          Dynamic Personas & Behavioral Insights
                        </span>
                      </div>
                      <div
                      className="px-5 py-4 rounded-lg border text-center transition-all duration-500"
                      style={{
                        borderColor: beat6Phase >= 1 ? "#3B82F6" : "#E2E8F0",
                        backgroundColor: beat6Phase >= 1 ? "#EFF6FF" : "#FFFFFF",
                        minWidth: 160
                      }}>
                        <span className="text-sm font-bold tracking-wider uppercase" style={{ color: beat6Phase >= 1 ? "#3B82F6" : "#64748B" }}>
                          Transactions
                        </span>
                      </div>
                      <div
                      className="px-5 py-4 rounded-lg border text-center transition-all duration-500"
                      style={{
                        borderColor: beat6Phase >= 1 ? "#3B82F6" : "#CBD5E1",
                        borderStyle: beat6Phase >= 1 ? "solid" : "dashed",
                        backgroundColor: beat6Phase >= 1 ? "#EFF6FF" : "#F8FAFC",
                        minWidth: 160
                      }}>
                        <span className="text-sm font-bold tracking-wider uppercase" style={{ color: beat6Phase >= 1 ? "#3B82F6" : "#94A3B8" }}>
                          Demographics
                        </span>
                      </div>
                    </div>

                    {/* MIDDLE — Arrow */}
                    <div className="flex items-center px-1">
                      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="transition-colors duration-500">
                        <line x1="0" y1="12" x2="38" y2="12" stroke={beat6Phase >= 1 ? "#3B82F6" : "#CBD5E1"} strokeWidth="2" strokeDasharray={beat6Phase >= 1 ? "none" : "4 3"} className="transition-all duration-500" />
                        <path d="M36 6L44 12L36 18" stroke={beat6Phase >= 1 ? "#3B82F6" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />
                      </svg>
                    </div>

                    {/* RIGHT — Output items */}
                    <div className="flex-1 min-w-0 relative">
                      {/* Phase 0: static labels */}
                      <div
                      className="flex flex-col gap-2.5 transition-all duration-500"
                      style={{
                        opacity: beat6Phase === 0 ? 1 : 0,
                        transform: beat6Phase === 0 ? 'translateY(0)' : 'translateY(-10px)',
                        position: beat6Phase === 0 ? 'relative' : 'absolute',
                        inset: 0,
                        pointerEvents: beat6Phase === 0 ? 'auto' : 'none'
                      }}>
                        {[
                      { label: "Analytics", icon: "📊" },
                      { label: "UX", icon: "🖥️" },
                      { label: "Rewards", icon: "🎁" },
                      { label: "Relationship", icon: "🤝" }].
                      map((item) =>
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-lg border"
                        style={{ borderColor: "#E2E8F0", backgroundColor: "#FAFBFC" }}>
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-base font-medium whitespace-nowrap" style={{ color: "#64748B" }}>{item.label}</span>
                          </div>
                      )}
                      </div>

                      {/* Phase 1: rolling carousel */}
                      <div
                      className="transition-all duration-700"
                      style={{
                        opacity: beat6Phase >= 1 ? 1 : 0,
                        transform: beat6Phase >= 1 ? 'translateY(0)' : 'translateY(10px)',
                        position: beat6Phase >= 1 ? 'relative' : 'absolute',
                        inset: 0,
                        pointerEvents: beat6Phase >= 1 ? 'auto' : 'none',
                        height: 200,
                        overflow: 'hidden',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                      }}>
                        <div className="animate-scroll-up flex flex-col gap-2.5">
                          {[...Array(2)].map((_, dupeIdx) =>
                        [
                        { label: "Smart Rewards with Personalized Offers", icon: "🎁" },
                        { label: "Behavioral Pattern Detection & Anticipation", icon: "💫" },
                        { label: "AI-Powered Campaign Targeting", icon: "📣" },
                        { label: "Behavioral Segment Builder", icon: "👥" },
                        { label: "Travel Detection & Local Deals", icon: "✈️" },
                        { label: "Wealth Copilot for Advisors", icon: "📈" },
                        { label: "Personalized Customer Engagement", icon: "💎" },
                        { label: "Bank-Wide Behavioral Analytics", icon: "📊" },
                        { label: "Automated Relationship Intelligence", icon: "🤝" },
                        { label: "Financial Wellness Coaching", icon: "🌱" },
{ label: "Cross-Sell Opportunity Matrix", icon: "🔗" },
                        { label: "Geo-Targeted Merchant Partnerships", icon: "📍" },
                        { label: "Gamification and Achievements", icon: "🏆" },
                        { label: "Fund Outflow and Competitor Analysis", icon: "💸" }].
                        map((item, i) =>
                        <div
                          key={`${dupeIdx}-${i}`}
                          className="flex items-center gap-2.5 px-5 py-3 rounded-lg border"
                          style={{ borderColor: "#BFDBFE", backgroundColor: "#F8FAFF" }}>
                                <span className="text-lg flex-shrink-0">{item.icon}</span>
                                <span className="text-base font-medium whitespace-nowrap" style={{ color: "#1E40AF" }}>{item.label}</span>
                              </div>
                        )
                        )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Enter Demo button — appears after phase 1 */}
                  {beat6Phase >= 1 && (
                    <div className="mt-8 flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          sessionStorage.setItem("demo_access", "true");
                          setGranted(true);
                        }}
                        className="h-11 px-10 rounded-full text-sm font-semibold text-white transition-colors"
                        style={{ backgroundColor: "#3B82F6", animation: "fadeSlideIn 0.5s ease-out" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}>
                        Enter Demo →
                      </button>
                    </div>
                  )}
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    </div>);
}
