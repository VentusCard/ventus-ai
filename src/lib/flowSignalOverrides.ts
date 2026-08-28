// Session-scoped edits to Automated Flow signals and risk filters.
// Defaults in flowSignalFamilies.ts stay pure — this layer sits on top so a
// banker can reword, retarget, add or remove signals during a demo session.

import { useSyncExternalStore, useMemo } from "react";
import type { ProductFlow } from "./productAutomatedFlows";
import {
  expandFlowSignals,
  expandFlowFilters,
  composeSignalMessage,
  channelsForFamily,
  customSignalId,
  customFilterId,
  SIGNAL_FAMILY_ORDER,
  type ExpandedSignal,
  type EligibilityFilter,
  type SignalFamily,
} from "./flowSignalFamilies";

export type SignalStrength = "strong" | "moderate" | "light";

export const STRENGTH_WEIGHT: Record<SignalStrength, number> = {
  strong: 0.36,
  moderate: 0.22,
  light: 0.12,
};

export const STRENGTH_LABEL: Record<SignalStrength, string> = {
  strong: "Strong",
  moderate: "Moderate",
  light: "Light",
};

export function weightToStrength(weight: number): SignalStrength {
  if (weight >= 0.3) return "strong";
  if (weight >= 0.18) return "moderate";
  return "light";
}

export interface SignalDraft {
  label: string;
  evidence: string;
  family: SignalFamily;
  strength: SignalStrength;
}

export interface FilterDraft {
  label: string;
  evidence: string;
  /** Share of the triggered audience removed, 0–1. */
  removes: number;
}

interface FlowOverride {
  editedSignals: Record<string, SignalDraft>;
  addedSignals: SignalDraft[];
  removedSignals: string[];
  editedFilters: Record<string, FilterDraft>;
  addedFilters: FilterDraft[];
  removedFilters: string[];
}

const EMPTY_OVERRIDE: FlowOverride = {
  editedSignals: {},
  addedSignals: [],
  removedSignals: [],
  editedFilters: {},
  addedFilters: [],
  removedFilters: [],
};

let state: Record<string, FlowOverride> = {};
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function mutate(flowId: string, fn: (o: FlowOverride) => FlowOverride) {
  state[flowId] = fn(state[flowId] ?? EMPTY_OVERRIDE);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

function useOverrides(): Record<string, FlowOverride> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ----------------------------- mutations ----------------------------- */

export function editSignal(flowId: string, signalId: string, draft: SignalDraft) {
  mutate(flowId, (o) => ({ ...o, editedSignals: { ...o.editedSignals, [signalId]: draft } }));
}

export function resetSignal(flowId: string, signalId: string) {
  mutate(flowId, (o) => {
    const next = { ...o.editedSignals };
    delete next[signalId];
    return { ...o, editedSignals: next };
  });
}

export function addSignal(flowId: string, draft: SignalDraft) {
  mutate(flowId, (o) => {
    const id = customSignalId(flowId, draft.label);
    if (o.addedSignals.some((s) => customSignalId(flowId, s.label) === id)) return o;
    return {
      ...o,
      addedSignals: [...o.addedSignals, draft],
      removedSignals: o.removedSignals.filter((r) => r !== id),
    };
  });
}

export function removeSignal(flowId: string, signalId: string) {
  mutate(flowId, (o) => ({
    ...o,
    removedSignals: o.removedSignals.includes(signalId) ? o.removedSignals : [...o.removedSignals, signalId],
    addedSignals: o.addedSignals.filter((s) => customSignalId(flowId, s.label) !== signalId),
  }));
}

export function editFilter(flowId: string, filterId: string, draft: FilterDraft) {
  mutate(flowId, (o) => ({ ...o, editedFilters: { ...o.editedFilters, [filterId]: draft } }));
}

export function resetFilter(flowId: string, filterId: string) {
  mutate(flowId, (o) => {
    const next = { ...o.editedFilters };
    delete next[filterId];
    return { ...o, editedFilters: next };
  });
}

export function addFilter(flowId: string, draft: FilterDraft) {
  mutate(flowId, (o) => {
    const id = customFilterId(flowId, draft.label);
    if (o.addedFilters.some((f) => customFilterId(flowId, f.label) === id)) return o;
    return { ...o, addedFilters: [...o.addedFilters, draft], removedFilters: o.removedFilters.filter((r) => r !== id) };
  });
}

export function removeFilter(flowId: string, filterId: string) {
  mutate(flowId, (o) => ({
    ...o,
    removedFilters: o.removedFilters.includes(filterId) ? o.removedFilters : [...o.removedFilters, filterId],
    addedFilters: o.addedFilters.filter((f) => customFilterId(flowId, f.label) !== filterId),
  }));
}

export function resetFlowOverrides(flowId: string) {
  mutate(flowId, () => EMPTY_OVERRIDE);
}

/* ------------------------------ reading ------------------------------ */

function applyOverride(flow: ProductFlow, override: FlowOverride) {
  const base = expandFlowSignals(flow)
    .filter((s) => !override.removedSignals.includes(s.id))
    .map((s) => {
      const edit = override.editedSignals[s.id];
      if (!edit) return s;
      return {
        ...s,
        label: edit.label,
        evidence: edit.evidence,
        family: edit.family,
        weight: STRENGTH_WEIGHT[edit.strength],
        channels: channelsForFamily(edit.family),
        message: composeSignalMessage(flow, edit.family, edit.label, edit.evidence),
      } satisfies ExpandedSignal;
    });

  const added: ExpandedSignal[] = override.addedSignals.map((d) => ({
    id: customSignalId(flow.id, d.label),
    label: d.label,
    evidence: d.evidence,
    family: d.family,
    weight: STRENGTH_WEIGHT[d.strength],
    channels: channelsForFamily(d.family),
    message: composeSignalMessage(flow, d.family, d.label, d.evidence),
  }));

  const signals = [...base, ...added].sort(
    (a, b) => SIGNAL_FAMILY_ORDER.indexOf(a.family) - SIGNAL_FAMILY_ORDER.indexOf(b.family),
  );

  const baseFilters = expandFlowFilters(flow)
    .filter((f) => !override.removedFilters.includes(f.id))
    .map((f) => {
      const edit = override.editedFilters[f.id];
      if (!edit) return f;
      return { ...f, label: edit.label, evidence: edit.evidence, passRate: 1 - edit.removes } satisfies EligibilityFilter;
    });

  const addedFilters: EligibilityFilter[] = override.addedFilters.map((d) => ({
    id: customFilterId(flow.id, d.label),
    label: d.label,
    evidence: d.evidence,
    passRate: 1 - d.removes,
  }));

  return { signals, filters: [...baseFilters, ...addedFilters] };
}

export interface FlowSignalSet {
  signals: ExpandedSignal[];
  filters: EligibilityFilter[];
  editedSignalIds: Set<string>;
  customSignalIds: Set<string>;
  editedFilterIds: Set<string>;
  customFilterIds: Set<string>;
  hasOverrides: boolean;
}

/** Override-aware view of a flow's signals and filters. */
export function useFlowSignals(flow: ProductFlow): FlowSignalSet {
  const all = useOverrides();
  const override = all[flow.id] ?? EMPTY_OVERRIDE;
  return useMemo(() => {
    const { signals, filters } = applyOverride(flow, override);
    return {
      signals,
      filters,
      editedSignalIds: new Set(Object.keys(override.editedSignals)),
      customSignalIds: new Set(override.addedSignals.map((s) => customSignalId(flow.id, s.label))),
      editedFilterIds: new Set(Object.keys(override.editedFilters)),
      customFilterIds: new Set(override.addedFilters.map((f) => customFilterId(flow.id, f.label))),
      hasOverrides:
        Object.keys(override.editedSignals).length > 0 ||
        override.addedSignals.length > 0 ||
        override.removedSignals.length > 0 ||
        Object.keys(override.editedFilters).length > 0 ||
        override.addedFilters.length > 0 ||
        override.removedFilters.length > 0,
    };
  }, [flow, override]);
}

/** Non-hook variant for default enabled-set seeding. */
export function flowSignalsNow(flow: ProductFlow) {
  return applyOverride(flow, state[flow.id] ?? EMPTY_OVERRIDE);
}
