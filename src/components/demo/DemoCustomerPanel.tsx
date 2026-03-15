import { useState } from "react";
import { DEMO_CUSTOMERS, buildCustomDemoCustomer, type DemoCustomer, type CustomDemographics } from "@/lib/demoData";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, HelpCircle, Copy, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";
import type { Transaction } from "@/types/transaction";

const LLM_PROMPT = `Generate 30 rows of realistic bank transaction CSV data with these exact columns:
date,merchant_name,amount,mcc,merchant_zip

Rules:
- Dates in the last 3 months (YYYY-MM-DD format)
- Amounts from $5-$2000
- Include varied merchants across travel, dining, grocery, shopping, wellness, and entertainment
- Use realistic MCC codes (5411=grocery, 5812=dining, 3000-3299=airlines, 5977=cosmetics, 7941=sports, etc.)
- Use realistic US zip codes
- Output ONLY the CSV with header row, no explanation`;

interface Props {
  customerA: DemoCustomer | null;
  customerB: DemoCustomer | null;
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
        <p className="text-[11px] text-slate-500 mt-0.5">Select Two Users to Compare Personalization</p>
      </div>

      {/* Customer A */}
      <CustomerSlot
        label="Customer A"
        color="#3b82f6"
        customId="custom-a"
        selected={customerA}
        onSelect={onSelectA}
        excludeId={customerB?.id}
        transactions={parsedTransactionsA}
      />

      <div className="my-4 border-t border-slate-200" />

      {/* Customer B */}
      <CustomerSlot
        label="Customer B"
        color="#10b981"
        customId="custom-b"
        selected={customerB}
        onSelect={onSelectB}
        excludeId={customerA?.id}
        transactions={parsedTransactionsB}
      />

      {/* Enrich button */}
      <div className="mt-auto pt-6 space-y-3">
        <Button
          onClick={onEnrich}
          disabled={isProcessing || !customerA || !customerB}
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
  customId,
  selected,
  onSelect,
  excludeId,
  transactions,
}: {
  label: string;
  color: string;
  customId: string;
  selected: DemoCustomer | null;
  onSelect: (c: DemoCustomer) => void;
  excludeId: string | undefined;
  transactions: Transaction[];
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [demographics, setDemographics] = useState<CustomDemographics>({
    name: "", age: "", occupation: "", familyStatus: "Single",
  });
  const [zipCode, setZipCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDropdownChange = (value: string) => {
    if (value === "custom") {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      const c = DEMO_CUSTOMERS.find((d) => d.id === value);
      if (c) onSelect(c);
    }
  };

  const handleLoad = () => {
    if (!csvText.trim()) return;
    const customer = buildCustomDemoCustomer(customId, csvText.trim(), demographics, zipCode);
    onSelect(customer);
    setIsCustomMode(false);
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(LLM_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        value={isCustomMode ? "custom" : (selected?.id ?? "")}
        onChange={(e) => handleDropdownChange(e.target.value)}
      >
        {!selected && !isCustomMode && <option value="" disabled>Select a customer…</option>}
        {DEMO_CUSTOMERS.filter((d) => d.id !== excludeId).map((d) => (
          <option key={d.id} value={d.id}>{d.profile.name}</option>
        ))}
        <option value="custom">✏️ Custom</option>
      </select>

      {isCustomMode ? (
        <div className="space-y-2">
          {/* Demographics */}
          <div className="grid grid-cols-2 gap-1.5">
            <input
              className="col-span-1 bg-white text-slate-900 text-[11px] rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500"
              placeholder="Name"
              value={demographics.name}
              onChange={(e) => setDemographics(d => ({ ...d, name: e.target.value }))}
            />
            <input
              className="col-span-1 bg-white text-slate-900 text-[11px] rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500"
              placeholder="Age"
              type="number"
              value={demographics.age}
              onChange={(e) => setDemographics(d => ({ ...d, age: e.target.value }))}
            />
          </div>
          <input
            className="w-full bg-white text-slate-900 text-[11px] rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500"
            placeholder="Occupation"
            value={demographics.occupation}
            onChange={(e) => setDemographics(d => ({ ...d, occupation: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <select
              className="bg-white text-slate-900 text-[11px] rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500"
              value={demographics.familyStatus}
              onChange={(e) => setDemographics(d => ({ ...d, familyStatus: e.target.value }))}
            >
              <option>Single</option>
              <option>Married</option>
              <option>Married with Kids</option>
              <option>Divorced</option>
            </select>
            <input
              className="bg-white text-slate-900 text-[11px] rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>

          {/* CSV textarea with LLM prompt helper */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-slate-500">Transactions CSV</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-slate-400 hover:text-blue-500 transition-colors">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 bg-white border-slate-200" side="left">
                  <p className="text-[11px] font-medium text-slate-700 mb-2">
                    Paste this into ChatGPT / Claude to generate sample data:
                  </p>
                  <pre className="text-[9px] bg-slate-50 border border-slate-200 rounded-md p-2 whitespace-pre-wrap text-slate-600 max-h-32 overflow-y-auto mb-2" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(215 15% 82%) transparent" }}>
                    {LLM_PROMPT}
                  </pre>
                  <Button size="sm" variant="outline" className="w-full h-7 text-[11px]" onClick={handleCopyPrompt}>
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            <textarea
              className="w-full bg-white text-slate-900 text-[10px] font-mono rounded-md px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              rows={5}
              placeholder={"date,merchant_name,amount,mcc,merchant_zip\n2025-01-15,Whole Foods,87.50,5411,94102\n..."}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
          </div>

          <Button size="sm" className="w-full h-7 text-[11px]" onClick={handleLoad} disabled={!csvText.trim()}>
            Load Data
          </Button>
        </div>
      ) : !selected ? (
        <p className="text-[11px] text-slate-400 italic py-2">Select a customer above</p>
      ) : (
        <>
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
            <div className="max-h-[180px] overflow-y-auto">
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
