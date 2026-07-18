import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Building2, Check, ChevronRight, Eye, ShieldCheck } from "lucide-react";

// The same play at two levels: aggregate pilot economics for an operator and
// one decision brief inside a bank-owned employee workflow.

const bookRows = [
  { label: "Moments qualified", value: "1,240", width: "100%" },
  { label: "Policy eligible", value: "782", width: "63%" },
  { label: "Banker tasks accepted", value: "486", width: "39%" },
  { label: "Retained vs holdout", value: "+8.4 pp", width: "72%", verified: true },
];

const DeviceDuo = () => {
  const [ping, setPing] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && !reduced && setPing(true)),
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <section ref={ref} className="v2-rule-t w-full relative z-10" style={{ paddingTop: 104, paddingBottom: 104, backgroundColor: "var(--v2-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mb-16">
            <p className="v2-label mb-4">In the workflow</p>
            <h2 className="v2-display text-3xl md:text-5xl">
              The play lands where your team already works.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-12 lg:gap-16 items-center">
          {/* PC screen — aggregate pilot economics */}
          <ScrollReveal>
            <div className="rounded-2xl border bg-white overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)]" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper-raised)" }}>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="ml-3 v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  bank growth desk · pilot view
                </span>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="v2-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--v2-ink-faint)" }}>deposit retention play</p>
                    <p className="v2-display text-2xl mt-1">Pilot funnel</p>
                  </div>
                  <span className="v2-chip-amber">illustrative dataset</span>
                </div>
                <div className="space-y-4">
                  {bookRows.map((r) => (
                    <div key={r.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-semibold text-gray-900">{r.label}</span>
                        <span
                          className="v2-mono text-[11px] font-bold"
                          style={{ color: r.verified ? "var(--v2-verified)" : "var(--v2-ink-soft)" }}
                        >
                          {r.value}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: ping || reduced ? r.width : "0%",
                            background: r.verified ? "var(--v2-verified)" : "var(--v2-blue)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="v2-mono mt-5 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>
                  pilot data replaces all illustrative values
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Bank-owned employee workflow */}
          <ScrollReveal delay={0.15}>
            <div className="mx-auto w-full max-w-[390px] rounded-2xl border bg-white shadow-2xl overflow-hidden" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-console)" }}>
                <div className="flex items-center gap-2 text-white">
                  <Building2 className="h-4 w-4" />
                  <span className="text-[12px] font-semibold">Relationship workbench</span>
                </div>
                <span className="v2-mono text-[8px] text-white/55">BANK SYSTEM</span>
              </div>
              <div className="p-5">
                <div
                  className="transition-all duration-700"
                  style={{
                    transform: ping || reduced ? "translateY(0)" : "translateY(-10px)",
                    opacity: ping || reduced ? 1 : 0,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="v2-mono text-[9px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Customer 013 · decision brief</p>
                      <p className="mt-1 text-[17px] font-bold text-gray-900">Deposit primacy at risk</p>
                    </div>
                    <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 v2-mono text-[9px] font-bold text-blue-700">91%</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      ["Payroll", "Split detected"],
                      ["Balances", "18% migrated"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <p className="v2-mono text-[8px] uppercase text-gray-400">{label}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">
                    <ShieldCheck className="h-4 w-4 flex-none" />
                    <span className="text-[11px] font-semibold">Eligible under approved retention policy</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-[11px] font-semibold text-gray-700">
                      <Eye className="h-3.5 w-3.5" /> Evidence
                    </button>
                    <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: "var(--v2-blue)" }}>
                      <Check className="h-3.5 w-3.5" /> Accept task
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="v2-mono text-[8px] text-gray-400">Ventus evidence receipt attached</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default DeviceDuo;
