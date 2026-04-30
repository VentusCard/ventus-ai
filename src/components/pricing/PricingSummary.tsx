import { Mail, Copy } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";

interface Props {
  totalFixed: number;
  totalVariable: number;
  grandTotal: number;
  customers: number;
  selectedCount: number;
  onEmail: () => void;
  onCopy: () => void;
}

export default function PricingSummary({
  totalFixed,
  totalVariable,
  grandTotal,
  customers,
  selectedCount,
  onEmail,
  onCopy,
}: Props) {
  const perCustomer = customers > 0 ? grandTotal / customers : 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Annual Investment</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(grandTotal)}</p>
      <p className="text-[12px] text-slate-500 mt-1">
        {selectedCount} module{selectedCount === 1 ? "" : "s"} · {formatNumber(customers)} customers · ~$
        {perCustomer.toFixed(2)} / customer / yr
      </p>

      <div className="mt-4 space-y-2 text-[13px]">
        <div className="flex items-center justify-between text-slate-600">
          <span>Fixed platform fees</span>
          <span className="font-semibold text-slate-800">{formatCurrency(totalFixed)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Per-user fees ({formatNumber(customers)} × rates)</span>
          <span className="font-semibold text-slate-800">{formatCurrency(totalVariable)}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
          <span className="font-semibold text-slate-900">Total / year</span>
          <span className="font-bold text-slate-900">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={onCopy}
          className="h-10 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 inline-flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" /> Copy
        </button>
        <button
          onClick={onEmail}
          className="h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 inline-flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" /> Email draft
        </button>
      </div>
    </div>
  );
}
