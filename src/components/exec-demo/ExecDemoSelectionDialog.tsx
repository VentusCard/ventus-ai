import { useState } from "react";
import { Pencil, Copy, Check, ArrowLeft, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DEMO_CUSTOMERS, buildCustomerPrompt, parseUnifiedOutput } from "@/lib/demoData";
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
  const [showCustomFlow, setShowCustomFlow] = useState(false);
  const [personaInput, setPersonaInput] = useState(DEFAULT_PERSONA);
  const [copied, setCopied] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  const customer = DEMO_CUSTOMERS[selectedIdx];

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
      <DialogContent className="max-w-[85vw] w-[85vw] h-[85vh] max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">
            Ventus AI · Select a Customer Profile
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Choose a sample customer to explore behavioral enrichment
          </p>
        </div>

        {/* Pills row */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {DEMO_CUSTOMERS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { onSelectCustomer(i); setShowCustomFlow(false); }}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-150 whitespace-nowrap ${
                  selectedIdx === i && !showCustomFlow
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {c.profile.name} · {c.txnCount} txns
              </button>
            ))}
            <button
              onClick={() => setShowCustomFlow(true)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 ${
                showCustomFlow
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white border border-dashed border-slate-300 text-slate-500 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              <Pencil className="w-3 h-3" />
              Custom
            </button>
          </div>
        </div>

        {/* Custom flow (inline, between pills and table) */}
        {showCustomFlow && (
          <div className="px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="max-w-2xl space-y-3">
              <button
                onClick={() => setShowCustomFlow(false)}
                className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">1. Describe a persona</div>
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
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">2. Paste LLM output</div>
                  <textarea
                    value={pasteValue}
                    onChange={(e) => setPasteValue(e.target.value)}
                    className="w-full text-[10px] font-mono rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none min-h-[88px]"
                    placeholder={"=== PROFILE ===\nname: ...\n\n=== TRANSACTIONS ===\ntransaction_id,merchant_name,..."}
                  />
                  <button
                    onClick={handleLoadCustomer}
                    disabled={!pasteValue.trim()}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-semibold transition-all ${
                      pasteValue.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Load Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction table — full width */}
        {!showCustomFlow && (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Table header info */}
            <div className="px-6 pt-3 pb-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-slate-800">{customer.profile.name}</span>
                <span className="text-[11px] text-slate-400">{customer.txnCount} transactions · {customer.txnTotal} · {customer.dateRange}</span>
              </div>
            </div>

            {/* Scrollable table */}
            <ScrollArea className="flex-1 min-h-0 px-6">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-left text-[9px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <th className="pb-2 pr-4 pt-1">Date</th>
                    <th className="pb-2 pr-4 pt-1">Merchant</th>
                    <th className="pb-2 pr-4 pt-1">Category</th>
                    <th className="pb-2 pr-4 pt-1 text-right">Amount</th>
                    <th className="pb-2 pr-4 pt-1">Zip Code</th>
                    <th className="pb-2 pt-1">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.sampleTransactions.map((tx, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-1.5 pr-4 text-slate-500 tabular-nums whitespace-nowrap">{tx.date}</td>
                      <td className="py-1.5 pr-4 font-medium text-slate-800">{tx.merchant}</td>
                      <td className="py-1.5 pr-4">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-right font-semibold text-slate-700 tabular-nums">{tx.amount}</td>
                      <td className="py-1.5 pr-4 text-slate-400 text-[10px]">{tx.zip_code || "—"}</td>
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
            </ScrollArea>
          </div>
        )}

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
