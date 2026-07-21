import { useMemo } from "react";
import { Calendar, MapPin, TrendingUp, TrendingDown, Repeat, Tag, DollarSign, Clock } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { PersonaSynthesis, PillarRollup } from "./ExecDemoIntelPanel";
import type { Transaction, SignalEntry } from "./execDemoData";
import NextOfferRationale from "./NextOfferRationale";
import type { RollupOfferGroup } from "./NextOfferRationale";

interface ChipData {
  pillar: string;
  label: string;
  count: number;
  totalSpend: number;
  frequency?: string;
}

interface ActiveTrigger {
  label: string;
  indices: number[];
  color: string;
  kind: "lifeEvent" | "risk";
}

interface Props {
  chips: ChipData[];
  transactions: Transaction[];
  signalMap: Record<number, SignalEntry>;
  personaSynthesis?: PersonaSynthesis | null;
  generatedOffers?: RollupOfferGroup[] | null;
  offersLoading?: boolean;
  activeRollup?: PillarRollup | null;
  activeTriggerLabel?: string | null;
  activeTrigger?: ActiveTrigger | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (!s) return null;
  // ISO: yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  // mm/dd/yy or mm/dd/yyyy (also m/d/yy)
  const parts = s.split("/");
  if (parts.length === 3) {
    let [mm, dd, yy] = parts;
    let year = yy;
    if (yy.length === 2) {
      const n = parseInt(yy, 10);
      // Window: 00-69 → 2000s, 70-99 → 1900s
      year = (n <= 69 ? 2000 + n : 1900 + n).toString();
    }
    const d = new Date(`${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
    return isNaN(d.getTime()) ? null : d;
  }
  // Last resort
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function parseAmount(amount: any): number {
  return parseFloat(String(amount).replace(/[$,]/g, "")) || 0;
}

interface SubcategoryStat {
  name: string;
  count: number;
  spend: number;
  pct: number; // share of count, 0–100
}

interface CadenceData {
  label: string;
  pillar: string;
  totalCount: number;
  totalSpend: number;
  avgTicket: number;
  topMerchant: { name: string; count: number } | null;
  topSubcategories: SubcategoryStat[];
  firstSeen: Date | null;
  lastSeen: Date | null;
  activeSpan: string | null;          // e.g. "Mar 2024 → today (14 mo)"
  cadence: string | null;             // e.g. "every ~28 days (12 visits/yr)"
  cadenceCategory: "weekly" | "monthly" | "quarterly" | "annual" | "irregular" | null;
  seasonality: string | null;         // e.g. "annually in July" or "summer-heavy (Jun–Aug)"
  velocity: number;                   // % change recent vs prior quarter
  monthlyTrend: number[];             // length 12, normalized 0–1
  summaryLine: string;                // plain-English headline
}

const GENERIC_SUBCATS = new Set([
  "other", "miscellaneous", "misc", "unclassified", "general", "general retail", "uncategorized",
]);

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function buildCadence(
  rollup: PillarRollup,
  transactions: Transaction[],
  signalMap: Record<number, SignalEntry>
): CadenceData | null {
  const indices = rollup.txIndices ?? rollup.categoryIndices ?? [];
  const txs = indices
    .map(i => transactions[i])
    .filter((t): t is Transaction => !!t);

  if (txs.length === 0) return null;

  // ---- Top merchant ----
  const merchantCounts = new Map<string, number>();
  for (const t of txs) {
    const m = ((t as any).merchant_name || (t as any).merchant || "").trim();
    if (!m) continue;
    merchantCounts.set(m, (merchantCounts.get(m) || 0) + 1);
  }
  let topMerchant: { name: string; count: number } | null = null;
  for (const [name, count] of merchantCounts) {
    if (!topMerchant || count > topMerchant.count) topMerchant = { name, count };
  }

  // ---- Date analysis ----
  const dates = txs
    .map(t => parseDate(t.date))
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());

  let cadence: string | null = null;
  let cadenceCategory: CadenceData["cadenceCategory"] = null;
  if (dates.length >= 2) {
    const intervals: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const perYear = Math.max(1, Math.round(365 / avg));
    if (avg <= 10) {
      cadenceCategory = "weekly";
      cadence = `every ~${Math.round(avg)} days (${perYear}+ visits/yr)`;
    } else if (avg <= 45) {
      cadenceCategory = "monthly";
      cadence = `every ~${Math.round(avg)} days (${perYear} visits/yr)`;
    } else if (avg <= 120) {
      cadenceCategory = "quarterly";
      cadence = `every ~${Math.round(avg)} days (${perYear}× / year)`;
    } else if (avg <= 270) {
      cadenceCategory = "annual";
      cadence = `every ~${Math.round(avg / 30)} months`;
    } else {
      cadenceCategory = "annual";
      cadence = `roughly once a year`;
    }
  }

  // ---- Seasonality (count-weighted, more reliable than spend) ----
  const monthCounts = new Array(12).fill(0);
  const monthSpend = new Array(12).fill(0);
  let totalSpend = 0;
  // Compute totalSpend from ALL txs (independent of date parsing)
  for (const t of txs) totalSpend += parseAmount(t.amount);
  // Fill monthly buckets only when date parses
  for (const t of txs) {
    const d = parseDate(t.date);
    if (!d) continue;
    const m = d.getMonth();
    monthCounts[m] += 1;
    monthSpend[m] += parseAmount(t.amount);
  }

  let seasonality: string | null = null;
  const totalDated = monthCounts.reduce((a, b) => a + b, 0);
  if (totalDated > 0) {
    const peakMonth = monthCounts.indexOf(Math.max(...monthCounts));
    const peakPct = monthCounts[peakMonth] / totalDated;
    if (peakPct >= 0.5 && monthCounts[peakMonth] >= 1) {
      // Annual single-month → "annually in Jul"
      if (cadenceCategory === "annual" || totalDated <= 4) {
        seasonality = `annually in ${MONTHS[peakMonth]}`;
      } else {
        seasonality = `concentrated in ${MONTHS[peakMonth]}`;
      }
    } else {
      let bestSum = 0, bestStart = 0;
      for (let s = 0; s < 12; s++) {
        const sum3 = monthCounts[s] + monthCounts[(s + 1) % 12] + monthCounts[(s + 2) % 12];
        if (sum3 > bestSum) { bestSum = sum3; bestStart = s; }
      }
      const bucketPct = bestSum / totalDated;
      if (bucketPct >= 0.45) {
        seasonality = `${MONTHS[bestStart]}–${MONTHS[(bestStart + 2) % 12]} heavy`;
      } else {
        seasonality = "year-round";
      }
    }
  }

  // ---- Velocity (recent 3 months vs prior 3 months) ----
  const now = new Date();
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  let recentSpend = 0, priorSpend = 0;
  for (let i = 0; i < txs.length; i++) {
    const d = parseDate(txs[i].date);
    if (!d) continue;
    const ageDays = (now.getTime() - d.getTime()) / ms30;
    const amt = parseAmount(txs[i].amount);
    if (ageDays < 3) recentSpend += amt;
    else if (ageDays < 6) priorSpend += amt;
  }
  const velocity = priorSpend > 0 ? Math.round(((recentSpend - priorSpend) / priorSpend) * 100) : 0;

  // ---- Subcategory mix (from signalMap) ----
  const subMap = new Map<string, { count: number; spend: number; display: string }>();
  for (const idx of indices) {
    const sig = signalMap[idx];
    const tx = transactions[idx];
    if (!tx) continue;
    const raw = (sig?.label || sig?.category || "").trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (GENERIC_SUBCATS.has(key)) continue;
    const display = titleCase(raw);
    const cur = subMap.get(key) || { count: 0, spend: 0, display };
    cur.count += 1;
    cur.spend += parseAmount(tx.amount);
    subMap.set(key, cur);
  }
  const subTotal = Array.from(subMap.values()).reduce((a, s) => a + s.count, 0) || txs.length;
  const topSubcategories: SubcategoryStat[] = Array.from(subMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(s => ({
      name: s.display,
      count: s.count,
      spend: s.spend,
      pct: Math.round((s.count / subTotal) * 100),
    }));

  // ---- Active span ----
  const firstSeen = dates[0] ?? null;
  const lastSeen = dates[dates.length - 1] ?? null;
  let activeSpan: string | null = null;
  if (firstSeen && lastSeen) {
    const spanDays = (lastSeen.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    if (spanDays >= 60) {
      const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      const months = Math.max(1, Math.round(spanDays / 30));
      const isRecent = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24) < 45;
      const endLabel = isRecent ? "today" : fmt(lastSeen);
      activeSpan = `${fmt(firstSeen)} → ${endLabel} (${months} mo)`;
    }
  }

  // ---- 12-month trend (counts per month, ending at lastSeen or now) ----
  const trendCounts = new Array(12).fill(0);
  const anchor = lastSeen || now;
  const anchorMonthIdx = anchor.getFullYear() * 12 + anchor.getMonth();
  for (const d of dates) {
    const mi = d.getFullYear() * 12 + d.getMonth();
    const offset = anchorMonthIdx - mi;
    if (offset >= 0 && offset < 12) {
      trendCounts[11 - offset] += 1;
    }
  }
  const maxTrend = Math.max(...trendCounts, 1);
  const monthlyTrend = trendCounts.map(c => c / maxTrend);

  const avgTicket = txs.length > 0 ? totalSpend / txs.length : 0;

  // ---- Summary line ----
  const cadenceWord =
    cadenceCategory === "weekly" ? "Weekly" :
    cadenceCategory === "monthly" ? "Monthly" :
    cadenceCategory === "quarterly" ? "Quarterly" :
    cadenceCategory === "annual" ? "Annual" : "Recurring";

  const dominantSub = topSubcategories[0] && topSubcategories[0].pct >= 40
    ? topSubcategories[0].name.toLowerCase()
    : null;
  const subjectBase = rollup.label.toLowerCase();
  const subject = dominantSub && !subjectBase.includes(dominantSub)
    ? `${dominantSub} ${subjectBase}`
    : subjectBase;

  let summaryLine = rollup.label;
  const annualMonth =
    seasonality && seasonality.startsWith("annually in ") ? seasonality.replace("annually in ", "") :
    seasonality && seasonality.startsWith("concentrated in ") ? seasonality.replace("concentrated in ", "") :
    null;

  if (cadenceCategory === "annual" && annualMonth) {
    summaryLine = topMerchant
      ? `Annual ${subject} every ${annualMonth}, mostly at ${topMerchant.name}`
      : `Annual ${subject} every ${annualMonth}`;
  } else if (topMerchant && cadenceCategory) {
    summaryLine = `${cadenceWord} ${subject} at ${topMerchant.name}`;
  } else if (cadenceCategory) {
    summaryLine = `${cadenceWord} ${subject} pattern`;
  } else if (topMerchant) {
    summaryLine = `${rollup.label} — primarily at ${topMerchant.name}`;
  }

  return {
    label: rollup.label,
    pillar: rollup.pillar,
    totalCount: txs.length,
    totalSpend,
    avgTicket,
    topMerchant,
    topSubcategories,
    firstSeen,
    lastSeen,
    activeSpan,
    cadence,
    cadenceCategory,
    seasonality,
    velocity,
    monthlyTrend,
    summaryLine,
  };
}

function fmtCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}


function CadenceCard({ data, colorOverride, headerSuffix }: { data: CadenceData; colorOverride?: string; headerSuffix?: string }) {
  const c = getColor(data.pillar);
  const accent = colorOverride || c.dot;
  const headerColor = colorOverride || c.text;
  return (
    <div
      className="rounded-xl border border-slate-100 bg-white px-4 py-3"
      style={{
        borderTopWidth: 3,
        borderTopColor: accent,
        animation: "exec-card-reveal 0.4s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: accent }}>✦</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: headerColor }}
        >
          {data.label} · {headerSuffix || "Shopping Pattern"}
        </span>
      </div>

      <div className="mb-2" />

      {(() => {
        const hasTiming =
          !!data.cadence ||
          !!data.activeSpan ||
          (!!data.seasonality && data.seasonality !== "year-round") ||
          data.velocity !== 0;



        const LeftCol = (
          <div className="space-y-1.5 text-[11.5px] text-slate-600 leading-snug">
            {data.topMerchant && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
                <span>
                  <span className="font-semibold text-slate-700">Top spot:</span>{" "}
                  {data.topMerchant.name}{" "}
                  <span className="text-slate-400">
                    ({data.topMerchant.count} of {data.totalCount})
                  </span>
                </span>
              </div>
            )}
            {data.topSubcategories.length > 0 && (
              <div className="flex items-start gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
                <span>
                  <span className="font-semibold text-slate-700">Top types:</span>{" "}
                  {data.topSubcategories.map((s, i) => (
                    <span key={s.name}>
                      {i > 0 && <span className="text-slate-300"> · </span>}
                      <span className="text-slate-700">{s.name}</span>{" "}
                      <span className="text-slate-400">{s.pct}%</span>
                    </span>
                  ))}
                </span>
              </div>
            )}
            {data.totalSpend > 0 && (
              <div className="flex items-start gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
                <span>
                  <span className="font-semibold text-slate-700">Lifetime:</span>{" "}
                  {fmtCurrency(data.totalSpend)}
                  {data.avgTicket > 0 && (
                    <span className="text-slate-400"> · avg {fmtCurrency(data.avgTicket)}/visit</span>
                  )}
                </span>
              </div>
            )}
          </div>
        );

        const RightCol = (
          <div className="space-y-1.5 text-[11.5px] text-slate-600 leading-snug">
            {data.cadence && (
              <div className="flex items-start gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
                <span>
                  <span className="font-semibold text-slate-700">Cadence:</span> {data.cadence}
                </span>
              </div>
            )}
            {data.activeSpan && (
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
                <span>
                  <span className="font-semibold text-slate-700">Active:</span> {data.activeSpan}
                </span>
              </div>
            )}
            {data.seasonality && data.seasonality !== "year-round" && (
              <div className="flex items-start gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
                <span>
                  <span className="font-semibold text-slate-700">Seasonality:</span> {data.seasonality}
                </span>
              </div>
            )}
            {data.monthlyTrend.some(v => v > 0) && (
              <div className="pt-1 flex items-center gap-2">
                <Sparkline values={data.monthlyTrend} color={accent} />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">last 12 mo</span>
              </div>
            )}
          </div>
        );

        if (!hasTiming) return LeftCol;

        return (
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="pr-3">{LeftCol}</div>
            <div className="pl-3">{RightCol}</div>
          </div>
        );
      })()}
    </div>
  );
}

export default function PurchaseCycleTimeline({
  chips,
  transactions,
  signalMap,
  personaSynthesis,
  generatedOffers,
  offersLoading,
  activeRollup,
  activeTriggerLabel,
  activeTrigger,
}: Props) {
  const rollups = personaSynthesis?.pillarRollups || [];

  // Pick the active rollup — defaults handled by parent, but defensive fallback here too
  const selectedRollup: PillarRollup | null = useMemo(() => {
    if (activeRollup) return activeRollup;
    if (rollups.length > 0) return rollups[0];
    return null;
  }, [activeRollup, rollups]);

  // Build cadence: trigger wins if it has indices; otherwise fall back to rollup
  const cadenceData = useMemo(() => {
    if (activeTrigger && activeTrigger.indices.length > 0) {
      const syntheticRollup: PillarRollup = {
        label: activeTrigger.label,
        pillar: activeTrigger.kind === "lifeEvent" ? "Life Event" : "Risk",
        txIndices: activeTrigger.indices,
      } as PillarRollup;
      return buildCadence(syntheticRollup, transactions, signalMap);
    }
    if (!selectedRollup || activeTrigger) return null;
    return buildCadence(selectedRollup, transactions, signalMap);
  }, [activeTrigger, selectedRollup, transactions, signalMap]);

  // What label to filter offers by — trigger takes precedence if active
  const activeOfferLabel = activeTrigger?.label || activeTriggerLabel || selectedRollup?.label || null;
  const activeOfferPillar = activeTrigger
    ? (activeTrigger.kind === "lifeEvent" ? "Life Event" : "Risk")
    : (activeTriggerLabel ? "Life Event" : selectedRollup?.pillar || null);

  // Color override + header label for trigger-driven cadence
  const cardColorOverride = activeTrigger ? activeTrigger.color : undefined;
  const cardHeaderSuffix = activeTrigger
    ? (activeTrigger.kind === "lifeEvent" ? "Life Event Pattern" : "Risk Pattern")
    : undefined;

  // Empty-state callout when trigger is active but no transactions matched
  const triggerCalloutColor = activeTrigger?.color || "#f59e0b";
  const triggerCalloutKind = activeTrigger?.kind || "lifeEvent";
  const triggerCalloutLabel = activeTrigger?.label || activeTriggerLabel;

  return (
    <div style={{ animation: "exec-card-reveal 0.4s ease-out" }}>
      {/* ═══ SHOPPING CADENCE CARD ═══ */}
      {cadenceData ? (
        <CadenceCard data={cadenceData} colorOverride={cardColorOverride} headerSuffix={cardHeaderSuffix} />
      ) : triggerCalloutLabel ? (
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            borderColor: `${triggerCalloutColor}66`,
            background: `${triggerCalloutColor}14`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ color: triggerCalloutColor }}>✦</span>
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: triggerCalloutColor }}
            >
              {triggerCalloutLabel} · {triggerCalloutKind === "lifeEvent" ? "Life Event Trigger" : "Risk Trigger"}
            </span>
          </div>
          <p className="text-[12px] text-slate-600 leading-snug">
            {triggerCalloutKind === "lifeEvent"
              ? "Targeted offers below are matched to this life event."
              : "Flagged transaction has no recurring pattern. See offers below."}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <span className="text-[11px] text-slate-300">Select a persona pill above to see shopping patterns</span>
        </div>
      )}

      {/* ═══ NEXT-OFFER RECOMMENDATIONS (filtered to active persona) ═══ */}
      <div className="mt-3">
        <NextOfferRationale
          offers={generatedOffers || null}
          personaSynthesis={personaSynthesis || null}
          loading={!!offersLoading}
          activeRollupLabel={activeOfferLabel}
          activeRollupPillar={activeOfferPillar}
          colorOverride={cardColorOverride}
          kindOverride={activeTrigger?.kind}
        />
      </div>

      <style>{`
        @keyframes exec-card-reveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
