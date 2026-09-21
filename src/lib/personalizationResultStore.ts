import { useSyncExternalStore } from "react";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import {
  buildLifeEvents,
  generatePersonalizedExperience,
  type PersonalizationGenerationResult,
  type PersonalizationNeed,
} from "@/lib/personalizationGeneration";
import { getPersonalizationSnapshot } from "@/lib/personalizationSnapshots";
import { getBankPromptContext } from "@/lib/demoBankConfig";
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
/** Customer id → the needs currently being generated. */
const inFlight = new Map<string, Set<PersonalizationNeed>>();

/** True when what we already hold covers everything the requested surface renders. */
function satisfies(entry: PersonalizationGenerationResult | null | undefined, need: PersonalizationNeed) {
  if (!entry) return false;
  const hasOffers = Boolean(entry.offers?.length);
  const hasCards = Boolean(entry.productCards?.length);
  if (need === "offers") return hasOffers;
  if (need === "cards") return hasCards;
  return hasOffers && hasCards;
}

function inFlightCovers(customerId: string, need: PersonalizationNeed) {
  const active = inFlight.get(customerId);
  if (!active) return false;
  if (active.has("all") || active.has(need)) return true;
  return need === "all" && active.has("offers") && active.has("cards");
}
let hasPrewarmed = false;

const CACHE_PREFIX = "ventus.personalization.v1";

/** Live results are only bank-specific, so the cache key carries the bank name. */
function cacheKey(customerId: string) {
  const bank = getBankPromptContext()?.bankName ?? "default";
  return `${CACHE_PREFIX}:${bank}:${customerId}`;
}

function readCache(customerId: string): PersonalizationGenerationResult | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(customerId));
    return raw ? (JSON.parse(raw) as PersonalizationGenerationResult) : null;
  } catch {
    return null;
  }
}

function writeCache(customerId: string, result: PersonalizationGenerationResult) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(cacheKey(customerId), JSON.stringify(result));
  } catch {
    /* quota — cache is best-effort */
  }
}

function clearCache() {
  if (typeof sessionStorage === "undefined") return;
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function set(id: string, patch: Partial<PersonalizationEntry>) {
  store = { ...store, [id]: { ...(store[id] ?? EMPTY), ...patch } };
  emit();
}

/**
 * Resolves a customer's personalization.
 * Default bank → committed snapshot (instant, zero model calls).
 * Custom bank → session cache, else live generation for what `need` renders.
 */
export function ensurePersonalization(customerId: string, need: PersonalizationNeed = "all") {
  if (inFlightCovers(customerId, need)) return;
  const existing = store[customerId];
  if (satisfies(existing, need)) return;
  const customer = EXAMPLE_CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) return;

  const lifeEvents = buildLifeEvents(customer);
  const isCustomBank = Boolean(getBankPromptContext());

  if (!isCustomBank) {
    const snap = getPersonalizationSnapshot(customerId);
    if (satisfies(snap, need)) {
      set(customerId, { ...snap, lifeEvents, status: "ready" });
      return;
    }
  }

  const cached = readCache(customerId);
  if (satisfies(cached, need)) {
    set(customerId, { ...cached, lifeEvents, status: "ready" });
    return;
  }
  // A partial cached result still seeds the store while the missing half loads.
  if (cached && (cached.offers?.length || cached.productCards?.length)) {
    set(customerId, { ...cached, lifeEvents, status: "running" });
  }

  const active = inFlight.get(customerId) ?? new Set<PersonalizationNeed>();
  active.add(need);
  inFlight.set(customerId, active);
  if (!existing || existing.status === "idle" || existing.status === "failed") {
    set(customerId, { status: "running", lifeEvents: [] });
  }

  generatePersonalizedExperience(
    customer,
    {
      // Render each half the moment it lands instead of waiting on both.
      onProductCards: (cards) => {
        if (cards?.length) set(customerId, { productCards: cards, status: "ready" });
      },
      onOffers: (offers) => {
        if (offers?.length) set(customerId, { offers, status: "ready" });
      },
    },
    need,
  )
    .then((res) => {
      const ok = Boolean(res.offers?.length || res.productCards?.length);
      // Keep whatever the other half already produced instead of overwriting it with null.
      const prev = store[customerId];
      const merged: PersonalizationGenerationResult = {
        offers: res.offers?.length ? res.offers : prev?.offers ?? null,
        productCards: res.productCards?.length ? res.productCards : prev?.productCards ?? null,
        lifeEvents: res.lifeEvents?.length ? res.lifeEvents : prev?.lifeEvents ?? [],
      };
      set(customerId, { ...merged, status: ok ? "ready" : "failed" });
      if (ok) writeCache(customerId, merged);
    })
    .catch((err) => {
      console.error("[PERSONALIZATION] generation failed", err);
      set(customerId, { status: "failed" });
    })
    .finally(() => {
      const running = inFlight.get(customerId);
      running?.delete(need);
      if (!running || running.size === 0) inFlight.delete(customerId);
    });
}

/** Clears one customer's cached result and fires generation again. */
export function retryPersonalization(customerId: string) {
  inFlight.delete(customerId);
  const { [customerId]: _drop, ...rest } = store;
  store = rest;
  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.removeItem(cacheKey(customerId));
    } catch {
      /* ignore */
    }
  }
  emit();
  ensurePersonalization(customerId);
}

/** Drops every cached result so surfaces regenerate (e.g. after the demo bank name changes). */
export function clearPersonalizationResults() {
  store = {};
  inFlight.clear();
  hasPrewarmed = false;
  clearCache();
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("demo-bank-config-changed", () => {
    clearPersonalizationResults();
    prewarmDefaultCustomer();
  });
}

/** Prewarms the first example customer once per session — all three tabs. */
export function prewarmDefaultCustomer() {
  if (hasPrewarmed) return;
  hasPrewarmed = true;
  const first = EXAMPLE_CUSTOMERS[0];
  if (first) ensurePersonalization(first.id, "all");
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
