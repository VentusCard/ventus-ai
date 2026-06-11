import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DollarSign, Activity, Users, ShieldCheck } from "lucide-react";
import type { ProductFlow } from "@/lib/productAutomatedFlows";
import { buildAudienceFunnel, getProductExclusions } from "@/lib/productCatalogExtras";

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

interface Props {
  product: ProductFlow;
}

export function ExclusionFunnelSection({ product }: Props) {
  const exclusions = useMemo(
    () => getProductExclusions(product.id, product.category),
    [product.id, product.category],
  );
  const funnel = useMemo(
    () => buildAudienceFunnel(product.estimatedAudience, exclusions),
    [product.estimatedAudience, exclusions],
  );

  const financial = exclusions.filter((e) => e.type === "financial");
  const behavioral = exclusions.filter((e) => e.type === "behavioral");
  const maxCount = funnel.stages[0].count;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
        <p className="text-sm font-semibold text-slate-900">Audience &amp; exclusion funnel</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white ml-auto">
          {fmt(funnel.finalCount)} addressable
        </Badge>
      </div>

      {/* Funnel bars */}
      <div className="space-y-2 mb-5">
        {funnel.stages.map((stage, i) => {
          const widthPct = (stage.count / maxCount) * 100;
          const tone =
            i === 0
              ? "bg-slate-700"
              : i === 1
              ? "bg-emerald-500"
              : "bg-blue-500";
          return (
            <div key={stage.id}>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs font-medium text-slate-700">{stage.label}</p>
                <div className="flex items-baseline gap-2">
                  {stage.delta && stage.delta > 0 && (
                    <span className="text-[11px] text-slate-500">−{fmt(stage.delta)}</span>
                  )}
                  <span className="text-sm font-mono font-semibold text-slate-900">{fmt(stage.count)}</span>
                </div>
              </div>
              <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", tone)}
                  style={{ width: `${Math.max(widthPct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Final addressable audience</span>
          </div>
          <span className="text-base font-mono font-semibold text-slate-900">{fmt(funnel.finalCount)}</span>
        </div>
      </div>

      {/* Exclusion criteria — two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ExclusionColumn
          title="Financial-risk filters"
          icon={<DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
          tone="emerald"
          totalRemoved={funnel.financialRemoved}
          totalBase={product.estimatedAudience}
          items={financial}
        />
        <ExclusionColumn
          title="Behavioral-risk filters"
          icon={<Activity className="w-3.5 h-3.5 text-blue-600" />}
          tone="blue"
          totalRemoved={funnel.behavioralRemoved}
          totalBase={product.estimatedAudience}
          items={behavioral}
        />
      </div>

      <p className="mt-3 text-[11px] text-slate-500 italic flex items-start gap-1.5">
        <Users className="w-3 h-3 mt-0.5 shrink-0" />
        Filters are framed as customer protection — anyone in an excluded cohort is held for a more appropriate offer, not denied.
      </p>
    </div>
  );
}

function ExclusionColumn({
  title,
  icon,
  tone,
  totalRemoved,
  totalBase,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "emerald" | "blue";
  totalRemoved: number;
  totalBase: number;
  items: ReturnType<typeof getProductExclusions>;
}) {
  const borderTone = tone === "emerald" ? "border-l-emerald-400" : "border-l-blue-400";
  return (
    <div className={cn("rounded-lg border border-slate-200 border-l-4 bg-white p-3", borderTone)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{title}</p>
        </div>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">
          −{fmt(totalRemoved)}
        </Badge>
      </div>
      <ul className="space-y-2">
        {items.map((ex) => (
          <li key={ex.id} className="rounded-md border border-slate-100 bg-slate-50 p-2">
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <p className="text-xs font-medium text-slate-900 leading-tight">{ex.label}</p>
              <span className="text-[10px] font-mono text-slate-600 shrink-0">
                −{fmt(Math.round(totalBase * ex.removedPct))}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">{ex.rationale}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
