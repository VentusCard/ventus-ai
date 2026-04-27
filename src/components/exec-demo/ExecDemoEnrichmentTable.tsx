import { ArrowRight } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { EnrichedTransaction } from "./execDemoData";

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

const getConfidenceColor = (c: number) => {
  if (c >= 0.8) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (c >= 0.5) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-700 border-red-200";
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

interface Props {
  transactions: EnrichedTransaction[];
}

// Column widths (kept in sync with skeleton in ExecDemoIntelPanel)
const COL = {
  date: "w-[70px]",
  merchant: "w-[130px]",
  description: "w-[170px]",
  mcc: "w-[55px]",
  amount: "w-[60px]",
  arrow: "w-[24px]",
  source: "w-[95px]",
  pillar: "w-[130px]",
  category: "w-[110px]",
  subs: "w-[130px]",
  tier: "w-[75px]",
  freq: "w-[80px]",
  conf: "w-[55px]",
};

export default function ExecDemoEnrichmentTable({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <p className="text-[11px] text-slate-400 italic py-4 text-center">
        Awaiting enriched transactions…
      </p>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-auto exec-light-scroll bg-white" style={{ maxHeight: "100%" }}>
      <table className="w-full text-left border-collapse min-w-[1340px]">
        <thead className="sticky top-0 z-10">
          {/* Tier 1 — Raw vs Enriched grouping */}
          <tr className="border-b border-slate-200">
            <th
              colSpan={6}
              className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 border-r border-slate-200"
            >
              Raw Transaction <span className="font-normal normal-case tracking-normal text-slate-400">· as received from bank feed</span>
            </th>
            <th className="bg-slate-50 px-0.5" />
            <th
              colSpan={6}
              className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 border-l border-slate-200"
            >
              Ventus Enriched <span className="font-normal normal-case tracking-normal text-blue-500/80">· AI-labeled semantic intelligence</span>
            </th>
          </tr>
          {/* Tier 2 — Column headers */}
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.source}`}>Source</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.date}`}>Date</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.merchant}`}>Merchant</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.description}`}>Description</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.mcc}`}>MCC</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.amount} text-right border-r border-slate-200`}>Amt</th>
            <th className={`${COL.arrow} px-0.5`}><span className="sr-only">→</span></th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.pillar}`}>Pillar</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.category}`}>Category</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.subs}`}>Subcategories</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.tier}`}>Tier</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.freq}`}>Freq</th>
            <th className={`text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 whitespace-nowrap ${COL.conf}`}>Conf</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => {
            const c = getColor(tx.pillar);
            const merchantRaw = tx.merchant_name || "—";
            const merchantDisplay = (tx as any).normalized_merchant || merchantRaw;
            const subs: string[] = (tx as any).subcategories ?? ((tx as any).subcategory ? [(tx as any).subcategory] : []);
            const conf: number = typeof (tx as any).confidence === "number" ? (tx as any).confidence : 0;
            const description = (tx as any).description as string | undefined;
            const mcc = (tx as any).mcc as string | undefined;
            return (
              <tr key={(tx as any).transaction_id || `tx-${idx}`} className="border-b border-slate-100 hover:bg-slate-50/60">
                {/* ===== RAW SIDE ===== */}
                <td className={`text-[10.5px] text-slate-600 whitespace-nowrap px-2 py-1 ${COL.date} tabular-nums`}>
                  {tx.date || "—"}
                </td>
                <td className={`px-2 py-1 ${COL.merchant}`}>
                  <div className="text-[10.5px] font-medium text-slate-900 truncate max-w-[120px]" title={merchantRaw}>
                    {merchantRaw}
                  </div>
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
                <td className={`px-2 py-1 ${COL.mcc}`}>
                  {mcc ? (
                    <span className="inline-block bg-slate-100 text-slate-600 text-[9.5px] font-mono px-1.5 py-px rounded">
                      {mcc}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </td>
                <td className={`font-mono text-[10.5px] text-slate-900 px-2 py-1 whitespace-nowrap ${COL.amount} text-right tabular-nums border-r border-slate-100`}>
                  ${Math.round(Math.abs(Number(tx.amount) || 0))}
                </td>

                {/* ===== ARROW ===== */}
                <td className={`px-0.5 py-1 ${COL.arrow}`}>
                  <ArrowRight className="w-3 h-3 text-blue-500 mx-auto" />
                </td>

                {/* ===== ENRICHED SIDE ===== */}
                <td className={`px-2 py-1 ${COL.source}`}>
                  {(tx as any).source ? (
                    <span className={`inline-block px-1.5 py-px rounded text-[9px] font-medium whitespace-nowrap ${SOURCE_COLORS[(tx as any).source] ?? "bg-slate-50 text-slate-500"}`}>
                      {(tx as any).source}
                    </span>
                  ) : <span className="text-[10px] text-slate-400">—</span>}
                </td>
                <td className={`px-2 py-1 ${COL.pillar}`}>
                  <span
                    className="inline-block border text-[9.5px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap leading-tight"
                    style={{ background: c.bg, color: c.text, borderColor: c.border }}
                    title={merchantDisplay !== merchantRaw ? `Normalized: ${merchantDisplay}` : undefined}
                  >
                    {tx.pillar}
                  </span>
                </td>
                <td className={`text-[10.5px] text-slate-700 px-2 py-1 truncate max-w-[110px] ${COL.category}`} title={(tx as any).category}>
                  {(tx as any).category || "—"}
                </td>
                <td className={`px-2 py-1 ${COL.subs}`}>
                  <div className="flex flex-wrap gap-0.5">
                    {subs.length > 0 ? subs.map((sub, i) => (
                      <span key={i} className="inline-block bg-slate-100 text-slate-600 text-[9px] px-1 py-px rounded">{sub}</span>
                    )) : <span className="text-[10px] text-slate-400">—</span>}
                  </div>
                </td>
                <td className={`px-2 py-1 ${COL.tier}`}>
                  <span className={`inline-block border text-[9px] px-1.5 py-px rounded whitespace-nowrap leading-tight ${getTierColor((tx as any).spending_tier)}`}>
                    {(tx as any).spending_tier || "—"}
                  </span>
                </td>
                <td className={`px-2 py-1 ${COL.freq}`}>
                  <span className={`inline-block border text-[9px] px-1.5 py-px rounded whitespace-nowrap leading-tight ${getFrequencyColor((tx as any).purchase_frequency)}`}>
                    {(tx as any).purchase_frequency || "—"}
                  </span>
                </td>
                <td className={`px-2 py-1 ${COL.conf}`}>
                  <span className={`inline-block border text-[9px] px-1.5 py-px rounded leading-tight tabular-nums ${getConfidenceColor(conf)}`}>
                    {Math.round(conf * 100)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
