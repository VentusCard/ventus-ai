// Additive variant model — keyed by CatalogProduct.name.
//   total = stacks * plays + lifeEvents + financialGoals
// Anchors add (one campaign is anchored on ONE thing), they don't multiply.
// Tone / proof / construction are A/B wrappers on a single anchored campaign,
// not separate campaigns.

import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";

export interface VariantBreakdown {
  stacks: number;          // category-stack surface (0 if not category-bearing)
  plays: number;
  lifeEvents: number;
  financialGoals: number;
  total: number;
}

const mk = (stacks: number, plays: number, lifeEvents: number, financialGoals: number): VariantBreakdown => ({
  stacks,
  plays,
  lifeEvents,
  financialGoals,
  total: stacks * plays + lifeEvents + financialGoals,
});

export const PRODUCT_VARIANTS: Record<string, VariantBreakdown> = {
  // ── Credit Cards (10) ───────── 805
  "Cashback (3/2/1)":    mk(132, 4, 15, 5),  // 548
  "Custom Cashback":     mk(12,  4, 15, 5),  // 68
  "Travel":              mk(8,   4, 10, 4),  // 46
  "Airline":             mk(0,   0,  8, 3),  // 11
  "Hotel":               mk(0,   0,  8, 3),  // 11
  "Premium Travel":      mk(8,   4, 10, 4),  // 46
  "Student":             mk(0,   0,  9, 3),  // 12
  "Secured":             mk(0,   0,  7, 2),  // 9
  "Business":            mk(8,   4, 10, 4),  // 46
  "Co-Branded Retail":   mk(0,   0,  6, 2),  // 8

  // ── Deposit Accounts (8) ────── 92
  "Checking":            mk(0, 0, 12, 4),    // 16
  "Savings":             mk(0, 0, 10, 5),    // 15
  "High-Yield Savings":  mk(0, 0,  8, 5),    // 13
  "Money Market":        mk(0, 0,  6, 4),    // 10
  "CD":                  mk(0, 0,  6, 4),    // 10
  "Business Checking":   mk(0, 0,  8, 3),    // 11
  "Business Savings":    mk(0, 0,  6, 3),    // 9
  "Youth/Teen":          mk(0, 0,  6, 2),    // 8

  // ── Loans (8) ───────────────── 88
  "Personal Loan":        mk(0, 0, 10, 3),   // 13
  "Auto Loan":            mk(0, 0,  6, 2),   // 8
  "Home Mortgage":        mk(0, 0, 10, 4),   // 14
  "HELOC":                mk(0, 0,  9, 4),   // 13
  "Student Loan Refi":    mk(0, 0,  6, 2),   // 8
  "Small Business Loan":  mk(0, 0,  8, 3),   // 11
  "Line of Credit":       mk(0, 0,  8, 3),   // 11
  "Debt Consolidation":   mk(0, 0,  7, 3),   // 10

  // ── Investments (7) ─────────── 83
  "Brokerage":          mk(0, 0, 8, 5),      // 13
  "Traditional IRA":    mk(0, 0, 7, 5),      // 12
  "Roth IRA":           mk(0, 0, 8, 5),      // 13
  "529 Plan":           mk(0, 0, 6, 4),      // 10
  "Robo-Advisor":       mk(0, 0, 7, 5),      // 12
  "Managed Portfolio":  mk(0, 0, 8, 5),      // 13
  "Trust Account":      mk(0, 0, 6, 4),      // 10

  // ── Insurance (5) ───────────── 42
  "Life Insurance":             mk(0, 0, 9, 3),  // 12
  "Home Insurance":             mk(0, 0, 7, 2),  // 9
  "Auto Insurance":             mk(0, 0, 6, 2),  // 8
  "Travel Insurance":           mk(0, 0, 6, 2),  // 8
  "Identity Theft Protection":  mk(0, 0, 4, 1),  // 5

  // ── Digital Services (6) ────── 32
  "Mobile Banking Active":  mk(0, 0, 4, 1),  // 5
  "Digital Wallet":         mk(0, 0, 4, 1),  // 5
  "Zelle/P2P Active":       mk(0, 0, 4, 1),  // 5
  "Direct Deposit Active":  mk(0, 0, 5, 1),  // 6
  "Bill Pay Active":        mk(0, 0, 4, 1),  // 5
  "Overdraft Protection":   mk(0, 0, 4, 2),  // 6
};

export const CATEGORY_GROUP_TOTALS: Record<ProductCategory, number> = {
  credit_cards: 805,
  deposit_accounts: 92,
  loans: 88,
  investments: 83,
  insurance: 42,
  digital_services: 32,
};

export const CATALOG_GRAND_TOTAL = 1_142;

export function getProductVariants(product: CatalogProduct): VariantBreakdown {
  return PRODUCT_VARIANTS[product.name] ?? mk(0, 0, 0, 0);
}

/** Render the additive formula as a human-readable string. */
export function formatVariantFormula(v: VariantBreakdown): string {
  const parts: string[] = [];
  if (v.stacks > 0 && v.plays > 0) {
    parts.push(`${v.stacks} stacks × ${v.plays} plays`);
  }
  if (v.lifeEvents > 0) parts.push(`${v.lifeEvents} life-event hooks`);
  if (v.financialGoals > 0) parts.push(`${v.financialGoals} goal hooks`);
  return `${parts.join("  +  ")}  =  ${v.total} campaigns`;
}
