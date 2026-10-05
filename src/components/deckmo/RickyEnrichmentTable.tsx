import { cn } from "@/lib/utils";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { RICKY_TRANSACTIONS } from "@/lib/deckmoRickyTransactions";
import { enrichRickyTransaction } from "@/lib/deckmoRickyEnrichment";

const TIER: Record<string, string> = {
  Premium: "bg-amber-50 text-amber-700 border-amber-200",
  Standard: "bg-blue-50 text-blue-700 border-blue-200",
  Budget: "bg-teal-50 text-teal-700 border-teal-200",
  "N/A": "bg-slate-50 text-slate-500 border-slate-200",
};
const FREQ: Record<string, string> = {
  Weekly: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Monthly: "bg-violet-50 text-violet-700 border-violet-200",
  Occasional: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Annually: "bg-orange-50 text-orange-700 border-orange-200",
  "One-Time": "bg-slate-50 text-slate-600 border-slate-200",
};
const conf = (c: number) => c >= 0.8 ? "bg-green-50 text-green-700 border-green-200" : c >= 0.5 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200";

/** Grid template for the enriched columns (merchant, pillar, category·sub, tier, freq, conf). No signal column. */
export const ENRICH_COLS = "minmax(0,1.1fr)_128px_minmax(0,1fr)_64px_72px_44px";

export function EnrichmentHeaderStrip() {
  const rails = new Set(RICKY_TRANSACTIONS.map((t) => t.source)).size;
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-deck-rule bg-background px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
      <span className="text-deck-blue">Enriched ledger</span>
      <span className="h-3 w-px bg-deck-rule" />
      <span>{RICKY_TRANSACTIONS.length} transactions · {rails} rails · 100% enriched</span>
    </div>
  );
}

export function EnrichmentColumnHeaders() {
  return (
    <>
      <span>Merchant</span><span>Pillar</span><span>Category · Sub</span><span>Tier</span><span>Freq</span><span>Conf</span>
    </>
  );
}

export function EnrichmentCells({ transactionId, index }: { transactionId: string; index: number }) {
  const t = RICKY_TRANSACTIONS.find((row) => row.id === transactionId);
  if (!t) return null;
  const x = enrichRickyTransaction(t);
  const color = PILLAR_COLORS[x.pillar] ?? "#64748b";
  const delay = { animationDelay: `${Math.min(index, 18) * 60 + 250}ms` };
  return (
    <>
      <span className="deck-ricky-cascade truncate text-[10.5px] font-bold text-slate-900" style={delay}>{x.merchant}</span>
      <span className="deck-ricky-cascade truncate" style={delay}>
        <span className="inline-block max-w-full truncate rounded-full border px-1.5 py-px text-[8.5px] font-semibold" style={{ backgroundColor: `${color}1a`, color, borderColor: `${color}40` }}>{x.pillar}</span>
      </span>
      <span className="deck-ricky-cascade flex min-w-0 items-center gap-1 overflow-hidden" style={delay}>
        <span className="truncate text-[9.5px] font-semibold text-slate-700">{x.category}</span>
        {x.subcategories.map((s) => <span key={s} className="shrink-0 rounded bg-slate-100 px-1 py-px text-[8.5px] text-slate-600">{s}</span>)}
      </span>
      <span className={cn("deck-ricky-cascade w-fit rounded border px-1.5 py-px text-[8.5px] font-semibold", TIER[x.tier])} style={delay}>{x.tier}</span>
      <span className={cn("deck-ricky-cascade w-fit rounded border px-1.5 py-px text-[8.5px] font-semibold", FREQ[x.frequency])} style={delay}>{x.frequency}</span>
      <span className={cn("deck-ricky-cascade w-fit rounded border px-1 py-px text-[8.5px] font-semibold tabular-nums", conf(x.confidence))} style={delay}>{Math.round(x.confidence * 100)}%</span>
    </>
  );
}
