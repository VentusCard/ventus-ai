import { useMemo, useState } from "react";
import { useSaveSequence, SIGNAL_STAGES } from "@/hooks/useSaveSequence";
import { SaveSequence } from "@/components/tepilot/common/SaveSequence";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { FlowGovernanceCard } from "./FlowGovernanceCard";
import { AddSignalPicker, AddFilterPicker } from "./AddSignalPicker";
import { SignalEditForm, FilterEditForm } from "./SignalEditForm";
import { PRODUCT_FLOWS, type FlowCategory, type ProductFlow } from "@/lib/productAutomatedFlows";
import {
  enabledAudience,
  qualifiedAudience,
  filterPassRate,
  filterCascade,
  allocateSignalAudiences,
  FAMILY_SIGNAL_CAP,

  customSignalId,
  customFilterId,
  SIGNAL_FAMILY_CLASS,
  SIGNAL_FAMILY_LABEL,
  type ExpandedSignal,
  type EligibilityFilter,
} from "@/lib/flowSignalFamilies";
import {
  useFlowSignals,
  flowSignalsNow,
  editSignal,
  resetSignal,
  addSignal,
  removeSignal,
  editFilter,
  resetFilter,
  addFilter,
  removeFilter,
  resetFlowOverrides,
  weightToStrength,
  type SignalDraft,
  type FilterDraft,
} from "@/lib/flowSignalOverrides";
import {
  Zap,
  Play,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Mail,
  ShieldAlert,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";


const CATEGORIES: (FlowCategory | "All")[] = ["All", "Lending", "Wealth", "Deposits", "Cards", "Insurance"];

const CATEGORY_COLOR: Record<FlowCategory, string> = {
  Lending: "bg-blue-50 text-blue-700 border-blue-200",
  Wealth: "bg-violet-50 text-violet-700 border-violet-200",
  Deposits: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cards: "bg-amber-50 text-amber-700 border-amber-200",
  Insurance: "bg-rose-50 text-rose-700 border-rose-200",
};

/**
 * Single formatter for the whole tab. One fixed unit (M, two decimals) so a
 * total and its parts are always additive on screen: 0.97M + 4.08M + ...
 */
function formatAudience(n: number): string {
  if (n >= 10_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString();
}



function SignalDetail({ signal, audience }: { signal: ExpandedSignal; audience: number }) {
  const msg = signal.message;
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 grid gap-3 md:grid-cols-2">
      <div className="space-y-3 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
              SIGNAL_FAMILY_CLASS[signal.family],
            )}
          >
            {SIGNAL_FAMILY_LABEL[signal.family]}
          </span>
          <p className="text-[13px] font-semibold text-slate-900 truncate">{msg.title}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Why this fires</p>
          <p className="text-[12px] text-slate-600 leading-snug mt-1">{signal.evidence}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Microsegment</p>
            <p className="text-[12px] font-bold text-slate-900">{formatAudience(audience)} customers</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {signal.channels.map((c) => (
              <span
                key={c}
                className="text-[10.5px] font-medium px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          <Mail className="w-3.5 h-3.5" />
          Personalized message
        </div>
        <p className="text-[13px] font-semibold text-slate-900 leading-snug">{msg.subject}</p>
        <p className="text-[12px] text-slate-600 leading-snug whitespace-pre-line">{msg.body}</p>
        {msg.benefits?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">What they get</p>
            <ul className="mt-1 space-y-0.5">
              {msg.benefits.slice(0, 3).map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-[12px] text-slate-600 leading-snug">
                  <Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[12px] font-medium border-slate-300 text-slate-700 hover:bg-slate-50 mt-auto self-start"
        >
          {msg.cta}
        </Button>

      </div>
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  tone = "slate",
}: {
  onEdit: () => void;
  onDelete?: () => void;
  tone?: "slate" | "rose";
}) {
  return (
    <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        type="button"
        title="Edit signal"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className={cn(
          "p-1 rounded-md hover:bg-slate-100 text-slate-400",
          tone === "rose" ? "hover:text-rose-600" : "hover:text-slate-800",
        )}
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      {onDelete && (
        <button
          type="button"
          title="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function SignalRow({
  signal,
  audience,
  enabled,
  open,
  edited,
  custom,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
}: {
  signal: ExpandedSignal;
  audience: number;
  enabled: boolean;
  open: boolean;
  edited?: boolean;
  custom?: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white">
      <div className={cn("flex items-center gap-3 px-4 py-2.5", !enabled && "opacity-50")}>
        <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                  SIGNAL_FAMILY_CLASS[signal.family],
                )}
              >
                {SIGNAL_FAMILY_LABEL[signal.family]}
              </span>
              <p className="text-[13px] font-semibold text-slate-900 leading-tight truncate">{signal.label}</p>
              {(edited || custom) && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 shrink-0">
                  {custom ? "Added" : "Edited"}
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 leading-snug truncate">{signal.evidence}</p>
          </div>
          <div className="text-right shrink-0 w-24">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Audience</p>
            <p className="text-[13px] font-bold text-slate-900 mt-0.5">{formatAudience(audience)}</p>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-slate-400 shrink-0 transition-transform", open && "rotate-90")} />
        </button>
        <RowActions onEdit={onEdit} onDelete={onDelete} />
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </div>
      {open && (
        <div className="px-4 pb-3">
          <SignalDetail signal={signal} audience={audience} />
        </div>
      )}
    </div>
  );
}


function FilterRow({
  filter,
  removed,
  enabled,
  open,
  edited,
  custom,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
}: {
  filter: EligibilityFilter;
  removed: number;
  enabled: boolean;
  open: boolean;
  edited?: boolean;
  custom?: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dropPct = Math.round((1 - filter.passRate) * 100);
  return (
    <div className="group rounded-lg border border-rose-200 bg-white">
      <div className={cn("flex items-center gap-3 px-4 py-2.5", !enabled && "opacity-50")}>
        <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 bg-rose-50 text-rose-700 border-rose-200">
                Risk Filter
              </span>
              <p className="text-[13px] font-semibold text-slate-900 leading-tight truncate">{filter.label}</p>
              {(edited || custom) && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 shrink-0">
                  {custom ? "Added" : "Edited"}
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 leading-snug truncate">{filter.evidence}</p>
          </div>
          <div className="text-right shrink-0 w-28">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Removes</p>
            <p className="text-[13px] font-bold text-rose-600 mt-0.5">
              {enabled ? `−${dropPct}% · −${formatAudience(removed)}` : <span className="text-slate-400">—</span>}
            </p>
          </div>

          <ChevronRight className={cn("w-5 h-5 text-slate-400 shrink-0 transition-transform", open && "rotate-90")} />
        </button>
        <RowActions onEdit={onEdit} onDelete={onDelete} tone="rose" />
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </div>

      {open && (
        <div className="px-4 pb-3">
          <div className="mt-1 rounded-lg border border-rose-200 bg-rose-50/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-rose-500 font-semibold">Who this removes</p>
            <p className="text-[12px] text-slate-700 leading-snug mt-1">
              {enabled
                ? `Removes ${dropPct}% of whatever reaches this step — ${formatAudience(removed)} people drop out here.`
                : `Turned off. When on it removes ${dropPct}% of whatever reaches this step.`}
            </p>

            <p className="text-[12px] text-slate-500 leading-snug mt-2">
              This is a guardrail, never a trigger — it can only take customers out of the flow, never start
              outreach on its own.
            </p>

          </div>
        </div>
      )}
    </div>
  );
}


function FlowRow({
  flow,
  active,
  expanded,
  enabledSignals,
  enabledFilters,
  onSetEnabled,
  onSetFilters,
  onToggle,
  onExpand,
}: {
  flow: ProductFlow;
  active: boolean;
  expanded: boolean;
  enabledSignals: Set<string>;
  enabledFilters: Set<string>;
  onSetEnabled: (next: Set<string>) => void;
  onSetFilters: (next: Set<string>) => void;
  onToggle: () => void;
  onExpand: () => void;
}) {
  const Icon = flow.icon;
  const { signals, filters, editedSignalIds, customSignalIds, editedFilterIds, customFilterIds, hasOverrides } =
    useFlowSignals(flow);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const save = useSaveSequence({ stages: SIGNAL_STAGES, doneLabel: "Audience synced" });

  const enabledCount = signals.filter((s) => enabledSignals.has(s.id)).length;
  const filterCount = filters.filter((f) => enabledFilters.has(f.id)).length;
  const triggered = enabledAudience(flow, signals, enabledSignals);
  const signalAlloc = useMemo(() => allocateSignalAudiences(flow, signals), [flow, signals]);
  const cascade = useMemo(
    () => filterCascade(triggered, filters, enabledFilters),
    [triggered, filters, enabledFilters],
  );
  const liveAudience = qualifiedAudience(flow, signals, enabledSignals, filters, enabledFilters);
  const passRate = filterPassRate(filters, enabledFilters);
  const totalRemoved = Math.max(0, triggered - liveAudience);
  const isActive = active && enabledCount > 0;

  const overCap = useMemo(() => {
    const counts = new Map<string, number>();
    signals.forEach((s) => counts.set(s.family, (counts.get(s.family) ?? 0) + 1));
    return [...counts.entries()]
      .filter(([family, n]) => n > (FAMILY_SIGNAL_CAP[family as ExpandedSignal["family"]] ?? 3))
      .map(([family]) => SIGNAL_FAMILY_LABEL[family as ExpandedSignal["family"]]);
  }, [signals]);

  const toggleSignal = (id: string) =>
    save.run(() => {
      const next = new Set(enabledSignals);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSetEnabled(next);
    });

  const toggleFilter = (id: string) =>
    save.run(() => {
      const next = new Set(enabledFilters);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSetFilters(next);
    });

  const handleAddSignal = (draft: SignalDraft) =>
    save.run(() => {
      addSignal(flow.id, draft);
      const id = customSignalId(flow.id, draft.label);
      onSetEnabled(new Set([...enabledSignals, id]));
    });

  const handleAddFilter = (draft: FilterDraft) =>
    save.run(() => {
      addFilter(flow.id, draft);
      const id = customFilterId(flow.id, draft.label);
      onSetFilters(new Set([...enabledFilters, id]));
    });


  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onExpand}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>

        <div className="flex items-center gap-2 w-64 shrink-0 min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate">{flow.name}</span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0", CATEGORY_COLOR[flow.category])}>
            {flow.category}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 shrink-0">
            <Sparkles className="w-3 h-3" />
            {enabledCount} of {signals.length} signals
          </span>
          {filters.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 shrink-0">
              <ShieldAlert className="w-3 h-3" />
              {filterCount} of {filters.length} risk filters
            </span>
          )}

          <span className="text-xs text-slate-500 truncate">{flow.positioning}</span>
        </div>

        <div className="text-right shrink-0 w-28">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
            {filters.length > 0 ? "Qualified" : "Audience"}
          </p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{formatAudience(liveAudience)}</p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "text-[10px] gap-1 border shrink-0 w-16 justify-center",
            isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500",
          )}
        >
          {isActive ? <Play className="w-2.5 h-2.5" /> : null}
          {isActive ? "Active" : "Paused"}
        </Badge>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>

        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Signals that trigger this flow — toggle, edit or add your own
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <SaveSequence status={save.status} label={save.stageLabel} />
              {hasOverrides && (
                <button
                  type="button"
                  onClick={() => save.run(() => resetFlowOverrides(flow.id))}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset flow
                </button>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{enabledCount} on</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {signals.map((sig) =>
              editingId === sig.id ? (
                <SignalEditForm
                  key={sig.id}
                  initial={{
                    label: sig.label,
                    evidence: sig.evidence,
                    family: sig.family,
                    strength: weightToStrength(sig.weight),
                  }}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(draft) => {
                    save.run(() => editSignal(flow.id, sig.id, draft));
                    setEditingId(null);
                  }}
                  onReset={
                    editedSignalIds.has(sig.id)
                      ? () => {
                          save.run(() => resetSignal(flow.id, sig.id));
                          setEditingId(null);
                        }
                      : undefined
                  }
                />
              ) : (
                <SignalRow
                  key={sig.id}
                  signal={sig}
                  audience={signalAlloc.get(sig.id) ?? 0}
                  enabled={enabledSignals.has(sig.id)}
                  open={openRow === sig.id}
                  edited={editedSignalIds.has(sig.id)}
                  custom={customSignalIds.has(sig.id)}
                  onToggle={() => toggleSignal(sig.id)}
                  onOpen={() => setOpenRow(openRow === sig.id ? null : sig.id)}
                  onEdit={() => setEditingId(sig.id)}
                  onDelete={() => save.run(() => removeSignal(flow.id, sig.id))}
                />
              ),
            )}

            <AddSignalPicker existingLabels={signals.map((s) => s.label)} onAdd={handleAddSignal} />

            {overCap.length > 0 && (
              <p className="text-[10.5px] text-amber-600 px-1">
                More {overCap.join(" and ")} signals than we'd normally fire on — still fine, just broader than the
                default targeting.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Triggered audience</p>
            <p className="text-[12px] font-bold text-slate-900">{formatAudience(triggered)}</p>
          </div>

          <>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5 pt-2">
                <ShieldAlert className="w-3 h-3 text-rose-500" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                  Risk filters — each one removes customers from the triggered audience
                </p>
              </div>
              {filters.length > 0 && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 shrink-0 pt-2">
                  {filterCount} on · −{Math.round((1 - passRate) * 100)}% · −{formatAudience(totalRemoved)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {filters.map((f) =>
                editingId === f.id ? (
                  <FilterEditForm
                    key={f.id}
                    initial={{ label: f.label, evidence: f.evidence, removes: 1 - f.passRate }}
                    onCancel={() => setEditingId(null)}
                    onSubmit={(draft) => {
                      save.run(() => editFilter(flow.id, f.id, draft));
                      setEditingId(null);
                    }}
                    onReset={
                      editedFilterIds.has(f.id)
                        ? () => {
                            save.run(() => resetFilter(flow.id, f.id));
                            setEditingId(null);
                          }
                        : undefined
                    }
                  />
                ) : (
                  <FilterRow
                    key={f.id}
                    filter={f}
                    removed={cascade.get(f.id) ?? 0}
                    enabled={enabledFilters.has(f.id)}
                    open={openRow === f.id}
                    edited={editedFilterIds.has(f.id)}
                    custom={customFilterIds.has(f.id)}
                    onToggle={() => toggleFilter(f.id)}
                    onOpen={() => setOpenRow(openRow === f.id ? null : f.id)}
                    onEdit={() => setEditingId(f.id)}
                    onDelete={() => save.run(() => removeFilter(flow.id, f.id))}
                  />
                ),
              )}

              <AddFilterPicker existingLabels={filters.map((f) => f.label)} onAdd={handleAddFilter} />
            </div>

            {filters.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Qualified audience</p>
                <p className="text-[13px] font-bold text-slate-900">
                  <span className="text-[11px] font-semibold text-rose-600 mr-2">−{formatAudience(totalRemoved)}</span>
                  {formatAudience(liveAudience)}
                </p>
              </div>
            )}
          </>
        </div>
      )}

    </div>
  );
}


export function ProductAutomatedFlowsView() {
  const [category, setCategory] = useState<FlowCategory | "All">("All");
  const [active, setActive] = useState<Set<string>>(
    () => new Set(PRODUCT_FLOWS.filter((p) => p.defaultActive).map((p) => p.id)),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signalState, setSignalState] = useState<Record<string, Set<string>>>({});
  const [filterState, setFilterState] = useState<Record<string, Set<string>>>({});

  const enabledFor = (flow: ProductFlow) =>
    signalState[flow.id] ?? new Set(flowSignalsNow(flow).signals.map((s) => s.id));

  const setEnabledFor = (flowId: string, next: Set<string>) =>
    setSignalState((prev) => ({ ...prev, [flowId]: next }));

  const filtersFor = (flow: ProductFlow) =>
    filterState[flow.id] ?? new Set(flowSignalsNow(flow).filters.map((f) => f.id));

  const setFiltersFor = (flowId: string, next: Set<string>) =>
    setFilterState((prev) => ({ ...prev, [flowId]: next }));

  const filtered =
    category === "All"
      ? [...PRODUCT_FLOWS].sort((a, b) => b.estimatedAudience - a.estimatedAudience)
      : PRODUCT_FLOWS.filter((p) => p.category === category);

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };


  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Zap className="w-4 h-4" />}
        title="Automated Flows"
        subtitle="Always-on per product — Ventus auto-enrolls customers the moment behavioral signals fire"
        howItWorks="Each bank product runs as an always-on flow. Ventus watches transaction, lifecycle, and engagement signals; when a customer crosses the threshold for a product, they are enrolled into that flow's personalized outreach."
        whyItMatters="Replaces calendar-driven campaigns with continuous, signal-driven enrollment so every product is offered when it is most relevant to the customer."
      />

      <FlowGovernanceCard />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
              )}
            >
              {cat}
              <span className="ml-1.5 opacity-60">
                {cat === "All" ? PRODUCT_FLOWS.length : PRODUCT_FLOWS.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
        <Badge variant="outline" className="text-xs border-slate-200 bg-white">
          <Play className="w-3 h-3 mr-1 text-emerald-600" />
          {active.size} active of {PRODUCT_FLOWS.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((flow) => (
          <FlowRow
            key={flow.id}
            flow={flow}
            active={active.has(flow.id)}
            expanded={expandedId === flow.id}
            enabledSignals={enabledFor(flow)}
            enabledFilters={filtersFor(flow)}
            onSetEnabled={(next) => setEnabledFor(flow.id, next)}
            onSetFilters={(next) => setFiltersFor(flow.id, next)}
            onToggle={() => toggle(flow.id)}

            onExpand={() => setExpandedId(expandedId === flow.id ? null : flow.id)}
          />
        ))}
      </div>
    </div>
  );
}
