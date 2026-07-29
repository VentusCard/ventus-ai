import { Check } from "lucide-react";
import { PricingModule } from "@/lib/pricingCatalog";
import { formatCurrency } from "@/lib/formatHelper";

interface Props {
  module: PricingModule;
  selected: boolean;
  customers: number;
  onToggle: () => void;
}

export default function ModuleCard({ module, selected, customers, onToggle }: Props) {
  const lineTotal = module.fixedFee + module.perUserFee * customers;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative text-left w-full rounded-xl border p-4 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-slate-900 leading-tight">{module.name}</p>
          <p className="text-[12px] text-slate-500 mt-1 leading-snug">{module.description}</p>
        </div>
        <div
          className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center ${
            selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
          }`}
        >
          {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <p className="text-slate-400 uppercase tracking-wide">Fixed / yr</p>
          <p className="text-slate-800 font-semibold text-[13px]">{formatCurrency(module.fixedFee)}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase tracking-wide">Per user / yr</p>
          <p className="text-slate-800 font-semibold text-[13px]">${module.perUserFee.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 uppercase tracking-wide">Line / yr</p>
          <p className={`font-semibold text-[13px] ${selected ? "text-blue-700" : "text-slate-500"}`}>
            {formatCurrency(lineTotal)}
          </p>
        </div>
      </div>
    </button>
  );
}
