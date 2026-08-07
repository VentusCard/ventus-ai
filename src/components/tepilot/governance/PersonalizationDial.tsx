import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  PERSONALIZATION_LEVELS,
  type PersonalizationLevel,
  type PersonalizationLevelId,
} from "./personalizationLevels";

interface Props {
  value: PersonalizationLevelId;
  onChange: (id: PersonalizationLevelId) => void;
  level: PersonalizationLevel;
}

export function PersonalizationDial({ value, onChange, level }: Props) {
  const index = PERSONALIZATION_LEVELS.findIndex((l) => l.id === value);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Personalization level</h3>
          <p className="text-[11.5px] text-slate-500">
            How far Ventus is allowed to go when tailoring an experience to an individual household.
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
          Stage {index + 1} of {PERSONALIZATION_LEVELS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {PERSONALIZATION_LEVELS.map((l, i) => {
          const active = l.id === value;
          const passed = i <= index;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange(l.id)}
              className={cn(
                "text-left rounded-md border px-3 py-2.5 transition-colors",
                active
                  ? "border-blue-300 bg-blue-50/60 ring-1 ring-blue-200"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn("h-1.5 w-1.5 rounded-full", passed ? "bg-blue-600" : "bg-slate-300")} />
                <span className={cn("text-[12px] font-semibold", active ? "text-slate-900" : "text-slate-600")}>
                  {l.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 leading-snug">{l.tagline}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
          What this means downstream
        </div>
        <ul className="space-y-1.5 mb-3">
          {level.downstream.map((d) => (
            <li key={d} className="flex items-start gap-2 text-[12.5px] text-slate-700">
              <Check className="w-3.5 h-3.5 text-blue-600 mt-[3px] shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          <Flag on={level.externalIntelligence} label="External intelligence" />
          <Flag on={level.individualValueMath} label="Individual value math" />
          <Flag on={level.autonomousEnrollment} label="Autonomous enrollment" />
        </div>
      </div>
    </div>
  );
}

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "text-[11px] px-2 py-0.5 rounded-full border",
        on ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400",
      )}
    >
      {on ? "On" : "Off"} · {label}
    </span>
  );
}
