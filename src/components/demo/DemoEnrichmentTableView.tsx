import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { getFlow } from "@/lib/transactionFlow";


const getConfidenceColor = (c: number) => {
  if (c >= 0.8) return "bg-green-500/10 text-green-700 border-green-500/20";
  if (c >= 0.5) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
  return "bg-red-500/10 text-red-700 border-red-500/20";
};

const getTierColor = (t: string) => {
  switch (t) {
    case "Premium": return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    case "Standard": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    case "Budget": return "bg-teal-500/10 text-teal-700 border-teal-500/20";
    default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const getFrequencyColor = (f: string) => {
  switch (f) {
    case "Weekly": return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
    case "Monthly": return "bg-violet-500/10 text-violet-700 border-violet-500/20";
    case "Occasional": return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
    case "Annually": return "bg-orange-500/10 text-orange-700 border-orange-500/20";
    case "One-Time": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const SOURCE_COLORS: Record<string, string> = {
  "Checking": "bg-slate-100 text-slate-600",
  "Cashback Card": "bg-emerald-50 text-emerald-700",
  "Travel Card": "bg-blue-50 text-blue-700",
  "Premium Card": "bg-purple-50 text-purple-700",
  "HSA": "bg-amber-50 text-amber-700",
};

function CustomerTable({ transactions }: { transactions: EnrichedTransaction[] }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-400 py-8 text-center">No enriched data yet</p>;
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-lg">
      <table className="w-full text-left border-collapse min-w-[1050px]">
        <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
          <tr>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[110px] min-w-[110px]">Merchant</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[55px] min-w-[55px] text-right">Amt</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[80px] min-w-[80px]">Date</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[90px] min-w-[90px]">Source</th>
            <th className="w-[20px] px-0.5"><span className="sr-only">→</span></th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[130px] min-w-[130px]">Pillar</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[100px] min-w-[100px]">Category</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[110px] min-w-[110px]">Subcategories</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[80px] min-w-[80px]">Trip</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[70px] min-w-[70px]">Tier</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[75px] min-w-[75px]">Freq</th>
            <th className="text-slate-600 text-[10px] font-semibold px-2 py-1.5 whitespace-nowrap w-[45px] min-w-[45px]">Conf</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transaction_id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-2 py-1 w-[110px] min-w-[110px]">
                <div className="text-[10px] font-medium text-slate-900 truncate max-w-[100px]" title={tx.normalized_merchant}>{tx.normalized_merchant}</div>
              </td>
              {(() => {
                const flow = getFlow({ merchant_name: tx.merchant_name, description: (tx as any).description });
                const abs = Math.abs(tx.amount).toFixed(0);
                return (
                  <td className={`font-mono text-[10px] px-2 py-1 whitespace-nowrap w-[55px] min-w-[55px] text-right ${flow === "income" ? "text-emerald-600 font-semibold" : "text-slate-900"}`}>
                    {flow === "income" ? `$${abs}` : `($${abs})`}
                  </td>
                );
              })()}
              <td className="text-[10px] text-slate-600 whitespace-nowrap px-2 py-1 w-[80px] min-w-[80px]">{tx.date}</td>
              <td className="px-2 py-1 w-[90px] min-w-[90px]">
                {tx.source ? (
                  <span className={`inline-block px-1 py-px rounded text-[9px] font-medium whitespace-nowrap ${
                    SOURCE_COLORS[tx.source] ?? "bg-slate-50 text-slate-500"
                  }`}>{tx.source}</span>
                ) : <span className="text-[10px] text-slate-400">—</span>}
              </td>
              <td className="px-0.5 py-1 w-[20px]"><ArrowRight className="w-2.5 h-2.5 text-primary mx-auto" /></td>
              <td className="px-2 py-1 w-[130px] min-w-[130px]">
                <Badge
                  variant="outline"
                  className="border text-[9px] px-1 py-0 whitespace-nowrap leading-tight"
                  style={{
                    backgroundColor: `${PILLAR_COLORS[tx.pillar]}20`,
                    color: PILLAR_COLORS[tx.pillar],
                    borderColor: `${PILLAR_COLORS[tx.pillar]}40`,
                  }}
                >
                  {tx.pillar}
                </Badge>
              </td>
              <td className="text-[10px] text-slate-700 px-2 py-1 truncate max-w-[100px] w-[100px] min-w-[100px]" title={tx.category}>{tx.category}</td>
              <td className="px-2 py-1 w-[110px] min-w-[110px]">
                <div className="flex flex-wrap gap-0.5">
                  {(tx.subcategories ?? [tx.subcategory]).map((sub, i) => (
                    <span key={i} className="inline-block bg-slate-100 text-slate-600 text-[9px] px-1 py-px rounded">{sub}</span>
                  ))}
                </div>
              </td>
              <td className="px-2 py-1 w-[80px] min-w-[80px]">
                {tx.trip_label ? (
                  <span className="inline-flex items-center gap-0.5 bg-purple-500/10 text-purple-700 border border-purple-500/20 text-[9px] px-1 py-px rounded whitespace-nowrap" title={tx.trip_label}>
                    ✈ {tx.travel_context?.travel_destination || "Trip"}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">—</span>
                )}
              </td>
              <td className="px-2 py-1 w-[70px] min-w-[70px]">
                <Badge variant="outline" className={`text-[9px] px-1 py-0 whitespace-nowrap leading-tight ${getTierColor(tx.spending_tier)}`}>
                  {tx.spending_tier}
                </Badge>
              </td>
              <td className="px-2 py-1 w-[75px] min-w-[75px]">
                <Badge variant="outline" className={`text-[9px] px-1 py-0 whitespace-nowrap leading-tight ${getFrequencyColor(tx.purchase_frequency)}`}>
                  {tx.purchase_frequency}
                </Badge>
              </td>
              <td className="px-2 py-1 w-[45px] min-w-[45px]">
                <Badge variant="outline" className={`text-[9px] px-1 py-0 leading-tight ${getConfidenceColor(tx.confidence)}`}>
                  {(tx.confidence * 100).toFixed(0)}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerHeader({ customer, color }: { customer: DemoCustomer; color: "blue" | "emerald" }) {
  const sources = [...new Set(customer.sampleTransactions.map(t => t.source).filter(Boolean))];
  const colors = color === "blue"
    ? "bg-blue-50 border-blue-200 text-blue-800"
    : "bg-emerald-50 border-emerald-200 text-emerald-800";

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-t-lg border ${colors} text-[10px] shrink-0`}>
      <span className="font-semibold">{customer.profile.name}</span>
      <span className="text-slate-400">·</span>
      <span><span className="font-semibold">{customer.txnCount}</span> txns</span>
      <span className="text-slate-400">·</span>
      <span>{customer.txnTotal}</span>
      {customer.dateRange && (
        <>
          <span className="text-slate-400">·</span>
          <span className="opacity-70">{customer.dateRange}</span>
        </>
      )}
      {sources.length > 0 && (
        <>
          <span className="text-slate-400">·</span>
          {sources.map(s => (
            <span key={s} className={`inline-block px-1.5 py-px rounded-full text-[9px] font-medium ${SOURCE_COLORS[s!] ?? "bg-slate-50 text-slate-500"}`}>{s}</span>
          ))}
        </>
      )}
    </div>
  );
}

interface Props {
  customer: DemoCustomer | null;
  enriched?: EnrichedTransaction[];
}

export default function DemoEnrichmentTableView({ customer, enriched }: Props) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {customer && (
        <div className="flex-1 min-h-0 flex flex-col">
          <CustomerHeader customer={customer} color="blue" />
          <CustomerTable transactions={enriched ?? []} />
        </div>
      )}
    </div>
  );
}
