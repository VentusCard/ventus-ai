import type { ExampleCustomer } from "@/lib/personalizationExamples";

export type LtvSurface = "rewards" | "product" | "relationship";

export interface LtvLiftLine {
  label: string;
  display: string;
}

export interface LtvLiftResult {
  /** Headline lift value, e.g. "+$48". */
  display: string;
  /** Short driver hint shown in the collapsed row, e.g. "driven by 12 live offers". */
  driverHint: string;
  /** Supporting lines shown when expanded. */
  lines: LtvLiftLine[];
  /** Whether live generated data backed the driver count. */
  ready: boolean;
}

interface OffersLike {
  deals?: unknown[];
}

export interface LtvLiftInputs {
  /** Generated offer groups (rewards). */
  offers?: OffersLike[] | null;
  /** Generated product cards (product). */
  productCards?: unknown[] | null;
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

function money(value: number): string {
  return `$${Math.round(value)}`;
}

/**
 * Anticipated LTV lift per average customer, per surface. Assumptions adapted
 * from the former unit-economics card, simplified to a single headline lift.
 */
export function computeLtvLift(
  surface: LtvSurface,
  customer: ExampleCustomer | null,
  inputs: LtvLiftInputs,
): LtvLiftResult {
  if (surface === "rewards") {
    const offers = (inputs.offers ?? []).reduce((sum, g) => sum + (g.deals?.length ?? 0), 0);
    const annualDealsSpend = 600;
    const takeRate = 0.08;
    const value = annualDealsSpend * takeRate;
    return {
      display: `+${money(value)}`,
      driverHint: offers > 0 ? `driven by ${offers} live offers` : "from deal-driven spend",
      ready: offers > 0,
      lines: [
        { label: "Incremental deal spend / customer / yr", display: money(annualDealsSpend) },
        { label: "Bank take rate on directed spend", display: `${Math.round(takeRate * 100)}%` },
        { label: "Anticipated lift / customer / yr", display: `+${money(value)}` },
      ],
    };
  }

  if (surface === "product") {
    const cards = inputs.productCards?.length ?? 0;
    const productConversion = 0.04;
    const cacAvoided = 420;
    const value = productConversion * cacAvoided;
    return {
      display: `+${money(value)}`,
      driverHint: cards > 0 ? `driven by ${cards} recommended products` : "from next-product conversion",
      ready: cards > 0,
      lines: [
        { label: "Expected conversion per recommendation", display: `${Math.round(productConversion * 100)}%` },
        { label: "Acquisition cost avoided per conversion", display: money(cacAvoided) },
        { label: "Anticipated lift / customer / yr", display: `+${money(value)}` },
      ],
    };
  }

  const signals = countSignals(customer);
  const baseAttrition = 0.12;
  const attritionReduction = 0.15;
  const replacementCost = 650;
  const pointsSaved = baseAttrition * attritionReduction;
  const value = pointsSaved * replacementCost;
  return {
    display: `+${money(value)}`,
    driverHint: signals > 0 ? `driven by ${signals} grounded signals` : "from attrition reduction",
    ready: signals > 0,
    lines: [
      { label: "Attrition points avoided / yr", display: `${(pointsSaved * 100).toFixed(1)} pts` },
      { label: "Replacement cost avoided per save", display: money(replacementCost) },
      { label: "Anticipated lift / customer / yr", display: `+${money(value)}` },
    ],
  };
}
