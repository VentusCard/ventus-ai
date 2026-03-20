import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="text-slate-700 text-xs">Merchant</TableHead>
              <TableHead className="text-slate-700 text-xs">Amount</TableHead>
              <TableHead className="text-slate-700 text-xs">Date</TableHead>
              <TableHead className="w-6"><span className="sr-only">→</span></TableHead>
              <TableHead className="text-slate-700 text-xs">Pillar</TableHead>
              <TableHead className="text-slate-700 text-xs">Subcategory</TableHead>
              <TableHead className="text-slate-700 text-xs">Tier</TableHead>
              <TableHead className="text-slate-700 text-xs">Frequency</TableHead>
              <TableHead className="text-slate-700 text-xs">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.transaction_id}>
                <TableCell className="py-2">
                  <div className="text-xs font-medium text-slate-900">{tx.normalized_merchant}</div>
                  {tx.merchant_name !== tx.normalized_merchant && (
                    <div className="text-[10px] text-slate-500">{tx.merchant_name}</div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-900 py-2">${tx.amount.toFixed(2)}</TableCell>
                <TableCell className="text-[11px] text-slate-700 whitespace-nowrap py-2">{tx.date}</TableCell>
                <TableCell className="py-2"><ArrowRight className="w-3 h-3 text-primary mx-auto" /></TableCell>
                <TableCell className="py-2">
                  <Badge
                    variant="outline"
                    className="border text-[10px] px-1.5 py-0 whitespace-nowrap"
                    style={{
                      backgroundColor: `${PILLAR_COLORS[tx.pillar]}20`,
                      color: PILLAR_COLORS[tx.pillar],
                      borderColor: `${PILLAR_COLORS[tx.pillar]}40`,
                    }}
                  >
                    {tx.pillar}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] text-slate-700 py-2">{tx.subcategory}</TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 whitespace-nowrap ${getTierColor(tx.spending_tier)}`}>
                    {tx.spending_tier}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 whitespace-nowrap ${getFrequencyColor(tx.purchase_frequency)}`}>
                    {tx.purchase_frequency}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getConfidenceColor(tx.confidence)}`}>
                    {(tx.confidence * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">{customerA.profile.name}</span>
          <span className="text-[10px] text-slate-400">{enrichedA?.length ?? 0} transactions</span>
        </div>
        <CustomerTable transactions={enrichedA ?? []} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">{customerB.profile.name}</span>
          <span className="text-[10px] text-slate-400">{enrichedB?.length ?? 0} transactions</span>
        </div>
        <CustomerTable transactions={enrichedB ?? []} />
      </div>
    </div>
  );
}
