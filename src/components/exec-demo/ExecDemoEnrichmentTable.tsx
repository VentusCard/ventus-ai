import { useEffect, useRef, useState } from "react";
import { getColor } from "./ExecDemoIntelPanel";
import type { EnrichedTransaction } from "./execDemoData";
import { MCC_DESCRIPTIONS } from "@/lib/sampleData";
import { getFlow } from "@/lib/transactionFlow";
import type { ExternalIntelSignal } from "@/lib/externalIntelligenceSignals";
import { Sparkles } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  "Checking": "bg-slate-100 text-slate-600",
  "Cashback Card": "bg-emerald-50 text-emerald-700",
  "Travel Card": "bg-blue-50 text-blue-700",
  "Premium Card": "bg-rose-50 text-rose-700",
  "HSA": "bg-amber-50 text-amber-700",
  "ACH": "bg-slate-100 text-slate-600",
  "Wire": "bg-red-50 text-red-700",
  "Zelle": "bg-purple-50 text-purple-700",
  "Checks": "bg-orange-50 text-orange-700",
};

const getTierColor = (t: string) => {
  switch (t) {
    case "Premium": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Standard": return "bg-blue-50 text-blue-700 border-blue-200";
    case "Budget": return "bg-teal-50 text-teal-700 border-teal-200";
    default: return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

const getFrequencyColor = (f: string) => {
  switch (f) {
    case "Weekly": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Monthly": return "bg-violet-50 text-violet-700 border-violet-200";
    case "Occasional": return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Annually": return "bg-orange-50 text-orange-700 border-orange-200";
    case "One-Time": return "bg-slate-50 text-slate-600 border-slate-200";
    default: return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

/** Raw row used while AI enrichment is still pending */
export interface RawRow {
  transaction_id?: string;
  source?: string;
  date?: string;
  merchant_name: string;
  description?: string;
  mcc?: string;
  amount: number;
}

interface Props {
  /** Enriched transactions (final state). Render takes precedence over rawRows. */
  transactions: EnrichedTransaction[];
  /** Raw rows shown while waiting for AI. If provided, missing-enriched rows render as shimmers. */
  rawRows?: RawRow[];
  /** When true, drops the outer rounded border so the table sits flush with its parent. */
  flush?: boolean;
  /** When provided, rows at these indices are highlighted; others are dimmed. */
  highlightedIndices?: number[] | null;
  /** Accent color used for the highlight border / tint. */
  highlightColor?: string;
  /** Active pill label (used in the "Showing N of M" strip). */
  activePillLabel?: string | null;
  /** Called when the user clicks Clear in the highlight strip. */
  onClearHighlight?: () => void;
  /** Called when the user clicks a Pillar pill inside the table to filter by that pillar. */
  onPillarClick?: (pillar: string) => void;
  /** External Intelligence signals rendered as extra rows at the bottom (no merchant/amount schema). */
  externalSignals?: ExternalIntelSignal[];
  /** Id of the external signal currently activated by a pill click — highlights that row. */
  activeExternalSignalId?: string | null;
}

// Column widths (kept in sync with skeleton in ExecDemoIntelPanel)
const COL = {
  date: "w-[44px]",
  merchant: "w-[112px]",
  description: "w-[52px]",
  mcc: "w-[32px]",
  amount: "w-[58px]",
  source: "w-[94px]",
  pillar: "w-[184px]",
  category: "w-[112px]",
  subs: "w-[132px]",
  tier: "w-[68px]",
  freq: "w-[92px]",
};

// Compact "MM/DD" date formatter — keeps the column narrow.
const formatDateCompact = (raw?: string): string => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${m}/${day}`;
  }
  const isoMatch = raw.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}/${isoMatch[2]}`;
  return raw;
};

const ShimmerCell = ({ width = "80%", height = 14, rounded = "rounded" }: { width?: string; height?: number; rounded?: string }) => (
  <span
    className={`inline-block bg-slate-200/70 animate-pulse ${rounded}`}
    style={{ width, height }}
  />
);

export default function ExecDemoEnrichmentTable({ transactions, rawRows, flush, highlightedIndices, highlightColor = "#0ea5e9", activePillLabel, onClearHighlight, onPillarClick, externalSignals, activeExternalSignalId }: Props) {
  // Determine source rows: prefer enriched if we have any; otherwise use raw rows.
  // When both exist, build a unified list keyed by index — enriched cells from `transactions`,
  // raw fields from `rawRows` for any rows where enrichment hasn't arrived yet.
  const enrichedCount = transactions.length;

  // One-shot cascade: only animate enriched cells when AI results FIRST arrive,
  // not on mount (shimmer phase) and not on pill clicks/re-sorts later.
  const [animateReveal, setAnimateReveal] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const prevEnrichedCount = useRef(0);
  useEffect(() => {
    if (prevEnrichedCount.current === 0 && enrichedCount > 0) {
      setRevealKey((k) => k + 1);
      setAnimateReveal(true);
      const t = setTimeout(() => setAnimateReveal(false), 4000);
      prevEnrichedCount.current = enrichedCount;
      return () => clearTimeout(t);
    }
    prevEnrichedCount.current = enrichedCount;
  }, [enrichedCount]);
  const rawCount = rawRows?.length ?? 0;
  const totalRows = Math.max(enrichedCount, rawCount);

  if (totalRows === 0) {
    return (
      <p className="text-[13px] text-slate-400 italic py-4 text-center">
        Awaiting enriched transactions…
      </p>
    );
  }

  const wrapperCls = flush
    ? "border border-slate-200 rounded-xl overflow-auto exec-light-scroll bg-white h-full"
    : "border border-slate-200 rounded-xl overflow-auto exec-light-scroll bg-white";

  const hasPending = rawCount > 0 && enrichedCount < rawCount;
  const highlightSet = highlightedIndices && highlightedIndices.length > 0 ? new Set(highlightedIndices) : null;
  const externals = externalSignals ?? [];
  const externalActive = !!activeExternalSignalId;
  const matchedCount = highlightSet ? highlightSet.size : externalActive ? 1 : 0;
  const showStrip = (highlightSet && activePillLabel) || (externalActive && activePillLabel);

  // When the user activates an external-intel pill we render just that one
  // signal as a single row (with a swapped violet Tier-1 header) instead of
  // the full transaction list — makes the "from outside data provider" nature
  // obvious without leaving the familiar table layout.
  const activeExternal = externalActive
    ? externals.find((s) => s.id === activeExternalSignalId) ?? null
    : null;
  const activeExternalConf = activeExternal
    ? activeExternal.confidence > 1
      ? Math.round(activeExternal.confidence)
      : Math.round(activeExternal.confidence * 100)
    : 0;
  const activeExternalEvidence = activeExternal?.evidence?.[0];

  return (

    <div className={`${wrapperCls} ${animateReveal ? "exec-cascade-on" : ""}`} style={{ maxHeight: "100%" }}>
      {showStrip && (
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ background: `${highlightColor}14`, borderColor: `${highlightColor}55` }}
        >
          <span className="text-[13px] font-semibold" style={{ color: highlightColor }}>
            {externalActive ? (
              <>Showing <span className="tabular-nums">1</span> external signal for "{activePillLabel}"</>
            ) : (
              <>Showing <span className="tabular-nums">{matchedCount}</span> of <span className="tabular-nums">{totalRows}</span> transactions for "{activePillLabel}"</>
            )}
          </span>
          {onClearHighlight && (
            <button
              onClick={onClearHighlight}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-800 underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <table className="w-full min-w-[912px] text-left border-collapse table-fixed">
        <colgroup>
          <col className={COL.source} />
          <col className={COL.date} />
          <col className={COL.merchant} />
          <col className={COL.mcc} />
          <col className={COL.description} />
          <col className={COL.amount} />
          <col className={COL.pillar} />
          <col className={COL.category} />
          <col className={COL.subs} />
          <col className={COL.freq} />
        </colgroup>
        <thead className="sticky top-0 z-10">
          {/* Tier 1 — Raw vs Enriched grouping (or External Signal takeover) */}
          <tr className="border-b border-slate-200">
            {activeExternal ? (
              <th
                colSpan={10}
                className="relative overflow-hidden text-white text-[13px] font-bold uppercase tracking-[0.12em] px-3 py-2 animate-[ventus-enriched-reveal_0.5s_ease-out_both]"
                style={{
                  background: "linear-gradient(90deg, hsl(262 83% 58%) 0%, hsl(258 90% 50%) 100%)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                    animation: "ventus-enriched-shimmer 1.6s ease-out 0.2s 1 both",
                    transform: "translateX(-100%)",
                  }}
                />
                <span className="relative inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  External Signal
                  <span className="font-normal normal-case tracking-normal text-violet-100/90">
                    · sourced from outside data provider
                  </span>
                </span>
              </th>
            ) : (
              <>
                <th
                  colSpan={6}
                  className="bg-slate-100 text-slate-600 text-[13px] font-bold uppercase tracking-[0.12em] px-3 py-2 border-r-2 border-slate-300"
                >
                  Raw Transaction <span className="font-normal normal-case tracking-normal text-slate-400">· as received from bank feed</span>
                </th>
                <th
                  colSpan={4}
                  className="relative overflow-hidden text-white text-[13px] font-bold uppercase tracking-[0.12em] px-3 py-2 animate-[ventus-enriched-reveal_0.7s_ease-out_both]"
                  style={{
                    background: "linear-gradient(90deg, hsl(217 91% 55%) 0%, hsl(221 83% 48%) 100%)",
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                      animation: "ventus-enriched-shimmer 1.6s ease-out 0.4s 1 both",
                      transform: "translateX(-100%)",
                    }}
                  />
                  <span className="relative inline-flex items-center gap-2">
                    Semantic Enrichment <span className="font-normal normal-case tracking-normal text-blue-100/90">· AI-labeled semantic intelligence</span>
                    {hasPending && (
                      <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-white normal-case tracking-normal">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Enriching…
                      </span>
                    )}
                  </span>
                </th>
              </>
            )}
          </tr>
          {/* Tier 2 — Column headers */}
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.source}`}>Source</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.date}`}>Date</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.merchant}`}>Merchant</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.mcc}`}>MCC</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.description}`} title="Description">Desc.</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.amount} text-right border-r-2 border-slate-300`}>Amt</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.pillar}`}>Pillar</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.category}`}>Category</th>
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.subs}`}>Subcategories</th>
            
            <th className={`text-slate-600 text-[12.5px] font-semibold uppercase tracking-wider px-1.5 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${COL.freq}`}>Freq</th>
          </tr>
        </thead>
        <tbody>
          {!activeExternal && (() => {
            const order = Array.from({ length: totalRows }, (_, i) => i);
            if (highlightSet) {
              order.sort((a, b) => {
                const aHi = highlightSet.has(a) ? 0 : 1;
                const bHi = highlightSet.has(b) ? 0 : 1;
                return aHi - bHi;
              });
            }
            return order.map((idx) => {
            const tx = transactions[idx] as EnrichedTransaction | undefined;
            const raw = rawRows?.[idx];
            // Prefer enriched values; fall back to raw fields when AI hasn't returned yet.
            const merchantRaw = tx?.merchant_name || raw?.merchant_name || "—";
            const merchantDisplay = (tx as any)?.normalized_merchant || merchantRaw;
            const subs: string[] = (tx as any)?.subcategories ?? ((tx as any)?.subcategory ? [(tx as any).subcategory] : []);
            const mcc = ((tx as any)?.mcc as string | undefined) ?? raw?.mcc;
            const rawDesc = ((tx as any)?.description as string | undefined) ?? raw?.description;
            const description = (mcc && MCC_DESCRIPTIONS[mcc]) || rawDesc;
            const source = (tx as any)?.source ?? raw?.source;
            const date = tx?.date ?? raw?.date;
            const amount = tx?.amount ?? raw?.amount ?? 0;
            const isEnriched = !!tx;
            const c = isEnriched ? getColor(tx!.pillar) : null;
            const isHighlighted = highlightSet ? highlightSet.has(idx) : false;
            const isDimmed = highlightSet ? !isHighlighted : externalActive;
            return (
              <tr
                key={(tx as any)?.transaction_id || raw?.transaction_id || `tx-${idx}`}
                className={`border-b border-slate-100 transition-all duration-200 ${isHighlighted ? "exec-row-highlighted" : isDimmed ? "exec-row-dimmed" : "hover:bg-slate-50/60"}`}
                style={{
                  ...(isHighlighted ? ({ ["--exec-hl" as any]: highlightColor } as React.CSSProperties) : {}),
                  ["--enrich-row-i" as any]: Math.min(idx, 24),
                } as React.CSSProperties}
              >
                {/* ===== RAW SIDE ===== */}
                <td className={`px-1 py-2 ${COL.source}`}>
                  {source ? (
                    <span className={`inline-block px-1 py-0.5 rounded text-[12.5px] font-medium whitespace-nowrap ${SOURCE_COLORS[source] ?? "bg-slate-50 text-slate-500"}`}>
                      {source}
                    </span>
                  ) : <span className="text-[13px] text-slate-400">—</span>}
                </td>
                <td className={`text-[13px] text-slate-600 whitespace-nowrap px-1 py-2 ${COL.date} tabular-nums`}>
                  {formatDateCompact(date)}
                </td>
                <td className={`px-1 py-2 ${COL.merchant}`}>
                  <div className="text-[13px] font-medium text-slate-900 truncate" title={merchantRaw}>
                    {merchantRaw}
                  </div>
                </td>
                <td className={`px-1 py-2 ${COL.mcc}`}>
                  {mcc ? (
                    <span className="inline-block bg-slate-100 text-slate-600 text-[12px] font-mono px-0.5 py-0.5 rounded">
                      {mcc}
                    </span>
                  ) : (
                    <span className="text-[13px] text-slate-300">—</span>
                  )}
                </td>
                <td className={`px-1 py-2 ${COL.description}`}>
                  {description ? (
                    <div className="text-[13px] text-slate-500 truncate" title={description}>
                      {description}
                    </div>
                  ) : (
                    <span className="text-[13px] text-slate-300">—</span>
                  )}
                </td>
                {(() => {
                  const flow = getFlow({ merchant_name: merchantRaw, description: rawDesc });
                  const absAmt = Math.round(Math.abs(Number(amount) || 0));
                  const txt = flow === "income" ? `$${absAmt}` : `($${absAmt})`;
                  return (
                    <td className={`font-mono text-[13px] px-1 py-2 whitespace-nowrap ${COL.amount} text-right tabular-nums border-r-2 border-slate-200 ${flow === "income" ? "text-emerald-600 font-semibold" : "text-slate-900"}`}>
                      {txt}
                    </td>
                  );
                })()}

                {/* ===== ENRICHED SIDE ===== */}
                <td key={`enr-pillar-${idx}-${isEnriched ? revealKey : "pending"}`} className={`exec-enriched-cell px-1.5 py-2 ${COL.pillar}`}>
                  {isEnriched && c ? (
                    onPillarClick ? (
                      <button
                        type="button"
                        onClick={() => onPillarClick(tx!.pillar)}
                        className="inline-block rounded transition-all cursor-pointer hover:brightness-95 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-1"
                        style={{ ['--tw-ring-color' as any]: c.border }}
                        title={`Show all "${tx!.pillar}" transactions`}
                      >
                        <span
                          className={`inline-block border text-[13px] font-semibold px-2 py-0.5 rounded whitespace-nowrap leading-tight ${activePillLabel === tx!.pillar ? "ring-2 ring-offset-1" : ""}`}
                          style={{
                            background: c.bg,
                            color: c.text,
                            borderColor: c.border,
                            ...(activePillLabel === tx!.pillar ? { ['--tw-ring-color' as any]: c.dot, boxShadow: `0 0 0 2px ${c.dot}` } : {}),
                          }}
                        >
                          {tx!.pillar}
                        </span>
                      </button>
                    ) : (
                      <span
                        className="inline-block border text-[13px] font-semibold px-2 py-0.5 rounded whitespace-nowrap leading-tight"
                        style={{ background: c.bg, color: c.text, borderColor: c.border }}
                        title={merchantDisplay !== merchantRaw ? `Normalized: ${merchantDisplay}` : undefined}
                      >
                        {tx!.pillar}
                      </span>
                    )
                  ) : (
                    <ShimmerCell width="120px" height={18} rounded="rounded" />
                  )}
                </td>
                <td key={`enr-cat-${idx}-${isEnriched ? revealKey : "pending"}`} className={`exec-enriched-cell text-[13px] text-slate-700 px-1.5 py-2 truncate ${COL.category}`} title={(tx as any)?.category}>
                  {isEnriched ? ((tx as any).category || "—") : <ShimmerCell width="90px" height={12} />}
                </td>
                <td key={`enr-subs-${idx}-${isEnriched ? revealKey : "pending"}`} className={`exec-enriched-cell px-1.5 py-2 ${COL.subs}`}>
                  {isEnriched ? (
                    <div className="flex flex-nowrap gap-0.5 overflow-hidden whitespace-nowrap" title={subs.join(", ")}>
                      {subs.length > 0 ? subs.map((sub, i) => (
                        <span key={i} className="inline-block shrink-0 bg-slate-100 text-slate-600 text-[12.5px] px-1.5 py-0.5 rounded whitespace-nowrap">{sub}</span>
                      )) : <span className="text-[13px] text-slate-400">—</span>}
                    </div>
                  ) : (
                    <ShimmerCell width="120px" height={14} />
                  )}
                </td>
                <td key={`enr-freq-${idx}-${isEnriched ? revealKey : "pending"}`} className={`exec-enriched-cell px-1.5 py-2 ${COL.freq}`}>
                  {isEnriched ? (
                    <span className={`inline-block border text-[12.5px] px-1.5 py-0.5 rounded whitespace-nowrap leading-tight ${getFrequencyColor((tx as any).purchase_frequency)}`}>
                      {(tx as any).purchase_frequency || "—"}
                    </span>
                  ) : (
                    <ShimmerCell width="70px" height={16} />
                  )}
                </td>
              </tr>
            );
            });
          })()}
          {externals.map((s) => {
            const isActive = activeExternalSignalId === s.id;
            const isDimmed = !isActive && (!!highlightSet || externalActive);
            const conf = s.confidence > 1 ? Math.round(s.confidence) : Math.round(s.confidence * 100);
            return (
              <tr
                key={`ext-${s.id}`}
                className={`border-t border-violet-200 transition-all duration-200 ${isActive ? "exec-ext-highlighted" : ""} ${isDimmed ? "exec-row-dimmed" : ""}`}
                style={isActive ? ({ ["--exec-hl" as any]: "#8b5cf6" } as React.CSSProperties) : undefined}
              >
                <td colSpan={10} className="px-3 py-2 bg-violet-50/40">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 shrink-0 text-[11.5px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-violet-100 text-violet-700 border border-violet-200">
                      <Sparkles className="w-3 h-3" />
                      External Intelligence
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-slate-900 truncate">{s.headline}</div>
                      <div className="text-[12px] text-slate-500 truncate">{s.detail}</div>
                    </div>
                    <span className="shrink-0 text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-white text-violet-700 border border-violet-200 whitespace-nowrap">
                      {s.provider}
                    </span>
                    <span className="shrink-0 tabular-nums text-[12.5px] font-semibold text-violet-700">
                      {conf}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style>{`
        tr.exec-row-highlighted > td {
          background-color: color-mix(in srgb, var(--exec-hl) 12%, transparent);
        }
        tr.exec-row-highlighted > td:first-child {
          box-shadow: inset 3px 0 0 0 var(--exec-hl);
        }
        tr.exec-row-dimmed > td {
          opacity: 0.32;
        }
        tr.exec-ext-highlighted > td {
          background-color: color-mix(in srgb, var(--exec-hl) 14%, transparent) !important;
          box-shadow: inset 3px 0 0 0 var(--exec-hl);
        }
        td.exec-enriched-cell {
          background-image: linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%);
        }
        .exec-cascade-on td.exec-enriched-cell {
          animation: exec-enriched-row-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--enrich-row-i, 0) * 110ms);
          transform-origin: top center;
        }
        tr.exec-row-highlighted > td.exec-enriched-cell {
          background-image: none;
        }
        tr.exec-row-dimmed > td.exec-enriched-cell {
          background-image: none;
        }
        @keyframes exec-enriched-row-reveal {
          0% {
            opacity: 0;
            transform: translateY(-14px) scaleY(0.85);
            background-color: rgba(59, 130, 246, 0.28);
            box-shadow: inset 0 -1px 0 0 rgba(59, 130, 246, 0.55);
            filter: brightness(1.12);
          }
          55% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
            background-color: rgba(59, 130, 246, 0.16);
            box-shadow: inset 0 -1px 0 0 rgba(59, 130, 246, 0.35);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
            background-color: transparent;
            box-shadow: inset 0 0 0 0 transparent;
            filter: brightness(1);
          }
        }
        @keyframes ventus-enriched-reveal {
          0% { opacity: 0; transform: translateY(-6px); filter: brightness(1.15); }
          100% { opacity: 1; transform: translateY(0); filter: brightness(1); }
        }
        @keyframes ventus-enriched-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  );
}
