import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Plus, Search, Check, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SIGNAL_FAMILY_CLASS,
  SIGNAL_FAMILY_LABEL,
  SIGNAL_FAMILY_ORDER,
  type SignalFamily,
} from "@/lib/flowSignalFamilies";
import { signalLibrary, filterLibrary, rememberSignal, rememberFilter } from "@/lib/flowSignalLibrary";
import type { SignalDraft, FilterDraft } from "@/lib/flowSignalOverrides";
import { SignalEditForm, FilterEditForm } from "./SignalEditForm";

const norm = (s: string) => s.trim().toLowerCase();

export function AddSignalPicker({
  existingLabels,
  onAdd,
}: {
  existingLabels: string[];
  onAdd: (draft: SignalDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState(false);
  const taken = useMemo(() => new Set(existingLabels.map(norm)), [existingLabels]);

  const grouped = useMemo(() => {
    const q = norm(query);
    const list = signalLibrary().filter(
      (s) => !q || s.label.toLowerCase().includes(q) || s.evidence.toLowerCase().includes(q),
    );
    return SIGNAL_FAMILY_ORDER.filter((f) => f !== "risk")
      .map((family) => [family, list.filter((s) => s.family === family).slice(0, 12)] as const)
      .filter(([, items]) => items.length > 0);
  }, [query]);

  const close = () => {
    setOpen(false);
    setCustom(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-slate-300 bg-white/60 px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add signal
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] p-0 bg-white border-slate-200">
        {custom ? (
          <div className="p-3">
            <SignalEditForm
              initial={{ label: query, evidence: "", family: "behavioral", strength: "moderate" }}
              submitLabel="Add signal"
              onCancel={() => setCustom(false)}
              onSubmit={(draft) => {
                rememberSignal({
                  label: draft.label,
                  evidence: draft.evidence,
                  family: draft.family,
                  strength: draft.strength,
                });
                onAdd(draft);
                close();
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search signals used across all products…"
                className="h-7 border-0 px-0 text-[12px] shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto py-1">
              {grouped.length === 0 && (
                <p className="px-3 py-6 text-center text-[11.5px] text-slate-400">No matching signals in the library.</p>
              )}
              {grouped.map(([family, items]) => (
                <div key={family} className="px-1.5 py-1">
                  <p className="px-1.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    {SIGNAL_FAMILY_LABEL[family as SignalFamily]}
                  </p>
                  {items.map((s) => {
                    const already = taken.has(s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        disabled={already}
                        onClick={() => {
                          onAdd({ label: s.label, evidence: s.evidence, family: s.family, strength: s.strength });
                          close();
                        }}
                        className={cn(
                          "w-full text-left rounded-md px-2 py-1.5 flex items-start gap-2 transition-colors",
                          already ? "opacity-45 cursor-default" : "hover:bg-slate-50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 w-3.5 h-3.5 rounded-[4px] border shrink-0 flex items-center justify-center",
                            already ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white",
                          )}
                        >
                          {already && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold text-slate-900 leading-tight truncate">
                            {s.label}
                          </span>
                          <span className="block text-[10.5px] text-slate-500 leading-snug truncate">{s.evidence}</span>
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0",
                            SIGNAL_FAMILY_CLASS[s.family],
                          )}
                        >
                          {s.usedBy} {s.usedBy === 1 ? "flow" : "flows"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCustom(true)}
              className="w-full border-t border-slate-200 px-3 py-2 text-[11.5px] font-medium text-blue-600 hover:bg-blue-50/60 flex items-center gap-1.5"
            >
              <PenLine className="w-3.5 h-3.5" />
              Write a custom signal{query.trim() ? ` — "${query.trim()}"` : ""}
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function AddFilterPicker({
  existingLabels,
  onAdd,
}: {
  existingLabels: string[];
  onAdd: (draft: FilterDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState(false);
  const taken = useMemo(() => new Set(existingLabels.map(norm)), [existingLabels]);

  const items = useMemo(() => {
    const q = norm(query);
    return filterLibrary()
      .filter((f) => !q || f.label.toLowerCase().includes(q) || f.evidence.toLowerCase().includes(q))
      .slice(0, 20);
  }, [query]);

  const close = () => {
    setOpen(false);
    setCustom(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-rose-200 bg-white/60 px-4 py-2.5 text-[13px] font-medium text-rose-500 hover:border-rose-400 hover:text-rose-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add risk filter
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] p-0 bg-white border-slate-200">
        {custom ? (
          <div className="p-3">
            <FilterEditForm
              initial={{ label: query, evidence: "", removes: 0.15 }}
              submitLabel="Add filter"
              onCancel={() => setCustom(false)}
              onSubmit={(draft) => {
                rememberFilter({ label: draft.label, evidence: draft.evidence, removes: draft.removes });
                onAdd(draft);
                close();
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search risk filters…"
                className="h-7 border-0 px-0 text-[12px] shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto py-1 px-1.5">
              {items.length === 0 && (
                <p className="px-3 py-6 text-center text-[11.5px] text-slate-400">No matching filters.</p>
              )}
              {items.map((f) => {
                const already = taken.has(f.key);
                return (
                  <button
                    key={f.key}
                    type="button"
                    disabled={already}
                    onClick={() => {
                      onAdd({ label: f.label, evidence: f.evidence, removes: f.removes });
                      close();
                    }}
                    className={cn(
                      "w-full text-left rounded-md px-2 py-1.5 flex items-start gap-2 transition-colors",
                      already ? "opacity-45 cursor-default" : "hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-3.5 h-3.5 rounded-[4px] border shrink-0 flex items-center justify-center",
                        already ? "bg-rose-600 border-rose-600" : "border-slate-300 bg-white",
                      )}
                    >
                      {already && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-slate-900 leading-tight truncate">
                        {f.label}
                      </span>
                      <span className="block text-[10.5px] text-slate-500 leading-snug truncate">{f.evidence}</span>
                    </span>
                    <span className="text-[9.5px] font-semibold text-rose-600 shrink-0">
                      −{Math.round(f.removes * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setCustom(true)}
              className="w-full border-t border-slate-200 px-3 py-2 text-[11.5px] font-medium text-rose-600 hover:bg-rose-50/60 flex items-center gap-1.5"
            >
              <PenLine className="w-3.5 h-3.5" />
              Write a custom filter{query.trim() ? ` — "${query.trim()}"` : ""}
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
