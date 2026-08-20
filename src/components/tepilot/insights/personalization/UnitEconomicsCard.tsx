import { useEffect, useMemo, useState } from "react";
import { Calculator, ChevronDown, RotateCcw } from "lucide-react";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import { usePersonalizationCustomer } from "@/lib/personalizationCustomerStore";
import { usePersonalizationResult } from "@/lib/personalizationResultStore";
import {
  computeSurfaceEconomics,
  formatMoney,
  recordContribution,
  resetAssumptions,
  setAssumption,
  SURFACE_LABEL,
  useEconomicsState,
  type EconomicsAssumptions,
  type EconomicsSurface,
} from "@/lib/personalizationUnitEconomics";

const ALL_SURFACES: EconomicsSurface[] = ["rewards", "product", "relationship"];

const ASSUMPTION_FIELDS: {
  key: keyof EconomicsAssumptions;
  label: string;
  suffix?: string;
  pct?: boolean;
  step?: number;
}[] = [
  { key: "annualDealsSpend", label: "Deals spend / yr", suffix: "$", step: 100 },
  { key: "takeRate", label: "Take rate", pct: true, step: 0.5 },
  { key: "productConversion", label: "Product lift", pct: true, step: 0.5 },
  { key: "cacAvoided", label: "CAC avoided", suffix: "$", step: 20 },
  { key: "baseAttrition", label: "Base attrition", pct: true, step: 0.5 },
  { key: "attritionReduction", label: "Attrition cut", pct: true, step: 1 },
  { key: "replacementCost", label: "Replacement cost", suffix: "$", step: 25 },
];

export function UnitEconomicsCard({ surface }: { surface: EconomicsSurface }) {
  const selectedId = usePersonalizationCustomer();
  const customer = EXAMPLE_CUSTOMERS.find((c) => c.id === selectedId) ?? null;
  const entry = usePersonalizationResult(customer?.id ?? "");
  const { assumptions, contributions } = useEconomicsState();
  const [showAssumptions, setShowAssumptions] = useState(false);

  const computed = useMemo(
    () =>
      ALL_SURFACES.map((s) => computeSurfaceEconomics(s, customer, entry, assumptions)),
    [customer, entry, assumptions],
  );

  useEffect(() => {
    if (!customer) return;
    computed.forEach((c) => {
      if (c.ready) recordContribution(customer.id, c.surface, c.value);
    });
  }, [customer?.id, computed]);

  const stored = customer ? contributions[customer.id] ?? {} : {};
  const rows = ALL_SURFACES.map((s) => {
    const live = computed.find((c) => c.surface === s)!;
    const value = live.ready ? live.value : stored[s];
    return { surface: s, value: value ?? null, live };
  });

  const total = rows.reduce((sum, r) => sum + (r.value ?? 0), 0);
  const partial = rows.some((r) => r.value == null);
  const current = computed.find((c) => c.surface === surface)!;

  if (!customer) {
    return (
      <div className="flex-1 min-h-0 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
        <Header />
        <div className="flex-1 min-h-0 p-3">
          <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50/40 px-4 text-center">
            <p className="text-[11.5px] text-slate-400 leading-relaxed max-w-[220px]">
              Select a customer to model the per-average-customer economics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
      <Header value={total} partial={partial} />

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {/* Current surface metrics */}
        <div className="border border-blue-200 rounded-md bg-blue-50/40 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 mb-2">
            {SURFACE_LABEL[current.surface]}
          </p>
          <div className="space-y-2">
            {current.lines.map((line) => (
              <div key={line.label} className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] text-slate-700">{line.label}</span>
                <span className="text-[13px] font-bold text-slate-900 tabular-nums shrink-0">
                  {line.display ?? formatMoney(line.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Running total */}
        <div className="border border-slate-200 rounded-md bg-slate-50/50 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] font-semibold text-slate-900">
              {partial ? "Total so far / customer / yr" : "Total / customer / yr"}
            </span>
            <span className="text-[15px] font-bold text-blue-700 tabular-nums">
              {formatMoney(total)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
            {rows.map((row) => (
              <div key={row.surface} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-600">{SURFACE_LABEL[row.surface]}</span>
                {row.value == null ? (
                  <span className="text-[10.5px] text-slate-400">not generated</span>
                ) : (
                  <span className="text-[11.5px] font-semibold text-slate-800 tabular-nums">
                    {formatMoney(row.value)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assumptions */}
        <div className="border border-slate-200 rounded-md bg-white">
          <button
            type="button"
            onClick={() => setShowAssumptions((v) => !v)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 rounded-md"
          >
            <span>Assumptions</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showAssumptions ? "rotate-180" : ""}`}
            />
          </button>
          {showAssumptions && (
            <div className="px-2.5 pb-2.5 pt-1 space-y-1.5">
              {ASSUMPTION_FIELDS.map((f) => {
                const raw = assumptions[f.key];
                const shown = f.pct ? Number((raw * 100).toFixed(2)) : raw;
                return (
                  <label key={f.key} className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-slate-600">{f.label}</span>
                    <span className="flex items-center gap-1">
                      {f.suffix === "$" && <span className="text-[10.5px] text-slate-400">$</span>}
                      <input
                        type="number"
                        step={f.step}
                        value={shown}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isNaN(n)) return;
                          setAssumption(f.key, (f.pct ? n / 100 : n) as never);
                        }}
                        className="w-[74px] text-[10.5px] text-right text-slate-900 bg-white border border-slate-200 rounded px-1.5 py-[3px] focus:outline-none focus:border-blue-400"
                      />
                      {f.pct && <span className="text-[10.5px] text-slate-400">%</span>}
                    </span>
                  </label>
                );
              })}
              <button
                type="button"
                onClick={resetAssumptions}
                className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3 h-3" /> Reset to defaults
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ value, partial }: { value?: number; partial?: boolean }) {
  return (
    <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Calculator className="w-4 h-4 text-blue-500 shrink-0" />
        <h2 className="text-sm font-semibold text-slate-900 truncate">Unit economics</h2>
      </div>
      {value != null && (
        <span className="text-[11px] font-semibold text-blue-700 tabular-nums shrink-0">
          {formatMoney(value)}{partial ? " so far" : ""} / customer / yr
        </span>
      )}
    </div>
  );
}
