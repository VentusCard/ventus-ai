import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { appendEvents, verifyChain, type LedgerDraft, type LedgerEvent } from "@/lib/ledger";

// The signature band: a Decision Ledger writing itself, running the demo's real
// hash-chain code (src/lib/ledger.ts) on marketing copy. Competitors show
// dashboards; Ventus shows receipts. Every row is honestly chipped "simulated".

const SCRIPT: LedgerDraft[] = [
  { kind: "signal", title: "Payroll split detected", detail: "Deposit core · household tok_hh_4417", status: "simulated" },
  { kind: "gate", title: "Policy pack attached", detail: "UDAAP · uniform criteria · suppression", status: "simulated" },
  { kind: "decision", title: "Growth Play qualified the moment", detail: "Deposit Primacy Defense · 91%", status: "simulated" },
  { kind: "counterfactual", title: "Holdout reserved before action", detail: "10% of cohort untouched", status: "simulated" },
  { kind: "activation", title: "Banker task created", detail: "Salesforce FSC · receipt returned", status: "simulated" },
  { kind: "outcome", title: "Incremental lift measured", detail: "vs. holdout · 95% interval", status: "simulated" },
];

const KIND_LABEL: Record<string, string> = {
  signal: "SIGNAL",
  gate: "GATE",
  decision: "DECISION",
  counterfactual: "HOLDOUT",
  activation: "ACTIVATE",
  outcome: "OUTCOME",
};

const LedgerBand = () => {
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setStarted(true)),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEvents(appendEvents([], SCRIPT));
      return;
    }
    const timers = timersRef.current;
    SCRIPT.forEach((draft, index) => {
      timers.push(
        window.setTimeout(() => setEvents((prev) => appendEvents(prev, [draft])), 400 + index * 650),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [started]);

  const chainVerified = useMemo(() => events.length > 0 && verifyChain(events), [events]);
  const complete = events.length === SCRIPT.length;

  return (
    <section ref={sectionRef} className="w-full relative z-10" style={{ backgroundColor: "var(--v2-console)", paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <div>
          <p className="v2-mono text-[11px] font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#34D399" }}>
            04 — Decision Ledger
          </p>
          <h2 className="v2-display text-3xl md:text-5xl mb-5" style={{ color: "#ffffff" }}>
            Every decision leaves a receipt.
          </h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: "var(--v2-console-soft)" }}>
            Signals, policy checks, activations, holdouts, and outcomes are written to an
            append-only, hash-chained record. Not a dashboard you export — an audit trail
            your risk team can verify. This panel runs the same ledger code as the product.
          </p>
          <Link
            to="/demo/enterprise"
            className="inline-flex items-center gap-2 rounded bg-white px-5 py-3 text-sm font-bold transition hover:opacity-90"
            style={{ color: "var(--v2-console)" }}
          >
            See it live in the demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--v2-console-line)" }}>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--v2-console-faint)" }}>
              [ decision-ledger · session ]
            </span>
            <span
              className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide transition-opacity duration-500 ${chainVerified ? "opacity-100" : "opacity-0"}`}
              style={{ color: "#34D399" }}
            >
              <Check className="w-3 h-3" /> chain verified
            </span>
          </div>
          <div className="mt-3 space-y-2 min-h-[280px]">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.03)", animation: "ventus-append 0.35s ease backwards" }}
              >
                <span className="w-9 flex-none font-mono text-[10px]" style={{ color: "var(--v2-console-faint)" }}>
                  #{String(event.seq).padStart(3, "0")}
                </span>
                <span className="w-16 flex-none font-mono text-[9px] font-bold tracking-wider" style={{ color: event.kind === "outcome" ? "#34D399" : "#9FB6D4" }}>
                  {KIND_LABEL[event.kind] ?? event.kind.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-white">{event.title}</span>
                  <span className="block truncate text-[10px]" style={{ color: "var(--v2-console-faint)" }}>{event.detail}</span>
                </span>
                <span className="flex-none rounded px-1.5 py-0.5 text-[8px] font-bold uppercase border border-amber-400/30 bg-amber-400/10 text-amber-300">
                  {event.status}
                </span>
                <span className="hidden sm:block flex-none font-mono text-[10px]" style={{ color: "var(--v2-console-faint)" }}>
                  {event.hash.slice(0, 6)}
                </span>
              </div>
            ))}
          </div>
          <p className={`mt-3 font-mono text-[10px] transition-opacity duration-700 ${complete ? "opacity-100" : "opacity-0"}`} style={{ color: "var(--v2-console-faint)" }}>
            append-only · hash-chained · runs in your perimeter · tokens, not PII —{" "}
            <span style={{ color: "#34D399" }}>simulated here, labeled as such everywhere</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LedgerBand;
