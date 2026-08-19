// Deduped catalog of every signal used across the product flows, plus any
// custom signals written during the session. Powers the "Add signal" picker.

import { PRODUCT_FLOWS } from "./productAutomatedFlows";
import { expandFlowSignals, expandFlowFilters, type SignalFamily } from "./flowSignalFamilies";
import { weightToStrength, type SignalStrength } from "./flowSignalOverrides";

export interface LibrarySignal {
  key: string;
  label: string;
  evidence: string;
  family: SignalFamily;
  strength: SignalStrength;
  /** How many flows already use this signal — a rough popularity cue. */
  usedBy: number;
}

export interface LibraryFilter {
  key: string;
  label: string;
  evidence: string;
  removes: number;
  usedBy: number;
}

let signalCache: LibrarySignal[] | null = null;
let filterCache: LibraryFilter[] | null = null;
const sessionSignals: LibrarySignal[] = [];
const sessionFilters: LibraryFilter[] = [];

const norm = (s: string) => s.trim().toLowerCase();

function buildSignals(): LibrarySignal[] {
  const map = new Map<string, LibrarySignal>();
  for (const flow of PRODUCT_FLOWS) {
    for (const s of expandFlowSignals(flow)) {
      const key = norm(s.label);
      const existing = map.get(key);
      if (existing) existing.usedBy += 1;
      else
        map.set(key, {
          key,
          label: s.label,
          evidence: s.evidence,
          family: s.family,
          strength: weightToStrength(s.weight),
          usedBy: 1,
        });
    }
  }
  return [...map.values()].sort((a, b) => b.usedBy - a.usedBy || a.label.localeCompare(b.label));
}

function buildFilters(): LibraryFilter[] {
  const map = new Map<string, LibraryFilter>();
  for (const flow of PRODUCT_FLOWS) {
    for (const f of expandFlowFilters(flow)) {
      const key = norm(f.label);
      const existing = map.get(key);
      if (existing) existing.usedBy += 1;
      else
        map.set(key, {
          key,
          label: f.label,
          evidence: f.evidence,
          removes: Math.round((1 - f.passRate) * 100) / 100,
          usedBy: 1,
        });
    }
  }
  return [...map.values()].sort((a, b) => b.usedBy - a.usedBy || a.label.localeCompare(b.label));
}

export function signalLibrary(): LibrarySignal[] {
  if (!signalCache) signalCache = buildSignals();
  return [...sessionSignals, ...signalCache];
}

export function filterLibrary(): LibraryFilter[] {
  if (!filterCache) filterCache = buildFilters();
  return [...sessionFilters, ...filterCache];
}

/** Makes a custom signal reusable on other flows for the rest of the session. */
export function rememberSignal(entry: Omit<LibrarySignal, "key" | "usedBy">) {
  const key = norm(entry.label);
  if (signalLibrary().some((s) => s.key === key)) return;
  sessionSignals.unshift({ ...entry, key, usedBy: 1 });
}

export function rememberFilter(entry: Omit<LibraryFilter, "key" | "usedBy">) {
  const key = norm(entry.label);
  if (filterLibrary().some((f) => f.key === key)) return;
  sessionFilters.unshift({ ...entry, key, usedBy: 1 });
}
