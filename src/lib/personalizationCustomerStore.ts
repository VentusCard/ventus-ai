import { useSyncExternalStore } from "react";

// Shared selection across the three Personalization tabs (Deals, Product,
// Relationship) so the same example customer stays in view when switching tabs.
// "session" means: use the live /demo session customer when one exists.

// null = nothing selected yet (empty workspace state)
export type PersonalizationSelection = string | null; // example customer id, "session", or null

let selected: PersonalizationSelection = null;
const listeners = new Set<() => void>();

export function setPersonalizationCustomer(id: PersonalizationSelection) {
  if (selected === id) return;
  selected = id;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return selected;
}

export function usePersonalizationCustomer(): PersonalizationSelection {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
