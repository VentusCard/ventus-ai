import { useState, useEffect, useCallback, type ReactNode } from "react";
import ventusLogo from "@/assets/ventus-logo-blue.png";

const TOTAL_BEATS = 6;

const BEAT_SUMMARIES = [
"Billions in personalization spend — zero customer understanding.",
"Built on MCC — a 1974 taxonomy for routing, not intelligence.",
"MCCs are blind — same code for symphony, Celtics, and Monster Jam.",
"MCCs can't see patterns — three ski purchases, three generic codes.",
"Disconnected data — no demographics, no actionable intelligence."];


export default function DemoPasswordGate({ children }: {children: ReactNode;}) {
  const [granted, setGranted] = useState(() => sessionStorage.getItem("demo_access") === "true");
  const [step, setStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [revealLogo, setRevealLogo] = useState(false);
  const [revealInput, setRevealInput] = useState(false);
  const [beat4Phase, setBeat4Phase] = useState(0);
  const [beat5Phase, setBeat5Phase] = useState(0);

  const advance = useCallback(() => {
    if (isTransitioning) return;
    setStep((s) => {
      if (s === 3) {
        if (beat4Phase < 2) {
          setBeat4Phase((p) => p + 1);
          return s;
        }
        setBeat4Phase(0);
      }
      if (s === 4) {
        if (beat5Phase < 1) {
          setBeat5Phase((p) => p + 1);
          return s;
        }
        setBeat5Phase(0);
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
  }, [beat4Phase, beat5Phase, isTransitioning]);

  const goBack = useCallback(() => {
    if (step === 3 && beat4Phase > 0) {
      setBeat4Phase((p) => p - 1);
      return;
    }
    if (step === 4 && beat5Phase > 0) {
      setBeat5Phase((p) => p - 1);
      return;
    }
    setStep((s) => s > 0 ? s - 1 : s);
    setRevealLogo(false);
    setRevealInput(false);
    setBeat4Phase(0);
    setBeat5Phase(0);
  }, [step, beat4Phase, beat5Phase]);

  useEffect(() => {
    if (step === 5) {
      const t1 = setTimeout(() => setRevealLogo(true), 1500);
      const t2 = setTimeout(() => setRevealInput(true), 2200);
      return () => {clearTimeout(t1);clearTimeout(t2);};
    }
  }, [step]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        goBack();
        return;
      }
      if (step === 5) return;
      if (e.code === "Space" || e.code === "ArrowRight" || e.code === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, advance, goBack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2026demo") {
      sessionStorage.setItem("demo_access", "true");
      setGranted(true);
    } else {
      setError(true);
    }
  };

  if (granted) return <>{children}</>;

  return (
    <div
      className="h-screen w-screen overflow-hidden relative select-none flex flex-col"
      style={{
        fontFamily: "Manrope, sans-serif",
        background: "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #EFF6FF 100%)",
        backgroundSize: "400% 400%",
        animation: "ambientShift 20s ease infinite",
        cursor: step < 5 ? "pointer" : "default"
      }}
      onClick={() => step < 5 && advance()}>
      
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

      {/* Logo — top left */}
      <div className="absolute top-6 left-8 z-20">
        <img src={ventusLogo} alt="VentusAI" className="h-7 opacity-70" />
      </div>

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
      {step < 5 &&
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs tracking-wide z-20"
        style={{ color: "#94A3B8", animation: "subtlePulse 2.5s ease infinite" }}>
        
          tap or press space to continue
        </div>
      }

      {/* ── Stacked Card Layout ── */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden">
        <div className="w-full max-w-4xl relative" style={{ minHeight: 400 }}>
          {/* Previous beat cards — stacked behind */}
          {Array.from({ length: step }).map((_, i) => {
            if (i < 2) return null; // beats 1 & 2 are cardless
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
                  height: 80,
                  transformOrigin: "top center",
                  transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                style={{
                  borderColor: "#E2E8F0",
                  boxShadow: `0 ${4 - distance}px ${12 - distance * 2}px rgba(0,0,0,${0.06 - distance * 0.01})`,
                  transform: `translateY(${yOffset}px) scale(${scaleVal})`,
                  opacity: opacityVal,
                  zIndex: i,
                  height: 80,
                  transformOrigin: "top center",
                }}>
                <div className="px-8 py-5 flex items-center gap-3">
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>
                    {String(i + 1).padStart(2, "0")}
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
            className={`relative animate-fade-slide ${step >= 2 ? "rounded-2xl border bg-white shadow-lg" : ""}`}
            style={{
              ...(step >= 2 ? { borderColor: "#E2E8F0", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" } : {}),
              zIndex: step + 1,
              marginTop: step >= 2 ? Math.min(step - 1, 4) * 4 : 0,
            }}>
            <div className={step >= 2 ? "p-8 sm:p-10" : ""}>

              {/* Beat 1 */}
              {step === 0 && (
                <div className="text-center py-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#0F172A" }}>
                    Billions spent in personalized banking doesn't work.
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#64748B" }}>
                    Your customers see irrelevant offers. Random campaigns. Wasted spend.
                    Everyone knows this. The question is <span className="font-semibold" style={{ color: "#0F172A" }}>why</span>.
                  </p>
                </div>
              )}

              {/* Beat 2 */}
              {step === 1 && (
                <div className="text-center py-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
                    The answer is three letters:{" "}
                    <span style={{ color: "#3B82F6" }}>MCC</span>.
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#64748B" }}>
                    Every bank runs on Merchant Category Codes — a four-digit taxonomy from{" "}
                    <span className="font-semibold" style={{ color: "#0F172A" }}>1974</span>{" "}
                    designed for interchange routing, not customer understanding.
                  </p>
                </div>
              )}

              {/* Beat 3 */}
              {step === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>01</span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>MCCs are blind.</h2>
                  <p className="mt-3 text-base sm:text-lg" style={{ color: "#64748B" }}>
                    MCC 7922 — "Sports and Entertainment." Three customers. Three purchases: Symphony Orchestra, Celtics tickets, Monster Jam.
                    Three completely different people — invisible to the bank.
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="flex justify-center w-full max-w-md mx-auto">
                      <div className="flex-1 flex flex-col items-center gap-3 animate-fade-slide" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <ellipse cx="11" cy="23" rx="3.5" ry="2.5" fill="#94A3B8" />
                            <line x1="14.5" y1="23" x2="14.5" y2="9" stroke="#94A3B8" strokeWidth="2" />
                            <ellipse cx="21" cy="19" rx="3.5" ry="2.5" fill="#94A3B8" />
                            <line x1="24.5" y1="19" x2="24.5" y2="9" stroke="#94A3B8" strokeWidth="2" />
                            <path d="M14.5 9C14.5 9 19 7 24.5 9" stroke="#94A3B8" strokeWidth="2" fill="none" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Symphony<br/>Orchestra</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-3 animate-fade-slide" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="10" stroke="#94A3B8" strokeWidth="2" fill="none" />
                            <path d="M6 16C6 16 10 12 16 12C22 12 26 16 26 16" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
                            <path d="M6 16C6 16 10 20 16 20C22 20 26 16 26 16" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
                            <line x1="16" y1="6" x2="16" y2="26" stroke="#94A3B8" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Celtics<br/>Tickets</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-3 animate-fade-slide" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect x="6" y="12" width="20" height="8" rx="2" fill="#94A3B8" />
                            <path d="M8 12L12 6H20L24 12" fill="#94A3B8" />
                            <rect x="13" y="7" width="6" height="4" rx="1" fill="#CBD5E1" />
                            <circle cx="10" cy="22" r="3.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
                            <circle cx="10" cy="22" r="1.5" fill="#94A3B8" />
                            <circle cx="22" cy="22" r="3.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
                            <circle cx="22" cy="22" r="1.5" fill="#94A3B8" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-center" style={{ color: "#64748B" }}>Monster<br/>Jam</span>
                      </div>
                    </div>
                    <svg width="100%" height="40" viewBox="0 0 300 40" preserveAspectRatio="none" className="max-w-md animate-fade-slide" style={{ animationDelay: "1.0s", animationFillMode: "both" }}>
                      <line x1="50" y1="0" x2="150" y2="36" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                      <line x1="150" y1="0" x2="150" y2="36" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                      <line x1="250" y1="0" x2="150" y2="36" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                    </svg>
                    <div className="flex flex-col items-center gap-2 animate-fade-slide" style={{ animationDelay: "1.2s", animationFillMode: "both" }}>
                      <div className="px-5 py-2.5 rounded-lg border-2 border-dashed" style={{ borderColor: "#F59E0B", color: "#F59E0B" }}>
                        <span className="text-sm font-bold tracking-wider">MCC 7922 · Sports and Entertainment</span>
                      </div>
                      <span className="text-xs" style={{ color: "#94A3B8" }}>Same code for all three</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Beat 4 */}
              {step === 3 && (
                <div className="flex flex-col" style={{ minHeight: '40vh' }}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>02</span>
                      <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>MCCs can't identify patterns.</h2>
                    <p className="mt-3 text-base sm:text-lg" style={{ color: "#64748B" }}>
                      Three transactions across three different MCC codes. To the bank, these are completely unrelated purchases.
                    </p>
                    <div className="mt-8">
                      <div className="space-y-3">
                        {[
                          { merchant: "Vail Resorts — EPIC Pass", mcc: "7941", mccLabel: "Sports & Entertainment", amount: "$979.00", delay: "0.2s" },
                          { merchant: "Burton Snowboards", mcc: "5941", mccLabel: "Sporting Goods", amount: "$649.00", delay: "0.5s" },
                          { merchant: "The North Face", mcc: "5699", mccLabel: "Apparel", amount: "$389.00", delay: "0.8s" }
                        ].map((tx, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-5 py-3 rounded-lg border animate-fade-slide"
                            style={{
                              borderColor: "#E2E8F0",
                              backgroundColor: "#FAFBFC",
                              animationDelay: tx.delay,
                              animationFillMode: "both"
                            }}>
                            <div className="flex items-center gap-4">
                              {beat4Phase >= 1 && (
                                <span className="text-sm font-medium animate-fade-slide" style={{ color: "#0F172A" }}>{tx.merchant}</span>
                              )}
                              <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
                                MCC {tx.mcc} · {tx.mccLabel}
                              </span>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>{tx.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {beat4Phase >= 2 && (
                    <div
                      className="flex-1 flex items-center justify-center animate-fade-slide"
                      style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                      <div className="flex items-center gap-3">
                        <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2L11 7L9 12L7 7L9 2Z" fill="#3B82F6" />
                            <path d="M5 8L9 12L13 8" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
                            <line x1="9" y1="12" x2="9" y2="16" stroke="#3B82F6" strokeWidth="1.5" />
                          </svg>
                          <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>Intent: Skiing</span>
                        </div>
                        <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Beat 5 */}
              {step === 4 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>03</span>
                    <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>
                    {beat5Phase === 0 ? "Patterns can't be extended." : "Until they're connected."}
                  </h2>
                  <p className="mt-3 text-base sm:text-lg" style={{ color: "#64748B" }}>
                    {beat5Phase === 0
                      ? "Demographics and transaction data sit in separate silos. Downstream systems get generic, disconnected signals."
                      : "Intent Data brackets demographics and transactions into a single intelligence layer. Every downstream system upgrades."
                    }
                  </p>

                  {/* Horizontal flow diagram */}
                  <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-center leading-relaxed transition-all duration-500 max-w-[220px]" style={{ color: beat5Phase >= 1 ? "#2563EB" : "#94A3B8", minWidth: 260, width: 260, letterSpacing: "0.1em" }}>
                      {beat5Phase >= 1 ? "If we truly understand our customers" : "We don't really understand our customers"}
                    </p>
                    <div style={{ width: 44 }} />
                    <p className="text-[11px] font-bold tracking-widest uppercase text-center leading-relaxed transition-all duration-500 max-w-[220px]" style={{ color: beat5Phase >= 1 ? "#2563EB" : "#94A3B8", minWidth: 260, width: 260, letterSpacing: "0.1em" }}>
                      {beat5Phase >= 1 ? "We can then provide a deeply personalized experience" : "We provide a generic experience"}
                    </p>
                  </div>
                  <div className="mt-8 mb-5 flex items-center justify-center gap-4 sm:gap-6">

                    {/* LEFT — Input boxes */}
                    <div className="flex flex-col items-stretch gap-4 relative" style={{ minWidth: 260, width: 260 }}>
                      {beat5Phase >= 1 && (
                        <div
                          className="absolute -inset-4 rounded-xl border-2 animate-fade-slide"
                          style={{
                            borderColor: "#3B82F6",
                            backgroundColor: "rgba(59,130,246,0.04)",
                            animationFillMode: "both"
                          }}>
                          <span
                            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide"
                            style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}>
                            Intent Data
                          </span>
                        </div>
                      )}
                      <div
                        className="px-5 py-4 rounded-lg border text-center transition-all duration-500"
                        style={{
                          borderColor: beat5Phase >= 1 ? "#3B82F6" : "#CBD5E1",
                          borderStyle: beat5Phase >= 1 ? "solid" : "dashed",
                          backgroundColor: beat5Phase >= 1 ? "#EFF6FF" : "#F8FAFC",
                          minWidth: 160
                        }}>
                        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: beat5Phase >= 1 ? "#3B82F6" : "#94A3B8" }}>
                          Demographics
                        </span>
                      </div>
                      <div
                        className="px-5 py-4 rounded-lg border text-center transition-all duration-500"
                        style={{
                          borderColor: beat5Phase >= 1 ? "#3B82F6" : "#E2E8F0",
                          backgroundColor: beat5Phase >= 1 ? "#EFF6FF" : "#FFFFFF",
                          minWidth: 160
                        }}>
                        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: beat5Phase >= 1 ? "#3B82F6" : "#64748B" }}>
                          Transactions
                        </span>
                      </div>
                    </div>

                    {/* MIDDLE — Arrow */}
                    <div className="flex items-center">
                      <div className="h-px w-10 sm:w-16" style={{ backgroundColor: beat5Phase >= 1 ? "#3B82F6" : "#CBD5E1" }} />
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                        <path d="M0 6H10M10 6L6 2M10 6L6 10" stroke={beat5Phase >= 1 ? "#3B82F6" : "#CBD5E1"} strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* RIGHT — Output items */}
                    <div className="flex flex-col gap-2.5" style={{ minWidth: 260, width: 260 }}>
                      {(beat5Phase === 0
                        ? [
                            { label: "Analytics", icon: "📊" },
                            { label: "UX", icon: "🖥️" },
                            { label: "Rewards", icon: "🎁" },
                            { label: "Relationship", icon: "🤝" },
                          ]
                        : [
                            { label: "Analytics", icon: "📊" },
                            { label: "UX", icon: "🖥️" },
                            { label: "Personalized Rewards", icon: "🎁" },
                            { label: "Automated Relationship Intelligence", icon: "🤝" },
                          ]
                      ).map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-500"
                          style={{
                            borderColor: beat5Phase >= 1 ? "#BFDBFE" : "#E2E8F0",
                            backgroundColor: beat5Phase >= 1 ? "#F8FAFF" : "#FAFBFC",
                          }}>
                          <span className="text-base">{item.icon}</span>
                          <span
                            className="text-sm font-medium transition-colors duration-500"
                            style={{ color: beat5Phase >= 1 ? "#1E40AF" : "#64748B" }}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {/* Beat 6 — Reveal */}
              {step === 5 && (
                <div className="text-center py-8">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
                    You can't patch this. You need a new layer.
                  </h1>
                  <div
                    className="mt-12 transition-all duration-700 ease-out flex flex-col items-center"
                    style={{ opacity: revealLogo ? 1 : 0, transform: revealLogo ? "translateY(0)" : "translateY(20px)" }}>
                    <img src={ventusLogo} alt="VentusAI" className="h-12 mb-3" />
                    <p className="mt-2 text-base" style={{ color: "#64748B" }}>
                      Transform banking experiences — no core overhaul required.
                    </p>
                  </div>
                  <div
                    className="mt-10 transition-all duration-500 ease-out"
                    style={{ opacity: revealInput ? 1 : 0, transform: revealInput ? "translateY(0)" : "translateY(12px)" }}
                    onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="Enter access code"
                        className="h-11 w-64 rounded-lg border bg-white px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: error ? "#EF4444" : "#E2E8F0", color: "#0F172A" }} />
                      {error && <p className="text-sm" style={{ color: "#EF4444" }}>Incorrect access code</p>}
                      <button
                        type="submit"
                        className="h-10 px-8 rounded-full text-sm font-semibold text-white transition-colors"
                        style={{ backgroundColor: "#3B82F6" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}>
                        Enter Demo
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>);
}