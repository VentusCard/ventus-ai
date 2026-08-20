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
  /** Deals: incremental spend routed to the bank's rails per live offer, per year ($). */
  spendPerOffer: number;
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
  spendPerOffer: 200,
  takeRate: 0.08,
  productConversion: 0.04,
  cacAvoided: 420,
  baseAttrition: 0.12,
  attritionReduction: 0.15,
  replacementCost: 650,
};

export interface EconomicsLine {
  label: string;
  formula: string;
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
    const directedSpend = offers * a.spendPerOffer;
    const value = directedSpend * a.takeRate;
    return {
      surface,
      value,
      ready: offers > 0,
      driverLabel: "live offers",
      driverCount: offers,
      lines: [
        {
          label: "Directed spend",
          formula: `${offers} offers × $${a.spendPerOffer.toLocaleString()} incremental spend`,
          value: directedSpend,
        },
        {
          label: "Bank take rate",
          formula: `$${Math.round(directedSpend).toLocaleString()} × ${(a.takeRate * 100).toFixed(1)}%`,
          value,
        },
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
        {
          label: "Incremental conversions",
          formula: `${cards} products × ${(a.productConversion * 100).toFixed(1)}% lift`,
          value: conversions,
        },
        {
          label: "CAC avoided",
          formula: `${conversions.toFixed(2)} conversions × $${a.cacAvoided.toLocaleString()} CAC`,
          value,
        },
      ],
    };
  }

  const signals = countSignals(customer);
  // More grounded signals → a slightly stronger retention effect, capped.
  const effect = Math.min(a.attritionReduction * (0.6 + signals * 0.06), a.attritionReduction * 1.6);
  const pointsSaved = a.baseAttrition * effect;
  const value = pointsSaved * a.replacementCost;
  return {
    surface: "relationship",
    value,
    ready: signals > 0,
    driverLabel: "grounded signals",
    driverCount: signals,
    lines: [
      {
        label: "Attrition avoided",
        formula: `${(a.baseAttrition * 100).toFixed(1)}% base × ${(effect * 100).toFixed(1)}% reduction`,
        value: pointsSaved,
      },
      {
        label: "Retention cost saved",
        formula: `${(pointsSaved * 100).toFixed(2)}pp × $${a.replacementCost.toLocaleString()} replacement`,
        value,
      },
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
  state = { ...state, assumptions: { ...state.assumptions, [key]: value } };
  emit();
}

export function resetAssumptions() {
  state = { ...state, assumptions: DEFAULT_ASSUMPTIONS };
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
