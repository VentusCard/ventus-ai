import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

// The closed loop drawn as an actual loop: four stations on a circuit, a pulse
// that travels Moment → Play → Lift → Ledger, and a highlighted feedback edge
// returning to the start — the moat is the edge, so the design draws the edge.
// SMIL animateMotion keeps it dependency-free; reduced motion renders static.

const steps = [
  {
    label: "Qualified Moment",
    title: "A customer moment is qualified",
    body: "Life events and intent are detected from real transactions — not clicks or cookies.",
  },
  {
    label: "Governed Action",
    title: "A Growth Play is launched",
    body: "The right action goes out under your controls — audience, channel, and holdout you set.",
  },
  {
    label: "Measured Lift",
    title: "Incremental outcome is proven",
    body: "A built-in holdout isolates true incremental lift — no vanity engagement metrics.",
  },
  {
    label: "Decision Ledger",
    title: "Every decision is recorded",
    body: "Each play, holdout, and result is written to an auditable ledger that informs the next decision.",
  },
];

// Forward path along the top of the cards, return path sweeping underneath.
const FORWARD_PATH = "M 60 40 H 940";
const RETURN_PATH = "M 940 40 C 990 40 990 150 940 150 H 60 C 10 150 10 40 60 40";

const ClosedLoopCircuit = () => {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setVisible(true)),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white w-full relative z-10" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
            The Closed Loop
          </p>
          <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight mb-4 max-w-3xl">
            Not another dashboard. A loop that proves growth.
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-2xl mb-12">
            Ventus doesn't stop at insight. It takes a governed action, measures the
            incremental result against a holdout, and records it — so every decision
            makes the next one better.
          </p>
        </ScrollReveal>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <ScrollReveal key={step.label} delay={i * 0.08}>
                <div className="relative z-10 rounded-[20px] border border-gray-200 bg-white p-6 h-full shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600">
                      {step.label}
                    </span>
                    <span className="text-[11px] font-mono text-gray-300">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Circuit overlay — desktop only; cards carry the story on mobile. */}
          <div className="hidden lg:block pointer-events-none absolute inset-x-0 -bottom-24 h-48">
            <svg viewBox="0 0 1000 190" className="w-full h-full" fill="none" aria-hidden="true">
              {/* Return edge: outcomes feed the next moment. */}
              <path d={RETURN_PATH} stroke="#0B6B43" strokeWidth="1.5" strokeDasharray="6 5" opacity={visible ? 0.5 : 0} style={{ transition: "opacity 600ms ease 400ms" }} />
              <path d={FORWARD_PATH} stroke="#BFDBFE" strokeWidth="2" opacity={visible ? 1 : 0} style={{ transition: "opacity 600ms ease" }} />
              {visible && !reducedMotion && (
                <circle r="4" fill="#2563EB">
                  <animateMotion dur="6s" repeatCount="indefinite" path={RETURN_PATH} />
                </circle>
              )}
              <text x="500" y="172" textAnchor="middle" className="font-mono" fontSize="11" fill="#0B6B43" opacity={visible ? 1 : 0} style={{ transition: "opacity 600ms ease 600ms" }}>
                outcomes sharpen the next play ↺
              </text>
            </svg>
          </div>
        </div>

        {/* Spacer so the circuit's return edge has room before the next section. */}
        <div className="hidden lg:block" style={{ height: 96 }} />
      </div>
    </section>
  );
};

export default ClosedLoopCircuit;
