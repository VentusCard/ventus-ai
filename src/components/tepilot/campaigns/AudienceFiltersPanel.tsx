import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AGE_RANGES, REGIONS, INCOME_BANDS, ACCOUNT_TENURE_OPTIONS,
  FICO_RANGES, LOOKBACK_OPTIONS,
  type DemographicFilters, type AccountTenure,
} from "@/types/segment";
import { DollarSign } from "lucide-react";

interface AudienceFiltersPanelProps {
  filters: DemographicFilters;
  onChange: (filters: DemographicFilters) => void;
  signalCategory: string;
}

function ChipRow({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: readonly (string | { value: string; label: string })[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => {
          const value = typeof item === 'string' ? item : item.value;
          const displayLabel = typeof item === 'string' ? item : item.label;
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AudienceFiltersPanel({ filters, onChange, signalCategory }: AudienceFiltersPanelProps) {
  const toggle = (field: 'ageRanges' | 'regions' | 'incomeBands' | 'ficoRanges', value: string) => {
    const current = field === 'ficoRanges' ? (filters.ficoRanges || []) : filters[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [field]: updated });
  };

  const threshold = filters.signalThreshold || { minAmount: 0, lookbackMonths: 12 };

  return (
    <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
      {/* FICO */}
      <ChipRow
        label="FICO Score"
        items={FICO_RANGES}
        selected={filters.ficoRanges || []}
        onToggle={(v) => toggle('ficoRanges', v)}
      />

      {/* Age & Income row */}
      <div className="grid grid-cols-2 gap-3">
        <ChipRow
          label="Age Ranges"
          items={AGE_RANGES as unknown as string[]}
          selected={filters.ageRanges}
          onToggle={(v) => toggle('ageRanges', v)}
        />
        <ChipRow
          label="Income Bands"
          items={INCOME_BANDS}
          selected={filters.incomeBands}
          onToggle={(v) => toggle('incomeBands', v)}
        />
      </div>

      {/* Signal Threshold */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
          Signal Threshold <span className="normal-case font-normal text-muted-foreground/70">on {signalCategory}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="relative w-32">
            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              type="number"
              value={threshold.minAmount}
              onChange={(e) =>
                onChange({
                  ...filters,
                  signalThreshold: { ...threshold, minAmount: Number(e.target.value) || 0 },
                })
              }
              className="pl-6 h-7 text-xs"
              placeholder="Min spend"
            />
          </div>
          <span className="text-xs text-muted-foreground">in the last</span>
          <Select
            value={String(threshold.lookbackMonths)}
            onValueChange={(v) =>
              onChange({
                ...filters,
                signalThreshold: { ...threshold, lookbackMonths: Number(v) },
              })
            }
          >
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOOKBACK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tenure & Regions row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Account Tenure</p>
          <Select
            value={filters.accountTenure}
            onValueChange={(v) => onChange({ ...filters, accountTenure: v as AccountTenure })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TENURE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ChipRow
          label="Regions"
          items={REGIONS as unknown as string[]}
          selected={filters.regions}
          onToggle={(v) => toggle('regions', v)}
        />
      </div>
    </div>
  );
}
