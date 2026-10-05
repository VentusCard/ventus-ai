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

/** Proportional tracks so the enrichment fits the right half at any deck width. Literal for Tailwind. */
export const ENRICH_COLS = "grid-cols-[1.3fr_1.2fr_1.4fr_0.55fr_0.7fr_0.45fr]";

/** Header labels for the slide 4.2 enrichment half of the shared Ricky table. */
export function EnrichmentColumnHeaders() {
  return (
    <>
      <span className="truncate">Merchant</span><span className="truncate">Pillar</span><span className="truncate">Category · Sub</span><span className="truncate">Tier</span><span className="truncate">Freq</span><span className="truncate">Conf</span>
    </>
  );
}

export function EnrichmentCells({ transactionId, index }: { transactionId: string; index: number }) {
  const t = RICKY_TRANSACTIONS.find((row) => row.id === transactionId);
  if (!t) return null;
  const x = enrichRickyTransaction(t);
  const color = PILLAR_COLORS[x.pillar] ?? "#64748b";
  const delay = { animationDelay: `${Math.min(index, 18) * 60 + 250}ms` };
  const sub = x.subcategories[0];
  return (
    <>
      <span className="deck-ricky-cascade flex min-w-0 items-center" style={delay}>
        {/* Height strut: same box as the ledger's source badge, keeps row heights identical to 4.1 */}
        <span aria-hidden className="invisible inline-block w-0 overflow-hidden rounded-sm border py-0.5 text-[8px] font-bold">x</span>
        <span className="truncate text-[10.5px] font-bold leading-none text-slate-900">{x.merchant}</span>
      </span>
      <span className="deck-ricky-cascade flex min-w-0 items-center leading-none" style={delay}>
        <span className="truncate rounded-full border px-1.5 py-0.5 text-[8.5px] font-semibold leading-none" style={{ backgroundColor: `${color}1a`, color, borderColor: `${color}40` }}>{x.pillar}</span>
      </span>
      <span className="deck-ricky-cascade flex min-w-0 items-center gap-1 overflow-hidden leading-none" style={delay}>
        <span className="truncate text-[9.5px] font-semibold leading-none text-slate-700">{x.category}</span>
        {sub && <span className="min-w-0 truncate rounded bg-slate-100 px-1 py-0.5 text-[8.5px] leading-none text-slate-600">{sub}</span>}
      </span>
      <span className="deck-ricky-cascade flex min-w-0 items-center leading-none" style={delay}>
        <span className={cn("truncate rounded border px-1.5 py-0.5 text-[8.5px] font-semibold leading-none", TIER[x.tier])}>{x.tier}</span>
      </span>
      <span className="deck-ricky-cascade flex min-w-0 items-center leading-none" style={delay}>
        <span className={cn("truncate rounded border px-1.5 py-0.5 text-[8.5px] font-semibold leading-none", FREQ[x.frequency])}>{x.frequency}</span>
      </span>
      <span className="deck-ricky-cascade flex min-w-0 items-center leading-none" style={delay}>
        <span className={cn("truncate rounded border px-1 py-0.5 text-[8.5px] font-semibold tabular-nums leading-none", conf(x.confidence))}>{Math.round(x.confidence * 100)}%</span>
      </span>
    </>
  );
}
