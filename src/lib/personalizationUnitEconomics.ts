import { useSyncExternalStore } from "react";
import type { ExampleCustomer } from "@/lib/personalizationExamples";
import type { PersonalizationEntry } from "@/lib/personalizationResultStore";

export type EconomicsSurface = "rewards" | "product" | "relationship";

export const SURFACE_LABEL: Record<EconomicsSurface, string> = {
  rewards: "Deals",
  product: "Product",
  relationship: "Relationship",
};

/** Editable, average-customer-level assumptions. */
export interface EconomicsAssumptions {
  /** Deals: incremental, offer-driven spend routed to the bank's rails per average customer, per year ($). */
  annualDealsSpend: number;
  /** Deals: bank take rate on directed spend (0-1). */
  takeRate: number;
  /** Product: incremental conversion rate per recommended product (0-1). */
  productConversion: number;
  /** Product: acquisition cost avoided per converted product ($). */
  cacAvoided: number;
  /** Relationship: baseline annual attrition rate (0-1). */
  baseAttrition: number;
  /** Relationship: attrition reduction, in relative terms (0-1). */
  attritionReduction: number;
  /** Relationship: cost to replace a lost customer ($). */
  replacementCost: number;
}

export const DEFAULT_ASSUMPTIONS: EconomicsAssumptions = {
  annualDealsSpend: 600,
  takeRate: 0.08,
  productConversion: 0.04,
  cacAvoided: 420,
  baseAttrition: 0.12,
  attritionReduction: 0.15,
  replacementCost: 650,
};

export interface EconomicsLine {
  label: string;
  formula?: string;
  /** Rendered as currency unless this is set. */
  display?: string;
  value: number;
}

export interface SurfaceEconomics {
  surface: EconomicsSurface;
  /** Annual value per average customer ($). */
  value: number;
  /** Whether the underlying generated data is available yet. */
  ready: boolean;
  driverLabel: string;
  driverCount: number;
  lines: EconomicsLine[];
}

function countOffers(entry: PersonalizationEntry | null): number {
  if (!entry?.offers?.length) return 0;
  return entry.offers.reduce((sum, g) => sum + (g.deals?.length ?? 0), 0);
}

function countSignals(customer: ExampleCustomer | null): number {
  if (!customer) return 0;
  return (
    customer.lifeEvents.length +
    customer.financialSignals.length +
    customer.spendingHabits.length +
    customer.demographicSignals.length +
    customer.riskFlags.length
  );
}

export function computeSurfaceEconomics(
  surface: EconomicsSurface,
  customer: ExampleCustomer | null,
  entry: PersonalizationEntry | null,
  a: EconomicsAssumptions = DEFAULT_ASSUMPTIONS,
): SurfaceEconomics {
  if (surface === "rewards") {
    const offers = countOffers(entry);
    const directedSpend = a.annualDealsSpend;
    const value = directedSpend * a.takeRate;
    return {
      surface,
      value,
      ready: offers > 0,
      driverLabel: "live offers",
      driverCount: offers,
      lines: [
        { label: "Incremental deal spend / user / yr", value: directedSpend },
        { label: "Bank take / user / yr", value },
      ],
    };
  }

  if (surface === "product") {
    const cards = entry?.productCards?.length ?? 0;
    const conversions = cards * a.productConversion;
    const value = conversions * a.cacAvoided;
    return {
      surface,
      value,
      ready: cards > 0,
      driverLabel: "recommended products",
      driverCount: cards,
      lines: [
        { label: "Recommended products", value: cards },
        { label: "CAC avoided / user / yr", value },
      ],
    };
  }

  const signals = countSignals(customer);
  const pointsSaved = a.baseAttrition * a.attritionReduction;
  const value = pointsSaved * a.replacementCost;
  return {
    surface: "relationship",
    value,
    ready: signals > 0,
    driverLabel: "grounded signals",
    driverCount: signals,
    lines: [
      { label: "Attrition reduction", value: pointsSaved },
      { label: "Retention cost saved / user / yr", value },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Session store: assumptions (editable) + accumulated contributions   */
/* ------------------------------------------------------------------ */

interface EconomicsState {
  assumptions: EconomicsAssumptions;
  /** customerId → surface → value */
  contributions: Record<string, Partial<Record<EconomicsSurface, number>>>;
}

let state: EconomicsState = { assumptions: DEFAULT_ASSUMPTIONS, contributions: {} };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setAssumption<K extends keyof EconomicsAssumptions>(
  key: K,
  value: EconomicsAssumptions[K],
) {
  if (state.assumptions[key] === value) return;
  // Cached contributions were computed with the old assumptions — drop them.
  state = { assumptions: { ...state.assumptions, [key]: value }, contributions: {} };
  emit();
}

export function resetAssumptions() {
  state = { assumptions: DEFAULT_ASSUMPTIONS, contributions: {} };
  emit();
}

export function recordContribution(
  customerId: string,
  surface: EconomicsSurface,
  value: number,
) {
  const current = state.contributions[customerId]?.[surface];
  if (current === value) return;
  state = {
    ...state,
    contributions: {
      ...state.contributions,
      [customerId]: { ...(state.contributions[customerId] ?? {}), [surface]: value },
    },
  };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useEconomicsState(): EconomicsState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(value < 100 ? 2 : 0)}`;
}
