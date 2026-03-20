import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { PILLAR_COLORS } from "@/lib/sampleData";

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

function CustomerTable({ transactions }: { transactions: EnrichedTransaction[] }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-400 py-8 text-center">No enriched data yet</p>;
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[580px]">
        <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
          <tr>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Merchant</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Amt</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Date</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Source</th>
            <th className="w-4 px-0.5"><span className="sr-only">→</span></th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Pillar</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Subcat</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Tier</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Freq</th>
            <th className="text-slate-600 text-[10px] font-semibold px-1 py-1.5 whitespace-nowrap">Conf</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transaction_id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-1.5 py-1">
                <div className="text-[10px] font-medium text-slate-900 truncate max-w-[90px]" title={tx.normalized_merchant}>{tx.normalized_merchant}</div>
              </td>
              <td className="font-mono text-[10px] text-slate-900 px-1.5 py-1 whitespace-nowrap">${tx.amount.toFixed(0)}</td>
              <td className="text-[10px] text-slate-600 whitespace-nowrap px-1.5 py-1">{tx.date}</td>
              <td className="px-0.5 py-1"><ArrowRight className="w-2.5 h-2.5 text-primary mx-auto" /></td>
              <td className="px-1 py-1">
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
              <td className="text-[10px] text-slate-600 px-1 py-1 truncate max-w-[70px]" title={tx.subcategory}>{tx.subcategory}</td>
              <td className="px-1.5 py-1">
                <Badge variant="outline" className={`text-[9px] px-1 py-0 whitespace-nowrap leading-tight ${getTierColor(tx.spending_tier)}`}>
                  {tx.spending_tier}
                </Badge>
              </td>
              <td className="px-1.5 py-1">
                <Badge variant="outline" className={`text-[9px] px-1 py-0 whitespace-nowrap leading-tight ${getFrequencyColor(tx.purchase_frequency)}`}>
                  {tx.purchase_frequency}
                </Badge>
              </td>
              <td className="px-1.5 py-1">
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

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
}

export default function DemoEnrichmentTableView({ customerA, customerB, enrichedA, enrichedB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-700">{customerA.profile.name}</span>
          <span className="text-[9px] text-slate-400">{enrichedA?.length ?? 0} txns</span>
        </div>
        <CustomerTable transactions={enrichedA ?? []} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-700">{customerB.profile.name}</span>
          <span className="text-[9px] text-slate-400">{enrichedB?.length ?? 0} txns</span>
        </div>
        <CustomerTable transactions={enrichedB ?? []} />
      </div>
    </div>
  );
}
