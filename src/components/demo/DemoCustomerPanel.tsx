import { useState } from "react";
import { DEMO_CUSTOMERS, buildCustomDemoCustomer, buildCustomerPrompt, parseUnifiedOutput, type DemoCustomer } from "@/lib/demoData";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Sparkles, CheckCircle2, Circle, Copy, Check, Lock } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";
import type { Transaction } from "@/types/transaction";
import { ALL_MODULES, type ModuleKey } from "@/types/demo";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: DemoCustomer | null;
  parsedTransactions: Transaction[];
  onSelect: (c: DemoCustomer) => void;
  onEnrich: () => void;
  isProcessing: boolean;
  statusMessage: string;
  currentPhase: "idle" | "classification" | "travel" | "complete";
  nodeReadiness: NodeReadiness;
  enabledModules: Set<ModuleKey>;
  onModulesChange: (modules: Set<ModuleKey>) => void;
}

const MODULE_CONFIG: { mod: ModuleKey; label: string; team: string; description: string; borderColor: string; checkColor: string }[] = [
  {
    mod: "Analytics",
    label: "Ventus AI Customer Intelligence & Analytics",
    team: "Customer Intelligence Team",
    description: "Core transaction classification, spending analytics, and customer profiling",
    borderColor: "border-l-blue-500",
    checkColor: "text-blue-600",
  },
  {
    mod: "AI & UX",
    label: "AI & UX",
    team: "Banking Experience Team",
    description: "How can we help our customers understand their spending?",
    borderColor: "border-l-sky-500",
    checkColor: "text-sky-600",
  },
  {
    mod: "Rewards",
    label: "Rewards",
    team: "Rewards Team",
    description: "How can we support and reward their lifestyle?",
    borderColor: "border-l-emerald-500",
    checkColor: "text-emerald-600",
  },
  {
    mod: "Relationship",
    label: "Relationship",
    team: "Growth / Wealth Team",
    description: "What's their next product to live a better life?",
    borderColor: "border-l-purple-500",
    checkColor: "text-purple-600",
  },
];
export default function DemoCustomerPanel({
  open, onOpenChange,
  customer, parsedTransactions,
  onSelect,
  onEnrich, isProcessing, statusMessage, currentPhase, nodeReadiness,
  enabledModules, onModulesChange,
}: Props) {
  const allOn = ALL_MODULES.every(m => enabledModules.has(m));

  const toggleModule = (mod: ModuleKey) => {
    if (mod === "Analytics") return;
    const next = new Set(enabledModules);
    if (next.has(mod)) next.delete(mod);
    else next.add(mod);
    onModulesChange(next);
  };

  const toggleAll = () => {
    if (allOn) {
      onModulesChange(new Set<ModuleKey>(["Analytics"]));
    } else {
      onModulesChange(new Set(ALL_MODULES));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-[60vw] h-[85vh] p-0 gap-0 flex flex-col overflow-hidden bg-white text-slate-900"
        style={{ fontFamily: "Manrope, sans-serif", colorScheme: "light" }}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ventus AI</h2>
          <p className="text-[13px] text-slate-500 mt-1">Configure customer profile and platform modules for demo experience</p>
        </div>

        {/* Two-column body */}
        <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
          {/* Left: Customer Selection */}
          <div className="border-r border-slate-100 p-8 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <h3 className="text-xs tracking-[0.15em] uppercase mb-4 text-primary-foreground font-extrabold">Select Customer</h3>
            <CustomerSlot
              label="Customer"
              color="#3b82f6"
              customId="custom-a"
              selected={customer}
              onSelect={onSelect}
              transactions={parsedTransactions}
            />
          </div>

          {/* Right: Platform Modules */}
          <div className="p-8 overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none" }}>
            <h3 className="text-xs tracking-[0.15em] uppercase mb-4 text-primary-foreground font-extrabold">Platform Modules</h3>

            {/* All toggle */}
            <div className="mb-4">
              <button
                onClick={toggleAll}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                  allOn
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                All Modules
              </button>
            </div>

            {/* Module cards */}
            <div className="space-y-3 flex-1">
              {MODULE_CONFIG.map(({ mod, label, team, description, borderColor, checkColor }) => {
                const isAnalytics = mod === "Analytics";
                const checked = isAnalytics || enabledModules.has(mod);
                return (
                  <div
                    key={mod}
                    onClick={() => !isAnalytics && toggleModule(mod)}
                    className={`border-l-[3px] ${checked ? borderColor : "border-l-slate-200"} rounded-lg border border-slate-200 p-4 transition-all ${
                      isAnalytics ? "cursor-default" : "cursor-pointer hover:shadow-sm hover:border-slate-300"
                    } ${checked ? "bg-white shadow-sm opacity-100" : "bg-slate-50 opacity-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      {checked ? (
                        <CheckCircle2 className={`h-5 w-5 mt-0.5 shrink-0 ${checkColor}`} />
                      ) : (
                        <Circle className="h-5 w-5 mt-0.5 shrink-0 text-slate-300" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold ${checked ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                        {isAnalytics && <Lock className="h-3 w-3 text-slate-400 inline ml-2" />}
                        <p className={`text-[11px] mt-0.5 font-medium ${checked ? "text-slate-400" : "text-slate-300"}`}>{team}</p>
                        <p className={`text-[12px] mt-1 leading-relaxed italic ${checked ? "text-slate-500" : "text-slate-400"}`}>{description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <Button
              onClick={onEnrich}
              disabled={isProcessing || !customer || !["AI & UX", "Rewards", "Relationship"].some(m => enabledModules.has(m as ModuleKey))}
              variant="ai"
              size="default"
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Experience…
                </>
              ) : currentPhase === "complete" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Recreate Experience
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Next-Gen Banking Experience
                </>
              )}
            </Button>
          </div>

          {!["AI & UX", "Rewards", "Relationship"].some(m => enabledModules.has(m as ModuleKey)) && (
            <p className="text-[11px] text-amber-600 mt-2 text-center">Select at least one feature module to proceed</p>
          )}

          {/* Status line */}
          {(isProcessing || currentPhase === "complete") && (
            <div className="text-center mt-3">
              <p className="text-[11px] text-slate-500 truncate">{statusMessage}</p>
              {isProcessing && (
                <div className="mt-2 flex gap-1.5 justify-center flex-wrap">
                  <PhaseDot label="Classify" active={nodeReadiness.analytics === "processing"} done={nodeReadiness.analytics === "ready"} />
                  <PhaseDot label="Travel" active={nodeReadiness.travel === "processing" && nodeReadiness.analytics === "ready"} done={nodeReadiness.travel === "ready"} />
                  <PhaseDot label="Lifestyle" active={nodeReadiness.wealth === "processing" && nodeReadiness.analytics === "ready"} done={nodeReadiness.wealth === "ready"} />
                  <PhaseDot label="Deals" active={nodeReadiness.rewards === "processing" && nodeReadiness.analytics === "ready"} done={nodeReadiness.rewards === "ready"} />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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

  const incomeTxns = transactions.filter(isIncomeTransaction);
  const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0) - totalIncome;
  const dates = transactions.map(t => t.date).sort();
  const dateRange = dates.length > 0
    ? `${formatShortDate(dates[0])} – ${formatShortDate(dates[dates.length - 1])}`
    : "";

  return (
    <div>
      <select
        className="w-full bg-white text-slate-900 text-sm rounded-lg px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 mb-4"
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
        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-medium text-slate-500 mb-1.5 block">1. Copy prompt → paste into ChatGPT / Claude</span>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-[11px]"
              onClick={handleCopyPrompt}
            >
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-500 mb-1.5 block">2. Paste the full LLM output below</span>
            <textarea
              className="w-full bg-white text-slate-900 text-[11px] font-mono rounded-md px-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              rows={8}
              placeholder={"=== PROFILE ===\nname: ...\n\n=== TRANSACTIONS ===\ndate,merchant_name,amount,mcc,merchant_zip\n..."}
              value={outputText}
              onChange={(e) => { setOutputText(e.target.value); setParseError(""); }}
            />
          </div>

          {parseError && (
            <p className="text-[11px] text-red-500">{parseError}</p>
          )}

          <Button size="sm" className="w-full h-8 text-[11px]" onClick={handleLoad} disabled={!outputText.trim()}>
            Load Customer
          </Button>
        </div>
      ) : !selected ? (
        <p className="text-[12px] text-slate-400 italic py-4">Select a customer above to view their transaction data</p>
      ) : (
        <>
          {/* Demographics */}
          {(selected.profile.demographics.industry || selected.profile.demographics.incomeLevel) && (
            <div className="mb-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
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
          <div className="flex items-center gap-2 flex-wrap mb-2 text-[11px] text-slate-500">
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
              <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[10px]">
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

          {/* Transaction table */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-3 py-2 font-medium text-slate-500">Date</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-500">Merchant</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-500">Amt</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-500">Zip</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-500">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={`${t.transaction_id}-${i}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-3 py-1.5 text-slate-400 text-[10px] whitespace-nowrap">{t.date}</td>
                      <td className="px-3 py-1.5 text-slate-700 truncate max-w-[140px]">{t.merchant_name}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-slate-600">${t.amount.toFixed(0)}</td>
                      <td className="px-3 py-1.5 text-right text-slate-400 font-mono text-[10px]">{t.zip_code || "—"}</td>
                      <td className="px-3 py-1.5 text-center">
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
