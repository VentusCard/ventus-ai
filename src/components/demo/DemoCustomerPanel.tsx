import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";
import type { Transaction } from "@/types/transaction";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  parsedTransactionsA: Transaction[];
  parsedTransactionsB: Transaction[];
  onSelectA: (c: DemoCustomer) => void;
  onSelectB: (c: DemoCustomer) => void;
  onEnrich: () => void;
  isProcessing: boolean;
  statusMessage: string;
  currentPhase: "idle" | "classification" | "travel" | "complete";
  nodeReadiness: NodeReadiness;
}

export default function DemoCustomerPanel({
  customerA, customerB, parsedTransactionsA, parsedTransactionsB,
  onSelectA, onSelectB,
  onEnrich, isProcessing, statusMessage, currentPhase, nodeReadiness,
}: Props) {
  return (
    <div className="h-full flex flex-col p-5 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          Ventus AI
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Conference Demo</p>
      </div>

      {/* Customer A */}
      <CustomerSlot
        label="Customer A"
        color="#3b82f6"
        selected={customerA}
        onSelect={onSelectA}
        excludeId={customerB.id}
        transactions={parsedTransactionsA}
      />

      <div className="my-4 border-t border-slate-200" />

      {/* Customer B */}
      <CustomerSlot
        label="Customer B"
        color="#10b981"
        selected={customerB}
        onSelect={onSelectB}
        excludeId={customerA.id}
        transactions={parsedTransactionsB}
      />

      {/* Enrich button */}
      <div className="mt-auto pt-6 space-y-3">
        <Button
          onClick={onEnrich}
          disabled={isProcessing}
          variant="ai"
          size="sm"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enriching…
            </>
          ) : currentPhase === "complete" ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Re-Enrich Both
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enrich Both Customers
            </>
          )}
        </Button>

        {/* Status line */}
        {(isProcessing || currentPhase === "complete") && (
          <div className="text-center">
            <p className="text-[10px] text-slate-500 truncate">{statusMessage}</p>
            {isProcessing && (
              <div className="mt-1.5 flex gap-1 justify-center flex-wrap">
                <PhaseDot label="Classify" active={nodeReadiness.analytics === "processing"} done={nodeReadiness.analytics === "ready"} />
                <PhaseDot label="Travel" active={nodeReadiness.travel === "processing" && nodeReadiness.analytics === "ready"} done={nodeReadiness.travel === "ready"} />
                <PhaseDot label="Lifestyle" active={nodeReadiness.wealth === "processing" && nodeReadiness.analytics === "ready"} done={nodeReadiness.wealth === "ready"} />
                <PhaseDot label="Deals" active={nodeReadiness.rewards === "processing" && nodeReadiness.analytics === "ready"} done={nodeReadiness.rewards === "ready"} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseDot({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
      done ? "bg-emerald-100 text-emerald-700" :
      active ? "bg-blue-100 text-blue-700 animate-pulse" :
      "bg-slate-100 text-slate-400"
    }`}>
      {done ? "✓ " : ""}{label}
    </span>
  );
}

function CustomerSlot({
  label,
  color,
  selected,
  onSelect,
  excludeId,
  transactions,
}: {
  label: string;
  color: string;
  selected: DemoCustomer;
  onSelect: (c: DemoCustomer) => void;
  excludeId: string;
  transactions: Transaction[];
}) {
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dates = transactions.map(t => t.date).sort();
  const dateRange = dates.length > 0
    ? `${formatShortDate(dates[0])} – ${formatShortDate(dates[dates.length - 1])}`
    : "";

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color }}>{label}</p>

      <select
        className="w-full bg-white text-slate-900 text-sm rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 mb-3"
        value={selected.id}
        onChange={(e) => {
          const c = DEMO_CUSTOMERS.find((d) => d.id === e.target.value);
          if (c) onSelect(c);
        }}
      >
        {DEMO_CUSTOMERS.filter((d) => d.id !== excludeId).map((d) => (
          <option key={d.id} value={d.id}>{d.profile.name}</option>
        ))}
      </select>

      {/* Summary stats */}
      <div className="flex items-center gap-2 mb-2 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">{transactions.length}</span> txns
        <span className="text-slate-300">·</span>
        <span className="font-semibold text-slate-700">${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> total
      </div>
      {dateRange && (
        <p className="text-[10px] text-slate-400 mb-2">{dateRange}</p>
      )}

      {/* Compact transaction table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="max-h-[180px] overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="text-left px-2 py-1.5 font-medium text-slate-500">Merchant</th>
                <th className="text-right px-2 py-1.5 font-medium text-slate-500">Amt</th>
                <th className="text-right px-2 py-1.5 font-medium text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={`${t.transaction_id}-${i}`} className="border-b border-slate-50 last:border-0">
                  <td className="px-2 py-1 text-slate-700 truncate max-w-[140px]">{t.merchant_name}</td>
                  <td className="px-2 py-1 text-right font-mono text-slate-600">${t.amount.toFixed(0)}</td>
                  <td className="px-2 py-1 text-right text-slate-400">{formatShortDate(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
