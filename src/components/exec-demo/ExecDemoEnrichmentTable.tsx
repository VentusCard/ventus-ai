import { getColor } from "./ExecDemoIntelPanel";
import type { EnrichedTransaction } from "./execDemoData";
import { MCC_DESCRIPTIONS } from "@/lib/sampleData";

const SOURCE_COLORS: Record<string, string> = {
  "Checking": "bg-slate-100 text-slate-600",
  "Cashback Card": "bg-emerald-50 text-emerald-700",
  "Travel Card": "bg-blue-50 text-blue-700",
  "Premium Card": "bg-rose-50 text-rose-700",
  "HSA": "bg-amber-50 text-amber-700",
  "ACH": "bg-slate-100 text-slate-600",
  "Wire": "bg-red-50 text-red-700",
  "Zelle": "bg-purple-50 text-purple-700",
  "Checks": "bg-orange-50 text-orange-700",
};

const getTierColor = (t: string) => {
  switch (t) {
    case "Premium": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Standard": return "bg-blue-50 text-blue-700 border-blue-200";
    case "Budget": return "bg-teal-50 text-teal-700 border-teal-200";
    default: return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

const getFrequencyColor = (f: string) => {
  switch (f) {
    case "Weekly": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Monthly": return "bg-violet-50 text-violet-700 border-violet-200";
    case "Occasional": return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Annually": return "bg-orange-50 text-orange-700 border-orange-200";
    case "One-Time": return "bg-slate-50 text-slate-600 border-slate-200";
    default: return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

/** Raw row used while AI enrichment is still pending */
export interface RawRow {
  transaction_id?: string;
  source?: string;
  date?: string;
  merchant_name: string;
  description?: string;
  mcc?: string;
  amount: number;
}

interface Props {
  /** Enriched transactions (final state). Render takes precedence over rawRows. */
  transactions: EnrichedTransaction[];
  /** Raw rows shown while waiting for AI. If provided, missing-enriched rows render as shimmers. */
  rawRows?: RawRow[];
  /** When true, drops the outer rounded border so the table sits flush with its parent. */
  flush?: boolean;
  /** When provided, rows at these indices are highlighted; others are dimmed. */
  highlightedIndices?: number[] | null;
  /** Accent color used for the highlight border / tint. */
  highlightColor?: string;
  /** Active pill label (used in the "Showing N of M" strip). */
  activePillLabel?: string | null;
  /** Called when the user clicks Clear in the highlight strip. */
  onClearHighlight?: () => void;
}

// Column widths (kept in sync with skeleton in ExecDemoIntelPanel)
const COL = {
  date: "w-[70px]",
  merchant: "w-[130px]",
  description: "w-[170px]",
  mcc: "w-[55px]",
  amount: "w-[60px]",
  source: "w-[95px]",
  pillar: "w-[130px]",
  category: "w-[110px]",
  subs: "w-[130px]",
  tier: "w-[75px]",
  freq: "w-[80px]",
};

const ShimmerCell = ({ width = "80%", height = 14, rounded = "rounded" }: { width?: string; height?: number; rounded?: string }) => (
  <span
    className={`inline-block bg-slate-200/70 animate-pulse ${rounded}`}
    style={{ width, height }}
  />
);

export default function ExecDemoEnrichmentTable({ transactions, rawRows, flush, highlightedIndices, highlightColor = "#0ea5e9", activePillLabel, onClearHighlight }: Props) {
  // Determine source rows: prefer enriched if we have any; otherwise use raw rows.
  // When both exist, build a unified list keyed by index — enriched cells from `transactions`,
  // raw fields from `rawRows` for any rows where enrichment hasn't arrived yet.
  const enrichedCount = transactions.length;
  const rawCount = rawRows?.length ?? 0;
  const totalRows = Math.max(enrichedCount, rawCount);

  if (totalRows === 0) {
    return (
      <p className="text-[11px] text-slate-400 italic py-4 text-center">
        Awaiting enriched transactions…
      </p>
    );
  }

  const wrapperCls = flush
    ? "overflow-auto exec-light-scroll bg-white h-full"
    : "border border-slate-200 rounded-lg overflow-auto exec-light-scroll bg-white";

  const hasPending = rawCount > 0 && enrichedCount < rawCount;
  const highlightSet = highlightedIndices && highlightedIndices.length > 0 ? new Set(highlightedIndices) : null;
  const matchedCount = highlightSet ? highlightSet.size : 0;

  return (
    <div className={wrapperCls} style={{ maxHeight: "100%" }}>
      {highlightSet && activePillLabel && (
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-3 py-1.5 border-b"
          style={{ background: `${highlightColor}14`, borderColor: `${highlightColor}55` }}
        >
          <span className="text-[11px] font-semibold" style={{ color: highlightColor }}>
            Showing <span className="tabular-nums">{matchedCount}</span> of <span className="tabular-nums">{totalRows}</span> transactions for "{activePillLabel}"
          </span>
          {onClearHighlight && (
            <button
              onClick={onClearHighlight}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <table className="w-full text-left border-collapse min-w-[1180px]">
        <thead className="sticky top-0 z-10">
          {/* Tier 1 — Raw vs Enriched grouping */}
          <tr className="border-b border-slate-200">
            <th
              colSpan={6}
              className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 border-r-2 border-slate-300"
            >
              Raw Transaction <span className="font-normal normal-case tracking-normal text-slate-400">· as received from bank feed</span>
            </th>
            <th
              colSpan={5}
              className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5"
            >
              <span className="inline-flex items-center gap-2">
                Ventus Enriched <span className="font-normal normal-case tracking-normal text-blue-500/80">· AI-labeled semantic intelligence</span>
                {hasPending && (
                  <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 normal-case tracking-normal">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Enriching…
                  </span>
                )}
              </span>
            </th>
          </tr>
          {/* Tier 2 — Column headers */}
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.source}`}>Source</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.date}`}>Date</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.merchant}`}>Merchant</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.mcc}`}>MCC</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.description}`}>Description</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.amount} text-right border-r-2 border-slate-300`}>Amt</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.pillar}`}>Pillar</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.category}`}>Category</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.subs}`}>Subcategories</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.tier}`}>Tier</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.freq}`}>Freq</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows }).map((_, idx) => {
            const tx = transactions[idx] as EnrichedTransaction | undefined;
            const raw = rawRows?.[idx];
            // Prefer enriched values; fall back to raw fields when AI hasn't returned yet.
            const merchantRaw = tx?.merchant_name || raw?.merchant_name || "—";
            const merchantDisplay = (tx as any)?.normalized_merchant || merchantRaw;
            const subs: string[] = (tx as any)?.subcategories ?? ((tx as any)?.subcategory ? [(tx as any).subcategory] : []);
            const mcc = ((tx as any)?.mcc as string | undefined) ?? raw?.mcc;
            const rawDesc = ((tx as any)?.description as string | undefined) ?? raw?.description;
            const description = (mcc && MCC_DESCRIPTIONS[mcc]) || rawDesc;
            const source = (tx as any)?.source ?? raw?.source;
            const date = tx?.date ?? raw?.date;
            const amount = tx?.amount ?? raw?.amount ?? 0;
            const isEnriched = !!tx;
            const c = isEnriched ? getColor(tx!.pillar) : null;
            return (
              <tr key={(tx as any)?.transaction_id || raw?.transaction_id || `tx-${idx}`} className="border-b border-slate-100 hover:bg-slate-50/60">
                {/* ===== RAW SIDE ===== */}
                <td className={`px-2 py-1 ${COL.source}`}>
                  {source ? (
                    <span className={`inline-block px-1.5 py-px rounded text-[9px] font-medium whitespace-nowrap ${SOURCE_COLORS[source] ?? "bg-slate-50 text-slate-500"}`}>
                      {source}
                    </span>
                  ) : <span className="text-[10px] text-slate-400">—</span>}
                </td>
                <td className={`text-[10.5px] text-slate-600 whitespace-nowrap px-2 py-1 ${COL.date} tabular-nums`}>
                  {date || "—"}
                </td>
                <td className={`px-2 py-1 ${COL.merchant}`}>
                  <div className="text-[10.5px] font-medium text-slate-900 truncate max-w-[120px]" title={merchantRaw}>
                    {merchantRaw}
                  </div>
                </td>
                <td className={`px-2 py-1 ${COL.mcc}`}>
                  {mcc ? (
                    <span className="inline-block bg-slate-100 text-slate-600 text-[9.5px] font-mono px-1.5 py-px rounded">
                      {mcc}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </td>
                <td className={`px-2 py-1 ${COL.description}`}>
                  {description ? (
                    <div className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]" title={description}>
                      {description}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </td>
                <td className={`font-mono text-[10.5px] text-slate-900 px-2 py-1 whitespace-nowrap ${COL.amount} text-right tabular-nums border-r-2 border-slate-200`}>
                  ${Math.round(Math.abs(Number(amount) || 0))}
                </td>

                {/* ===== ENRICHED SIDE ===== */}
                <td className={`px-2 py-1 ${COL.pillar}`}>
                  {isEnriched && c ? (
                    <span
                      className="inline-block border text-[9.5px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap leading-tight"
                      style={{ background: c.bg, color: c.text, borderColor: c.border }}
                      title={merchantDisplay !== merchantRaw ? `Normalized: ${merchantDisplay}` : undefined}
                    >
                      {tx!.pillar}
                    </span>
                  ) : (
                    <ShimmerCell width="100px" height={16} rounded="rounded" />
                  )}
                </td>
                <td className={`text-[10.5px] text-slate-700 px-2 py-1 truncate max-w-[110px] ${COL.category}`} title={(tx as any)?.category}>
                  {isEnriched ? ((tx as any).category || "—") : <ShimmerCell width="80px" height={10} />}
                </td>
                <td className={`px-2 py-1 ${COL.subs}`}>
                  {isEnriched ? (
                    <div className="flex flex-wrap gap-0.5">
                      {subs.length > 0 ? subs.map((sub, i) => (
                        <span key={i} className="inline-block bg-slate-100 text-slate-600 text-[9px] px-1 py-px rounded">{sub}</span>
                      )) : <span className="text-[10px] text-slate-400">—</span>}
                    </div>
                  ) : (
                    <ShimmerCell width="100px" height={12} />
                  )}
                </td>
                <td className={`px-2 py-1 ${COL.tier}`}>
                  {isEnriched ? (
                    <span className={`inline-block border text-[9px] px-1.5 py-px rounded whitespace-nowrap leading-tight ${getTierColor((tx as any).spending_tier)}`}>
                      {(tx as any).spending_tier || "—"}
                    </span>
                  ) : (
                    <ShimmerCell width="55px" height={14} />
                  )}
                </td>
                <td className={`px-2 py-1 ${COL.freq}`}>
                  {isEnriched ? (
                    <span className={`inline-block border text-[9px] px-1.5 py-px rounded whitespace-nowrap leading-tight ${getFrequencyColor((tx as any).purchase_frequency)}`}>
                      {(tx as any).purchase_frequency || "—"}
                    </span>
                  ) : (
                    <ShimmerCell width="60px" height={14} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
