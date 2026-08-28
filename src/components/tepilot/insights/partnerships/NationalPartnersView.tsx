import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Building2, Users, TrendingUp, Sparkles, Target } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import {
  NATIONAL_PARTNERS, CATEGORY_COLORS, STAGE_LABELS, STAGE_STYLES,
  type NationalPartner,
} from "@/lib/merchantPartnershipData";
import { cn } from "@/lib/utils";
import type { ContactTarget } from "./BrandContactDialog";

type SortKey = "estimatedValue" | "fitScore" | "cardholders";

const CATEGORIES = ["All", ...Array.from(new Set(NATIONAL_PARTNERS.map((p) => p.category)))];

interface Props {
  onFindContact: (target: ContactTarget) => void;
}

export function NationalPartnersView({ onFindContact }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("estimatedValue");
  const [category, setCategory] = useState("All");
  const [readiness, setReadiness] = useState<"all" | "in_motion" | "prospect">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    let items = [...NATIONAL_PARTNERS];
    if (category !== "All") items = items.filter((p) => p.category === category);
    if (readiness === "in_motion") items = items.filter((p) => p.stage !== "prospect");
    if (readiness === "prospect") items = items.filter((p) => p.stage === "prospect");
    return items.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [category, readiness, sortBy]);

  const totalValue = rows.reduce((s, p) => s + p.estimatedValue, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                category === c ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {c === "All" ? "All categories" : c.split(" & ")[0]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {([
              { key: "all", label: "All" },
              { key: "in_motion", label: "In motion" },
              { key: "prospect", label: "Prospects" },
            ] as const).map((r) => (
              <button
                key={r.key}
                onClick={() => setReadiness(r.key)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all",
                  readiness === r.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {([
              { key: "estimatedValue" as SortKey, label: "Value" },
              { key: "fitScore" as SortKey, label: "Fit" },
              { key: "cardholders" as SortKey, label: "Reach" },
            ]).map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all",
                  sortBy === s.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {rows.length} brands shown · {formatCurrency(totalValue)} combined estimated annual value
      </p>

      <div className="space-y-2">
        {rows.map((p) => (
          <PartnerRow
            key={p.id}
            partner={p}
            isExpanded={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
            onFindContact={onFindContact}
          />
        ))}
      </div>
    </div>
  );
}

function PartnerRow({
  partner, isExpanded, onToggle, onFindContact,
}: {
  partner: NationalPartner;
  isExpanded: boolean;
  onToggle: () => void;
  onFindContact: (t: ContactTarget) => void;
}) {
  const colors = CATEGORY_COLORS[partner.category] ?? CATEGORY_COLORS["Retail & Style"];
  const peak = Math.max(...partner.trend.map((t) => t.spend));

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-3.5 hover:bg-slate-50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
            <Building2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">{partner.brand}</span>
              <Badge variant="outline" className={cn("text-[10px] font-medium", colors.chip)}>{partner.category}</Badge>
              <Badge variant="outline" className={cn("text-[10px] font-medium", STAGE_STYLES[partner.stage])}>
                {STAGE_LABELS[partner.stage]}
              </Badge>
              <span className="text-[10px] text-slate-400">Fit {partner.fitScore}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{partner.reason}</p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(partner.cardholders)} cardholders</span>
              <span>{formatCurrency(partner.annualSpend)} annual spend</span>
              <span>{partner.categorySharePct}% of category</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{partner.upliftPct}% projected lift</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-slate-900">{formatCurrency(partner.estimatedValue)}</p>
            <p className="text-[10px] text-slate-400">est. annual value</p>
            <p className="text-[10px] text-slate-400">{formatCurrency(partner.valueLow)}–{formatCurrency(partner.valueHigh)}</p>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 ml-auto mt-1 transition-transform", isExpanded && "rotate-180")} />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 p-3.5 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Quarterly spend</p>
              <div className="flex items-end gap-1.5 h-14">
                {partner.trend.map((t) => (
                  <div key={t.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500/80 rounded-sm" style={{ height: `${(t.spend / peak) * 100}%` }} />
                    <span className="text-[9px] text-slate-400">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Share we would win back</p>
              <p className="text-sm font-semibold text-slate-900">{partner.competitor}</p>
              <p className="text-xs text-slate-500 mt-1">{formatCurrency(partner.competitorLeakage)} of overlapping spend currently leaks to this competitor.</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Overlapping cohorts</p>
              <div className="flex flex-wrap gap-1">
                {partner.cohorts.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">{c}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-start gap-2 min-w-0">
              <Target className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Proposed deal</p>
                <p className="text-xs text-slate-700">{partner.dealConstruct}</p>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={() => onFindContact({
                brand: partner.brand,
                scope: "national",
                cardholders: partner.cardholders,
                annualSpend: partner.annualSpend,
                estimatedValue: partner.estimatedValue,
                dealConstruct: partner.dealConstruct,
                reason: partner.reason,
              })}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Find contact
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
