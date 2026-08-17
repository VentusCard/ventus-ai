import { useSyncExternalStore } from "react";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import {
  generatePersonalizedExperience,
  type PersonalizationGenerationResult,
} from "@/lib/personalizationGeneration";
import type { LifeEvent } from "@/types/lifestyle-signals";

export type PersonalizationStatus = "idle" | "running" | "ready" | "failed";

export interface PersonalizationEntry extends PersonalizationGenerationResult {
  status: PersonalizationStatus;
}

const EMPTY: PersonalizationEntry = {
  status: "idle",
  offers: null,
  productCards: null,
  lifeEvents: [] as LifeEvent[],
};

let store: Record<string, PersonalizationEntry> = {};
const listeners = new Set<() => void>();
const inFlight = new Set<string>();

function emit() {
  listeners.forEach((l) => l());
}

function set(id: string, patch: Partial<PersonalizationEntry>) {
  store = { ...store, [id]: { ...(store[id] ?? EMPTY), ...patch } };
  emit();
}

/** Fires generation for a customer once per session; cached afterwards. */
export function ensurePersonalization(customerId: string) {
  if (inFlight.has(customerId)) return;
  const existing = store[customerId];
  if (existing && (existing.status === "ready" || existing.status === "running")) return;
  const customer = EXAMPLE_CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) return;

  inFlight.add(customerId);
  set(customerId, { status: "running", offers: null, productCards: null, lifeEvents: [] });

  generatePersonalizedExperience(customer)
    .then((res) => {
      const ok = Boolean(res.offers?.length || res.productCards?.length);
      set(customerId, { ...res, status: ok ? "ready" : "failed" });
    })
    .catch((err) => {
      console.error("[PERSONALIZATION] generation failed", err);
      set(customerId, { status: "failed" });
    })
    .finally(() => {
      inFlight.delete(customerId);
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return store;
}

export function usePersonalizationResult(customerId: string): PersonalizationEntry {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return snap[customerId] ?? EMPTY;
}
