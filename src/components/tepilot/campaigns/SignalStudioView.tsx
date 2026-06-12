import { useMemo, useState } from "react";
import { Wand2, Users, Target, Send, Check } from "lucide-react";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import {
  SIGNAL_FAMILIES,
  estimateAudience,
  rankProductFits,
  recommendOutreach,
  formatAudience,
  type StudioSignal,
  type SignalFamily,
} from "@/lib/signalStudio";

const FAMILY_TONE: Record<SignalFamily, { dot: string; chipSelected: string }> = {
  "life-event":   { dot: "bg-violet-500",  chipSelected: "bg-violet-50 border-violet-400 text-violet-900" },
  "behavioral":   { dot: "bg-sky-500",     chipSelected: "bg-sky-50 border-sky-400 text-sky-900" },
  "financial":    { dot: "bg-emerald-500", chipSelected: "bg-emerald-50 border-emerald-400 text-emerald-900" },
  "demographic":  { dot: "bg-amber-500",   chipSelected: "bg-amber-50 border-amber-400 text-amber-900" },
  "risk":         { dot: "bg-rose-500",    chipSelected: "bg-rose-50 border-rose-400 text-rose-900" },
};

export function SignalStudioView({ embedded = false }: { embedded?: boolean } = {}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSignals = useMemo(
    () => SIGNAL_FAMILIES.flatMap((g) => g.signals),
    [],
  );
  const selected: StudioSignal[] = useMemo(
    () => allSignals.filter((s) => selectedIds.has(s.id)),
    [allSignals, selectedIds],
  );

  const audience = useMemo(() => estimateAudience(selected), [selected]);
  const fits = useMemo(() => rankProductFits(selected, 4), [selected]);
  const outreach = useMemo(() => recommendOutreach(selected, fits[0]), [selected, fits]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clear = () => setSelectedIds(new Set());

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Wand2 className="w-4 h-4" />}
        title="Signal Studio"
        subtitle="Define a campaign from the bottom up: pick any signals you've extracted from transactions and we compute the audience, the best-fit products, and the best outreach channel."
        howItWorks="Pick signals across the five families. Audience size is computed from each signal's detection rate with partial-independence smoothing; product fit scores tag-level overlap weighted by family; outreach is rule-based on signal mix and product category."
        whyItMatters="No more starting from a product. Bankers can start from what they actually see in the data — a stack of signals — and let the engine surface which products to push, to how many customers, and through which channel."
      />

      {/* Selected summary bar */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{selected.length}</span> signal{selected.length === 1 ? "" : "s"} selected
          {selected.length > 0 && (
            <span className="ml-2 text-slate-400">
              · {SIGNAL_FAMILIES.filter((f) => selected.some((s) => s.family === f.family)).length} families
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={selected.length === 0}
          className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      {/* Signal pickers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {SIGNAL_FAMILIES.map((group) => {
          const tone = FAMILY_TONE[group.family];
          return (
            <div key={group.family} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                <h3 className="text-sm font-semibold text-slate-900">{group.label}</h3>
                <span className="text-[10px] text-slate-400 ml-auto">{group.signals.length} signals</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">{group.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.signals.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      title={s.description}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                        isSelected
                          ? tone.chipSelected
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {s.label}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {(s.detectionRate * 100).toFixed(s.detectionRate < 0.1 ? 1 : 0)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Audience */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Estimated Audience</h3>
          </div>
          {selected.length === 0 ? (
            <p className="text-xs text-slate-400">Pick at least one signal to size the audience.</p>
          ) : (
            <>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">
                {formatAudience(audience)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Customers across the bank base who match all {selected.length} selected signal{selected.length === 1 ? "" : "s"}.
              </p>
              <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
                {selected.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="truncate pr-2">{s.label}</span>
                    <span className="tabular-nums text-slate-400">{(s.detectionRate * 100).toFixed(s.detectionRate < 0.1 ? 1 : 0)}%</span>
                  </div>
                ))}
                {selected.length > 5 && <div className="text-slate-400">+{selected.length - 5} more</div>}
              </div>
            </>
          )}
        </div>

        {/* Best-fit products */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Best-Fit Products</h3>
          </div>
          {fits.length === 0 ? (
            <p className="text-xs text-slate-400">No product fits yet — add a signal or two.</p>
          ) : (
            <ul className="space-y-2">
              {fits.map((fit, idx) => {
                const Icon = fit.product.icon;
                const maxScore = fits[0].score || 1;
                const pct = Math.round((fit.score / maxScore) * 100);
                return (
                  <li key={fit.product.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 w-44 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 w-3">{idx + 1}</span>
                      <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-900 truncate">{fit.product.name}</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-slate-500 w-16 text-right">
                      {fit.matchedSignals.length}/{selected.length} match
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Outreach */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Best Outreach</h3>
          </div>
          {!outreach ? (
            <p className="text-xs text-slate-400">Pick signals to get a channel recommendation.</p>
          ) : (
            <>
              <div className="text-base font-semibold text-slate-900">{outreach.primary}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Fallback: <span className="text-slate-700">{outreach.secondary}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                {outreach.rationale}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
