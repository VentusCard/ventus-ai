import { Play, User } from "lucide-react";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { getIntelligenceForCustomer, getSourceColor } from "./execDemoData";
import type { Transaction } from "./execDemoData";

interface Props {
  selectedIdx: number;
  onSelectCustomer: (idx: number) => void;
  onRunAnalysis: () => void;
  isRunning: boolean;
  phase: string;
  collectedIndices: number[];
  currentCardColor: string;
}

const SCROLL_DURATION = 6000;
const CARD_SCAN_DURATION = 1320;
const MAX_RENDERED_ROWS = 80;

const TxRow = ({
  tx,
  dim,
  highlight,
  highlightColor,
  sourceColor,
}: {
  tx: Transaction;
  dim: boolean;
  highlight?: boolean;
  highlightColor?: string;
  sourceColor?: string;
}) => (
  <div
    className="font-mono text-[10px] leading-tight px-2 py-[4px] rounded flex items-center gap-1.5 truncate transition-all duration-300"
    style={{
      color: highlight ? "#1e293b" : dim ? "#94a3b8" : "#334155",
      background: highlight ? `${highlightColor}18` : "transparent",
      borderLeft: highlight ? `2px solid ${highlightColor}` : "2px solid transparent",
    }}
  >
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

export default function ExecDemoLeftPanel({
  selectedIdx,
  onSelectCustomer,
  onRunAnalysis,
  isRunning,
  phase,
  collectedIndices,
  currentCardColor,
}: Props) {
  const execProfile = getIntelligenceForCustomer(selectedIdx);
  const transactions = execProfile.transactions;
  const cappedTxns = transactions.slice(0, MAX_RENDERED_ROWS);

  const collected = transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => collectedIndices.includes(i));
  const uncollected = transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => !collectedIndices.includes(i));

  const showScrolling = phase === "scroll";
  const showCollected = phase === "cardCycle" || phase === "hold";

  return (
    <div className="flex flex-col h-full">
      {/* Customer Selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
          Select Customer
        </div>
        <div className="space-y-1.5">
          {DEMO_CUSTOMERS.map((c, i) => {
            const isSelected = selectedIdx === i;
            const isActive = phase !== "idle";
            if (isActive && !isSelected) return null;
            return (
              <button
                key={c.id}
                onClick={() => !isRunning && onSelectCustomer(i)}
                className={`w-full text-left rounded-lg px-3 py-2 border transition-all duration-200 ${
                  isSelected
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                } ${isRunning ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold bg-blue-500 text-white">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-slate-800 truncate">{c.profile.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {c.profile.segment} · {c.lifestyleType} · {c.txnCount} txns
                    </div>
                  </div>
                  {isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectCustomer(selectedIdx); }}
                      className="text-[9px] text-blue-500 hover:text-blue-700 font-medium shrink-0"
                      style={{ pointerEvents: isRunning ? "none" : "auto" }}
                    >
                      Change
                    </button>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="flex-1 overflow-hidden relative px-4 pb-2">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
          Transaction Feed
        </div>

        {phase === "idle" && (
          <div className="text-[10px] text-slate-300 mt-2 font-mono">
            Click "Run Analysis" to begin...
          </div>
        )}

        {showScrolling && (
          <div className="absolute inset-x-4 top-6 bottom-0 overflow-hidden">
            <div
              className="space-y-0.5"
              style={{ animation: `exec-rapid-scroll ${SCROLL_DURATION}ms linear forwards` }}
            >
              {cappedTxns.map((tx, i) => (
                <TxRow key={`s-${i}`} tx={tx} dim={false} sourceColor={getSourceColor(transactions, tx.account)} />
              ))}
              {cappedTxns.map((tx, i) => (
                <TxRow key={`s2-${i}`} tx={tx} dim sourceColor={getSourceColor(transactions, tx.account)} />
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
                <TxRow key={`cs-${i}`} tx={tx} dim={false} sourceColor={getSourceColor(transactions, tx.account)} />
              ))}
              {cappedTxns.map((tx, i) => (
                <TxRow key={`cs2-${i}`} tx={tx} dim sourceColor={getSourceColor(transactions, tx.account)} />
              ))}
            </div>
          </div>
        )}

        {showCollected && (
          <div className="space-y-0.5" style={{ animation: "exec-fade-in 0.3s ease-out" }}>
            {collected.map(({ tx, i }) => (
              <div key={`col-${i}`} style={{ animation: "exec-collect-pulse 0.4s ease-out" }}>
                <TxRow
                  tx={tx}
                  dim={false}
                  highlight
                  highlightColor={currentCardColor}
                  sourceColor={getSourceColor(transactions, tx.account)}
                />
              </div>
            ))}
            {uncollected.map(({ tx, i }) => (
              <TxRow key={`unc-${i}`} tx={tx} dim sourceColor={getSourceColor(transactions, tx.account)} />
            ))}
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
          {isRunning ? "Analyzing..." : "Run Analysis"}
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
