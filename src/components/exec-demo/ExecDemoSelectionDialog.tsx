import { useState, useMemo, useEffect } from "react";
import { Pencil, Copy, Check, ArrowLeft, Play, ChevronDown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DEMO_CUSTOMERS, buildCustomerPrompt, parseUnifiedOutput } from "@/lib/demoData";
import { MCC_DESCRIPTIONS } from "@/lib/sampleData";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";

const SOURCE_COLORS: Record<string, string> = {
  Checking: "bg-slate-100 text-slate-600",
  "Cashback Card": "bg-emerald-50 text-emerald-700",
  "Travel Card": "bg-blue-50 text-blue-700",
  "Premium Card": "bg-rose-50 text-rose-700",
  Checks: "bg-orange-50 text-orange-700",
  ACH: "bg-slate-100 text-slate-600",
  Wire: "bg-red-50 text-red-700",
  Zelle: "bg-purple-50 text-purple-700",
  HSA: "bg-amber-50 text-amber-700",
};

interface RawRow {
  transaction_id: string;
  merchant_name: string;
  mcc_description: string;
  mcc: string;
  amount: string;
  date: string;
  zip_code: string;
  source: string;
}

function parseCsvRows(csv: string): RawRow[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (col: string) => header.indexOf(col);

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      const get = (col: string) => cols[idx(col)] || "";
      const mcc = get("mcc");
      return {
        transaction_id: get("transaction_id"),
        merchant_name: get("merchant_name"),
        mcc_description: MCC_DESCRIPTIONS[mcc] || get("description") || "—",
        mcc,
        amount: get("amount"),
        date: get("date"),
        zip_code: get("zip_code") || get("home_zip"),
        source: get("source"),
      };
    });
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIdx: number;
  onSelectCustomer: (idx: number) => void;
  onRunAnalysis: () => void;
  onLoadCustomCsv?: (csv: string, name: string) => void;
}

const DEFAULT_PERSONA =
  "A 35-year-old tech professional in San Francisco who loves hiking, craft coffee, and is saving for a first home.";

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
  const rawRows = useMemo(() => parseCsvRows(customer.csv), [customer.csv]);

  const sourceGroups = useMemo(() => {
    const map = new Map<string, RawRow[]>();
    for (const r of rawRows) {
      const key = r.source || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    const known = Object.keys(SOURCE_COLORS);
    const ordered: { source: string; rows: RawRow[] }[] = [];
    for (const k of known) {
      if (map.has(k)) {
        ordered.push({ source: k, rows: map.get(k)! });
        map.delete(k);
      }
    }
    for (const [k, rows] of map) ordered.push({ source: k, rows });
    return ordered;
  }, [rawRows]);

  const [openSources, setOpenSources] = useState<Record<string, boolean>>({});
  const [kycOpen, setKycOpen] = useState(false);
  useEffect(() => {
    setOpenSources({});
    setKycOpen(false);
  }, [customer.id]);

  const allOpen = sourceGroups.length > 0 && sourceGroups.every((g) => openSources[g.source]);
  const toggleAll = () => {
    if (allOpen) {
      setOpenSources({});
    } else {
      const next: Record<string, boolean> = {};
      sourceGroups.forEach((g) => {
        next[g.source] = true;
      });
      setOpenSources(next);
    }
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
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-[65vw] w-[65vw] h-[85vh] max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white flex flex-col [&>button[aria-label='Close']]:hidden [&>button.absolute.right-4.top-4]:hidden"
      >
        {/* Header */}
        <div className="px-8 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <img src={ventusLogo} alt="Ventus AI" className="h-9 w-auto" />
            <span className="text-sm text-slate-400">·</span>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Select a Customer Profile</h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Ingests a holistic picture of every customer: KYC, and every transaction across rails
          </p>
        </div>

        {/* Pills row */}
        <div className="px-8 py-3 border-b border-slate-100 shrink-0">
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
            {DEMO_CUSTOMERS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCustomer(i);
                  setShowCustomFlow(false);
                }}
                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                  selectedIdx === i && !showCustomFlow
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {c.profile.name}
              </button>
            ))}
            <button
              onClick={() => setShowCustomFlow(true)}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-150 whitespace-nowrap flex items-center gap-1 shrink-0 ${
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
          <div className="px-8 py-3 border-b border-slate-100 shrink-0">
            <div className="max-w-2xl space-y-3">
              <button
                onClick={() => setShowCustomFlow(false)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    1. Describe a persona
                  </div>
                  <textarea
                    value={personaInput}
                    onChange={(e) => setPersonaInput(e.target.value)}
                    rows={3}
                    className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    placeholder="E.g. A 45-year-old surgeon in Boston who plays golf..."
                  />
                  <button
                    onClick={handleCopyPrompt}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    2. Paste LLM output
                  </div>
                  <textarea
                    value={pasteValue}
                    onChange={(e) => setPasteValue(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none min-h-[140px]"
                    placeholder={"=== PROFILE ===\nname: ...\n\n=== TRANSACTIONS ===\ntransaction_id,merchant_name,..."}
                  />
                  <button
                    onClick={handleLoadCustomer}
                    disabled={!pasteValue.trim()}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
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

        {/* Transaction cards — grouped by source */}
        {!showCustomFlow && (
          <div className="flex-1 min-h-0 flex flex-col">
            {rawRows.length > 0 && (
              <div className="px-8 pt-3 pb-2 flex items-center justify-between shrink-0">
                <div className="text-sm text-slate-500">
                  {rawRows.length} transactions · {sourceGroups.length} sources
                </div>
                <button onClick={toggleAll} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  {allOpen ? "Collapse all" : "Expand all"}
                </button>
              </div>
            )}

            <ScrollArea className="flex-1 min-h-0 px-8 pb-2">
              <div className="space-y-2">
                {/* KYC card */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setKycOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-2 py-0.5 rounded text-sm font-medium whitespace-nowrap bg-indigo-50 text-indigo-700">
                        KYC
                      </span>
                      <span className="text-base font-semibold text-slate-700">{customer.profile.compliance.kycStatus}</span>
                      <span className="text-sm text-slate-400">·</span>
                      <span className="text-sm text-slate-500">Last reviewed {customer.profile.compliance.lastReview}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${kycOpen ? "rotate-180" : ""}`} />
                  </button>
                  {kycOpen && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 px-4 py-3 border-t border-slate-100">
                      {[
                        ["Name", customer.profile.name],
                        ["Segment", customer.profile.segment],
                        ["AUM", customer.profile.aum],
                        ["Tenure", customer.profile.tenure],
                        ["Age", customer.profile.demographics.age],
                        ["Occupation", customer.profile.demographics.occupation],
                        ["Industry", customer.profile.demographics.industry],
                        ["Family Status", customer.profile.demographics.familyStatus],
                        ["Income Level", customer.profile.demographics.incomeLevel],
                        ["Email", customer.profile.contact.email],
                        ["Phone", customer.profile.contact.phone],
                        ["Address", customer.profile.contact.address],
                        ["KYC Status", customer.profile.compliance.kycStatus],
                        ["Last Review", customer.profile.compliance.lastReview],
                        ["Next Review", customer.profile.compliance.nextReview],
                        ["Risk Profile", customer.profile.compliance.riskProfile],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
                          <div className="text-[15px] text-slate-800 truncate" title={String(value)}>
                            {value || "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {sourceGroups.map(({ source, rows }) => {
                  const isOpen = !!openSources[source];
                  const total = rows.reduce((sum, r) => {
                    const a = parseFloat(r.amount);
                    return sum + (isNaN(a) ? 0 : Math.abs(a));
                  }, 0);
                  const fmtTotal = `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  return (
                    <div key={source} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <button
                        onClick={() => setOpenSources((p) => ({ ...p, [source]: !p[source] }))}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-sm font-medium whitespace-nowrap ${SOURCE_COLORS[source] || "bg-slate-50 text-slate-500"}`}
                          >
                            {source}
                          </span>
                          <span className="text-base font-semibold text-slate-700">{rows.length} txns</span>
                          <span className="text-sm text-slate-400">·</span>
                          <span className="text-sm font-mono tabular-nums text-slate-500">{fmtTotal}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/60 border-b border-slate-200">
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap">
                                  ID
                                </th>
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap">
                                  Date
                                </th>
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap">
                                  Merchant
                                </th>
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap">
                                  MCC
                                </th>
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap">
                                  Description
                                </th>
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap text-right">
                                  Amount
                                </th>
                                <th className="text-slate-600 text-[13px] font-semibold uppercase tracking-wider px-3 py-1.5 whitespace-nowrap">
                                  Zip
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => {
                                const amt = parseFloat(row.amount);
                                const fmtAmt = isNaN(amt)
                                  ? row.amount
                                  : `$${Math.abs(amt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                return (
                                  <tr
                                    key={i}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                                  >
                                    <td className="px-3 py-1 text-slate-400 font-mono text-xs">
                                      {row.transaction_id || i + 1}
                                    </td>
                                    <td className="px-3 py-1 text-[13px] text-slate-600 tabular-nums whitespace-nowrap">
                                      {row.date}
                                    </td>
                                    <td
                                      className="px-3 py-1 text-[13px] font-medium text-slate-900 max-w-[260px] truncate"
                                      title={row.merchant_name}
                                    >
                                      {row.merchant_name}
                                    </td>
                                    <td className="px-3 py-1">
                                      {row.mcc ? (
                                        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-mono px-1.5 py-0.5 rounded">
                                          {row.mcc}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-slate-300">—</span>
                                      )}
                                    </td>
                                    <td
                                      className="px-3 py-1 text-[13px] font-mono text-slate-500 max-w-[260px] truncate"
                                      title={row.mcc_description}
                                    >
                                      {row.mcc_description}
                                    </td>
                                    <td className="px-3 py-1 text-right font-mono text-[13px] text-slate-900 tabular-nums whitespace-nowrap font-normal">
                                      {fmtAmt}
                                    </td>
                                    <td className="px-3 py-1 text-slate-500 text-xs">{row.zip_code || "—"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Digital Telemetry — Coming soon */}
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 overflow-hidden opacity-70 cursor-not-allowed">
                  <div className="w-full flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap bg-slate-200 text-slate-500">
                        Digital Telemetry
                      </span>
                      <span className="text-sm font-semibold text-slate-400">Coming soon</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">App, web & device signals</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>

              {rawRows.length === 0 && (
                <div className="text-center text-sm text-slate-300 py-16">No transactions available</div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleRun}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
