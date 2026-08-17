import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Users } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import {
  METROS, getLocalPartnersByMetro, CATEGORY_COLORS, STAGE_LABELS, STAGE_STYLES,
} from "@/lib/merchantPartnershipData";
import { MetroStreetMap } from "./MetroStreetMap";
import { cn } from "@/lib/utils";
import type { ContactTarget } from "./BrandContactDialog";

interface Props {
  onFindContact: (target: ContactTarget) => void;
}

export function LocalPartnersView({ onFindContact }: Props) {
  const [metroId, setMetroId] = useState(METROS[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const metro = METROS.find((m) => m.id === metroId)!;
  const partners = useMemo(() => getLocalPartnersByMetro(metroId), [metroId]);

  const clusters = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    partners.forEach((p) => {
      const entry = map.get(p.neighborhood) ?? { count: 0, value: 0 };
      entry.count += 1;
      entry.value += p.estimatedValue;
      map.set(p.neighborhood, entry);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].value - a[1].value);
  }, [partners]);

  const totalValue = partners.reduce((s, p) => s + p.estimatedValue, 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {METROS.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMetroId(m.id); setSelectedId(null); }}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
              metroId === m.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-500">
          {metro.name}, {metro.state} · {formatNumber(metro.cardholders)} cardholders · {partners.length} local partners · {formatCurrency(totalValue)} estimated annual value
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {clusters.map(([n, c]) => (
            <span key={n} className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
              {n} · {c.count} · {formatCurrency(c.value)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3">
        <MetroStreetMap metro={metro} partners={partners} selectedId={selectedId} onSelect={setSelectedId} />

        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {partners.map((p) => {
            const colors = CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.Dining;
            const active = selectedId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "bg-white border rounded-xl p-3 cursor-pointer transition-colors",
                  active ? "border-blue-400 ring-1 ring-blue-100" : "border-slate-200 hover:bg-slate-50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                      <Badge variant="outline" className={cn("text-[10px]", colors.chip)}>{p.category}</Badge>
                      <Badge variant="outline" className={cn("text-[10px]", STAGE_STYLES[p.stage])}>{STAGE_LABELS[p.stage]}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{p.neighborhood}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(p.estimatedValue)}</p>
                    <p className="text-[10px] text-slate-400">est. annual value</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.reason}</p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(p.cardholders)}</span>
                  <span>{formatCurrency(p.annualSpend)} spend</span>
                  <span>${p.avgTicket} avg ticket</span>
                  <span>Fit {p.fitScore}</span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                  <p className="text-[11px] text-slate-600 truncate">{p.dealConstruct}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFindContact({
                        brand: p.name,
                        scope: "local",
                        metroId: p.metroId,
                        cardholders: p.cardholders,
                        annualSpend: p.annualSpend,
                        estimatedValue: p.estimatedValue,
                        dealConstruct: p.dealConstruct,
                        reason: p.reason,
                      });
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Find contact
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
