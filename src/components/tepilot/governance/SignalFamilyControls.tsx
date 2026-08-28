import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import {
  SIGNAL_FAMILIES,
  type PersonalizationLevel,
  type SignalFamilyId,
} from "./personalizationLevels";

interface Props {
  level: PersonalizationLevel;
  overrides: Record<string, boolean>;
  onToggle: (id: SignalFamilyId, on: boolean) => void;
}

export function SignalFamilyControls({ level, overrides, onToggle }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-[13px] font-semibold text-slate-900">Signal families</h3>
      <p className="text-[11.5px] text-slate-500 mb-3">
        Which behavioral signal families Ventus may use. Families outside the selected personalization
        level are locked.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SIGNAL_FAMILIES.map((f) => {
          const allowed = level.enabledFamilies.includes(f.id);
          const on = allowed && (overrides[f.id] ?? true);
          return (
            <div
              key={f.id}
              className={cn(
                "rounded-md border px-3 py-2.5 transition-colors",
                !allowed
                  ? "border-slate-200 bg-slate-50/70 opacity-60"
                  : on
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-slate-200 bg-white",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  {!allowed && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                  <span className="text-[12.5px] font-medium text-slate-800 truncate">{f.label}</span>
                </div>
                <Switch
                  checked={on}
                  disabled={!allowed}
                  onCheckedChange={(v) => onToggle(f.id, v)}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                {allowed ? f.policyNote : `Not available at the ${level.label} level.`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
