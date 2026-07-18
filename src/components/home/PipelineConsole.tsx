import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Check } from "lucide-react";

// The loop, shown as a live governed console instead of four text cards.
// A pipeline plays Moment → Gate → Play → Holdout → Lift → Ledger on a loop,
// writing rows into the ledger as it completes. Self-contained; reduced-motion
// renders the final state.

type Stage = {
  key: string;
  label: string;
  detail: string;
  ledger: string;
};

const STAGES: Stage[] = [
  { key: "moment", label: "Qualified Moment", detail: "College-bound · 91%", ledger: "signal · payroll split detected" },
  { key: "gate", label: "Policy Gate", detail: "UDAAP · uniform criteria", ledger: "gate · policy pack attached" },
  { key: "play", label: "Growth Play", detail: "529 outreach · controlled", ledger: "decision · play qualified" },
  { key: "holdout", label: "Holdout", detail: "10% cohort reserved", ledger: "counterfactual · holdout reserved" },
  { key: "lift", label: "Measured Lift", detail: "+32% incremental", ledger: "outcome · lift measured vs holdout" },
  { key: "ledger", label: "Decision Ledger", detail: "receipt written", ledger: "append-only · hash-chained" },
];

const PipelineConsole = () => {
  const [active, setActive] = useState(0);
  const [rows, setRows] = useState<Stage[]>([]);
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setStarted(true)),
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (reduced) {
      setRows(STAGES);
      setActive(STAGES.length - 1);
      return;
    }
    let i = 0;
    const tick = () => {
      setActive(i);
      setRows(STAGES.slice(0, Math.min(i + 1, STAGES.length)));
      i = (i + 1) % (STAGES.length + 2); // brief pause at the end before looping
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, [started, reduced]);

  return (
    <section ref={sectionRef} className="v2-rule-t w-full relative z-10" style={{ paddingTop: 96, paddingBottom: 96, backgroundColor: "var(--v2-console)" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="v2-mono text-[11px] font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#60A5FA" }}>
              The loop
            </p>
            <h2 className="v2-display text-3xl md:text-5xl text-white">
              A loop that proves growth.
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {/* PC / browser frame */}
          <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "#0d1826" }}>
            {/* browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <span className="w-3 h-3 rounded-full bg-[#3b4a5e]" />
              <span className="w-3 h-3 rounded-full bg-[#3b4a5e]" />
              <span className="w-3 h-3 rounded-full bg-[#3b4a5e]" />
              <span className="ml-3 font-mono text-[11px]" style={{ color: "var(--v2-console-faint)" }}>
                ventus · governed console
              </span>
            </div>

            <div className="p-6 md:p-8">
              {/* Pipeline stations */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-8">
                {STAGES.map((s, i) => {
                  const isActive = i === active;
                  const isDone = i < active || rows.length === STAGES.length;
                  return (
                    <div
                      key={s.key}
                      className="rounded-lg border px-3 py-3 transition-all duration-500"
                      style={{
                        borderColor: isActive ? "#60A5FA" : "var(--v2-console-line)",
                        backgroundColor: isActive ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.02)",
                        transform: isActive ? "translateY(-3px)" : "translateY(0)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-none transition-colors duration-500"
                          style={{ background: isDone || isActive ? "#60A5FA" : "#3b4a5e" }}
                        />
                        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: isActive ? "#93c5fd" : "#9FB6D4" }}>
                          {s.label}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold leading-tight text-white min-h-[26px]">
                        {isDone || isActive ? s.detail : ""}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ledger writing itself */}
              <div className="rounded-lg border p-4" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: "var(--v2-console-line)" }}>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--v2-console-faint)" }}>
                    decision-ledger · session
                  </span>
                  <span
                    className="flex items-center gap-1.5 font-mono text-[10px] transition-opacity duration-500"
                    style={{ color: "#60A5FA", opacity: rows.length === STAGES.length ? 1 : 0 }}
                  >
                    <Check className="w-3 h-3" /> chain verified
                  </span>
                </div>
                <div className="space-y-1.5 min-h-[150px]">
                  {rows.map((r, i) => (
                    <div key={r.key} className="flex items-center gap-3 font-mono text-[11px]" style={{ animation: "ventus-append 0.3s ease backwards" }}>
                      <span style={{ color: "var(--v2-console-faint)" }}>#{String(i + 1).padStart(3, "0")}</span>
                      <span className="flex-1 truncate text-white/90">{r.ledger}</span>
                      <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-amber-400/30 bg-amber-400/10 text-amber-300">
                        simulated
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="v2-mono mt-6 text-center text-[11px]" style={{ color: "var(--v2-console-faint)" }}>
            every step governed · every number labeled — simulated here
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PipelineConsole;
