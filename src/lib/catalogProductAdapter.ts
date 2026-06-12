// Adapts a CatalogProduct (campaignStudioData.ts) into the ProductFlow shape
// expected by the existing exclusion-funnel UI. Lets us swap the picker's
// data source without rewriting the funnel.

import {
  CreditCard,
  Wallet,
  HandCoins,
  LineChart,
  Shield,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";
import { BASE_USERS } from "@/lib/campaignStudioData";
import type { ProductFlow, FlowCategory, FlowSignal } from "@/lib/productAutomatedFlows";

const CATEGORY_TO_FLOW: Record<ProductCategory, FlowCategory> = {
  credit_cards: "Cards",
  deposit_accounts: "Deposits",
  loans: "Lending",
  investments: "Wealth",
  insurance: "Insurance",
  digital_services: "Deposits", // digital usage rides deposit behavior
};

const CATEGORY_ICON: Record<ProductCategory, LucideIcon> = {
  credit_cards: CreditCard,
  deposit_accounts: Wallet,
  loans: HandCoins,
  investments: LineChart,
  insurance: Shield,
  digital_services: Smartphone,
};

const CATEGORY_SIGNALS: Record<ProductCategory, FlowSignal[]> = {
  credit_cards: [
    { label: "Top-category concentration", evidence: "Two everyday categories carry the majority of card spend over the trailing 90 days.", type: "behavioral" },
    { label: "Off-us wallet leakage", evidence: "Recurring statement credits inbound suggest meaningful spend is landing on another issuer's card.", type: "behavioral" },
    { label: "New routine forming", evidence: "Sustained merchant-cluster shift over 60 days — commute, grocer, or gym swap consistent with a life-stage change.", type: "life-event" },
    { label: "Travel cadence pickup", evidence: "Three or more airline / hotel bookings in a rolling 6 months after a long quiet period.", type: "life-event" },
  ],
  deposit_accounts: [
    { label: "Buffer comfortably above bills", evidence: "Average checking balance has stayed 2× monthly bills for three consecutive cycles.", type: "behavioral" },
    { label: "Recurring savings transfer", evidence: "Standing weekly or pay-day transfer into a savings sub-account, growing steadily.", type: "behavioral" },
    { label: "Fresh employer on direct deposit", evidence: "New employer name on the payroll ACH, sustained for at least two cycles.", type: "life-event" },
    { label: "Sizable one-time inflow", evidence: "Single deposit ≥ 3× normal pay landed in the last 30 days — bonus, settlement, or sale.", type: "life-event" },
  ],
  loans: [
    { label: "Recurring high-rate balances elsewhere", evidence: "Statement payments to high-APR cards over 60 days suggest a consolidation opportunity.", type: "behavioral" },
    { label: "Sustained income stability", evidence: "Twelve uninterrupted payroll cycles with the same employer and rising trend.", type: "behavioral" },
    { label: "Auto purchase imminent", evidence: "Dealer visits, insurance shopping, and trade-in valuation searches inside a 30-day window.", type: "life-event" },
    { label: "Home purchase in motion", evidence: "Earnest-money escrow, inspection fees, and mortgage-broker conversations on file.", type: "life-event" },
  ],
  investments: [
    { label: "Idle cash above 3 months of bills", evidence: "Persistent cash drag in checking — meaningful balance unallocated to a goal.", type: "behavioral" },
    { label: "Self-directed brokerage activity", evidence: "Regular ACATS / outbound brokerage transfers to a peer platform.", type: "behavioral" },
    { label: "New child or grandchild signal", evidence: "Pediatric copays, baby retailer cluster, or gifting pattern suggesting 18-year horizon planning.", type: "life-event" },
    { label: "Retirement runway visible", evidence: "Age band combined with peak-earning-year posture and rising contribution rate.", type: "life-event" },
  ],
  insurance: [
    { label: "Major asset acquired", evidence: "Recent home or auto purchase — coverage needs just changed materially.", type: "life-event" },
    { label: "Dependent count just changed", evidence: "Birth, marriage, or beneficiary update suggests coverage gap re-assessment.", type: "life-event" },
    { label: "Comparable policy ages out", evidence: "Existing term policy approaches renewal — convert or re-quote window opening.", type: "behavioral" },
    { label: "High-asset household", evidence: "Liquid net worth crossed the threshold where umbrella / excess coverage starts to matter.", type: "behavioral" },
  ],
  digital_services: [
    { label: "Holds product but rarely uses", evidence: "Enrolled but fewer than 2 sessions / transactions per month over the last quarter.", type: "behavioral" },
    { label: "Adjacent digital usage strong", evidence: "Heavy use of one digital feature but no adoption of the natural next one.", type: "behavioral" },
    { label: "Channel preference shifting", evidence: "Branch and call-center contacts dropping while app sessions climb — ready for self-serve.", type: "life-event" },
    { label: "Recent device or carrier change", evidence: "New device fingerprint or SIM event — natural moment to re-enable wallet / biometrics.", type: "life-event" },
  ],
};

const CATEGORY_POSITIONING: Record<ProductCategory, (name: string) => string> = {
  credit_cards: (n) => `${n} card positioned for customers whose everyday spend pattern materially benefits from its rewards or rate structure.`,
  deposit_accounts: (n) => `${n} positioned as the primary or companion account for households whose cash-flow shape fits its fee and yield structure.`,
  loans: (n) => `${n} positioned for households with a planned outlay and the income stability to absorb a fixed monthly payment.`,
  investments: (n) => `${n} positioned for households with idle cash and a long enough horizon for the account's tax and structural advantages to compound.`,
  insurance: (n) => `${n} positioned for households whose asset base, dependents, or recent life event makes coverage materially valuable now.`,
  digital_services: (n) => `${n} positioned as a low-friction adoption play for customers already in the digital channel but not yet on this feature.`,
};

/** Stable slug from the catalog name — used as the synthetic ProductFlow id. */
export function catalogProductId(product: CatalogProduct): string {
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a ProductFlow-shaped object so the existing funnel UI can consume it. */
export function adaptCatalogProduct(product: CatalogProduct): ProductFlow {
  const flowCategory = CATEGORY_TO_FLOW[product.category];
  const estimatedAudience = Math.round(BASE_USERS * (product.penetrationRate / 100));
  return {
    id: catalogProductId(product),
    name: product.name,
    category: flowCategory,
    icon: CATEGORY_ICON[product.category],
    positioning: CATEGORY_POSITIONING[product.category](product.name),
    signals: CATEGORY_SIGNALS[product.category],
    estimatedAudience,
    penetration: product.penetrationRate / 100,
  };
}
