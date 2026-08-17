import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, History } from "lucide-react";
import type { CatalogProduct } from "@/types/campaign-studio";
import {
  assessAudience,
  forecastCampaign,
  comparableCampaigns,
  fmtCount,
  fmtMoney,
  type HealthLevel,
} from "@/lib/campaignAiEngine";

interface Props {
  product?: CatalogProduct;
  audience: number;
  baseAudience: number;
}

const HEALTH_TONE: Record<HealthLevel, { cls: string; icon: typeof CheckCircle2 }> = {
  good: { cls: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  warn: { cls: "border-amber-200 bg-amber-50 text-amber-800", icon: AlertTriangle },
  bad: { cls: "border-rose-200 bg-rose-50 text-rose-800", icon: ShieldAlert },
};

export function AudienceCopilot({ product, audience, baseAudience }: Props) {
  const health = assessAudience(audience, baseAudience, product);
  const forecast = forecastCampaign(audience, product);
  const comps = comparableCampaigns(product, audience);

  if (!product || !health || !forecast) return null;
  const Tone = HEALTH_TONE[health.level];
  const Icon = Tone.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-900">Audience copilot &amp; forecast</p>
        <span className="text-[10px] text-slate-400">recomputed from the funnel above</span>
      </div>

      {/* health */}
      <div className={`rounded-lg border px-3 py-2 ${Tone.cls}`}>
        <div className="flex items-start gap-2">
          <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight">{health.headline}</p>
            <p className="text-[11px] leading-snug opacity-90 mt-0.5">{health.detail}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 pl-5.5">
          {health.metrics.map((m) => (
            <div key={m.label}>
              <p className="text-[9px] uppercase tracking-wider opacity-70">{m.label}</p>
              <p className="text-xs font-semibold tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* forecast */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Projected outcome (range)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {forecast.stages.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
              <p className="text-[10px] text-slate-500">{s.label}</p>
              <p className="text-sm font-semibold text-slate-900 tabular-nums leading-tight">
                {fmtCount(s.low)}–{fmtCount(s.high)}
              </p>
              <p className="text-[9px] text-slate-400 tabular-nums">{s.ratePct}</p>
            </div>
          ))}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2">
            <p className="text-[10px] text-blue-700">Revenue impact</p>
            <p className="text-sm font-semibold text-blue-900 tabular-nums leading-tight">
              {fmtMoney(forecast.revenueLow)}–{fmtMoney(forecast.revenueHigh)}
            </p>
            <p className="text-[9px] text-blue-500 tabular-nums">~${forecast.costPerAcquisition} CPA</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">{forecast.basis}</p>
      </div>

      {/* comparables */}
      <div className="border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Comparable campaigns behind this forecast
          </p>
        </div>
        <div className="space-y-1">
          {comps.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 px-2.5 py-1.5 rounded-md border border-slate-100 bg-slate-50/60"
            >
              <span className="text-[11px] font-medium text-slate-800 truncate flex-1">{c.name}</span>
              <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{c.quarter}</span>
              <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">{fmtCount(c.audience)}</span>
              <span className="text-[10px] font-semibold text-slate-900 shrink-0 tabular-nums">{c.conversionPct}</span>
              <span className="text-[10px] text-slate-500 shrink-0 hidden lg:block">{c.outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
