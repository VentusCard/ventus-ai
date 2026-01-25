import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnrichedTransaction } from "@/types/transaction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { Badge } from "@/components/ui/badge";

interface SubcategoryTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: string;
  pillar: string;
  transactions: EnrichedTransaction[];
  onTransactionClick: (transaction: EnrichedTransaction) => void;
}

export function SubcategoryTransactionsModal({
  isOpen,
  onClose,
  subcategory,
  pillar,
  transactions,
  onTransactionClick
}: SubcategoryTransactionsModalProps) {
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const color = PILLAR_COLORS[pillar] || "#64748b";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <DialogTitle className="text-xl text-slate-900">{subcategory}</DialogTitle>
            <Badge variant="outline" style={{ borderColor: color, color }}>
              {pillar}
            </Badge>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <p className="text-slate-500">Total Spend</p>
              <p className="text-2xl font-bold" style={{ color }}>${totalSpend.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500">Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-2">
            {transactions.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => onTransactionClick(t)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{t.merchant_name}</p>
                  <p className="text-xs text-slate-500">{t.subcategory}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${t.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
