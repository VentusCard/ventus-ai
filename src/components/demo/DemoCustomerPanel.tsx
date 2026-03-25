import { useState } from "react";
import { DEMO_CUSTOMERS, buildCustomDemoCustomer, buildCustomerPrompt, parseUnifiedOutput, type DemoCustomer } from "@/lib/demoData";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, Copy, Check } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";
import type { Transaction } from "@/types/transaction";

interface Props {
  customer: DemoCustomer | null;
  parsedTransactions: Transaction[];
  onSelect: (c: DemoCustomer) => void;
  onEnrich: () => void;
  isProcessing: boolean;
  statusMessage: string;
  currentPhase: "idle" | "classification" | "travel" | "complete";
  nodeReadiness: NodeReadiness;
}

export default function DemoCustomerPanel({
  customer, parsedTransactions,
  onSelect,
  onEnrich, isProcessing, statusMessage, currentPhase, nodeReadiness,
}: Props) {
  return (
    <div className="h-full flex flex-col p-5 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          Ventus AI
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Select a customer to enrich</p>
      </div>

      {/* Customer */}
      <CustomerSlot
        label="Customer"
        color="#3b82f6"
        customId="custom-a"
        selected={customer}
        onSelect={onSelect}
        transactions={parsedTransactions}
      />

      {/* Enrich button */}
      <div className="mt-auto pt-6 space-y-3">
        <Button
          onClick={onEnrich}
          disabled={isProcessing || !customer}
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
              Re-Enrich Customer
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enrich Customer
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
  customId,
  selected,
  onSelect,
  transactions,
}: {
  label: string;
  color: string;
  customId: string;
  selected: DemoCustomer | null;
  onSelect: (c: DemoCustomer) => void;
  transactions: Transaction[];
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleDropdownChange = (value: string) => {
    if (value === "custom") {
      setIsCustomMode(true);
      setParseError("");
    } else {
      setIsCustomMode(false);
      setParseError("");
      const c = DEMO_CUSTOMERS.find((d) => d.id === value);
      if (c) onSelect(c);
    }
  };

  const handleCopyPrompt = async () => {
    const prompt = buildCustomerPrompt("a typical bank customer");
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoad = () => {
    setParseError("");
    if (!outputText.trim()) return;
    const parsed = parseUnifiedOutput(outputText);
    if (!parsed) {
      setParseError("Could not parse output. Make sure it contains === PROFILE === and === TRANSACTIONS === sections.");
      return;
    }
    const customer = buildCustomDemoCustomer(customId, parsed.csv, parsed.demographics, parsed.zip);
    onSelect(customer);
    setIsCustomMode(false);
    setOutputText("");
  };

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
        value={isCustomMode ? "custom" : selected?.id?.startsWith("custom-") ? "custom" : (selected?.id ?? "")}
        onChange={(e) => handleDropdownChange(e.target.value)}
      >
        {!selected && !isCustomMode && <option value="" disabled>Select a customer…</option>}
        {DEMO_CUSTOMERS.map((d) => (
          <option key={d.id} value={d.id}>{d.profile.name}</option>
        ))}
        <option value="custom">✏️ Custom</option>
      </select>

      {isCustomMode ? (
        <div className="space-y-2.5">
          {/* Step 1: Copy prompt */}
          <div>
            <span className="text-[10px] font-medium text-slate-500 mb-1 block">1. Copy prompt → paste into ChatGPT / Claude</span>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-[11px]"
              onClick={handleCopyPrompt}
            >
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </div>

          {/* Step 3: Paste output */}
          <div>
            <span className="text-[10px] font-medium text-slate-500 mb-1 block">3. Paste the full LLM output below</span>
            <textarea
              className="w-full bg-white text-slate-900 text-[10px] font-mono rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              rows={6}
              placeholder={"=== PROFILE ===\nname: ...\n\n=== TRANSACTIONS ===\ndate,merchant_name,amount,mcc,merchant_zip\n..."}
              value={outputText}
              onChange={(e) => { setOutputText(e.target.value); setParseError(""); }}
            />
          </div>

          {parseError && (
            <p className="text-[10px] text-red-500">{parseError}</p>
          )}

          <Button size="sm" className="w-full h-7 text-[11px]" onClick={handleLoad} disabled={!outputText.trim()}>
            Load Customer
          </Button>
        </div>
      ) : !selected ? (
        <p className="text-[11px] text-slate-400 italic py-2">Select a customer above</p>
      ) : (
        <>
          {/* Bank-available demographics */}
          {(selected.profile.demographics.industry || selected.profile.demographics.incomeLevel) && (
            <div className="mb-2 flex items-center gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              {selected.profile.demographics.industry && (
                <span>Industry: <span className="font-medium text-slate-600">{selected.profile.demographics.industry}</span></span>
              )}
              {selected.profile.demographics.industry && selected.profile.demographics.incomeLevel && (
                <span className="text-slate-300">·</span>
              )}
              {selected.profile.demographics.incomeLevel && (
                <span>Income: <span className="font-medium text-slate-600">{selected.profile.demographics.incomeLevel}</span></span>
              )}
            </div>
          )}
          {/* Summary stats */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5 text-[11px] text-slate-500">
            <span><span className="font-semibold text-slate-700">{transactions.length}</span> txns</span>
            <span className="text-slate-300">·</span>
            <span><span className="font-semibold text-slate-700">${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> total</span>
            {dateRange && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400">{dateRange}</span>
              </>
            )}
          </div>
          {/* Source pills */}
          {(() => {
            const sources = [...new Set(transactions.map(t => t.source).filter(Boolean))];
            return sources.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[10px]">
                <span className="text-slate-500 font-medium">Sources:</span>
                {sources.map(s => (
                  <span key={s} className={`inline-block px-1.5 py-px rounded-full text-[9px] font-medium ${
                    s === "Checking" ? "bg-slate-100 text-slate-600" :
                    s === "Cashback Card" ? "bg-emerald-50 text-emerald-700" :
                    s === "Travel Card" ? "bg-blue-50 text-blue-700" :
                    s === "Premium Card" ? "bg-purple-50 text-purple-700" :
                    s === "HSA" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-50 text-slate-500"
                  }`}>{s}</span>
                ))}
              </div>
            ) : null;
          })()}

          {/* Compact transaction table */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-2 py-1.5 font-medium text-slate-500">Date</th>
                    <th className="text-left px-2 py-1.5 font-medium text-slate-500">Merchant</th>
                    <th className="text-right px-2 py-1.5 font-medium text-slate-500">Amt</th>
                    <th className="text-right px-2 py-1.5 font-medium text-slate-500">Zip</th>
                    <th className="text-center px-2 py-1.5 font-medium text-slate-500">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={`${t.transaction_id}-${i}`} className="border-b border-slate-50 last:border-0">
                      <td className="px-2 py-1 text-slate-400 text-[10px] whitespace-nowrap">{t.date}</td>
                      <td className="px-2 py-1 text-slate-700 truncate max-w-[120px]">{t.merchant_name}</td>
                      <td className="px-2 py-1 text-right font-mono text-slate-600">${t.amount.toFixed(0)}</td>
                      <td className="px-2 py-1 text-right text-slate-400 font-mono text-[10px]">{t.zip_code || "—"}</td>
                      <td className="px-2 py-1 text-center">
                        {t.source && (
                          <span className={`inline-block px-1.5 py-px rounded text-[8px] font-medium whitespace-nowrap ${
                            t.source === "Checking" ? "bg-slate-100 text-slate-600" :
                            t.source === "Cashback Card" ? "bg-emerald-50 text-emerald-700" :
                            t.source === "Travel Card" ? "bg-blue-50 text-blue-700" :
                            t.source === "Premium Card" ? "bg-purple-50 text-purple-700" :
                            t.source === "HSA" ? "bg-amber-50 text-amber-700" :
                            "bg-slate-50 text-slate-500"
                          }`}>
                            {t.source}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
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
