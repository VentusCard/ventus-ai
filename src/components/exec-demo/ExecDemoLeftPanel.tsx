import { Play, User, Pencil, Copy, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { buildCustomerPrompt, parseUnifiedOutput } from "@/lib/demoData";
import { getIntelligenceForCustomer } from "./execDemoData";
import type { Transaction, SignalEntry } from "./execDemoData";
import { getColor } from "./ExecDemoIntelPanel";
import { toast } from "sonner";

interface Props {
  selectedIdx: number;
  onSelectCustomer: (idx: number) => void;
  onRunAnalysis: () => void;
  onLoadCustomCsv?: (csv: string, name: string) => void;
  isRunning: boolean;
  phase: string;
  collectedIndices: number[];
  currentCardColor: string;
  isCustomMode?: boolean;
  customName?: string;
  customTransactions?: Transaction[];
  personaIcon?: string;
  personaTitle?: string;
  filteredIndices?: number[] | null;
  signalMap?: Record<number, SignalEntry>;
  activePillLabel?: string | null;
  activePillColor?: string;
  onClearFilter?: () => void;
}

const SCROLL_DURATION = 6000;
const CARD_SCAN_DURATION = 1320;
const MAX_RENDERED_ROWS = 80;

const TxRow = ({
  tx,
  dim,
  highlight,
  highlightColor,
  pillarColor,
}: {
  tx: Transaction;
  dim: boolean;
  highlight?: boolean;
  highlightColor?: string;
  pillarColor?: string;
}) => (
  <div
    className="font-mono text-[10px] leading-tight px-2 py-[4px] rounded flex items-center gap-1.5 truncate transition-all duration-300"
    style={{
      color: highlight ? "#1e293b" : dim ? "#94a3b8" : "#334155",
      background: highlight ? `${highlightColor}18` : "transparent",
      borderLeft: highlight
        ? `2px solid ${highlightColor}`
        : pillarColor
          ? `2px solid ${pillarColor}40`
          : "2px solid transparent",
    }}
  >
    {pillarColor && !dim && (
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: pillarColor }}
      />
    )}
    <span
      className="text-[8px] font-medium px-1 py-0 rounded shrink-0 tabular-nums"
      style={{
        color: dim ? "#94a3b8" : "#64748b",
        opacity: dim ? 0.5 : 1,
      }}
    >
      {tx.date}
    </span>
    <span className="truncate">{tx.merchant}</span>
    <span
      className="ml-auto shrink-0 tabular-nums"
      style={{ color: highlight ? highlightColor : dim ? "#94a3b8" : "#64748b" }}
    >
      {tx.amount}
    </span>
  </div>
);

const DEFAULT_PERSONA = "A 35-year-old tech professional in San Francisco who loves hiking, craft coffee, and is saving for a first home.";

export default function ExecDemoLeftPanel({
  selectedIdx,
  onSelectCustomer,
  onRunAnalysis,
  onLoadCustomCsv,
  isRunning,
  phase,
  collectedIndices,
  currentCardColor,
  isCustomMode,
  customName,
  customTransactions,
  personaIcon,
  personaTitle,
  filteredIndices,
  signalMap,
  activePillLabel,
  activePillColor = "#10b981",
  onClearFilter,
}: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [personaInput, setPersonaInput] = useState(DEFAULT_PERSONA);
  const [copied, setCopied] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [confirmedIdx, setConfirmedIdx] = useState<number | null>(null);

  const execProfile = isCustomMode ? null : getIntelligenceForCustomer(selectedIdx);
  const transactions = isCustomMode ? (customTransactions || []) : (execProfile?.transactions || []);
  const cappedTxns = transactions.slice(0, MAX_RENDERED_ROWS);
  const previewTxns = transactions.slice(0, 15);

  const handleCardClick = (i: number) => {
    if (isRunning) return;
    setConfirmedIdx(i);
    onSelectCustomer(i);
  };

  const handleChangeCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) return;
    setConfirmedIdx(null);
  };

  const collected = transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => collectedIndices.includes(i));
  const uncollected = transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => !collectedIndices.includes(i));

  const showScrolling = phase === "scroll";
  const showCollected = phase === "cardCycle" || phase === "hold";

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
    setShowCustom(false);
    setPasteValue("");
    toast.success(`Loaded ${name}`);
  };

  // Custom input view
  if (showCustom && !isCustomMode) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setShowCustom(false)}
            className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Back to customers
          </button>
          <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
            Custom Customer
          </div>
        </div>

        {/* Step 1: Persona + Copy */}
        <div className="px-4 space-y-2 mb-3">
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
        </div>

        {/* Step 2: Paste output */}
        <div className="px-4 flex-1 flex flex-col min-h-0 space-y-2">
          <div className="text-[10px] font-semibold text-slate-500">2. Paste LLM output</div>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            className="flex-1 w-full text-[10px] font-mono rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none min-h-[120px]"
            placeholder={"=== PROFILE ===\nname: ...\n\n=== TRANSACTIONS ===\ntransaction_id,merchant_name,..."}
          />
        </div>

        {/* Load button */}
        <div className="px-4 pb-4 pt-3">
          <button
            onClick={handleLoadCustomer}
            disabled={!pasteValue.trim()}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
              pasteValue.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Load Customer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Customer Selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
          Select Customer
        </div>
        <div className="space-y-1.5">
          {/* Custom mode active */}
          {isCustomMode && (
            <button
              className="w-full text-left rounded-lg px-3 py-2 border border-blue-300 bg-blue-50 shadow-sm cursor-default"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold bg-violet-500 text-white">
                  <Pencil className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-800 truncate">{customName || "Custom"}</div>
                  <div className="text-[9px] text-slate-400 truncate">Custom · Pasted Data</div>
                  {phase !== "idle" && personaTitle && (
                    <div className="text-[9px] italic text-violet-500 truncate mt-0.5">{personaIcon} {personaTitle}</div>
                  )}
                </div>
                {phase !== "idle" ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectCustomer(0); }}
                    className="text-[9px] text-blue-500 hover:text-blue-700 font-medium shrink-0"
                    style={{ pointerEvents: isRunning ? "none" : "auto" }}
                  >
                    Change
                  </button>
                ) : null}
              </div>
            </button>
          )}

          {/* Pre-built customers */}
          {!isCustomMode && DEMO_CUSTOMERS.map((c, i) => {
            const isSelected = confirmedIdx === i;
            const isHidden = confirmedIdx !== null && confirmedIdx !== i;
            return (
              <div
                key={c.id}
                className="transition-all duration-300 overflow-hidden"
                style={{
                  maxHeight: isHidden ? 0 : 80,
                  opacity: isHidden ? 0 : 1,
                  marginBottom: isHidden ? 0 : 6,
                }}
              >
                <button
                  onClick={() => handleCardClick(i)}
                  className={`w-full text-left rounded-lg px-4 py-3 border transition-all duration-200 ${
                    isSelected
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  } ${isRunning || isSelected ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-500 text-white shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-slate-800 truncate">{c.profile.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.profile.segment} · {c.txnCount} txns
                      </div>
                      <div className="text-[10px] text-blue-400 truncate">{c.lifestyleType}</div>
                    </div>
                    {isSelected && (
                      <button
                        onClick={handleChangeCustomer}
                        className="text-[10px] text-blue-500 hover:text-blue-700 font-medium shrink-0"
                        style={{ pointerEvents: isRunning ? "none" : "auto" }}
                      >
                        Change
                      </button>
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          {/* Custom button (only when no customer confirmed) */}
          {!isCustomMode && (
            <div
              className="transition-all duration-300 overflow-hidden"
              style={{
                maxHeight: confirmedIdx !== null ? 0 : 80,
                opacity: confirmedIdx !== null ? 0 : 1,
              }}
            >
              <button
                onClick={() => setShowCustom(true)}
                className="w-full text-left rounded-lg px-4 py-3 border border-dashed border-slate-300 bg-white hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-violet-100 text-violet-600 shrink-0">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-slate-600">Custom</div>
                    <div className="text-[11px] text-slate-400">Paste your own data</div>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="flex-1 overflow-hidden relative px-4 pb-2">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
          Transaction Feed
        </div>

        {phase === "idle" && (
          (isCustomMode && transactions.length > 0) || (!isCustomMode && confirmedIdx !== null) ? (
            <div className="absolute inset-x-4 top-6 bottom-0 overflow-y-auto space-y-0.5 opacity-60" style={{ animation: "exec-fade-in 0.3s ease-out" }}>
              {previewTxns.map((tx, i) => (
                <TxRow key={`idle-${i}`} tx={tx} dim={false} />
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-slate-300 mt-2 font-mono">
              Select a customer to preview transactions...
            </div>
          )
        )}

        {showScrolling && (
          <div className="absolute inset-x-4 top-6 bottom-0 overflow-hidden">
            <div
              className="space-y-0.5"
              style={{ animation: `exec-rapid-scroll ${SCROLL_DURATION}ms linear forwards` }}
            >
              {cappedTxns.map((tx, i) => (
                <TxRow key={`s-${i}`} tx={tx} dim={false} />
              ))}
              {cappedTxns.map((tx, i) => (
                <TxRow key={`s2-${i}`} tx={tx} dim />
              ))}
            </div>
          </div>
        )}

        {phase === "cardScan" && (
          <div className="absolute inset-x-4 top-6 bottom-0 overflow-hidden">
            <div
              className="space-y-0.5"
              style={{ animation: `exec-card-scroll ${CARD_SCAN_DURATION}ms linear forwards` }}
            >
              {cappedTxns.map((tx, i) => (
                <TxRow key={`cs-${i}`} tx={tx} dim={false} />
              ))}
              {cappedTxns.map((tx, i) => (
                <TxRow key={`cs2-${i}`} tx={tx} dim />
              ))}
            </div>
          </div>
        )}

        {showCollected && (
          <div className="space-y-0.5" style={{ animation: "exec-fade-in 0.3s ease-out" }}>
            {/* Pill filter header */}
            {filteredIndices && activePillLabel && (
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[9px] font-semibold text-emerald-600">
                  Showing {filteredIndices.length} txns for "{activePillLabel}"
                </span>
                <button
                  onClick={onClearFilter}
                  className="text-[9px] text-blue-500 hover:text-blue-700 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
            {filteredIndices ? (
              <>
                {transactions.map((tx, i) => {
                  const isMatch = filteredIndices.includes(i);
                  if (!isMatch) return null;
                  return (
                    <div key={`filt-${i}`} style={{ animation: "exec-collect-pulse 0.4s ease-out" }}>
                      <TxRow tx={tx} dim={false} highlight highlightColor={activePillColor} pillarColor={signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined} />
                    </div>
                  );
                })}
                <div className="border-t border-slate-100 my-1" />
                {transactions.map((tx, i) => {
                  if (filteredIndices.includes(i)) return null;
                  const pc = signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined;
                  return <TxRow key={`dim-${i}`} tx={tx} dim pillarColor={pc} />;
                })}
              </>
            ) : (
              <>
                {collected.map(({ tx, i }) => (
                  <div key={`col-${i}`} style={{ animation: "exec-collect-pulse 0.4s ease-out" }}>
                    <TxRow tx={tx} dim={false} highlight highlightColor={currentCardColor} pillarColor={signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined} />
                  </div>
                ))}
                {uncollected.map(({ tx, i }) => {
                  const pc = signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined;
                  return <TxRow key={`unc-${i}`} tx={tx} dim pillarColor={pc} />;
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Run Analysis Button */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={onRunAnalysis}
          disabled={isRunning}
          className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
            isRunning
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Analyzing..." : "Behavioral Enrichment"}
        </button>
      </div>

      <style>{`
        @keyframes exec-rapid-scroll {
          0% { transform: translateY(0); }
          90% { transform: translateY(-85%); }
          100% { transform: translateY(-85%); }
        }
        @keyframes exec-card-scroll {
          0% { transform: translateY(0); }
          80% { transform: translateY(-75%); }
          100% { transform: translateY(-75%); }
        }
        @keyframes exec-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes exec-collect-pulse {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
