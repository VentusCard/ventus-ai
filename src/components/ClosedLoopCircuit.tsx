import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
const FORWARD_PATH = "M 60 30 H 940";
const RETURN_PATH = "M 940 30 C 990 30 990 120 940 120 H 60 C 10 120 10 30 60 30";

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
    <section ref={sectionRef} className="v2-rule-t w-full relative z-10" style={{ paddingTop: 96, paddingBottom: 88, backgroundColor: "var(--v2-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]">
            <p className="v2-label">03 — The closed loop</p>
            <div>
              <h2 className="v2-display text-3xl md:text-5xl max-w-3xl mb-5">
                Not another dashboard. A loop that proves growth.
              </h2>
              <p className="v2-body text-lg max-w-2xl mb-12">
                Ventus doesn't stop at insight. It takes a governed action, measures the
                incremental result against a holdout, and records it — so every decision
                makes the next one better.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {steps.map((step, i) => (
              <ScrollReveal key={step.label} delay={i * 0.08}>
                <div className="v2-row relative z-10 h-full" style={{ backgroundColor: "var(--v2-paper)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="v2-mono text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--v2-blue)" }}>
                      {step.label}
                    </span>
                    <span className="v2-section-no">0{i + 1}</span>
                  </div>
                  <h3 className="v2-display text-lg mb-2" style={{ letterSpacing: "-0.02em" }}>
                    {step.title}
                  </h3>
                  <p className="v2-body text-sm">{step.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Circuit overlay — desktop only; cards carry the story on mobile. */}
          <div className="hidden lg:block pointer-events-none absolute inset-x-0 top-full mt-6 h-40">
            <svg viewBox="0 0 1000 190" className="w-full h-full" fill="none" aria-hidden="true">
              {/* Return edge: outcomes feed the next moment. */}
              <path d={RETURN_PATH} stroke="var(--v2-verified)" strokeWidth="1.5" strokeDasharray="6 5" opacity={visible ? 0.45 : 0} style={{ transition: "opacity 600ms ease 400ms" }} />
              <path d={FORWARD_PATH} stroke="var(--v2-rule)" strokeWidth="2" opacity={visible ? 1 : 0} style={{ transition: "opacity 600ms ease" }} />
              {visible && !reducedMotion && (
                <circle r="4" fill="var(--v2-verified)">
                  <animateMotion dur="6s" repeatCount="indefinite" path={RETURN_PATH} />
                </circle>
              )}
              <text x="500" y="150" textAnchor="middle" className="v2-mono" fontSize="11" fill="var(--v2-verified)" opacity={visible ? 1 : 0} style={{ transition: "opacity 600ms ease 600ms" }}>
                outcomes sharpen the next play ↺
              </text>
            </svg>
          </div>
        </div>

        {/* Mid-page conversion hook: the loop is shown, the specifics are gated. */}
        <ScrollReveal>
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="v2-body max-w-md text-base">
              This loop runs on your book, not a slide. The only way to see your number is to run it.
            </p>
            <Link to="/contact" className="v2-btn">
              Schedule a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Spacer so the circuit's return edge has room before the next section. */}
        <div className="hidden lg:block" style={{ height: 96 }} />
      </div>
    </section>
  );
};

export default ClosedLoopCircuit;
