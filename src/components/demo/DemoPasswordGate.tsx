import { useState, useEffect, useCallback, type ReactNode } from "react";
import ventusLogo from "@/assets/ventus-logo-blue.png";

const TOTAL_BEATS = 6;

export default function DemoPasswordGate({ children }: { children: ReactNode }) {
  const [granted, setGranted] = useState(() => sessionStorage.getItem("demo_access") === "true");
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [revealLogo, setRevealLogo] = useState(false);
  const [revealInput, setRevealInput] = useState(false);

  const advance = useCallback(() => {
    setStep((s) => (s < TOTAL_BEATS - 1 ? s + 1 : s));
  }, []);

  // Reveal logo and input on beat 6 with staggered delays
  useEffect(() => {
    if (step === 5) {
      const t1 = setTimeout(() => setRevealLogo(true), 1500);
      const t2 = setTimeout(() => setRevealInput(true), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step === 5) return; // don't advance on final beat
      if (e.code === "Space" || e.code === "ArrowRight" || e.code === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, advance]);

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

  const beatOpacity = (beatIndex: number) => {
    if (beatIndex > step) return 0;
    if (beatIndex === step) return 1;
    // Dim progressively
    const distance = step - beatIndex;
    return Math.max(0.1, 0.3 - distance * 0.08);
  };

  const beatTransform = (beatIndex: number) => {
    if (beatIndex > step) return "translateY(30px)";
    if (beatIndex === step) return "translateY(0)";
    const distance = step - beatIndex;
    return `scale(0.92) translateY(-${distance * 12}px)`;
  };

  return (
    <div
      className="h-screen w-screen overflow-y-auto relative select-none"
      style={{
        fontFamily: "Manrope, sans-serif",
        background: "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #EFF6FF 100%)",
        backgroundSize: "400% 400%",
        animation: "ambientShift 20s ease infinite",
        cursor: step < 5 ? "pointer" : "default",
      }}
      onClick={() => step < 5 && advance()}
    >
      {/* Ambient background animation */}
      <style>{`
        @keyframes ambientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes branchOut {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-slide {
          animation: fadeSlideIn 0.5s ease forwards;
        }
        .animate-branch {
          animation: branchOut 0.4s ease forwards;
        }
      `}</style>

      {/* Logo — top left */}
      <div className="absolute top-6 left-8 z-20">
        <img src={ventusLogo} alt="VentusAI" className="h-7 opacity-70" />
      </div>

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

      {/* Tap to continue hint */}
      {step < 5 && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs tracking-wide z-20 transition-opacity duration-500"
          style={{ color: "#94A3B8", animation: "subtlePulse 2.5s ease infinite" }}
        >
          tap or press space to continue
        </div>
      )}

      {/* Content container */}
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-20 max-w-4xl mx-auto">

        {/* ── Beat 1 ── */}
        <div
          className="w-full text-center transition-all duration-500 ease-out"
          style={{
            opacity: beatOpacity(0),
            transform: beatTransform(0),
            pointerEvents: step === 0 ? "auto" : "none",
          }}
        >
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: "#0F172A" }}
          >
            Billions spent in personalized banking doesn't work.
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#64748B" }}>
            Your customers see irrelevant offers. Random campaigns. Wasted spend.
            Everyone knows this. The question is <span className="font-semibold" style={{ color: "#0F172A" }}>why</span>.
          </p>
        </div>

        {/* ── Beat 2 ── */}
        <div
          className="w-full text-center mt-16 transition-all duration-500 ease-out"
          style={{
            opacity: beatOpacity(1),
            transform: beatTransform(1),
            pointerEvents: step === 1 ? "auto" : "none",
          }}
        >
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ color: "#0F172A" }}
          >
            The answer is three letters:{" "}
            <span style={{ color: "#3B82F6" }}>MCC</span>.
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#64748B" }}>
            Every bank runs on Merchant Category Codes — a four-digit taxonomy from{" "}
            <span className="font-semibold" style={{ color: "#0F172A" }}>1974</span>{" "}
            designed for interchange routing, not customer understanding.
          </p>
        </div>

        {/* ── Beat 3 — Layer 1: MCCs are blind ── */}
        <div
          className="w-full mt-16 transition-all duration-500 ease-out"
          style={{
            opacity: beatOpacity(2),
            transform: beatTransform(2),
            pointerEvents: step === 2 ? "auto" : "none",
          }}
        >
          <div className="border rounded-xl p-8 sm:p-10" style={{ borderColor: "#E2E8F0", backgroundColor: "rgba(255,255,255,0.7)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>01</span>
              <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>
              MCCs are blind.
            </h2>
            <p className="mt-3 text-base sm:text-lg" style={{ color: "#64748B" }}>
              MCC 7922 — "Entertainment." That's a season pass to the symphony{" "}
              <em>and</em> a ticket to Monster Jam. Two completely different customers — invisible to the bank.
            </p>

            {/* Visual: Two persona silhouettes */}
            {step >= 2 && (
              <div className="mt-8 flex items-center justify-center gap-12 sm:gap-20">
                {/* Symphony patron */}
                <div className="flex flex-col items-center gap-3 animate-fade-slide" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 4C16 4 20 8 20 14C20 18 18 22 16 24C14 22 12 18 12 14C12 8 16 4 16 4Z" fill="#94A3B8"/>
                      <path d="M10 20L16 28L22 20" stroke="#94A3B8" strokeWidth="1.5" fill="none"/>
                      <circle cx="16" cy="9" r="2" fill="#CBD5E1"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#64748B" }}>Symphony Season Pass</span>
                </div>

                {/* MCC badge in center */}
                <div className="flex flex-col items-center gap-2 animate-fade-slide" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
                  <div className="px-4 py-2 rounded-lg border-2 border-dashed" style={{ borderColor: "#F59E0B", color: "#F59E0B" }}>
                    <span className="text-sm font-bold tracking-wider">MCC 7922</span>
                  </div>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>Same code</span>
                </div>

                {/* Monster Jam fan */}
                <div className="flex flex-col items-center gap-3 animate-fade-slide" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect x="8" y="14" width="16" height="10" rx="3" fill="#94A3B8"/>
                      <circle cx="12" cy="24" r="3" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1"/>
                      <circle cx="20" cy="24" r="3" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1"/>
                      <path d="M10 14L14 6H18L22 14" fill="#94A3B8"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#64748B" }}>Monster Jam Ticket</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Beat 4 — Layer 2: MCCs can't identify patterns ── */}
        <div
          className="w-full mt-8 transition-all duration-500 ease-out"
          style={{
            opacity: beatOpacity(3),
            transform: beatTransform(3),
            pointerEvents: step === 3 ? "auto" : "none",
          }}
        >
          <div className="border rounded-xl p-8 sm:p-10" style={{ borderColor: "#E2E8F0", backgroundColor: "rgba(255,255,255,0.7)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>02</span>
              <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>
              MCCs can't identify patterns.
            </h2>
            <p className="mt-3 text-base sm:text-lg" style={{ color: "#64748B" }}>
              MCC 5941 — "Sporting Goods." A customer buys an EPIC Pass. Then Burton gear. Then a North Face jacket.
              Three transactions. Three generic codes. But the pattern is obvious:{" "}
              <span className="font-semibold" style={{ color: "#0F172A" }}>someone is going skiing.</span>{" "}
              The bank can't see it.
            </p>

            {/* Visual: Three transactions → pattern */}
            {step >= 3 && (
              <div className="mt-8 space-y-0">
                {/* Transaction rows */}
                <div className="space-y-3">
                  {[
                    { merchant: "Vail Resorts — EPIC Pass", mcc: "7941", amount: "$979.00", delay: "0.2s" },
                    { merchant: "Burton Snowboards", mcc: "5941", amount: "$649.00", delay: "0.5s" },
                    { merchant: "The North Face", mcc: "5699", amount: "$389.00", delay: "0.8s" },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-3 rounded-lg border animate-fade-slide"
                      style={{
                        borderColor: "#E2E8F0",
                        backgroundColor: "#FAFBFC",
                        animationDelay: tx.delay,
                        animationFillMode: "both",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium" style={{ color: "#0F172A" }}>{tx.merchant}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
                          MCC {tx.mcc}
                        </span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>{tx.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Pattern connector */}
                <div
                  className="mt-6 flex items-center justify-center gap-3 animate-fade-slide"
                  style={{ animationDelay: "1.3s", animationFillMode: "both" }}
                >
                  <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 2L11 7L9 12L7 7L9 2Z" fill="#3B82F6"/>
                      <path d="M5 8L9 12L13 8" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
                      <line x1="9" y1="12" x2="9" y2="16" stroke="#3B82F6" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>Pattern: Skiing</span>
                  </div>
                  <div className="h-px w-16" style={{ backgroundColor: "#3B82F6" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Beat 5 — Layer 3: Patterns can't be extended ── */}
        <div
          className="w-full mt-8 transition-all duration-500 ease-out"
          style={{
            opacity: beatOpacity(4),
            transform: beatTransform(4),
            pointerEvents: step === 4 ? "auto" : "none",
          }}
        >
          <div className="border rounded-xl p-8 sm:p-10" style={{ borderColor: "#E2E8F0", backgroundColor: "rgba(255,255,255,0.7)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>03</span>
              <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>
              Patterns can't be extended.
            </h2>
            <p className="mt-3 text-base sm:text-lg" style={{ color: "#64748B" }}>
              Now layer in demographics. This is a family of four. That skiing pattern becomes actionable — 
              surface a GoPro offer, a family resort deal, gear for the kids. And log the entire ski trip as one 
              consolidated expense item for their wealth advisor.
            </p>

            {/* Visual: Pattern branching to actions */}
            {step >= 4 && (
              <div className="mt-8 flex flex-col items-center">
                {/* Source pattern */}
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full animate-fade-slide"
                  style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", animationDelay: "0.2s", animationFillMode: "both" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>🎿 Skiing · Family of 4</span>
                </div>

                {/* Branch lines */}
                <div className="relative w-full max-w-lg mt-4 mb-4">
                  <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none" className="animate-fade-slide" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
                    <line x1="200" y1="0" x2="66" y2="40" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="200" y1="0" x2="200" y2="40" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="200" y1="0" x2="334" y2="40" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                </div>

                {/* Action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                  {[
                    { icon: "📷", title: "GoPro Hero12", subtitle: "Electronics cross-sell", delay: "0.7s" },
                    { icon: "🏔️", title: "Family Resort Deal", subtitle: "Vail partner offer", delay: "0.9s" },
                    { icon: "🧒", title: "Kids' Ski Gear", subtitle: "Age-based targeting", delay: "1.1s" },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 text-center animate-branch"
                      style={{
                        borderColor: "#BFDBFE",
                        backgroundColor: "#F8FAFF",
                        animationDelay: card.delay,
                        animationFillMode: "both",
                      }}
                    >
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <div className="text-sm font-semibold" style={{ color: "#0F172A" }}>{card.title}</div>
                      <div className="text-xs mt-1" style={{ color: "#3B82F6" }}>{card.subtitle}</div>
                    </div>
                  ))}
                </div>

                {/* Wealth advisor consolidation */}
                <div
                  className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg border animate-branch"
                  style={{
                    borderColor: "#E2E8F0",
                    backgroundColor: "#FAFBFC",
                    animationDelay: "1.4s",
                    animationFillMode: "both",
                  }}
                >
                  <span className="text-sm" style={{ color: "#64748B" }}>→ Wealth Advisor View:</span>
                  <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                    Ski Trip — Family Vacation · $3,420
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Beat 6 — Reveal ── */}
        <div
          className="w-full mt-16 text-center transition-all duration-700 ease-out"
          style={{
            opacity: beatOpacity(5),
            transform: beatTransform(5),
          }}
        >
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ color: "#0F172A" }}
          >
            You can't patch this. You need a new layer.
          </h1>

          {/* Logo reveal */}
          <div
            className="mt-12 transition-all duration-700 ease-out flex flex-col items-center"
            style={{ opacity: revealLogo ? 1 : 0, transform: revealLogo ? "translateY(0)" : "translateY(20px)" }}
          >
            <img src={ventusLogo} alt="VentusAI" className="h-12 mb-3" />
            <div className="text-2xl font-bold tracking-wide" style={{ color: "#0F172A" }}>TEpilot</div>
            <p className="mt-2 text-base" style={{ color: "#64748B" }}>
              Transaction Intelligence Infrastructure for Banks
            </p>
          </div>

          {/* Password input */}
          <div
            className="mt-10 transition-all duration-500 ease-out"
            style={{ opacity: revealInput ? 1 : 0, transform: revealInput ? "translateY(0)" : "translateY(12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Enter access code"
                autoFocus={false}
                className="h-11 w-64 rounded-lg border bg-white px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: error ? "#EF4444" : "#E2E8F0", color: "#0F172A" }}
              />
              {error && <p className="text-sm" style={{ color: "#EF4444" }}>Incorrect access code</p>}
              <button
                type="submit"
                className="h-10 px-8 rounded-full text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "#3B82F6" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
              >
                Enter Demo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
