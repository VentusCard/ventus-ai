import { useMemo } from "react";
import { Calendar, MapPin, TrendingUp, TrendingDown, Repeat } from "lucide-react";
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

interface Props {
  chips: ChipData[];
  transactions: Transaction[];
  signalMap: Record<number, SignalEntry>;
  personaSynthesis?: PersonaSynthesis | null;
  generatedOffers?: RollupOfferGroup[] | null;
  offersLoading?: boolean;
  activeRollup?: PillarRollup | null;
  activeTriggerLabel?: string | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes("-")) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  // mm/dd/yyyy
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const d = new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function parseAmount(amount: any): number {
  return parseFloat(String(amount).replace(/[$,]/g, "")) || 0;
}

interface CadenceData {
  label: string;
  pillar: string;
  totalCount: number;
  totalSpend: number;
  topMerchant: { name: string; count: number } | null;
  cadence: string | null;            // e.g. "every ~28 days (12 visits/yr)"
  cadenceCategory: "weekly" | "monthly" | "quarterly" | "annual" | "irregular" | null;
  seasonality: string | null;        // e.g. "annually in July" or "summer-heavy (Jun–Aug)"
  velocity: number;                  // % change recent vs prior quarter
  summaryLine: string;               // plain-English headline
}

function buildCadence(
  rollup: PillarRollup,
  transactions: Transaction[]
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
      cadence = `every ~${Math.round(avg / 30)} months (${perYear}× / year)`;
    } else {
      cadenceCategory = "annual";
      cadence = `roughly once a year`;
    }
  }

  // ---- Seasonality ----
  const monthCounts = new Array(12).fill(0);
  const monthSpend = new Array(12).fill(0);
  let totalSpend = 0;
  for (let i = 0; i < txs.length; i++) {
    const d = parseDate(txs[i].date);
    if (!d) continue;
    const m = d.getMonth();
    monthCounts[m] += 1;
    const amt = parseAmount(txs[i].amount);
    monthSpend[m] += amt;
    totalSpend += amt;
  }

  let seasonality: string | null = null;
  if (totalSpend > 0) {
    // Single-month concentration ≥ 50%
    const peakMonth = monthSpend.indexOf(Math.max(...monthSpend));
    const peakPct = monthSpend[peakMonth] / totalSpend;
    if (peakPct >= 0.5 && monthCounts[peakMonth] >= 1) {
      seasonality = `concentrated in ${MONTHS[peakMonth]}`;
    } else {
      // 3-month bucket ≥ 40%
      let bestSum = 0, bestStart = 0;
      for (let s = 0; s < 12; s++) {
        const sum3 = monthSpend[s] + monthSpend[(s + 1) % 12] + monthSpend[(s + 2) % 12];
        if (sum3 > bestSum) { bestSum = sum3; bestStart = s; }
      }
      const bucketPct = bestSum / totalSpend;
      if (bucketPct >= 0.4) {
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

  // ---- Summary line ----
  let summaryLine = rollup.label;
  const cadenceWord =
    cadenceCategory === "weekly" ? "Weekly" :
    cadenceCategory === "monthly" ? "Monthly" :
    cadenceCategory === "quarterly" ? "Quarterly" :
    cadenceCategory === "annual" ? "Annual" : "Recurring";

  if (topMerchant && cadenceCategory) {
    if (cadenceCategory === "annual" && seasonality && seasonality.startsWith("concentrated in ")) {
      const month = seasonality.replace("concentrated in ", "");
      summaryLine = `Annual ${rollup.label.toLowerCase()} every ${month}, mostly at ${topMerchant.name}`;
    } else {
      summaryLine = `${cadenceWord} ${rollup.label.toLowerCase()} at ${topMerchant.name}`;
    }
  } else if (cadenceCategory) {
    summaryLine = `${cadenceWord} ${rollup.label.toLowerCase()} pattern`;
  } else if (topMerchant) {
    summaryLine = `${rollup.label} — primarily at ${topMerchant.name}`;
  }

  return {
    label: rollup.label,
    pillar: rollup.pillar,
    totalCount: txs.length,
    totalSpend,
    topMerchant,
    cadence,
    cadenceCategory,
    seasonality,
    velocity,
    summaryLine,
  };
}

function CadenceCard({ data }: { data: CadenceData }) {
  const c = getColor(data.pillar);
  return (
    <div
      className="rounded-xl border border-slate-100 bg-white px-4 py-3"
      style={{
        borderTopWidth: 3,
        borderTopColor: c.dot,
        animation: "exec-card-reveal 0.4s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: c.dot }}>✦</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: c.text }}
        >
          {data.label} · Shopping Pattern
        </span>
      </div>

      {/* Plain-English summary */}
      <p className="text-[13px] font-semibold text-slate-800 italic mb-2.5 leading-snug">
        "{data.summaryLine}"
      </p>

      <div className="space-y-1.5 text-[11.5px] text-slate-600 leading-snug">
        {data.cadence && (
          <div className="flex items-start gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
            <span>
              <span className="font-semibold text-slate-700">Cadence:</span> {data.cadence}
            </span>
          </div>
        )}
        {data.seasonality && (
          <div className="flex items-start gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
            <span>
              <span className="font-semibold text-slate-700">Seasonality:</span> {data.seasonality}
            </span>
          </div>
        )}
        {data.topMerchant && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[1px]" />
            <span>
              <span className="font-semibold text-slate-700">Top merchant:</span>{" "}
              {data.topMerchant.name}{" "}
              <span className="text-slate-400">
                ({data.topMerchant.count} of {data.totalCount} txns)
              </span>
            </span>
          </div>
        )}
        {data.velocity !== 0 && (
          <div className="flex items-start gap-1.5">
            {data.velocity > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-[1px]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0 mt-[1px]" />
            )}
            <span>
              <span className="font-semibold text-slate-700">Recent trend:</span>{" "}
              <span className={data.velocity > 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                {data.velocity > 0 ? "+" : ""}{data.velocity}%
              </span>{" "}
              vs prior quarter
            </span>
          </div>
        )}
      </div>
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
}: Props) {
  const rollups = personaSynthesis?.pillarRollups || [];

  // Pick the active rollup — defaults handled by parent, but defensive fallback here too
  const selectedRollup: PillarRollup | null = useMemo(() => {
    if (activeRollup) return activeRollup;
    if (rollups.length > 0) return rollups[0];
    return null;
  }, [activeRollup, rollups]);

  const cadenceData = useMemo(() => {
    if (!selectedRollup) return null;
    return buildCadence(selectedRollup, transactions);
  }, [selectedRollup, transactions]);

  // What label to filter offers by — life event takes precedence if active
  const activeOfferLabel = activeTriggerLabel || selectedRollup?.label || null;

  return (
    <div style={{ animation: "exec-card-reveal 0.4s ease-out" }}>
      {/* ═══ SHOPPING CADENCE CARD ═══ */}
      {cadenceData ? (
        <CadenceCard data={cadenceData} />
      ) : activeTriggerLabel ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-amber-500">✦</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              {activeTriggerLabel} · Life Event Trigger
            </span>
          </div>
          <p className="text-[12px] text-slate-600 leading-snug">
            Targeted offers below are matched to this life event.
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
