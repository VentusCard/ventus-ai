import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Play, User, Pencil } from "lucide-react";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { getIntelligenceForCustomer } from "./execDemoData";
import type { Transaction, SignalEntry } from "./execDemoData";
import { getColor } from "./ExecDemoIntelPanel";

const SOURCE_COLORS: Record<string, string> = {
  "Checking": "bg-slate-100 text-slate-600",
  "Cashback Card": "bg-emerald-50 text-emerald-700",
  "Travel Card": "bg-blue-50 text-blue-700",
  "Premium Card": "bg-rose-50 text-rose-700",
  "Checks": "bg-orange-50 text-orange-700",
  "ACH": "bg-slate-100 text-slate-600",
  "Wire": "bg-red-50 text-red-700",
  "Zelle": "bg-purple-50 text-purple-700",
  "HSA": "bg-amber-50 text-amber-700",
};

interface Props {
  selectedIdx: number;
  onSelectCustomer: (idx: number) => void;
  onRunAnalysis: () => void;
  onLoadCustomCsv?: (csv: string, name: string) => void;
  onChangeCustomer?: () => void;
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
  enriched?: boolean;
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
  
  signalEntry,
  enriched,
  txIndex,
}: {
  tx: Transaction;
  dim: boolean;
  highlight?: boolean;
  highlightColor?: string;
  pillarColor?: string;
  
  signalEntry?: SignalEntry;
  enriched?: boolean;
  txIndex?: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (dim) return;
    const rect = rowRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ x: rect.left + 16, y: rect.top });
      setHovered(true);
    }
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="font-mono text-[11px] leading-snug px-2 py-[5px] rounded flex items-center gap-2 truncate transition-all duration-300"
        style={{
          color: highlight ? "#1e293b" : dim ? "#94a3b8" : "#0f172a",
          background: highlight ? `${highlightColor}18` : "transparent",
          borderLeft: highlight
            ? `3px solid ${highlightColor}`
            : pillarColor
              ? `3px solid ${pillarColor}80`
              : "3px solid transparent",
        }}
      >
        {pillarColor && !dim && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: pillarColor }}
          />
        )}
        <span
          className="text-[9px] font-medium px-1 py-0 rounded shrink-0 tabular-nums"
          style={{
            color: dim ? "#94a3b8" : "#334155",
            opacity: dim ? 0.5 : 1,
          }}
        >
          {tx.date}
        </span>
        <span className="truncate font-medium">{tx.merchant}</span>
        <span
          className="shrink-0 tabular-nums font-semibold"
          style={{ color: tx.amount?.startsWith("$") && !tx.amount?.startsWith("($") ? "#059669" : highlight ? highlightColor : dim ? "#94a3b8" : "#475569" }}
        >
          {tx.amount}
        </span>
        {signalEntry?.category && pillarColor && !dim && (
          <span
            className="shrink-0 rounded px-1.5 py-[2px] text-[7.5px] font-semibold text-white/90"
            style={{ background: `${pillarColor}cc` }}
          >
            {signalEntry.category}
          </span>
        )}
      </div>
      {hovered && createPortal(
        <div
          className="fixed pointer-events-none bg-slate-800 text-white rounded-md px-3 py-2 shadow-2xl space-y-1 max-w-[440px]"
          style={{ left: coords.x, top: coords.y - 140, zIndex: 9999 }}
        >
          {/* Transaction header */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-300 font-semibold">
              Transaction{typeof txIndex === "number" ? ` #${txIndex + 1}` : ""}
            </span>
            {tx.source && (
              <span className={`inline-block px-1.5 py-px rounded text-[9px] font-semibold ${SOURCE_COLORS[tx.source] || "bg-slate-100 text-slate-600"}`}>
                {tx.source}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <span className="text-slate-400">Date:</span>
            <span className="text-slate-100 font-medium">{tx.date}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Amount:</span>
            <span className="text-slate-100 font-semibold tabular-nums">{tx.amount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Merchant:</span>
            <span className="text-slate-100 font-medium truncate">{tx.merchant}</span>
          </div>
          {signalEntry && (
            <>
              <div className="flex items-center gap-1.5 text-[11px] border-t border-slate-700 pt-1">
                <span className="text-slate-400 font-medium">MCC:</span>
                <span className="text-cyan-300 font-semibold">{signalEntry.mcc || "—"}</span>
                <span className="mx-0.5 text-slate-600">·</span>
                <span className="text-slate-200">{signalEntry.mccDescription || "Unknown"}</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-semibold tracking-wide border-t border-slate-700 pt-1">
                Ventus Semantic Enrichment:
              </div>
              <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                <span className="text-slate-400">Pillar:</span>
                <span className={enriched ? "font-semibold" : "text-slate-500"} style={enriched ? { color: pillarColor || "#67e8f9" } : undefined}>{enriched ? signalEntry.pillar : "—"}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Category:</span>
                <span className={enriched ? "text-slate-200" : "text-slate-500"}>{enriched ? (signalEntry.category || "—") : "—"}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Sub:</span>
                <span className={enriched ? "text-slate-200" : "text-slate-500"}>{enriched ? signalEntry.label : "—"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                <span className="text-slate-400">Tier:</span>
                <span className={enriched ? "text-slate-200" : "text-slate-500"}>{enriched ? (signalEntry.tier || "—") : "—"}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Frequency:</span>
                <span className={enriched ? "text-slate-200" : "text-slate-500"}>{enriched ? (signalEntry.frequency || "—") : "—"}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Amount (parsed):</span>
                <span className={enriched ? "text-slate-200 tabular-nums" : "text-slate-500"}>{enriched ? `$${signalEntry.amount.toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Confidence:</span>
                {enriched ? (
                  <span className={`font-semibold ${(signalEntry.confidence ?? 0) >= 0.8 ? "text-emerald-400" : (signalEntry.confidence ?? 0) >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                    {(signalEntry.confidence ?? 0) >= 0.8 ? "High" : (signalEntry.confidence ?? 0) >= 0.5 ? "Medium" : "Low"} ({signalEntry.confidence ?? "—"})
                  </span>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
            </>
          )}
          {!signalEntry && (
            <div className="text-[10px] text-slate-500 italic border-t border-slate-700 pt-1">
              Run analysis to see semantic enrichment
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

const DEFAULT_PERSONA = "A 35-year-old tech professional in San Francisco who loves hiking, craft coffee, and is saving for a first home.";

export default function ExecDemoLeftPanel({
  selectedIdx,
  onSelectCustomer,
  onRunAnalysis,
  onLoadCustomCsv,
  onChangeCustomer,
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
  enriched,
}: Props) {
  const execProfile = isCustomMode ? null : getIntelligenceForCustomer(selectedIdx);
  const transactions = isCustomMode ? (customTransactions || []) : (execProfile?.transactions || []);
  const cappedTxns = transactions.slice(0, MAX_RENDERED_ROWS);

  const collected = transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => collectedIndices.includes(i));
  const uncollected = transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => !collectedIndices.includes(i));

  const showScrolling = phase === "scroll";
  const showCollected = phase === "cardCycle" || phase === "hold";

  const currentCustomer = isCustomMode ? null : DEMO_CUSTOMERS[selectedIdx];

  return (
    <div className="flex flex-col h-full">
      {/* Current Customer Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
            Customer
          </div>
          {!isRunning && (
            <button
              onClick={onChangeCustomer}
              className="text-[10px] text-blue-500 hover:text-blue-700 font-medium"
            >
              Change
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 border border-blue-200 bg-blue-50/60">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold bg-blue-500 text-white shrink-0">
            {isCustomMode ? <Pencil className="w-3 h-3" /> : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-slate-800 truncate">
              {isCustomMode ? (customName || "Custom") : currentCustomer?.profile.name}
              {!isCustomMode && currentCustomer && (
                <span className="text-[9px] font-normal text-slate-400 ml-1.5">{currentCustomer.txnCount} txns</span>
              )}
            </div>
            {isCustomMode && (
              <div className="text-[9px] text-slate-400 truncate">Custom · Pasted Data</div>
            )}
            {!isCustomMode && currentCustomer && (
              <div className="text-[9px] text-slate-500 truncate mt-0.5">
                {currentCustomer.zip} · {currentCustomer.profile.demographics?.incomeLevel} · {currentCustomer.profile.demographics?.familyStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="flex-1 overflow-hidden relative px-4 pb-2 min-h-0">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
          Transaction Feed
        </div>

        {phase === "idle" && transactions.length > 0 && (
            <div className="absolute inset-x-4 top-6 bottom-0 overflow-y-auto scrollbar-light space-y-0.5 opacity-60" style={{ animation: "exec-fade-in 0.3s ease-out" }}>
              {cappedTxns.map((tx, i) => (
                <TxRow key={`idle-${i}`} tx={tx} dim={false} enriched={enriched} txIndex={i} signalEntry={signalMap?.[i]} pillarColor={signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined} />
              ))}
            </div>
        )}

        {phase === "idle" && transactions.length === 0 && (
            <div className="text-[10px] text-slate-300 mt-2 font-mono">
              Select a customer to preview transactions...
            </div>
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
          <div className="absolute inset-x-4 top-6 bottom-0 overflow-y-auto scrollbar-light space-y-0.5" style={{ animation: "exec-fade-in 0.3s ease-out" }}>
            {/* Pill filter header */}
            {filteredIndices && activePillLabel && (
              <div className="flex items-center justify-between mb-1.5 px-1 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-1">
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
                      <TxRow tx={tx} dim={false} highlight highlightColor={activePillColor} enriched={enriched} txIndex={i} pillarColor={signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined} signalEntry={signalMap?.[i]} />
                    </div>
                  );
                })}
                <div className="border-t border-slate-100 my-1" />
                {transactions.map((tx, i) => {
                  if (filteredIndices.includes(i)) return null;
                  const pc = signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined;
                  return <TxRow key={`dim-${i}`} tx={tx} dim enriched={enriched} txIndex={i} pillarColor={pc} signalEntry={signalMap?.[i]} />;
                })}
              </>
            ) : (
              <>
                {transactions.map((tx, i) => {
                  const pc = signalMap?.[i] ? getColor(signalMap[i].pillar).dot : undefined;
                  return <TxRow key={`all-${i}`} tx={tx} dim={false} enriched={enriched} txIndex={i} pillarColor={pc} signalEntry={signalMap?.[i]} />;
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Run Analysis Button — hidden once analysis completes */}
      {phase !== "hold" && (
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
            {isRunning ? "Analyzing..." : "Semantic Enrichment"}
          </button>
        </div>
      )}

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
