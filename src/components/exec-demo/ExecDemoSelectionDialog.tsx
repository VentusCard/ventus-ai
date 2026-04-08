import { useState } from "react";
import { User, Pencil, Copy, Check, ArrowLeft, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DEMO_CUSTOMERS, buildCustomerPrompt, parseUnifiedOutput } from "@/lib/demoData";
import type { DemoCustomer } from "@/lib/demoData";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIdx: number;
  onSelectCustomer: (idx: number) => void;
  onRunAnalysis: () => void;
  onLoadCustomCsv?: (csv: string, name: string) => void;
}

const DEFAULT_PERSONA = "A 35-year-old tech professional in San Francisco who loves hiking, craft coffee, and is saving for a first home.";

export default function ExecDemoSelectionDialog({
  open,
  onOpenChange,
  selectedIdx,
  onSelectCustomer,
  onRunAnalysis,
  onLoadCustomCsv,
}: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showCustomFlow, setShowCustomFlow] = useState(false);
  const [personaInput, setPersonaInput] = useState(DEFAULT_PERSONA);
  const [copied, setCopied] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  const previewIdx = hoveredIdx ?? selectedIdx;
  const customer = DEMO_CUSTOMERS[previewIdx];

  const handleSelect = (idx: number) => {
    onSelectCustomer(idx);
  };

  const handleRun = () => {
    onOpenChange(false);
    onRunAnalysis();
  };

  const handleCopyPrompt = () => {
    const prompt = buildCustomerPrompt(personaInput);
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied — paste into ChatGPT or Claude");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadCustomer = () => {
    const parsed = parseUnifiedOutput(pasteValue);
    if (!parsed) {
      toast.error("Could not parse output. Make sure it contains === PROFILE === and === TRANSACTIONS === blocks.");
      return;
    }
    const name = parsed.demographics.name || "Custom Customer";
    onLoadCustomCsv?.(parsed.csv, name);
    setShowCustomFlow(false);
    setPasteValue("");
    onOpenChange(false);
    toast.success(`Loaded ${name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[72vw] w-[72vw] h-[82vh] max-h-[82vh] p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">
            Ventus AI · Select a Customer Profile
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Choose a sample customer to explore behavioral enrichment
          </p>
        </div>

        {/* Body — two columns */}
        <div className="flex-1 min-h-0 grid grid-cols-[340px_1fr]">
          {/* Left — Customer Cards */}
          <div className="border-r border-slate-100 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {showCustomFlow ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCustomFlow(false)}
                      className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to customers
                    </button>

                    <div className="text-[10px] font-semibold text-slate-500">1. Describe a persona</div>
                    <textarea
                      value={personaInput}
                      onChange={(e) => setPersonaInput(e.target.value)}
                      rows={3}
                      className="w-full text-[11px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      placeholder="E.g. A 45-year-old surgeon in Boston who plays golf..."
                    />
                    <button
                      onClick={handleCopyPrompt}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy Prompt"}
                    </button>

                    <div className="text-[10px] font-semibold text-slate-500">2. Paste LLM output</div>
                    <textarea
                      value={pasteValue}
                      onChange={(e) => setPasteValue(e.target.value)}
                      className="w-full text-[10px] font-mono rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none min-h-[160px]"
                      placeholder={"=== PROFILE ===\nname: ...\n\n=== TRANSACTIONS ===\ntransaction_id,merchant_name,..."}
                    />
                    <button
                      onClick={handleLoadCustomer}
                      disabled={!pasteValue.trim()}
                      className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-semibold transition-all ${
                        pasteValue.trim()
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Load Customer
                    </button>
                  </div>
                ) : (
                  <>
                    {DEMO_CUSTOMERS.map((c, i) => (
                      <CustomerCard
                        key={c.id}
                        customer={c}
                        isSelected={selectedIdx === i}
                        onSelect={() => handleSelect(i)}
                        onHover={() => setHoveredIdx(i)}
                        onLeave={() => setHoveredIdx(null)}
                      />
                    ))}
                    {/* Custom card */}
                    <button
                      onClick={() => setShowCustomFlow(true)}
                      className="w-full text-left rounded-xl px-4 py-3 border border-dashed border-slate-300 bg-white hover:border-violet-300 hover:bg-violet-50/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-violet-100 text-violet-600 shrink-0">
                          <Pencil className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-slate-600">Custom</div>
                          <div className="text-[10px] text-slate-400">Paste your own transaction data</div>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right — Transaction Preview */}
          <div className="flex flex-col min-h-0">
            {/* Preview header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold text-slate-800">{customer.profile.name}</div>
                  <div className="text-[11px] text-slate-400">{customer.lifestyleType}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-slate-700">{customer.txnCount} <span className="text-[10px] font-normal text-slate-400">txns</span></div>
                    <div className="text-[11px] text-slate-500">{customer.txnTotal}</div>
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                <span>Industry: <strong className="text-slate-700">{customer.profile.demographics?.industry || "—"}</strong></span>
                <span>·</span>
                <span>Income: <strong className="text-slate-700">{customer.profile.demographics?.incomeLevel || "—"}</strong></span>
                <span>·</span>
                <span>{customer.dateRange}</span>
              </div>

              {/* Pillar chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {customer.topPillars.map((p) => (
                  <span
                    key={p.name}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600"
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                    <span className="text-slate-400">{p.pct}%</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Transaction table */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-5 py-3">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-3">Date</th>
                      <th className="pb-2 pr-3">Merchant</th>
                      <th className="pb-2 pr-3">Category</th>
                      <th className="pb-2 pr-3 text-right">Amount</th>
                      <th className="pb-2 pr-3">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.sampleTransactions.map((tx, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-1.5 pr-3 text-slate-500 tabular-nums whitespace-nowrap">{tx.date}</td>
                        <td className="py-1.5 pr-3 font-medium text-slate-800">{tx.merchant}</td>
                        <td className="py-1.5 pr-3">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-1.5 pr-3 text-right font-semibold text-slate-700 tabular-nums">{tx.amount}</td>
                        <td className="py-1.5 text-slate-400 text-[10px]">{tx.source || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {customer.sampleTransactions.length === 0 && (
                  <div className="text-center text-[11px] text-slate-300 py-12">
                    No sample transactions available
                  </div>
                )}

                {/* Source summary */}
                {customer.sourceCount > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500">{customer.sourceCount} source{customer.sourceCount > 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{customer.dateRange}</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleRun}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            <Play className="w-4 h-4" />
            Run Behavioral Enrichment
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CustomerCard({
  customer,
  isSelected,
  onSelect,
  onHover,
  onLeave,
}: {
  customer: DemoCustomer;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`w-full text-left rounded-xl px-3.5 py-3 border transition-all duration-200 ${
        isSelected
          ? "border-blue-400 bg-blue-50/80 shadow-sm ring-1 ring-blue-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isSelected ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          <User className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-bold text-slate-800 truncate">{customer.profile.name}</div>
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{customer.lifestyleType}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-600">{customer.txnCount}</span> txns · <span className="font-semibold text-slate-600">{customer.txnTotal}</span>
          </div>
          {/* Pillar chips */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {customer.topPillars.slice(0, 4).map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500"
              >
                <span>{p.icon}</span>
                <span>{p.pct}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
