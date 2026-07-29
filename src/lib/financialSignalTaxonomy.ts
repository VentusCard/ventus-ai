// Canonical "Financial Signals" vocabulary — bigger-than-spending financial products
// (loans, mortgages, leases, investments, insurance premiums).
//
// The persona-synthesis LLM classifies recurring counterparties into these families
// so they surface in their own Intel Panel section instead of being repackaged as
// "spending habits" (e.g. the invalid "Autoloan Management" rollup we used to see).

export type FinancialSignalFamily =
  | "auto_loan"
  | "auto_lease"
  | "mortgage"
  | "heloc"
  | "student_loan"
  | "personal_loan"
  | "credit_card_payoff"
  | "brokerage_contribution"
  | "retirement_contribution"
  | "insurance_premium"
  | "education_savings";

export interface FinancialSignal {
  id: string;
  product_family: FinancialSignalFamily;
  /** UI label — 2-5 words, e.g. "Auto Loan · VW Credit". */
  label: string;
  /** Counterparty / servicer name, e.g. "Volkswagen Credit". */
  servicer?: string;
  /** Vaguely-specific band, e.g. "~$450/mo", "~$2.1k/mo". Never exact figures. */
  monthly_amount_band?: string;
  cadence?: "monthly" | "biweekly" | "quarterly" | "annual" | "irregular";
  /** [T<n>] indices of the underlying transactions in the enriched list. */
  transaction_indices: number[];
  talking_points?: string[];
}

export interface FinancialSignalFamilyMeta {
  family: FinancialSignalFamily;
  label: string;
  /** Merchant / description substring hints (lowercase). The LLM uses these
   *  as ground-truth patterns; matching lives in the model prompt, not code. */
  merchant_hints: string[];
}

export const FINANCIAL_SIGNAL_VOCAB: FinancialSignalFamilyMeta[] = [
  {
    family: "auto_loan",
    label: "Auto Loan",
    merchant_hints: [
      "toyota financial",
      "vw credit",
      "volkswagen credit",
      "ford credit",
      "gm financial",
      "honda financial",
      "nissan motor accept",
      "ally auto",
      "chase auto",
      "capital one auto",
      "bmw financial",
      "mercedes-benz financial",
      "hyundai motor finance",
    ],
  },
  {
    family: "auto_lease",
    label: "Auto Lease",
    merchant_hints: ["lease", "leasing"],
  },
  {
    family: "mortgage",
    label: "Mortgage",
    merchant_hints: [
      "rocket mortgage",
      "wells fargo home mortgage",
      "chase home lending",
      "pennymac",
      "mr. cooper",
      "loandepot",
      "zillow home loans",
      "quicken loans",
      "us bank mortgage",
      "citi mortgage",
    ],
  },
  {
    family: "heloc",
    label: "HELOC",
    merchant_hints: ["heloc", "home equity"],
  },
  {
    family: "student_loan",
    label: "Student Loan",
    merchant_hints: ["nelnet", "sallie mae", "navient", "great lakes", "fedloan", "mohela", "aidvantage"],
  },
  {
    family: "personal_loan",
    label: "Personal Loan",
    merchant_hints: ["sofi loan", "lightstream", "marcus loan", "upstart", "prosper", "lendingclub", "best egg"],
  },
  {
    family: "credit_card_payoff",
    label: "Card Payoff",
    merchant_hints: ["amex payment", "chase card payment", "discover payment", "capital one card", "citi card payment"],
  },
  {
    family: "brokerage_contribution",
    label: "Brokerage Contribution",
    merchant_hints: [
      "fidelity",
      "schwab",
      "vanguard",
      "robinhood",
      "wealthfront",
      "betterment",
      "etrade",
      "e*trade",
      "merrill edge",
      "tastyworks",
    ],
  },
  {
    family: "retirement_contribution",
    label: "Retirement Contribution",
    merchant_hints: ["401k", "ira contribution", "roth ira", "sep ira", "solo 401k"],
  },
  {
    family: "insurance_premium",
    label: "Insurance Premium",
    merchant_hints: [
      "northwestern mutual",
      "new york life",
      "massmutual",
      "prudential life",
      "guardian life",
      "haven life",
      "policygenius",
      "umbrella premium",
      "disability premium",
    ],
  },
  {
    family: "education_savings",
    label: "529 Contribution",
    merchant_hints: ["529", "utah my529", "nevada 529", "ny 529", "collegeamerica", "scholarshare"],
  },
];

/** Compact string used inside the persona-synthesis system prompt. */
export function financialSignalVocabPromptBlock(): string {
  return FINANCIAL_SIGNAL_VOCAB
    .map(
      (m) =>
        `  - ${m.family} (${m.label}) — merchant hints: ${m.merchant_hints
          .slice(0, 6)
          .map((h) => `"${h}"`)
          .join(", ")}`,
    )
    .join("\n");
}
