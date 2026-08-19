import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SIGNAL_FAMILY_CLASS,
  SIGNAL_FAMILY_LABEL,
  SIGNAL_FAMILY_ORDER,
  type SignalFamily,
} from "@/lib/flowSignalFamilies";
import {
  STRENGTH_LABEL,
  type SignalDraft,
  type SignalStrength,
  type FilterDraft,
} from "@/lib/flowSignalOverrides";

const STRENGTHS: SignalStrength[] = ["strong", "moderate", "light"];
const TRIGGER_FAMILIES = SIGNAL_FAMILY_ORDER.filter((f) => f !== "risk");

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{children}</p>;
}

export function SignalEditForm({
  initial,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  onReset,
}: {
  initial: SignalDraft;
  submitLabel?: string;
  onSubmit: (draft: SignalDraft) => void;
  onCancel: () => void;
  onReset?: () => void;
}) {
  const [draft, setDraft] = useState<SignalDraft>(initial);
  const valid = draft.label.trim().length > 1 && draft.evidence.trim().length > 1;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 space-y-2.5">
      <div>
        <FieldLabel>Signal name</FieldLabel>
        <Input
          autoFocus
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="e.g. Paying tuition to an outside school"
          className="h-8 text-[12px] bg-white border-slate-300"
        />
      </div>

      <div>
        <FieldLabel>What we saw in the data</FieldLabel>
        <Input
          value={draft.evidence}
          onChange={(e) => setDraft({ ...draft, evidence: e.target.value })}
          placeholder="e.g. Recurring ACH to a school or tuition processor"
          className="h-8 text-[12px] bg-white border-slate-300"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <FieldLabel>Signal family</FieldLabel>
          <div className="flex flex-wrap gap-1">
            {TRIGGER_FAMILIES.map((f: SignalFamily) => (
              <button
                key={f}
                type="button"
                onClick={() => setDraft({ ...draft, family: f })}
                className={cn(
                  "text-[9.5px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border transition-all",
                  draft.family === f
                    ? SIGNAL_FAMILY_CLASS[f]
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300",
                )}
              >
                {SIGNAL_FAMILY_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Strength</FieldLabel>
          <div className="flex gap-1">
            {STRENGTHS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft({ ...draft, strength: s })}
                className={cn(
                  "text-[10px] font-medium px-2 py-1 rounded-md border transition-all",
                  draft.strength === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400",
                )}
              >
                {STRENGTH_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <Button
          size="sm"
          disabled={!valid}
          onClick={() => onSubmit({ ...draft, label: draft.label.trim(), evidence: draft.evidence.trim() })}
          className="h-7 text-[11px] bg-slate-900 hover:bg-slate-800 text-white"
        >
          {submitLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="h-7 text-[11px] border-slate-300 text-slate-600"
        >
          Cancel
        </Button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-[10.5px] font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            Reset to default
          </button>
        )}
      </div>
    </div>
  );
}

export function FilterEditForm({
  initial,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  onReset,
}: {
  initial: FilterDraft;
  submitLabel?: string;
  onSubmit: (draft: FilterDraft) => void;
  onCancel: () => void;
  onReset?: () => void;
}) {
  const [draft, setDraft] = useState<FilterDraft>(initial);
  const valid = draft.label.trim().length > 1 && draft.evidence.trim().length > 1;
  const pct = Math.round(draft.removes * 100);

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3 space-y-2.5">
      <div>
        <FieldLabel>Filter name</FieldLabel>
        <Input
          autoFocus
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="e.g. Recent overdrafts"
          className="h-8 text-[12px] bg-white border-slate-300"
        />
      </div>
      <div>
        <FieldLabel>Who this removes</FieldLabel>
        <Input
          value={draft.evidence}
          onChange={(e) => setDraft({ ...draft, evidence: e.target.value })}
          placeholder="e.g. Two or more overdrafts in the last 90 days"
          className="h-8 text-[12px] bg-white border-slate-300"
        />
      </div>
      <div>
        <FieldLabel>Removes {pct}% of the triggered audience</FieldLabel>
        <input
          type="range"
          min={2}
          max={80}
          step={1}
          value={pct}
          onChange={(e) => setDraft({ ...draft, removes: Number(e.target.value) / 100 })}
          className="w-56 accent-rose-600"
        />
      </div>
      <div className="flex items-center gap-2 pt-0.5">
        <Button
          size="sm"
          disabled={!valid}
          onClick={() => onSubmit({ ...draft, label: draft.label.trim(), evidence: draft.evidence.trim() })}
          className="h-7 text-[11px] bg-slate-900 hover:bg-slate-800 text-white"
        >
          {submitLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="h-7 text-[11px] border-slate-300 text-slate-600"
        >
          Cancel
        </Button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-[10.5px] font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            Reset to default
          </button>
        )}
      </div>
    </div>
  );
}
